import * as THREE from 'three';

export function createKart(color: string) {
 const kart=new THREE.Group();
 const paint=new THREE.MeshStandardMaterial({color,metalness:.25,roughness:.3,flatShading:true});
 const white=new THREE.MeshStandardMaterial({color:0xf5f4ff,metalness:.2,roughness:.32});
 const rubber=new THREE.MeshStandardMaterial({color:0x111538,roughness:.84});
 const hub=new THREE.MeshStandardMaterial({color:0x5975b0,metalness:.55,roughness:.3});
 const glass=new THREE.MeshStandardMaterial({color:0xa5d4ef,metalness:.3,roughness:.2});
 function block(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);kart.add(m);return m;}
 const bodyShape=new THREE.Shape();bodyShape.moveTo(-43,2);bodyShape.lineTo(-37,15);bodyShape.lineTo(-12,19);bodyShape.lineTo(12,12);bodyShape.lineTo(47,0);bodyShape.lineTo(42,-7);bodyShape.lineTo(-38,-7);bodyShape.closePath();
 const body=new THREE.Mesh(new THREE.ExtrudeGeometry(bodyShape,{depth:29,bevelEnabled:true,bevelThickness:1.2,bevelSize:1.2,bevelSegments:1,steps:1}),paint);body.position.z=-14.5;kart.add(body);
 block(54,5,35,-9,-6,0,paint);
 const cabin=new THREE.Mesh(new THREE.CylinderGeometry(11,20,21,4,1),paint);cabin.rotation.y=Math.PI/4;cabin.position.set(-10,24,0);cabin.scale.z=.78;kart.add(cabin);
 const wind=block(3,17,21,0,25,0,glass);wind.rotation.z=.53;
 block(17,15,1,-17,25,13,glass);block(17,15,1,-17,25,-13,glass);
 block(20,2,25,-13,36,0,white);
 for(const x of [-28,27])for(const z of [-24,24]){
  const tyre=new THREE.Mesh(new THREE.CylinderGeometry(14,14,14,16),rubber);tyre.rotation.x=Math.PI/2;tyre.position.set(x,-2,z);kart.add(tyre);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(5.3,5.3,14.6,12),hub);cap.rotation.x=Math.PI/2;cap.position.copy(tyre.position);kart.add(cap);
 }
 for(const z of [-12,12])block(3,21,3,-36,24,z,white);
 block(16,4,69,-40,37,0,white);block(6,3,50,45,-3,0,white);
 block(40,1.5,4,18,11,0,white).rotation.z=-.32;
 kart.userData.paint=paint;
 return kart;
}
