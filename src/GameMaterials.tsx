import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {createKart} from './kart';
import {fragmentShader,vertexShader} from './shaders';
import {liveOpening} from './timeline';
export type MenuSymbol='cup'|'coin'|'gear'|'kart';
const menuFragment=fragmentShader.replace('col=mix(col,accent,stripe);','col=mix(col,vec3(.12,.13,.16),stripe);');
function symbol(kind:MenuSymbol,color:string){
 if(kind==='kart'){const k=createKart(color);k.scale.setScalar(.65);return k;}
 const g=new THREE.Group(),gold=new THREE.MeshStandardMaterial({color:kind==='gear'?0xb5d4ee:0xffc94d,metalness:.72,roughness:.24}),dark=new THREE.MeshStandardMaterial({color:0x283147,metalness:.6,roughness:.3});
 function mesh(geometry:THREE.BufferGeometry,material=gold,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);g.add(m);return m;}
 if(kind==='cup'){
 const pts=[[0,-8],[10,-7],[21,4],[26,25],[23,28],[20,7],[9,-3],[0,-4]].map(([x,y])=>new THREE.Vector2(x,y));
 mesh(new THREE.LatheGeometry(pts,40));mesh(new THREE.CylinderGeometry(4,5,20,20),gold,0,-15);mesh(new THREE.CylinderGeometry(18,22,7,28),dark,0,-28);mesh(new THREE.CylinderGeometry(18,18,3,28),gold,0,-24);
 for(const x of [-25,25]){const h=mesh(new THREE.TorusGeometry(13,3.5,10,30),gold,x,13);h.scale.x=.8;}
 }else if(kind==='coin'){
 const c=mesh(new THREE.CylinderGeometry(29,29,8,48));c.rotation.x=Math.PI/2;
 for(const z of [-4.5,4.5])mesh(new THREE.TorusGeometry(24,1.5,8,48),gold,0,0,z);
 const diamond=mesh(new THREE.OctahedronGeometry(15),new THREE.MeshStandardMaterial({color:0xfff1b1,metalness:.6,roughness:.25}),0,0,7);diamond.scale.z=.2;
 }else{
 mesh(new THREE.TorusGeometry(19,8,12,40));mesh(new THREE.TorusGeometry(10,2,8,30),dark);
 for(let i=0;i<10;i++){const a=i*Math.PI/5;mesh(new THREE.BoxGeometry(12,13,11),gold,Math.sin(a)*27,Math.cos(a)*27).rotation.z=-a;}
 }return g;
}
function dispose(scene:THREE.Scene){scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});}
export function ShaderMenuButton({label,kind,accent,selected,onClick,motion=true,medal=false}:{label:string;kind:MenuSymbol;accent:string;selected:boolean;onClick:()=>void;motion?:boolean;medal?:boolean}){
 const host=useRef<HTMLButtonElement>(null),current=useRef({selected,accent,motion});current.current={selected,accent,motion};
 useEffect(()=>{
 const el=host.current!,renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.domElement.setAttribute('aria-hidden','true');el.prepend(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,600,88,0,.1,1200);camera.position.z=700;if(medal){camera.right=100;camera.top=100;camera.updateProjectionMatrix();}
 scene.add(new THREE.HemisphereLight(0xe7f5ff,0x55517c,2.8));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(80,200,300);scene.add(light);
 const material=new THREE.ShaderMaterial({vertexShader,fragmentShader:menuFragment,transparent:true,uniforms:{uOpen:{value:1},uColor:{value:new THREE.Color(accent)},uShine:{value:-2},uGloss:{value:1},uSheenStrength:{value:1},uSheenOpacity:{value:.8},uSheenColor:{value:new THREE.Vector3(.7,.86,1)},uSheenWidth:{value:1},uBloom:{value:.6}}});
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(600,88),material);plane.position.set(300,44,0);plane.visible=!medal;scene.add(plane);
 const icon=symbol(kind,accent);icon.position.set(medal?50:85,medal?50:43,50);scene.add(icon);
 const resize=new ResizeObserver(()=>renderer.setSize(el.clientWidth,el.clientHeight,false));resize.observe(el);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let raf=0;
 const frame=(t:number)=>{const animated=current.current.motion&&!reduced;icon.rotation.y=animated?t*.00065:-.35;icon.rotation.x=kind==='kart'?.32:.12;material.uniforms.uColor.value.set(current.current.accent);material.uniforms.uGloss.value=current.current.selected?1.25:.72;const phase=t/1000%5.2;material.uniforms.uShine.value=animated&&phase<.3?1-phase/.3:-2;renderer.render(scene,camera);raf=requestAnimationFrame(frame);};raf=requestAnimationFrame(frame);
 return()=>{cancelAnimationFrame(raf);resize.disconnect();dispose(scene);renderer.dispose();renderer.domElement.remove();};
 },[kind,medal]);
 useEffect(()=>{
  const el=host.current!;
  if(medal||!motion||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const frames=selected?Array.from({length:23},(_,i)=>({transform:`scaleX(${.82+.18*liveOpening(i/30)})`,offset:i/22})):[{transform:'scaleX(1)'},{transform:'scaleX(.82)'}];
  const animation=el.animate(frames,{duration:selected?733:260,easing:selected?'linear':'ease-out',fill:'forwards'});
  return()=>animation.cancel();
 },[selected,motion,medal]);
 return <button ref={host} className={`${medal?'ro-medal':'ro-menu-button'} ${selected?'selected':''}`} aria-pressed={selected} onClick={onClick} style={{'--accent':accent} as React.CSSProperties}><span className="ro-menu-label">{label}</span></button>;
}
