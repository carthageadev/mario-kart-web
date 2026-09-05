import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {createKart} from './kart';
import {fragmentShader,vertexShader} from './shaders';
import {referenceOpenness,type Racer} from './timeline';
import './leaderboard.css';

export interface RacingLeaderboardProps {
 players:Racer[]; selectedIndex:number; onSelect:(index:number)=>void;
 interaction?:{id:number;index:number;type:'open'|'confirm'};
 time:number; replay:boolean; showKarts?:boolean; gloss?:number; reducedMotion?:boolean;
 sheenStrength?:number; sheenOpacity?:number; sheenColor?:string; bloom?:number;
}
export function RacingLeaderboard(props:RacingLeaderboardProps){
 const host=useRef<HTMLDivElement>(null);const current=useRef(props);current.current=props;
 const rows=useRef<(HTMLButtonElement|null)[]>([]);const [fallback,setFallback]=useState(false);
 useEffect(()=>{
  const el=host.current!;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{setFallback(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setClearColor(0,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.setAttribute('aria-hidden','true');el.prepend(renderer.domElement);
  const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(0,600,550,0,.1,2000);camera.position.z=900;
  scene.add(new THREE.AmbientLight(0xffffff,2.1));
  const key=new THREE.DirectionalLight(0xffffff,3.5);key.position.set(-100,600,700);scene.add(key);
  const fill=new THREE.DirectionalLight(0x6495ff,2);fill.position.set(300,0,200);scene.add(fill);
  const planes:THREE.Mesh<THREE.PlaneGeometry,THREE.ShaderMaterial>[]=[];const karts:THREE.Group[]=[];
  for(let i=0;i<6;i++){
   const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,transparent:true,depthWrite:false,uniforms:{uOpen:{value:0},uColor:{value:new THREE.Vector3()},uShine:{value:-1},uGloss:{value:1},uSheenStrength:{value:1},uSheenOpacity:{value:.86},uSheenColor:{value:new THREE.Vector3(0.82,.88,1)},uSheenWidth:{value:1},uBloom:{value:.45}}});
   const plane=new THREE.Mesh(new THREE.PlaneGeometry(600,88),material);plane.position.set(300,550-7-i*89.4-44,0);scene.add(plane);planes.push(plane);
   const kart=createKart(current.current.players[i].color);kart.position.set(88,550-50-i*89.4,70);scene.add(kart);karts.push(kart);
  }
  const resize=new ResizeObserver(()=>{renderer.setSize(el.clientWidth,el.clientHeight,false);const layer=el.querySelector<HTMLElement>('.row-layer');if(layer)layer.style.transform=`scale(${el.clientWidth/600})`;});resize.observe(el);
  let raf=0,last=performance.now();let opens=referenceOpenness(current.current.time);let handledInteraction=current.current.interaction?.id??0;
  let opening:{index:number;started:number}|null=null;let confirmation:{index:number;started:number}|null=null;
  function frame(now:number){
   const dt=Math.min((now-last)/1000,.05);last=now;const p=current.current;
   if(p.interaction&&p.interaction.id!==handledInteraction){handledInteraction=p.interaction.id;if(!p.reducedMotion){if(p.interaction.type==='confirm'){confirmation={index:p.interaction.index,started:now};opening=null;}else{opening={index:p.interaction.index,started:now};confirmation=null;}}}
   const targets=p.replay?referenceOpenness(p.time):p.players.map((_,i)=>i===p.selectedIndex?1:0);
   opens=opens.map((v,i)=>p.replay||p.reducedMotion?targets[i]:THREE.MathUtils.lerp(v,targets[i],1-Math.exp(-dt*19)));
   const liveClock=now/1000;const openingAge=opening?(now-opening.started)/1000:2;const openingT=Math.max(0,Math.min(1,(openingAge-.17)/.46));
   const openingPulse=opening&&!p.replay&&openingAge>=.17&&openingT<1?Math.sin(openingT*Math.PI*3)*Math.pow(1-openingT,1.6):0;
   const confirmationAge=confirmation?(now-confirmation.started)/1000:2;const confirmationT=Math.max(0,Math.min(1,confirmationAge/.72));
   const confirmationPulse=confirmation&&!p.replay&&confirmationT<1?-Math.sin(confirmationT*Math.PI*4)*Math.pow(1-confirmationT,1.25):0;
   const confirmationActive=Boolean(confirmation&&confirmationT<1&&!p.reducedMotion&&!p.replay);const confirmationSweep=confirmationT*confirmationT*(3-2*confirmationT);
   if(openingAge>.7)opening=null;if(confirmationAge>.78)confirmation=null;
   const wooshPhase=liveClock%4.8;const wooshDuration=.28;const liveWoosh=wooshPhase<wooshDuration?1-wooshPhase/wooshDuration:-2;
   planes.forEach((plane,i)=>{
    const e=opens[i];const u=plane.material.uniforms;u.uOpen.value=e;
    const c=p.players[i].color;u.uColor.value.set(parseInt(c.slice(1,3),16)/255,parseInt(c.slice(3,5),16)/255,parseInt(c.slice(5,7),16)/255);
    u.uGloss.value=p.gloss??1;
    u.uSheenStrength.value=p.sheenStrength??1;u.uSheenOpacity.value=p.sheenOpacity??.86;u.uSheenWidth.value=1;u.uBloom.value=p.bloom??.45;
    const sheenHex=p.sheenColor??'#dce8ff';u.uSheenColor.value.set(parseInt(sheenHex.slice(1,3),16)/255,parseInt(sheenHex.slice(3,5),16)/255,parseInt(sheenHex.slice(5,7),16)/255);
    u.uShine.value=p.replay?(p.time>2.13&&p.time<2.55?(p.time-2.13)/.42:-2):(p.reducedMotion?-2:liveWoosh);
    if(confirmationActive&&confirmation?.index===i){u.uShine.value=confirmationSweep;u.uSheenStrength.value=Math.max((p.sheenStrength??1)*1.5,1.4);u.uSheenOpacity.value=Math.max(p.sheenOpacity??.86,.94);u.uSheenColor.value.set(.38,.72,1);u.uSheenWidth.value=1.75;u.uBloom.value=Math.max(p.bloom??.45,.82);}
    const openBounce=opening?.index===i?openingPulse:0;const confirmBounce=confirmation?.index===i?confirmationPulse:0;
    const pulseX=1+openBounce*.045+confirmBounce*.075;const pulseY=1-openBounce*.035+confirmBounce*.055;
    plane.scale.set(pulseX,pulseY,1);
    const anchor=20+120*e;plane.position.x=300+(anchor-300)*(1-pulseX);
    const row=rows.current[i];if(row){row.style.setProperty('--open',String(e));row.style.setProperty('--anchor',`${anchor}px`);row.style.setProperty('--pulse-x',String(pulseX));row.style.setProperty('--pulse-y',String(pulseY));row.style.width=`${90+e*475}px`;}
    const kart=karts[i];kart.visible=e>.015&&(p.showKarts??true);kart.scale.setScalar(.9*e*(1+confirmBounce*.055));
    (kart.userData.paint as THREE.MeshStandardMaterial).color.set(c);
    const spin=p.reducedMotion?0:(p.replay?p.time:liveClock);
    kart.rotation.set(.48,-.88+Math.sin(spin*2.8+i*.4)*.23,-.15+Math.sin(spin*2)*.04);
    if(i===3&&spin>2.12&&spin<2.6)kart.rotation.y+=(spin-2.12)/.48*Math.PI*2;
    if(confirmationActive&&confirmation?.index===i)kart.rotation.y+=confirmationSweep*Math.PI*2;
    kart.position.x=48+e*42;
   });
   if(!document.hidden)renderer.render(scene,camera);raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  const lost=(e:Event)=>{e.preventDefault();setFallback(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
  return()=>{cancelAnimationFrame(raf);resize.disconnect();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
 },[]);
 const bloomValue=props.bloom??.45;
 return <div className={`leaderboard ${fallback?'fallback':''}`} ref={host} aria-label="Race positions" style={{'--bloom-radius':`${bloomValue*16}px`,'--bloom-alpha':`${bloomValue*.22}`,'--bloom-tight-radius':`${bloomValue*6}px`,'--bloom-tight-alpha':`${bloomValue*.26}`} as React.CSSProperties}>
  <div className="row-layer">{props.players.map((p,i)=>{const nameSize=Math.max(17,Math.min(34,235/Math.max(p.name.length*.65,1)));return <button ref={e=>{rows.current[i]=e;}} type="button" className={`rank-row ${i===props.selectedIndex?'is-selected':''}`} style={{top:7+i*89.4,'--accent':p.color,...(fallback?{'--open':i===props.selectedIndex?1:0,width:i===props.selectedIndex?565:90}:{})} as React.CSSProperties} aria-label={`Position ${i+1}, ${p.name}`} title={`Position ${i+1}: ${p.name}`} aria-pressed={i===props.selectedIndex} key={p.id} onClick={()=>props.onSelect(i)}>
   <span className="fallback-plate"/><span className="player-name" style={{fontSize:`${nameSize}px`}}>{p.name}</span><span className="position-number">{i+1}</span>
  </button>})}
  </div>
 </div>;
}
