import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {Shield,Timer,Trophy,UsersRound,type LucideIcon} from 'lucide-react';
import {createKart} from './kart';
import {fragmentShader,vertexShader} from './shaders';
import {confirmationMotion,FIXED_STEP,MAX_FIXED_STEPS,liveOpening} from './timeline';
export type MenuSymbol='cup'|'coin'|'gear'|'kart';
export type MenuBadge='trophy'|'players'|'timer'|'battle';
const menuFragment=fragmentShader.replace('col=mix(col,accent,stripe);','col=mix(col,vec3(.12,.13,.16),stripe);');
const menuBadgeIcons:Record<MenuBadge,LucideIcon>={trophy:Trophy,players:UsersRound,timer:Timer,battle:Shield};
function MenuBadgeIcon({kind}:{kind:MenuBadge}){
 const Icon=menuBadgeIcons[kind];
 return <Icon className="ro-menu-badge-icon" aria-hidden="true" strokeWidth={3}/>;
}
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
export function ShaderMenuButton({label,kind,accent,selected,onClick,motion=true,medal=false,confirmation=0,badge='trophy'}:{label:string;kind:MenuSymbol;accent:string;selected:boolean;onClick:()=>void;motion?:boolean;medal?:boolean;confirmation?:number;badge?:MenuBadge}){
 const host=useRef<HTMLButtonElement>(null),current=useRef({selected,accent,motion,confirmation});current.current={selected,accent,motion,confirmation};
 useEffect(()=>{
 const el=host.current!,renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.domElement.setAttribute('aria-hidden','true');el.prepend(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,medal?100:600,medal?100:88,0,.1,1200);camera.position.z=700;
 scene.add(new THREE.HemisphereLight(0xe7f5ff,0x55517c,2.8));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(80,200,300);scene.add(light);
 const material=new THREE.ShaderMaterial({vertexShader,fragmentShader:menuFragment,transparent:true,uniforms:{uOpen:{value:0},uColor:{value:new THREE.Color(accent)},uShine:{value:-2},uGloss:{value:1},uSheenStrength:{value:1},uSheenOpacity:{value:.86},uSheenColor:{value:new THREE.Vector3(.82,.88,1)},uSheenWidth:{value:1},uBloom:{value:.6}}});
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(600,88),material);plane.position.set(300,44,0);plane.visible=!medal;scene.add(plane);
 const icon=symbol(kind,accent);icon.position.set(medal?50:85,medal?50:43,50);scene.add(icon);
 const resize=new ResizeObserver(()=>renderer.setSize(el.clientWidth,el.clientHeight,false));resize.observe(el);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let raf=0,last=performance.now(),accumulator=0,clock=0,open=selected?1:0,previous=open,wasSelected=selected,openingAge=2,confirmAge=2,seenConfirmation=confirmation;
 const frame=(now:number)=>{
  const p=current.current,animated=p.motion&&!reduced;
  if(p.selected!==wasSelected){if(p.selected)openingAge=0;wasSelected=p.selected;}
  if(p.confirmation!==seenConfirmation){confirmAge=0;seenConfirmation=p.confirmation;}
  if(document.hidden){last=now;accumulator=0;}else{accumulator+=Math.min((now-last)/1000,.25);last=now;let steps=0;while(accumulator>=FIXED_STEP&&steps<MAX_FIXED_STEPS){accumulator-=FIXED_STEP;previous=open;open=THREE.MathUtils.lerp(open,p.selected?1:0,1-Math.exp(-FIXED_STEP*19));clock+=FIXED_STEP;openingAge+=FIXED_STEP;confirmAge+=FIXED_STEP;steps++;}if(steps===MAX_FIXED_STEPS)accumulator=0;}
  const alpha=accumulator/FIXED_STEP,age=openingAge+alpha*FIXED_STEP;
  const e=medal?1:!animated?Number(p.selected):Math.max(0,Math.min(1.065,p.selected&&age<.7?liveOpening(age):previous+(open-previous)*alpha));
  const confirm=confirmationMotion(confirmAge+alpha*FIXED_STEP),confirmed=p.selected&&animated&&confirm.active;
  const pulse=confirmed?confirm.pulse:0,px=1+pulse*.075,py=1+pulse*.055,anchor=20+120*e,bx=(anchor-300)*(1-px);
  const u=material.uniforms;u.uOpen.value=e;u.uColor.value.set(p.accent);u.uGloss.value=1;u.uSheenStrength.value=confirmed?1.5:1;u.uSheenOpacity.value=confirmed?.94:.86;u.uSheenColor.value.set(...(confirmed?[.38,.72,1]:[.82,.88,1]) as [number,number,number]);u.uSheenWidth.value=confirmed?1.75:1;u.uBloom.value=confirmed?.82:.6;
  const phase=clock%4.8;u.uShine.value=confirmed?confirm.sweep:animated&&p.selected&&phase<.28?1-phase/.28:-2;
  plane.scale.set(px,py,1);plane.position.x=300+bx;
  el.style.setProperty('--open',String(e));el.style.setProperty('--label-left',`${(110+46*e)/6}%`);el.style.setProperty('--pulse-x',String(px));el.style.setProperty('--pulse-y',String(py));el.style.setProperty('--bounce-x',`${bx/6}cqw`);
  icon.visible=medal||p.selected&&e>.015;icon.scale.setScalar(medal?1:.9*e*(1+pulse*.055));icon.position.x=medal?50:48+e*42;icon.rotation.set(kind==='kart'?.32:.12,animated?clock*.65+(confirmed?confirm.sweep*Math.PI*2:0):-.35,0);
  if(!document.hidden)renderer.render(scene,camera);raf=requestAnimationFrame(frame);
 };raf=requestAnimationFrame(frame);
 return()=>{cancelAnimationFrame(raf);resize.disconnect();dispose(scene);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 },[kind,medal]);
 return <button ref={host} className={`${medal?'ro-medal':'ro-menu-button'} ${selected?'selected':''} ${confirmation&&selected?'confirming':''}`} aria-pressed={selected} onClick={onClick} style={{'--accent':accent} as React.CSSProperties}><span className="ro-menu-ink"><span className="ro-menu-label">{label}</span>{!medal&&<span className="ro-menu-badge"><MenuBadgeIcon kind={badge}/></span>}</span></button>;
}
