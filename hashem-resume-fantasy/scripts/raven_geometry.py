"""Original anatomical raven mesh, with UV-mapped feather vanes and articulated pivots."""
import bpy
import math
import numpy as np
from mathutils import Vector


def build_raven(api):
    empty, mat, parent = (api[k] for k in ('empty', 'mat', 'parent'))
    curve, box, text = (api[k] for k in ('curve', 'box', 'text'))
    gold, edge, paper, thread, leather = (api[k] for k in ('gold', 'edge', 'paper', 'thread', 'leather'))
    rng = np.random.default_rng(91)
    root = empty('raven_root')
    charcoal = mat('Raven charcoal underplumage', (.009, .012, .018), .01, .67)
    vane = mat('Raven blue-black feather vanes', (.012, .020, .030), .16, .43)
    covert = mat('Raven satin coverts', (.014, .020, .029), .10, .46)
    keratin = mat('Raven polished keratin', (.006, .008, .011), .05, .37)
    claw = mat('Raven weathered claws', (.025, .027, .030), .02, .51)
    iris = mat('Raven dark umber iris', (.065, .031, .013), .08, .22)
    pupil = mat('Raven glassy pupil', (.0015, .002, .003), .02, .10)
    glint = mat('Raven eye catchlight', (.57, .65, .71), 0, .16)

    # Fine barbs are baked into real UV textures, not hundreds of large armour scales.
    # A single shared 512px atlas carries a tapered rachis, angled barbs and subtle wear.
    size = 512
    u, v = np.meshgrid(np.linspace(0, 1, size), np.linspace(0, 1, size))
    distance = np.abs(u - .5)
    phase = v * 102 - distance * 40
    barbs = .5 + .5 * np.sin(phase * math.tau)
    fine = rng.random((size, size))
    rachis = np.exp(-((u - .5) / .009) ** 2)
    vane_height = .20 * barbs + .20 * rachis + .025 * fine

    def image_node(material, name, pixels, linear=False):
        image = bpy.data.images.new(name, width=size, height=size)
        if linear:
            image.colorspace_settings.name = 'Non-Color'
        rgba = np.ones((size, size, 4), dtype=np.float32)
        rgba[:, :, :3] = pixels
        image.pixels.foreach_set(rgba.ravel())
        image.pack()
        node = material.node_tree.nodes.new('ShaderNodeTexImage')
        node.image = image
        return node

    def feather_surface(material, base, strength):
        nodes, links = material.node_tree.nodes, material.node_tree.links
        shader = nodes.get('Principled BSDF')
        shade = .77 + .16 * barbs + .10 * fine + .06 * rachis
        color = np.array(base)[None, None, :] * shade[:, :, None]
        tex = image_node(material, material.name + ' fine barbs', color)
        links.new(tex.outputs['Color'], shader.inputs['Base Color'])
        dy, dx = np.gradient(vane_height)
        normal_rgb = np.stack((.5 - dx * 1.5, .5 - dy * 1.5, np.ones_like(dx)), axis=-1)
        tex = image_node(material, material.name + ' barb normal', normal_rgb, True)
        normal = nodes.new('ShaderNodeNormalMap')
        normal.inputs['Strength'].default_value = strength
        links.new(tex.outputs['Color'], normal.inputs['Color'])
        links.new(normal.outputs['Normal'], shader.inputs['Normal'])
        roughness = np.repeat((.40 + .13 * (1 - barbs))[:, :, None], 3, axis=2)
        tex = image_node(material, material.name + ' barb roughness', roughness, True)
        links.new(tex.outputs['Color'], shader.inputs['Roughness'])

    feather_surface(vane, (.045, .061, .082), .65)
    feather_surface(covert, (.038, .047, .064), .42)
    # Short, fine strands flow over the continuous body and crown rather than tiling scales.
    strand = .5 + .5 * np.sin(u * math.tau * 180 + np.sin(v * math.tau * 7) * 2)
    tex = image_node(charcoal, 'Fine down colour', np.array([.027, .032, .043])[None, None, :] * (.78 + .20 * strand[:, :, None] + .07 * fine[:, :, None]))
    shader = charcoal.node_tree.nodes.get('Principled BSDF')
    charcoal.node_tree.links.new(tex.outputs['Color'], shader.inputs['Base Color'])
    dy, dx = np.gradient(.055 * strand + .012 * fine)
    tex = image_node(charcoal, 'Fine down normal', np.stack((.5 - dx, .5 - dy, np.ones_like(dx)), axis=-1), True)
    normal = charcoal.node_tree.nodes.new('ShaderNodeNormalMap')
    normal.inputs['Strength'].default_value = .45
    charcoal.node_tree.links.new(tex.outputs['Color'], normal.inputs['Color'])
    charcoal.node_tree.links.new(normal.outputs['Normal'], shader.inputs['Normal'])

    def ellipsoid(name, pos, scale, material, pivot, tilt=0):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=18, location=pos)
        obj = bpy.context.object
        obj.name = name
        obj.scale = scale
        obj.rotation_euler.y = tilt
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.data.materials.append(material)
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        parent(obj, pivot)
        return obj

    def mesh(name, vertices, faces, material, pivot, coordinates=None):
        data = bpy.data.meshes.new(name)
        data.from_pydata(vertices, [], faces)
        data.update()
        obj = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(obj)
        data.materials.append(material)
        if coordinates:
            uv = data.uv_layers.new(name='Feather vane UV')
            for polygon in data.polygons:
                for loop in polygon.loop_indices:
                    uv.data[loop].uv = coordinates[data.loops[loop].vertex_index]
        for polygon in data.polygons:
            polygon.use_smooth = True
        parent(obj, pivot)
        return obj

    def feather(name, start, end, width, material, pivot, outward=(0, -1, 0), camber=.014, rows=12):
        start, end, outward = Vector(start), Vector(end), Vector(outward).normalized()
        axis = end - start
        across = outward.cross(axis).normalized()
        vertices, coordinates, faces = [], [], []
        columns = 5
        for j in range(rows + 1):
            t = j / rows
            # Broad, rounded end with a small asymmetric point, unlike diamond-shaped leaves.
            profile = (.24 + .76 * math.sin(math.pi * min(1, t * .83))) * max(0, 1 - t ** 8) ** .5
            profile = max(.005, profile)
            for k in range(columns):
                side = (k / (columns - 1)) * 2 - 1
                skew = .91 if side < 0 else 1.05
                nick = 1 - .025 * math.sin(j * 2.7 + k) ** 6
                bow = camber * math.sin(math.pi * t) * (1 - side * side)
                point = start + axis * t + across * (width * side * profile * skew * nick) + outward * bow
                vertices.append(tuple(point))
                coordinates.append((k / (columns - 1), t))
            if j:
                for k in range(columns - 1):
                    a = (j - 1) * columns + k
                    # Front face points outward so the feathers stay visible in WebGL.
                    faces.append((a, a + columns, a + columns + 1, a + 1))
        return mesh(name, vertices, faces, material, pivot, coordinates)

    # Keep the existing brass perch so the new bird still belongs in the hall.
    for z, radius, depth in [(.08, .76, .16), (.22, .70, .10), (.44, .58, .38), (.66, .63, .09)]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=radius, depth=depth, location=(0, 0, z))
        obj = bpy.context.object
        bevel = obj.modifiers.new('Turned perch edges', 'BEVEL')
        bevel.width, bevel.segments = .016, 3
        bpy.ops.object.modifier_apply(modifier=bevel.name)
        api['finish'](obj, 'Pedestal', gold if depth < .17 else leather, root)
    for radius, z in [(.66, .279), (.59, .712), (.53, .714)]:
        curve('Perch inlay', [(radius * math.cos(i * math.pi / 32), radius * math.sin(i * math.pi / 32), z) for i in range(64)], edge, root, .006, True)
    for i in range(12):
        a = i * math.pi / 6
        curve('Perch fluting', [(.581 * math.cos(a), .581 * math.sin(a), .31), (.581 * math.cos(a), .581 * math.sin(a), .53)], gold, root, .008)

    body = empty('raven_body', (0, 0, 1.58), root)

    def sample_profile(profile, t):
        t = max(0, min(1, t)) * (len(profile) - 1)
        i = min(len(profile) - 2, int(t))
        f = t - i
        p0 = np.array(profile[max(0, i - 1)])
        p1 = np.array(profile[i])
        p2 = np.array(profile[i + 1])
        p3 = np.array(profile[min(len(profile) - 1, i + 2)])
        return .5 * ((2 * p1) + (-p0 + p2) * f + (2*p0 - 5*p1 + 4*p2 - p3)*f*f + (-p0 + 3*p1 - 3*p2 + p3)*f*f*f)

    body_profile = [
        (.98, -.15, .008, .008), (1.11, -.16, .18, .17),
        (1.31, -.15, .31, .255), (1.53, -.085, .36, .291),
        (1.76, .015, .33, .277), (1.94, .115, .267, .238),
        (2.12, .20, .242, .226), (2.30, .28, .217, .198),
        (2.40, .32, .08, .08), (2.43, .32, .008, .008),
    ]
    head_profile = [
        (.065, 2.34, .012, .022), (.14, 2.36, .145, .145),
        (.25, 2.365, .207, .183), (.36, 2.36, .218, .177),
        (.46, 2.345, .192, .139), (.555, 2.322, .13, .094),
        (.64, 2.31, .074, .047), (.665, 2.31, .009, .013),
    ]
    def point_on_profile(profile, t, angle, is_head=False, lift=0):
        z, center, rx, ry = sample_profile(profile, t)
        if is_head:
            return Vector((z, (rx + lift) * math.sin(angle), center + (ry + lift) * math.cos(angle)))
        return Vector((center + (rx + lift) * math.cos(angle), (ry + lift) * math.sin(angle), z))

    def organic_loft(name, profile, pivot, is_head=False):
        vertices, faces, coordinates = [], [], []
        rows, columns = 44, 48
        for j in range(rows + 1):
            for k in range(columns + 1):
                vertices.append(tuple(point_on_profile(profile, j/rows, k/columns*math.tau, is_head)))
                coordinates.append((k / columns, j / rows))
                if j and k:
                    a = (j-1)*(columns+1)+k-1
                    faces.append((a, a+1, a+columns+2, a+columns+1) if not is_head else (a, a+columns+1, a+columns+2, a+1))
        return mesh(name, vertices, faces, charcoal, pivot, coordinates)

    organic_loft('Continuous breast neck and back', body_profile, body)
    head = empty('raven_head', (.32, 0, 2.25), body)
    organic_loft('Sculpted crown and cheeks', head_profile, head, True)

    def fine_plumage(profile, pivot, is_head=False):
        vertices, faces, coordinates = [], [], []
        rings, columns = (20, 44) if is_head else (24, 40)
        for row in range(rings):
            for col in range(columns):
                # Head feathers sweep back from the bill; body contour feathers flow downward.
                t0 = .20 + row / rings * (.64 if is_head else .65)
                angle = (col + (row % 2)*.5 + rng.uniform(-.14,.14)) / columns * math.tau
                length = (.074 if is_head else .082) * rng.uniform(.82, 1.22)
                offset = len(vertices)
                for j in range(7):
                    t = j/6
                    width = (.066 if is_head else .087) * math.sin(math.pi*t)**.55
                    for k in range(3):
                        side = k-1
                        lift = (.0025 if is_head else .007) + (.0012 if is_head else .004) * math.sin(math.pi*t)*(1-side*side)
                        point = point_on_profile(profile, t0-length*t, angle+width*side, is_head, lift)
                        vertices.append(tuple(point))
                        coordinates.append((k/2,t))
                    if j:
                        for k in range(2):
                            a = offset+(j-1)*3+k
                            faces.append((a,a+3,a+4,a+1) if not is_head else (a,a+1,a+4,a+3))
        mesh('Fine crown feathering' if is_head else 'Fine body contour plumage', vertices, faces, charcoal, pivot, coordinates)
    fine_plumage(body_profile, body)
    fine_plumage(head_profile, head, True)

    # Raven-like heavy culmen, flattened mandible and hooked bill tip, with a visible seam.
    for lower in [False, True]:
        vertices, faces = [], []
        for j in range(19):
            t = j / 18
            x = .51 + .51 * t
            radius = .123 * (1 - t) ** .72 + .0008
            center = 2.315 - .028 * t - .068 * t ** 3
            for k in range(18):
                a = k / 18 * math.tau
                y = math.cos(a) * radius * .73
                z = center + math.sin(a) * radius * (.31 if lower else .74)
                if lower:
                    z -= .043 * (1 - t) + .005
                vertices.append((x, y, z))
            if j:
                for k in range(18):
                    a = (j - 1) * 18 + k
                    b = (j - 1) * 18 + (k + 1) % 18
                    faces.append((a, b, b + 18, a + 18))
        mesh('Lower mandible' if lower else 'Heavy curved upper bill', vertices, faces, keratin, head)
    for side in [-1, 1]:
        curve('Bill gape', [(.54, side * .077, 2.287), (.69, side * .064, 2.277), (.89, side * .030, 2.243), (1.015, side * .001, 2.214)], charcoal, head, .0025)
        ellipsoid('Nostril', (.615, side * .070, 2.337), (.030, .004, .009), pupil, head, -.10)
        # Fine nasal bristles partly cover the bill base.
        for i in range(15):
            yy = side * (.015 + i * .004)
            feather('Nasal bristle', (.46 + i * .004, yy, 2.388 - i * .002), (.66 + i * .002, yy * .78, 2.35 - i * .002), .004, charcoal, head, (0, side * .5, .85), .002, 6)

    eyes = empty('raven_eye', (.455, 0, 2.389), head)
    for side in [-1, 1]:
        ellipsoid('Subtle orbital rim', (.455, side * .187, 2.389), (.041, .012, .037), keratin, head)
        ellipsoid('Dark umber iris', (.46, side * .198, 2.391), (.026, .010, .025), iris, eyes)
        ellipsoid('Black pupil', (.464, side * .205, 2.393), (.021, .007, .022), pupil, eyes)
        ellipsoid('Small reflected highlight', (.458, side * .211, 2.402), (.005, .0025, .005), glint, eyes)
        # A feathered brow gives the eye a deliberate, observant expression.
        feather('Brow feathers', (.36, side * .195, 2.42), (.535, side * .166, 2.395), .026, covert, head, (0, side, .3), .004, 10)

    # Tarsus and three forward toes plus a rear hallux: feet grip the pedestal.
    for y in [-.155, .155]:
        curve('Scaled tarsus', [(-.04, y, 1.12), (.035, y, .91), (-.015, y, .748)], claw, root, .021)
        for i in range(7):
            z = .79 + i * .032
            x = -.005 + .037 * math.sin((z - .75) * math.pi / .38)
            curve('Tarsal scute', [(x + .016, y - .016, z), (x + .024, y, z - .004), (x + .016, y + .016, z)], keratin, root, .003)
        for i in range(3):
            yy = y + (i - 1) * .065
            tipx = .235 - abs(i - 1) * .035
            curve('Articulated forward toe', [(-.014, y, .749), (.055, yy, .738), (.13, yy + (i - 1) * .012, .725), (tipx, yy, .719)], claw, root, .012)
            curve('Curved talon', [(tipx - .018, yy, .72), (tipx + .025, yy, .716), (tipx + .045, yy, .698)], keratin, root, .006)
        curve('Rear hallux', [(-.03, y, .747), (-.12, y + .025, .731), (-.21, y + .031, .716)], claw, root, .011)
        curve('Rear talon', [(-.20, y + .031, .718), (-.245, y + .034, .694)], keratin, root, .006)

    tail = empty('raven_tail', (-.32, .02, 1.31), body)
    for i in range(12):
        offset = (i - 5.5) / 5.5
        feather('Graduated wedge tail', (-.28, offset * .10, 1.40), (-1.04 + .18 * abs(offset), offset * .19, .75 + .07 * abs(offset)), .045, vane, tail, (0, -.30, .95), .015)

    for side, label in [(-1, 'left'), (1, 'right')]:
        wing = empty('raven_wing_' + label, (.08, side * .235, 1.94), body)
        ellipsoid('Folded wing volume', (-.215, side * .257, 1.57), (.178, .079, .405), charcoal, wing, .59)
        # Long primaries lie along the flank, with a graduated, swept-back trailing edge.
        for i in range(10):
            feather('Layered primary', (.08 - i * .033, side * (.350 + .007 * math.sin(i)), 1.78 - i * .014),
                    (-.60 - i * .027, side * (.22 + i * .008), 1.10 - .020 * i), .049,
                    vane, wing, (0, side, .10), .019)
        for i in range(8):
            feather('Rounded secondary', (.155 - i * .067, side * (.359 + .009 * math.sin(i * .5)), 1.96 - i * .030),
                    (-.18 - i * .065, side * (.370 - i * .007), 1.43 - i * .027), .057,
                    vane, wing, (0, side, .12), .015)
        # Small coverts overlap along the wing's curvature, irregularly staggered.
        for row in range(4):
            for col in range(7):
                x = .10 - col * .055 - row * .032
                z = 2.025 - row * .112 - col * .023
                bulge = .345 + .040 * math.sin((row + 1) / 5 * math.pi) * math.sin((col + 1) / 8 * math.pi)
                feather('Soft overlapping covert', (x, side * bulge, z),
                        (x - .135 - row * .012, side * (bulge + .012), z - .20 - row * .017),
                        .040, covert, wing, (0, side, .18), .008, 10)
        for i in range(12):
            feather('Shoulder mantle', (.19 - i * .035, side * (.21 + .042 * math.sin(i / 12 * math.pi)), 2.05 - i * .012),
                    (.07 - i * .045, side * .275, 1.82 - i * .015), .032, covert, wing, (0, side, .45), .009, 10)

    # Fine tapering throat hackles break the silhouette, a defining raven characteristic.
    for row in range(3):
        for i in range(15):
            a = -.95 + i / 14 * 1.9
            t = .755 - row * .055
            start = point_on_profile(body_profile, t, a, lift=.007)
            end = point_on_profile(body_profile, t - rng.uniform(.070, .100), a * 1.04, lift=.034)
            feather('Shaggy throat hackle', tuple(start), tuple(end),
                    .010 + rng.uniform(0, .006), covert, body, (math.cos(a), math.sin(a), .12), .006, 9)
    # Sparse fine contour feathers soften the neck/body junction and back outline.
    for side in [-1, 1]:
        for i in range(16):
            x = .065 - i * .019
            z = 2.13 - i * .031
            feather('Nape contour', (x, side * .19, z), (x - .09, side * .22, z - .18), .013,
                    charcoal, body, (-.4, side, .1), .003, 8)

    # A smaller, slightly tilted letter is visibly pinched at the bill tip.
    envelope = empty('envelope', (.995, -.005, 2.224), head)
    box('Parchment envelope', (.98, -.009, 2.054), (.44, .020, .32), paper, envelope, .006)
    curve('Envelope fold', [(.76, -.024, 2.208), (.98, -.024, 2.02), (1.20, -.024, 2.208)], thread, envelope, .003)
    ellipsoid('Wax seal', (.98, -.029, 2.025), (.042, .010, .042), gold, envelope)
    text('Seal H', 'H', (.98, -.042, 2.025), .054, edge, envelope)
    envelope.rotation_euler.y = -.10
    return root
