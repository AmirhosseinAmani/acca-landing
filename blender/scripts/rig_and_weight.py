"""Add a real humanoid armature to the astronaut and heat-map weight it.

  blender blender/astronaut-working.blend --background \
    --python blender/scripts/rig_and_weight.py -- \
    --output blender/astronaut-working.blend

Bone names + hierarchy mirror the web runtime rig (src/components/sections/
astronautRig.js) so the website can adopt the BAKED weights while keeping its
own clean bone frames and pose code. Torso column bones (root/spine/chest/head)
own the body so lifting an arm never drags the chest. Every vertex is guaranteed
a non-zero weight (unweighted verts would collapse to the origin in the web).
"""

import argparse
import os
import sys

import bpy
from mathutils import Vector


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    return parser.parse_args(argv)


def body_mesh():
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    if not meshes:
        raise SystemExit("ABORT: no mesh in the blend file")
    return max(meshes, key=lambda obj: len(obj.data.vertices))


def world_bounds(mesh):
    coords = [mesh.matrix_world @ vertex.co for vertex in mesh.data.vertices]
    lowest = Vector((min(c.x for c in coords), min(c.y for c in coords), min(c.z for c in coords)))
    highest = Vector((max(c.x for c in coords), max(c.y for c in coords), max(c.z for c in coords)))
    return lowest, highest


def main():
    args = parse_args()
    mesh = body_mesh()

    # Freeze transforms so the exported geometry matches the source GLB space
    # and matrix_world becomes identity (the web applies matrixWorld verbatim).
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="DESELECT")
    mesh.select_set(True)
    bpy.context.view_layer.objects.active = mesh
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    low, high = world_bounds(mesh)
    height = high.z - low.z
    width = high.x - low.x
    depth = high.y - low.y
    cx = (high.x + low.x) / 2
    cy = (high.y + low.y) / 2

    def P(fx, fz, front):
        # fx: signed fraction of width; fz: fraction of height (0=feet,1=head);
        # front: fraction of depth toward the camera (glTF +Z -> Blender -Y)
        return Vector((cx + fx * width, cy - front * depth, low.z + fz * height))

    joints = {
        "shoulder": {"fz": 0.732, "front": 0.22, "fx": 0.193},
        "elbow": {"fz": 0.522, "front": 0.07, "fx": 0.338},
        "hand": {"fz": 0.430, "front": 0.12, "fx": 0.470},
        "hip": {"fz": 0.430, "front": 0.10, "fx": 0.105},
        "knee": {"fz": 0.224, "front": 0.119, "fx": 0.129},
        "ankle": {"fz": 0.065, "front": 0.12, "fx": 0.135},
    }

    def side_point(name, sign):
        j = joints[name]
        return P(sign * j["fx"], j["fz"], j["front"])

    # ---- Build armature ----------------------------------------------------
    armature_data = bpy.data.armatures.new("ASTRONAUT_ARMATURE")
    armature = bpy.data.objects.new("ASTRONAUT_ARMATURE", armature_data)
    bpy.context.scene.collection.objects.link(armature)

    bpy.ops.object.select_all(action="DESELECT")
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode="EDIT")
    edit_bones = armature_data.edit_bones

    def bone(name, head, tail, parent=None):
        eb = edit_bones.new(name)
        eb.head = head
        eb.tail = tail
        eb.use_connect = False
        if parent is not None:
            eb.parent = parent
        return eb

    # torso column (owns the body -> keeps chest static when arms move)
    pelvis = bone("astronaut root", P(0, 0.42, 0.05), P(0, 0.52, 0.05))
    spine = bone("spine", P(0, 0.52, 0.04), P(0, 0.66, 0.02), pelvis)
    chest = bone("chest", P(0, 0.66, 0.02), P(0, 0.78, 0.0), spine)
    bone("head", P(0, 0.78, 0.0), P(0, 0.92, 0.0), chest)

    for side, sign in (("left", -1), ("right", 1)):
        shoulder = bone(f"{side} shoulder", side_point("shoulder", sign), side_point("elbow", sign), chest)
        elbow = bone(f"{side} elbow", side_point("elbow", sign), side_point("hand", sign), shoulder)
        hand_head = side_point("hand", sign)
        bone(f"{side} hand", hand_head, hand_head + Vector((sign * 0.04, 0, -0.04)), elbow)
        hip = bone(f"{side} hip", side_point("hip", sign), side_point("knee", sign), pelvis)
        bone(f"{side} knee", side_point("knee", sign), side_point("ankle", sign), hip)

    bpy.ops.object.mode_set(mode="OBJECT")
    # armature_data.bones is only populated OUTSIDE edit mode
    bone_segments = [
        (bone_obj.name, bone_obj.head_local.copy(), bone_obj.tail_local.copy())
        for bone_obj in armature_data.bones
    ]

    # ---- Parent (modifier only) then script robust weights ----------------
    # Heat-map weighting fails on this multi-shell mesh, so we use a method that
    # works on ANY topology: assign each vertex to the nearest bone segment,
    # then blur the weights across the surface so joints deform smoothly instead
    # of tearing. This bakes real, stable weights the website can adopt.
    bpy.ops.object.select_all(action="DESELECT")
    mesh.select_set(True)
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.parent_set(type="ARMATURE")  # modifier + parent, no weights

    groups = [mesh.vertex_groups.get(name) or mesh.vertex_groups.new(name=name)
              for name, _, _ in bone_segments]
    index_of = {name: idx for idx, (name, _, _) in enumerate(bone_segments)}

    def distance_to_segment(point, start, end):
        axis = end - start
        length_sq = axis.dot(axis)
        if length_sq < 1e-12:
            return (point - start).length
        t = max(0.0, min(1.0, (point - start).dot(axis) / length_sq))
        return (point - (start + axis * t)).length

    data = mesh.data
    vertex_count = len(data.vertices)

    # In the rest pose the arms hang DOWN beside the legs, so the hand/elbow
    # bones sit at thigh height. Naive nearest-bone then binds thighs to arm
    # bones (legs stop folding). Fix: for lower-body vertices near the body
    # centerline, exclude arm bones — the laterally-offset hands stay > the
    # gate and still bind to the arm chain.
    def has(name, keys):
        return any(key in name for key in keys)
    all_indices = list(range(len(bone_segments)))
    leg_indices = [i for i, (n, _, _) in enumerate(bone_segments) if has(n, ("hip", "knee"))]
    torso_indices = [i for i, (n, _, _) in enumerate(bone_segments)
                     if has(n, ("root", "spine", "chest", "head"))]
    gate_x = 0.30 * width

    # 1) hard nearest-bone, with an anatomical gate so the centered root/pelvis
    # and the down-hanging arms can't steal the legs:
    #   • below the hip joint (fz<0.44), central -> LEG bones only (hip/knee)
    #   • pelvis band (0.44-0.55), central -> legs + torso (root owns the seat)
    #   • everything else -> all bones (arms are lateral, so they win there)
    weights = [None] * vertex_count
    for vertex in data.vertices:
        co = vertex.co  # matrix_world is identity after transform_apply
        fz = (co.z - low.z) / height
        dx = abs(co.x - cx)
        if dx < gate_x and fz < 0.44:
            candidates = leg_indices
        elif dx < gate_x and fz < 0.55:
            candidates = leg_indices + torso_indices
        else:
            candidates = all_indices
        nearest = min(
            candidates,
            key=lambda i: distance_to_segment(co, bone_segments[i][1], bone_segments[i][2]),
        )
        weights[vertex.index] = {nearest: 1.0}

    # 2) blur across mesh edges -> smooth joint transitions (anti-tear).
    adjacency = [[] for _ in range(vertex_count)]
    for edge in data.edges:
        a, b = edge.vertices
        adjacency[a].append(b)
        adjacency[b].append(a)

    for _ in range(3):
        blurred = [None] * vertex_count
        for i in range(vertex_count):
            acc = dict(weights[i])
            for neighbor in adjacency[i]:
                for bone_index, value in weights[neighbor].items():
                    acc[bone_index] = acc.get(bone_index, 0.0) + value
            count = 1 + len(adjacency[i])
            blurred[i] = {bone_index: value / count for bone_index, value in acc.items()}
        weights = blurred

    # 3) cap to 4 influences (glTF), normalize, write back
    orphans = 0
    for i in range(vertex_count):
        top = sorted(weights[i].items(), key=lambda kv: kv[1], reverse=True)[:4]
        total = sum(value for _, value in top)
        if total < 1e-6:
            groups[index_of["astronaut root"]].add([i], 1.0, "REPLACE")
            orphans += 1
            continue
        for bone_index, value in top:
            groups[bone_index].add([i], value / total, "REPLACE")
    print(f"INFO: nearest-bone + 8x edge blur, {orphans} orphan vertices")

    # keep ASTRONAUT_ROOT the export root: armature under it, mesh under armature
    root_empty = bpy.data.objects.get("ASTRONAUT_ROOT")
    if root_empty:
        armature.parent = root_empty

    # ---- Save --------------------------------------------------------------
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.output))
    weighted = len([b for b in armature_data.bones])
    print(f"OK: rigged {len(mesh.data.vertices)} verts to {weighted} bones, saved {args.output}")


if __name__ == "__main__":
    main()
