"""Original web assets. Run Blender -b --python scripts/build-artifacts.py [-- --blockout]."""
import bpy, math, random, os, sys, json
from mathutils import Vector
from math import sin, cos, pi
random.seed(14)
BASE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(BASE,'public','models');os.makedirs(OUT,exist_ok=True)
BLOCK='--blockout' in sys.argv
ONLY=sys.argv[sys.argv.index('--asset')+1] if '--asset' in sys.argv else None
if ONLY and ONLY not in ['spellbook','satchel','raven','doors']:raise ValueError('Unknown artifact: '+ONLY)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color,metal=0,rough=.5):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
leather=mat('Obsidian leather',(.032,.019,.014),0,.64);brown=mat('Chestnut leather',(.105,.039,.016),0,.6)
gold=mat('Antique brass',(.55,.31,.095),.8,.3);edge=mat('Gold edges',(.73,.48,.19),.78,.25);paper=mat('Parchment',(.59,.43,.24),0,.83);thread=mat('Linen',(.40,.24,.10),0,.9)
black=mat('Obsidian feathers',(.006,.009,.014),.12,.57);blue=mat('Iridescent feathers',(.012,.023,.038),.35,.46);beak=mat('Keratin',(.011,.013,.018),.18,.25);eye=mat('Amber iris',(.32,.135,.025),.4,.17);ink=mat('Ink',(.042,.028,.016),0,.8)
if not BLOCK:
 import numpy as np
 rng=np.random.default_rng(14);size=512;grain=rng.random((size,size));broad=np.sin(np.arange(size)[:,None]*.085)*np.cos(np.arange(size)[None,:]*.073);height=.65*grain+.35*broad
 for material,color in [(leather,(.13,.085,.055)),(brown,(.31,.15,.065))]:
  image=bpy.data.images.new(material.name+' grain',width=size,height=size);pixels=np.ones((size,size,4),dtype=np.float32);pixels[:,:,:3]=np.array(color)[None,None,:]*(.73+.4*height[:,:,None]);image.pixels.foreach_set(pixels.ravel());image.pack();nodes=material.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=image;material.node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
  normal=bpy.data.images.new(material.name+' normal',width=size,height=size);normal.colorspace_settings.name='Non-Color';dy,dx=np.gradient(height);pixels[:,:,:3]=np.stack((.5-dx*.25,.5-dy*.25,np.ones_like(dx)),axis=-1);normal.pixels.foreach_set(pixels.ravel());normal.pack();texn=nodes.new('ShaderNodeTexImage');texn.image=normal;n=nodes.new('ShaderNodeNormalMap');n.inputs['Strength'].default_value=.45;material.node_tree.links.new(texn.outputs['Color'],n.inputs['Color']);material.node_tree.links.new(n.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal'])
def parent(o,p):
 bpy.context.view_layer.update()
 if p:o.parent=p;o.matrix_parent_inverse=p.matrix_world.inverted()
 return o
def empty(name,pos=(0,0,0),p=None):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.location=pos;return parent(o,p)
def finish(o,name,material,p=None):
 o.name=name;o.data.materials.append(material)
 for poly in o.data.polygons:poly.use_smooth=True
 return parent(o,p)
def box(name,pos,scale,material,p=None,bevel=.03):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Crafted edges','BEVEL');mod.width=bevel;mod.segments=3 if not BLOCK else 1;bpy.ops.object.modifier_apply(modifier=mod.name);mod=o.modifiers.new('Normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,name,material,p)
def sphere(name,pos,scale,material,p=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20 if not BLOCK else 12,ring_count=12 if not BLOCK else 8,location=pos);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,material,p)
def curve(name,points,material,p=None,r=.015,cyclic=False):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=2;c.bevel_depth=r;c.bevel_resolution=2;s=c.splines.new('POLY');s.points.add(len(points)-1)
 for a,b in zip(s.points,points):a.co=(*b,1)
 s.use_cyclic_u=cyclic;o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);c.materials.append(material);bpy.ops.object.select_all(action='DESELECT');bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return parent(o,p)
def ring(name,x,y,z,r,material,p=None):return curve(name,[(x+r*cos(i*2*pi/64),y,z+r*sin(i*2*pi/64)) for i in range(64)],material,p,.012,True)
def text(name,body,pos,size,material,p=None):
 c=bpy.data.curves.new(name,'FONT');c.body=body;c.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Georgia.ttf');c.align_x='CENTER';c.align_y='CENTER';c.size=size;c.extrude=.009;c.bevel_depth=.002;o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(pi/2,0,0);c.materials.append(material);
 if size<.08:c.resolution_u=2;c.extrude=.001;c.bevel_depth=0
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');return parent(o,p)
def border(x,z,w,h,y,material,p,r=.014):return curve('Inlay',[(x-w/2,y,z-h/2),(x+w/2,y,z-h/2),(x+w/2,y,z+h/2),(x-w/2,y,z+h/2)],material,p,r,True)
def stitch(x,z,w,h,y,p):
 if BLOCK:return
 for side in [-1,1]:
  for i in range(int(h/.07)):
   zz=z-h/2+i*.07;curve('Stitch',[(x+side*w/2,y,zz),(x+side*w/2,y,zz+.029)],thread,p,.004)
  for i in range(int(w/.07)):
   xx=x-w/2+i*.07;curve('Stitch',[(xx,y,z+side*h/2),(xx+.029,y,z+side*h/2)],thread,p,.004)
def book():
 root=empty('book_root');box('back_cover',(0,.26,1.8),(2.65,.14,3.65),leather,root,.07);box('page_block',(0,0,1.8),(2.46,.39,3.44),paper,root,.035);box('left_pages',(-.62,-.205,1.8),(1.20,.014,3.4),paper,root,.01);box('right_pages',(.62,-.21,1.8),(1.20,.014,3.4),paper,root,.01);box('spine',(-1.30,0,1.8),(.19,.64,3.66),brown,root,.08)
 cover=empty('front_cover',(-1.3,-.28,1.8),root);box('leather_cover',(0,-.30,1.8),(2.63,.14,3.65),leather,cover,.05)
 for w,h,y in [(2.46,3.48,-.385),(2.30,3.32,-.385),(2.12,3.10,-.38)]:border(0,1.8,w,h,y,gold,cover)
 stitch(0,1.8,2.2,3.2,-.387,cover);curve('Diamond crest',[(0,-.41,.57),(1.02,-.41,1.8),(0,-.41,3.03),(-1.02,-.41,1.8)],edge,cover,.023,True);ring('Crest outer',0,-.44,1.8,.62,gold,cover);ring('Crest inner',0,-.455,1.8,.54,edge,cover);text('H_crest','H',(0,-.48,1.8),.70,edge,cover)
 if not BLOCK:
  for k in range(12):
   a=k*pi/6;pts=[]
   for j in range(22):
    t=j/21*pi;r=.56+.19*sin(t);ang=a+.12*sin(2*t);pts.append((r*cos(ang),-.445,1.8+r*sin(ang)))
   curve('Crest leaf',pts,gold,cover,.012)
   curve('Leaf vein',[(.55*cos(a),-.45,1.8+.55*sin(a)),(.77*cos(a),-.45,1.8+.77*sin(a))],edge,cover,.007)
  for sx in [-1,1]:
   for sz in [-1,1]:
    x=sx*1.17;z=1.8+sz*1.63;box('Corner',(x,-.405,z),(.2,.055,.2),gold,cover,.02)
    for offset in [0,.16]:
     pts=[]
     for j in range(48):
      t=j/47*2*pi*1.7;r=.26*(1-j/53);pts.append((x-sx*(.15+offset)+r*cos(t)*sx,-.418,z-sz*.15+r*sin(t)*sz))
     curve('Filigree',pts,edge,cover,.009)
  for i in range(32):
   a=i*pi/16;sphere('Crest rivet',(.59*cos(a),-.456,1.8+.59*sin(a)),(.017,.013,.017),edge,cover)
  for i in range(28):box('Deckle edge',(1.232,-.17+i*.012,1.8),(.006,.003,3.37),thread,root,0)
 for z in [.25,.62,2.98,3.36]:box('Spine bands',(-1.30,0,z),(.22,.68,.09),gold,root,.035)
 clasp=empty('clasp',(1.32,-.12,1.72),root);box('clasp_arm',(1.22,-.43,1.72),(.42,.09,.22),gold,clasp,.03);sphere('clasp_pin',(1.08,-.49,1.72),(.07,.026,.07),edge,clasp)
 for name,z,symbol in [('character_tab',2.85,'I'),('quests_tab',1.8,'II'),('journey_tab',.75,'III')]:
  tab=empty(name,(1.40,0,z),root);box(name+'_leather',(1.43,-.04,z),(.33,.16,.73),brown,tab,.025);border(1.46,z,.25,.65,-.13,gold,tab,.01);text(name+'_mark',symbol,(1.47,-.145,z),.13,edge,tab)
 return root
def satchel():
 root=empty('satchel_root')
 lining=mat('Warm suede lining',(.065,.033,.018),0,.95)
 piping=mat('Burnished leather edges',(.17,.072,.025),0,.52)
 card_blue=mat('Midnight card leather',(.018,.035,.061),0,.67)
 card_green=mat('Forest card leather',(.029,.063,.043),0,.72)
 card_wine=mat('Oxblood card leather',(.09,.025,.018),0,.68)
 # An open shell: a soft exterior, a separate inward-facing lining, a sewn
 # rim and a recessed floor. No top face or fake black opening plane.
 segments=64
 rings=[(.13,1.00,.37),(.20,1.14,.46),(.48,1.23,.54),(1.12,1.23,.55),(1.60,1.16,.49),(1.88,1.10,.43),
        (1.87,1.035,.365),(1.56,1.085,.405),(.54,1.15,.45),(.27,1.04,.37)]
 verts=[]
 for row,(height,width,depth) in enumerate(rings):
  for i in range(segments):
   a=i*2*pi/segments;cx=cos(a);sy=sin(a)
   x=width*math.copysign(abs(cx)**.52,cx);y=depth*math.copysign(abs(sy)**.52,sy)
   # Dipped front lip and gentle asymmetric fabric tension around the gussets.
   z=height+(max(0,(height-1.4)/.48)*.095*sy)
   if row<6:
    x+=.014*sin(3*a+height*4)*sin(pi*height/2)
    y+=.012*sin(5*a+height*3)*sin(pi*height/2)
   verts.append((x,y,z))
 faces=[];indices=[]
 for row in range(len(rings)-1):
  for i in range(segments):
   a=row*segments+i;b=row*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments));indices.append(0 if row<5 else 2 if row==5 else 1)
 faces.append(tuple(reversed(range(segments))));indices.append(0)
 faces.append(tuple((len(rings)-1)*segments+i for i in range(segments)));indices.append(1)
 mesh=bpy.data.meshes.new('Hollow leather shell');mesh.from_pydata(verts,[],faces);mesh.update()
 shell=bpy.data.objects.new('bag_shell',mesh);bpy.context.collection.objects.link(shell);parent(shell,root)
 for material in [brown,lining,piping]:mesh.materials.append(material)
 uv=mesh.uv_layers.new(name='Leather UV')
 for poly,material_index in zip(mesh.polygons,indices):
  poly.material_index=material_index;poly.use_smooth=len(poly.vertices)==4
  for li in poly.loop_indices:
   vertex=mesh.vertices[mesh.loops[li].vertex_index];uv.data[li].uv=(vertex.co.x*.4+.5,vertex.co.z*.48)
 rim=verts[5*segments:6*segments]
 curve('Rolled mouth binding',rim,piping,root,.027,True)
 curve('Mouth saddle stitch',[(x*.983,y*.983,z-.035) for x,y,z in rim],thread,root,.007,True)
 # Side gussets retain the recognizable bag silhouette when the flap rises.
 for side in [-1,1]:
  x=side*1.22
  box('Soft side pocket',(side*1.27,.01,.91),(.35,.77,1.13),brown,root,.13)
  curve('Gusset seam',[(side*1.07,.13,.24),(side*1.24,.20,.65),(side*1.26,.21,1.10),(side*1.15,.23,1.66)],piping,root,.018)
  curve('Pocket welt',[(side*1.39,-.29,1.40),(side*1.46,0,1.46),(side*1.39,.29,1.40)],piping,root,.022)
  box('Strap anchor',(side*1.15,.02,1.55),(.16,.12,.40),leather,root,.045)
  # Brass D-ring, genuinely attached to a leather anchor tab.
  curve('Shoulder D ring',[(side*1.13,-.085,1.51),(side*1.28,-.085,1.58),(side*1.29,-.085,1.74),(side*1.12,-.085,1.77)],gold,root,.028,True)
  sphere('Anchor rivet',(side*1.16,-.078,1.47),(.033,.016,.033),edge,root)
 # An exterior pocket remains visible below the raised flap.
 box('Front document pocket',(0,-.525,.78),(1.83,.21,1.01),brown,root,.12)
 stitch(0,.77,1.65,.81,-.638,root)
 curve('Pocket lip',[(-.78,-.639,1.24),(0,-.662,1.22),(.78,-.639,1.24)],piping,root,.024)
 # A curved, continuous leather flap runs from the back hinge over the mouth
 # and down the front. Its two tails travel with it, instead of staying behind.
 flap=empty('satchel_flap',(0,.44,1.95),root)
 path=[(.44,1.95),(.30,1.995),(.10,2.01),(-.15,2.00),(-.38,1.955),(-.53,1.83),(-.605,1.62),(-.62,1.39),(-.61,1.19)]
 fv=[];ff=[];cols=20
 for row,(y,z) in enumerate(path):
  for j in range(cols+1):
   u=j/cols*2-1;w=1.135-(.065 if row==len(path)-1 else 0)*abs(u)**4
   fv.append((u*w,y+.018*u*u,z-.035*u*u))
 for row in range(len(path)-1):
  for j in range(cols):
   a=row*(cols+1)+j;ff.append((a,a+cols+1,a+cols+2,a+1))
 fm=bpy.data.meshes.new('Curved flap');fm.from_pydata(fv,[],ff);fm.update();fo=bpy.data.objects.new('flap_leather',fm);bpy.context.collection.objects.link(fo);finish(fo,'flap_leather',brown,flap)
 fm.materials.append(lining)
 uv=fm.uv_layers.new(name='Flap UV')
 for poly in fm.polygons:
  for li in poly.loop_indices:
   vi=fm.loops[li].vertex_index;uv.data[li].uv=(vi%(cols+1)/cols,vi//(cols+1)/(len(path)-1))
 bpy.context.view_layer.objects.active=fo;fo.select_set(True)
 sub=fo.modifiers.new('Supple leather','SUBSURF');sub.levels=2;bpy.ops.object.modifier_apply(modifier=sub.name)
 thick=fo.modifiers.new('Leather thickness','SOLIDIFY');thick.thickness=.065;thick.offset=0;thick.material_offset=1;bpy.ops.object.modifier_apply(modifier=thick.name)
 for side in [-1,1]:
  curve('Flap edge binding',[(side*(1.135-(.065 if i==len(path)-1 else 0)),y,z-.035) for i,(y,z) in enumerate(path)],piping,flap,.024)
  curve('Flap stitched edge',[(side*1.075,y-.012,z-.014) for y,z in path],thread,flap,.006)
 curve('Flap bottom binding',[(-1.07,-.61,1.155),(-.7,-.625,1.16),(0,-.63,1.16),(.7,-.625,1.16),(1.07,-.61,1.155)],piping,flap,.023)
 for x in [-.74,.74]:
  box('Flap strap tail',(x,-.668,.99),(.19,.075,.61),leather,flap,.045)
  for z in [.79,.88,.97]:sphere('Strap punched hole',(x,-.709,z),(.016,.006,.017),ink,flap)
  sphere('Tail rivet',(x,-.711,1.19),(.028,.012,.028),edge,flap)
  box('Buckle keeper',(x,-.666,.65),(.24,.055,.37),leather,root,.025)
  buckle=empty('buckle_left' if x<0 else 'buckle_right',(x,-.726,.78),root)
  border(x,.75,.25,.29,-.734,gold,buckle,.024)
  curve('Buckle tongue',[(x,-.77,.605),(x,-.78,.77)],edge,buckle,.012)
 # An embossed compass sits on the front-facing part of the flexible flap.
 ring('Compass outer',0,-.663,1.51,.255,gold,flap)
 ring('Compass inner',0,-.668,1.51,.213,piping,flap)
 for i in range(8):
  a=i*pi/4;r=.24 if i%2==0 else .16
  curve('Compass point',[(0,-.68,1.51),(r*cos(a),-.68,1.51+r*sin(a)),(.05*cos(a+.8),-.68,1.51+.05*sin(a+.8))],edge,flap,.009,True)
 sphere('Compass boss',(0,-.687,1.51),(.026,.012,.026),gold,flap)
 # Broad, flat shoulder strap with rounded thickness instead of parallel tubes.
 strap_points=[]
 for i in range(65):
  t=i/64;strap_points.append(Vector((-1.2-.59*sin(pi*t),.22-.38*t+.05*sin(pi*t),1.63-1.43*sin(pi*t))))
 sv=[];frames=[];width=Vector((0,1,0))
 for i,point in enumerate(strap_points):
  tangent=(strap_points[min(i+1,64)]-strap_points[max(i-1,0)]).normalized()
  width=(width-tangent*width.dot(tangent)).normalized()
  frames.append((width.copy(),tangent.cross(width).normalized()))
  sv.extend([tuple(point-width*.105),tuple(point+width*.105)])
 sf=[(i*2,i*2+1,i*2+3,i*2+2) for i in range(len(strap_points)-1)]
 sm=bpy.data.meshes.new('Flat shoulder strap');sm.from_pydata(sv,[],sf);sm.update();so=bpy.data.objects.new('shoulder_strap',sm);bpy.context.collection.objects.link(so);finish(so,'shoulder_strap',brown,root)
 bpy.context.view_layer.objects.active=so
 thick=so.modifiers.new('Strap thickness','SOLIDIFY');thick.thickness=.055;bpy.ops.object.modifier_apply(modifier=thick.name)
 for side in [-1,1]:curve('Shoulder strap stitching',[tuple(point+frames[i][0]*side*.077+frames[i][1]*.03) for i,point in enumerate(strap_points)],thread,root,.006)
 # Four independent, narrower cards sit inside actual slots. Their bounds leave
 # clearance even during the outward fan; no two share a depth plane or edge.
 for i,x in enumerate([-.78,-.26,.26,.78]):
  z=1.32;y=-.075+i*.015
  card=empty('artifact_'+str(i),(x,y,z),root)
  material=[card_blue,card_wine,card_green,paper][i]
  box('Artifact card',(x,y,z),(.435,.065,.74),material,card,.025)
  border(x,z,.375,.67,y-.039,gold,card,.007)
  text('Card label',['STORIES','PURPOSE','WANDER','CINEMA'][i],(x,y-.046,z-.25),.049,edge if i<3 else ink,card)
  if i==0:
   curve('Story tree',[(x,y-.051,z-.11),(x,y-.051,z+.19)],gold,card,.009)
   for j in range(3):
    zz=z-.04+j*.075
    for side in [-1,1]:curve('Tree branch',[(x,y-.051,zz),(x+side*(.105-j*.018),y-.051,zz+.06)],gold,card,.008)
  elif i==1:
   ring('Card compass',x,y-.051,z+.03,.11,gold,card)
   for j in range(4):
    a=j*pi/2;curve('Card compass point',[(x,y-.052,z+.03),(x+.13*cos(a),y-.052,z+.03+.13*sin(a))],edge,card,.009)
  elif i==2:
   curve('Mountain outline',[(x-.15,y-.05,z-.08),(x-.03,y-.05,z+.15),(x+.03,y-.05,z+.04),(x+.09,y-.05,z+.12),(x+.16,y-.05,z-.08)],gold,card,.008)
   sphere('Mountain star',(x+.105,y-.048,z+.205),(.018,.009,.018),edge,card)
  else:
   border(x,z+.035,.24,.25,y-.052,ink,card,.007)
   for side in [-1,1]:
    for j in range(4):box('Film perforation',(x+side*.086,y-.054,z-.05+j*.055),(.022,.008,.023),ink,card,.001)
 return root
def feather(name,pos,length,width,material,p,angle=0):
 verts=[]
 for j in range(9):
  t=j/8;w=width*(sin(pi*t)**.65);zz=-length*t
  for side in [-1,0,1]:
   xx=w*side;yy=-.024*sin(pi*t)+(abs(side)*.023);verts.append((pos[0]+xx*cos(angle)-zz*sin(angle),pos[1]+yy,pos[2]+xx*sin(angle)+zz*cos(angle)))
 faces=[]
 for j in range(8):
  for s in range(2):a=j*3+s;faces.append((a,a+1,a+4,a+3))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);finish(o,name,material,p);return o
def plumage(name,center,radii,material,p,rows=10,columns=20):
 # Overlapping curved feather scales follow an ellipsoidal body, including its silhouette.
 cx,cy,cz=center;rx,ry,rz=radii
 for row in range(rows):
  polar=.18+row/(rows-1)*2.35
  for col in range(columns):
   theta=col/columns*2*pi+(row%2)*pi/columns
   verts=[]
   for j in range(7):
    t=j/6;phi=polar+t*.43;w=.105*(sin(pi*t)**.8)
    for side in [-1,0,1]:
     az=theta+side*w;rad=1.035+.03*sin(pi*t)*(1-abs(side))
     verts.append((cx+rx*sin(phi)*cos(az)*rad,cy+ry*sin(phi)*sin(az)*rad,cz+rz*cos(phi)))
   faces=[]
   for j in range(6):
    for side in range(2):i=j*3+side;faces.append((i,i+1,i+4,i+3))
   m=bpy.data.meshes.new(name);m.from_pydata(verts,[],faces);m.update();o=bpy.data.objects.new(name,m);bpy.context.collection.objects.link(o);finish(o,name,blue if (row+col)%5==0 else material,p)
def raven():
 sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
 from raven_geometry import build_raven
 return build_raven(globals())
def doors():
 root=empty('doorway_root')
 stone=mat('Weathered basalt',(.065,.070,.078),0,.94)
 iron=mat('Hammered black iron',(.035,.033,.029),.68,.72)
 oak=mat('Fumed oak',(.042,.028,.018),0,.83)
 bronze=mat('Oxidized bronze',(.18,.115,.054),.72,.62)
 if not BLOCK:
  # Original tileable PBR maps: broad wear, pores, directional fibres and pits.
  size=512;xx,yy=np.meshgrid(np.arange(size)/size,np.arange(size)/size)
  def noise(sx,sy,seed):
   source=np.random.default_rng(seed).normal(size=(size,size))
   fx=np.fft.fftfreq(size)[None,:];fy=np.fft.fftfreq(size)[:,None]
   field=np.fft.ifft2(np.fft.fft2(source)*np.exp(-((fx*sx)**2+(fy*sy)**2))).real
   return (field-field.mean())/(field.std()+1e-8)
  fine=noise(1.2,1.2,42);cloud=noise(38,38,25)
  fibres=noise(2,90,16);wood=.45+.09*fibres+.035*noise(8,130,17)+.025*fine
  pores=np.maximum(0,-fibres-1.0)
  stone_height=.45+.10*noise(7,7,56)+.055*fine+.03*cloud
  iron_height=.5+.06*noise(4,4,98)+.02*fine
  def pbr(material,color,height,variation,roughness,strength):
   nodes=material.node_tree.nodes;links=material.node_tree.links;shader=nodes.get('Principled BSDF')
   def image_node(suffix,rgb,linear=False):
    image=bpy.data.images.new(material.name+' '+suffix,width=size,height=size)
    if linear:image.colorspace_settings.name='Non-Color'
    pixels=np.ones((size,size,4),dtype=np.float32);pixels[:,:,:3]=np.clip(rgb,0,1)
    image.pixels.foreach_set(pixels.ravel());image.pack()
    tex=nodes.new('ShaderNodeTexImage');tex.image=image
    if material==stone:
     folder=os.path.join(OUT,'materials');os.makedirs(folder,exist_ok=True)
     image.filepath_raw=os.path.join(folder,'basalt-'+suffix+'.png');image.file_format='PNG';image.save()
    return tex
   color_tex=image_node('color',np.array(color)[None,None,:]*variation[:,:,None])
   links.new(color_tex.outputs['Color'],shader.inputs['Base Color'])
   dy,dx=np.gradient(height);normal=np.stack((-dx*strength,-dy*strength,np.ones_like(dx)),axis=-1);normal/=np.linalg.norm(normal,axis=-1)[:,:,None]
   tex=image_node('normal',normal*.5+.5,True);n=nodes.new('ShaderNodeNormalMap');links.new(tex.outputs['Color'],n.inputs['Color']);links.new(n.outputs['Normal'],shader.inputs['Normal'])
   tex=image_node('roughness',np.repeat(np.clip(roughness+.045*cloud+.03*fine,.35,1)[:,:,None],3,axis=2),True)
   links.new(tex.outputs['Color'],shader.inputs['Roughness'])
  pbr(oak,(.19,.124,.077),wood-.035*pores,np.clip(.88+.16*fibres+.075*cloud-.13*pores,.32,1.4),.83,5)
  pbr(stone,(.205,.217,.232),stone_height,np.clip(.86+.09*cloud+.065*fine,.45,1.3),.93,3)
  pbr(iron,(.105,.095,.08),iron_height,np.clip(.85+.09*cloud+.1*fine,.35,1.3),.72,4)
  pbr(bronze,(.28,.192,.095),iron_height,np.clip(.8+.13*cloud,.3,1.3),.64,3)
 def slab(name,outline,front,back,material,p):
  n=len(outline);verts=[(x,y,z) for y in [front,back] for x,z in outline]
  faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
  mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);finish(o,name,material,p)
  bpy.context.view_layer.objects.active=o;o.select_set(True)
  bevel=o.modifiers.new('Solid softened edges','BEVEL');bevel.width=.025;bevel.segments=2;bpy.ops.object.modifier_apply(modifier=bevel.name);o.select_set(False)
  return o
 # Full-depth stone jambs, individual voussoirs, and a raised threshold.
 for side in [-1,1]:
  for i in range(10):box('Jamb stone',(side*3.53,0,.26+i*.5),(.64,.95,.48),stone,root,.035)
  box('Stone footing',(side*3.53,0,.13),(.91,1.25,.26),stone,root,.045)
  box('Capital',(side*3.53,0,5.03),(.90,1.14,.19),stone,root,.035)
  box('Corridor wall',(side*8.05,.12,4.6),(8.3,.8,9.2),stone,root,.05)
  for z in [1,2,3,4,5,6,7,8]:
   box('Wall bed joint',(side*8.05,-.291,z),(8.25,.018,.014),iron,root,0)
  for x in [4.5,6,7.5,9,10.5]:
   for row in range(8):box('Wall vertical joint',(side*(x+(row%2)*.7),-.292,row+.5),(.012,.018,.98),iron,root,0)
 for i in range(16):
  a=-pi/2+i*pi/16+.008;b=-pi/2+(i+1)*pi/16-.008
  outline=[(3.22*sin(a),5+1.65*cos(a)),(3.22*sin(b),5+1.65*cos(b)),(3.85*sin(b),5+2.28*cos(b)),(3.85*sin(a),5+2.28*cos(a))]
  slab('Arch stone',outline,-.49,.49,stone,root)
 # The masonry above the arch closes the corridor wall without filling the opening.
 outline=[(-3.85,9.2),(3.85,9.2)]+[(3.85*sin(pi/2-i*pi/24),5+2.28*cos(pi/2-i*pi/24)) for i in range(25)]
 slab('Arch spandrel',outline,-.28,.52,stone,root)
 box('Threshold',(0,0,.025),(7.8,1.4,.05),stone,root,.01)
 for side,label in [(-1,'left'),(1,'right')]:
  hinge=empty('door_leaf_'+label,(side*3.19,0,0),root)
  arc=[(side*3.18*sin(pi/2-i*pi/24),5+1.62*cos(pi/2-i*pi/24)) for i in range(13)]
  outline=[(side*3.18,.07)]+arc+[(side*.012,.07)]
  if side==1:outline.reverse()
  slab('Solid oak door',outline,-.19,.17,oak,hinge)
  # Raised rails and recessed panels give the door real depth on both faces.
  for y in [-.255,.215]:
   for x in [side*.13,side*3.05]:box('Door stile',(x,y,2.65),(.13,.105,5.12),oak,hinge,.018)
   for z in [.2,1.1,4.95]:box('Door rail',(side*1.59,y,z),(3.0,.105,.15),oak,hinge,.018)
   for j in range(7):
    x=side*(.32+j*.4);box('Recessed plank',(x,y+.02 if y<0 else y-.02,3.0),(.385,.026,3.73),oak,hinge,.006)
   border(side*1.59,3.0,2.64,3.60,y-.065 if y<0 else y+.065,bronze,hinge,.013)
  # The upper planks follow the arch instead of ending in a smooth blank semicircle.
  for j in range(8):
   lo=.02+j*.39;hi=min(3.15,lo+.375)
   top=lambda x:5+1.62*math.sqrt(max(0,1-(x/3.18)**2))-.06
   outline=[(side*lo,5.08),(side*hi,5.08),(side*hi,top(hi)),(side*lo,top(lo))]
   if side==1:outline.reverse()
   slab('Arched oak plank',outline,-.218,-.188,oak,hinge)
  # Forged branches grow out of the structural straps; decoration stays unbranded.
  for z,direction in [(1.02,1),(4.99,-1)]:
   for offset in [0,.57]:
    points=[]
    for i in range(28):
     t=i/27;angle=t*pi*1.15;radius=.44*(1-t*.7)
     points.append((side*(1.9+offset-radius*sin(angle)),-.30,z+direction*(.05+t*.25+radius*(1-cos(angle)))))
    curve('Forged branching hinge',points,iron,hinge,.025)
  arch=[(side*3.02*sin(pi/2-i*pi/28),5+1.45*cos(pi/2-i*pi/28)) for i in range(15)]
  curve('Arched iron rail',arch and [(x,-.26,z) for x,z in arch],iron,hinge,.045)
  for z in [1.02,4.99]:
   slab('Hinge strap',[(side*3.15,z-.10),(side*.72,z-.055),(side*.46,z),(side*.72,z+.055),(side*3.15,z+.10)],-.335,-.28,iron,hinge)
   for j in range(7):sphere('Forged rivet',(side*(.85+j*.35),-.349,z),(.035,.015,.035),bronze,hinge)
  for z in [.55,2.85,5.0]:
   box('Hinge barrel',(side*3.18,0,z),(.17,.31,.38),iron,hinge,.075)
   for dz in [-.14,.14]:ring('Hinge collar',side*3.18,-.10,z+dz,.085,bronze,hinge)
  box('Knocker backplate',(side*.40,-.30,2.9),(.26,.075,.42),iron,hinge,.035)
  sphere('Knocker boss',(side*.40,-.37,3.0),(.075,.055,.075),bronze,hinge)
  curve('Heavy bronze knocker',[(side*.40+.18*cos(i*2*pi/48),-.43,2.80+.18*sin(i*2*pi/48)) for i in range(48)],bronze,hinge,.032,True)
 # Original wall torches flank the opening; their flames are emissive solid geometry.
 flame=mat('Door torch flame',(1,.45,.08),0,.5)
 shader=flame.node_tree.nodes.get('Principled BSDF');shader.inputs['Emission Color'].default_value=(1,.38,.06,1);shader.inputs['Emission Strength'].default_value=3
 for side in [-1,1]:
  x=side*4.35;box('Sconce plate',(x,-.48,3.35),(.3,.15,.82),iron,root,.03)
  curve('Sconce arm',[(x,-.53,3.1),(x,-.95,2.9),(x,-1.08,3.18)],iron,root,.07)
  box('Torch cup',(x,-1.08,3.2),(.28,.28,.22),bronze,root,.055)
  sphere('Torch fire',(x,-1.08,3.46),(.105,.085,.24),flame,root)
 # Give every surface physical-scale UVs, including the custom arch slabs.
 # Oak fibres run vertically on the door faces; each plank samples a different strip.
 for obj in root.children_recursive:
  if obj.type!='MESH':continue
  uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='Surface UV')
  material=obj.data.materials[0]
  for poly in obj.data.polygons:
   normal=poly.normal;axis=max(range(3),key=lambda i:abs(normal[i]))
   for li in poly.loop_indices:
    v=obj.matrix_world @ obj.data.vertices[obj.data.loops[li].vertex_index].co
    u,w=(v.x,v.z) if axis==1 else (v.y,v.z) if axis==0 else (v.x,v.y)
    uv.data[li].uv=(u*.72,w*.24) if material==oak else (u*.70,w*.70)
 return root

def descendants(root):return [root]+list(root.children_recursive)
def optimize(root):
 groups={}
 for o in descendants(root):
  if o.type=='MESH' and o.name not in ['raven_eye','left_pages','right_pages','page_block','spine','back_cover','H_crest']:groups.setdefault((o.parent,o.data.materials[0].name),[]).append(o)
 for (p,matname),obs in groups.items():
  if len(obs)<2:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in obs:o.select_set(True)
  bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();bpy.context.object.name=p.name+'_'+matname

def save(root,name):
 optimize(root);bpy.ops.object.select_all(action='DESELECT')
 for o in descendants(root):o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name+'.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_yup=True)
 tri=0
 for o in descendants(root):
  if o.type=='MESH':o.data.calc_loop_triangles();tri+=len(o.data.loop_triangles)
 return {'file':name+'.glb','triangles':tri,'bytes':os.path.getsize(os.path.join(OUT,name+'.glb')),'meshes':sum(o.type=='MESH' for o in descendants(root))}
builders={'spellbook':book,'satchel':satchel,'raven':raven,'doors':doors}
roots=[(build(),name) for name,build in builders.items() if not ONLY or name==ONLY]
report=[save(root,name) for root,name in roots]
manifest_path=os.path.join(OUT,'manifest.json')
if ONLY and os.path.exists(manifest_path):
 with open(manifest_path) as f:previous=json.load(f)
 by_name={asset['file']:asset for asset in previous['assets']}
 for asset in report:by_name[asset['file']]=asset
 report=list(by_name.values())
with open(manifest_path,'w') as f:json.dump({'author':'Original geometry for Hashem Abdelati','thirdPartyModels':False,'blockout':BLOCK,'assets':report},f,indent=2)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BASE,'scripts','codex-'+ONLY+'.blend' if ONLY else 'codex-artifacts.blend'));print(json.dumps(report))
if not BLOCK:
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=640;scene.render.resolution_y=720;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.world.color=(.13,.13,.13)
 bpy.ops.object.camera_add(location=(4,-8,4));cam=bpy.context.object;cam.data.type='ORTHO';cam.data.ortho_scale=4.8;scene.camera=cam
 for pos,power,color,size in [((-3,-4,6),950,(1,.73,.40),5),((4,1,5),1600,(1,.65,.28),3),((1,-2,5),450,(.55,.68,1),3)]:
  bpy.ops.object.light_add(type='AREA',location=pos);l=bpy.context.object;l.data.energy=power;l.data.color=color;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector((0,0,1.5))-l.location).to_track_quat('-Z','Y').to_euler()
 for root,name in roots:
  for other,_ in roots:
   for o in descendants(other):o.hide_render=other!=root
  target=Vector((0,0,3.5 if name=='doors' else 1.8 if name=='spellbook' else 1.4));cam.location=(8,-18,9) if name=='doors' else (4,-9,4);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=11.5 if name=='doors' else 4.2 if name=='spellbook' else 3.6;scene.render.filepath=os.path.join(OUT,name+'.png');bpy.ops.render.render(write_still=True)

  if name=='satchel':
   # Inspection render of the same runtime open pose; exported GLB stays closed.
   bpy.data.objects['satchel_flap'].rotation_euler.x=-2.05
   for i,x in enumerate([-.96,-.32,.32,.96]):
    card=bpy.data.objects['artifact_'+str(i)]
    card.location.x=x;card.location.z=2.33+(.10 if i in [1,2] else 0)
    card.location.y=-.14+i*.025;card.rotation_euler.y=-(1.5-i)*.085
   cam.location=(3,-8,5);target=Vector((0,0,1.7));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=4.3
   scene.render.filepath=os.path.join(OUT,'satchel-open.png');bpy.ops.render.render(write_still=True)
