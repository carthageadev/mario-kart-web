import {useCallback,useEffect,useRef,useState} from 'react';
import {ShaderMenuButton} from './GameMaterials';
import {RacingLeaderboard} from './RacingLeaderboard';
import {DEFAULT_PLAYERS} from './timeline';
import './game.css';

type Page='menu'|'cups'|'garage'|'settings'|'ready'|'race';
const backdrop='https://www.gameuidatabase.com/uploads/MarioKart8Deluxe04222020-114642.jpg';
const modes=[
 {title:'Grand Prix',detail:'Race four courses and take the cup.',symbol:'cup',color:'#7daaff'},
 {title:'Multiplayer',detail:'Choose your players. Share the starting grid.',symbol:'kart',color:'#f5c74f'},
 {title:'Time Trial',detail:'Find your racing line. Beat your best time.',symbol:'coin',color:'#f8c85c'},
 {title:'Garage',detail:'Your next ride is on its way.',symbol:'kart',color:'#ec6d95'},
 {title:'Settings',detail:'Adjust your interface and sound.',symbol:'gear',color:'#76ddd0'}
] as const;
const cups=[
 {name:'Coastal Cup',symbol:'cup',color:'#79b9ff',tracks:['Harbor Run','Coral Tunnel','Cliffside Circuit','Midnight Marina']},
 {name:'Neon Cup',symbol:'coin',color:'#df81ff',tracks:['Neon Avenue','Skyline Sprint','Metro Loop','Afterglow Park']},
 {name:'Orbit Cup',symbol:'gear',color:'#ffcf68',tracks:['Launch Point','Satellite Strip','Lunar Drift','Starfall Road']}
] as const;
export function GameUI(){
 const [page,setPage]=useState<Page>('menu');
 const [active,setActive]=useState(0),[players,setPlayers]=useState(2),[cup,setCup]=useState(0),[course,setCourse]=useState(0),[engine,setEngine]=useState(150);
 const [bloom,setBloom]=useState(.6),[motion,setMotion]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches),[volume,setVolume]=useState(30),[count,setCount]=useState(3),[driver,setDriver]=useState(2);
 const [phase,setPhase]=useState<'idle'|'out'|'in'>('idle'),[wipe,setWipe]=useState(0),[imageLoaded,setImageLoaded]=useState(false);
 const [interaction,setInteraction]=useState<{id:number;index:number;type:'open'|'confirm'}>({id:0,index:2,type:'open'});
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]),changing=useRef(false);
 const navigate=useCallback((next:Page)=>{
  if(changing.current||next===page)return;
  if(!motion){setPage(next);return;}
  changing.current=true;setPhase('out');setWipe(n=>n+1);
  timers.current.push(setTimeout(()=>{setPage(next);setPhase('in');},300));
  timers.current.push(setTimeout(()=>{setPhase('idle');changing.current=false;timers.current=[];},760));
 },[motion,page]);
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 const back=()=>navigate(page==='ready'?'cups':page==='race'?'cups':'menu');
 const enter=(i:number)=>{setActive(i);navigate(i===3?'garage':i===4?'settings':'cups');};
 const chooseDriver=(i:number)=>{setInteraction(v=>({id:v.id+1,index:i,type:i===driver?'confirm':'open'}));setDriver(i);};
 useEffect(()=>{
  document.title='RACE ORDER | Kart Racing';
  const key=(e:KeyboardEvent)=>{
   if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement||changing.current)return;
   if(e.key==='Escape'||e.key.toLowerCase()==='b'){e.preventDefault();back();return;}
   if(page==='menu'){
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const i=(active+(e.key==='ArrowDown'?1:4))%5;setActive(i);document.querySelectorAll<HTMLButtonElement>('.ro-mode-list .ro-menu-button')[i]?.focus();return;}
    if(active===1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();setPlayers(n=>Math.max(1,Math.min(4,n+(e.key==='ArrowRight'?1:-1))));return;}
    if(e.key==='Enter'||e.key.toLowerCase()==='a'){e.preventDefault();enter(active);return;}
   }
   if(page==='cups'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')&&document.activeElement?.classList.contains('ro-medal')){e.preventDefault();const i=(cup+(e.key==='ArrowRight'?1:2))%3;setCup(i);setCourse(0);document.querySelectorAll<HTMLButtonElement>('.ro-medal')[i]?.focus();return;}
   if(e.key.toLowerCase()==='a'){e.preventDefault();if(document.activeElement instanceof HTMLButtonElement)document.activeElement.click();else if(page==='cups')navigate('ready');else if(page==='ready')navigate('race');}
  };
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[page,active,players,cup,navigate]);
 useEffect(()=>{if(page!=='race')return;setCount(3);const timer=setInterval(()=>setCount(n=>Math.max(0,n-1)),1000);return()=>clearInterval(timer);},[page]);
 useEffect(()=>{
  if(!volume)return;
  const click=(e:Event)=>{if(!(e.target instanceof Element)||!e.target.closest('.ro-game button'))return;const ctx=new AudioContext(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.setValueAtTime(700,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(1050,ctx.currentTime+.06);gain.gain.setValueAtTime(volume*.0007,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.09);osc.start();osc.stop(ctx.currentTime+.1);osc.onended=()=>{void ctx.close();};};
  document.addEventListener('click',click);return()=>document.removeEventListener('click',click);
 },[volume]);
 const playerTotal=active===1?players:1;
 const titles={menu:'Select a mode',cups:cups[cup].name,garage:'Garage',settings:'Settings',ready:'Ready to race?',race:cups[cup].tracks[course]};
 return <div className={`ro-game ro-page-${page} ${!motion?'ro-still':''}`} style={{'--glow':`${bloom*14}px`} as React.CSSProperties}>
  <div className={`ro-racing-backdrop ${imageLoaded?'loaded':''}`} aria-hidden="true"><img src={backdrop} alt="" referrerPolicy="no-referrer" onLoad={()=>setImageLoaded(true)}/><div className="ro-backdrop-haze"/></div>
  <div className="ro-frost-wedge" aria-hidden="true"/>
  <header className="ro-header"><a href="/game" className="ro-logo"><span className="ro-emblem">»</span>RACE<span>ORDER</span><small>KART RACING</small></a><nav><a href="/">UI LAB ↗</a><span className="ro-profile">NOVA <b>01</b></span></nav></header>
  <div className={`ro-screen ro-phase-${phase}`} key={page}>
   {page==='menu'?<main className="ro-main-menu"><h1 className="ro-screen-heading">Select a mode</h1><section className="ro-mode-list" aria-label="Game modes">{modes.map((m,i)=><div className={`ro-mode-wrap ${active===i?'active':''} ${i===1?'multiplayer':''}`} key={m.title} onMouseEnter={()=>!changing.current&&setActive(i)} onFocus={()=>setActive(i)}><ShaderMenuButton label={m.title} kind={m.symbol} accent={m.color} selected={active===i} onClick={()=>active===i?enter(i):setActive(i)} motion={motion}/>{i===1&&active===1&&<div className="ro-player-count" role="group" aria-label="Number of local players">{[1,2,3,4].map(n=><button key={n} aria-label={`${n} players`} aria-pressed={players===n} onClick={()=>setPlayers(n)}>{n}<small>P</small></button>)}</div>}</div>)}</section><p className="ro-menu-help" key={active}>{modes[active].detail}</p><div className="ro-backdrop-caption"><span>RACE ORDER</span><strong>RACE ORDER</strong><small>KART RACING</small></div></main>:
   page==='cups'?<main className="ro-cups"><div className="ro-cup-top"><h1>Select a cup</h1><div className="ro-class-select" aria-label="Engine class">{[50,100,150,200].map(v=><button key={v} aria-pressed={engine===v} onClick={()=>setEngine(v)}>{v}<small>cc</small></button>)}</div></div><section className="ro-cup-choices" aria-label="Cups">{cups.map((c,i)=><div className="ro-medal-holder" key={c.name}><ShaderMenuButton label={c.name} kind={c.symbol} accent={c.color} selected={cup===i} onClick={()=>{setCup(i);setCourse(0);}} motion={motion} medal/><span className="ro-cup-stars">☆ ☆ ☆</span></div>)}</section><section className="ro-course-tray" aria-label="Courses">{cups[cup].tracks.map((name,i)=><button key={name} className={`ro-course ${course===i?'selected':''}`} aria-pressed={course===i} onClick={()=>setCourse(i)}><div className={`ro-course-image course-${i}`}><img src={backdrop} alt="" referrerPolicy="no-referrer"/><span>{String(i+1).padStart(2,'0')}</span></div><strong>{name}</strong></button>)}</section><div className="ro-cup-summary"><span>{engine}cc · {playerTotal}P · {active===2?'TIME TRIAL':'GRAND PRIX'}</span><button className="ro-confirm" onClick={()=>navigate('ready')}><kbd>A</kbd> OK</button></div></main>:
   page==='settings'?<main className="ro-settings"><section className="ro-glass-panel"><h1>Interface settings</h1><div className="ro-settings-row"><span>Bloom</span><div className="ro-adjust"><button aria-label="Reduce bloom" onClick={()=>setBloom(v=>Math.max(0,+(v-.1).toFixed(1)))}>‹</button><output>{Math.round(bloom*100)}%</output><button aria-label="Increase bloom" onClick={()=>setBloom(v=>Math.min(1.2,+(v+.1).toFixed(1)))}>›</button></div></div><div className="ro-settings-row"><span>Menu sound</span><div className="ro-adjust"><button aria-label="Reduce menu sound" onClick={()=>setVolume(v=>Math.max(0,v-10))}>‹</button><output>{volume}%</output><button aria-label="Increase menu sound" onClick={()=>setVolume(v=>Math.min(100,v+10))}>›</button></div></div><div className="ro-settings-row"><span>Interface motion</span><button className="ro-value-toggle" aria-pressed={motion} onClick={()=>setMotion(v=>!v)}>‹ <span>{motion?'On':'Off'}</span> ›</button></div><div className="ro-settings-preview"><ShaderMenuButton label="Preview" kind="gear" accent="#d1d8e4" selected onClick={()=>setBloom(v=>v===.6?1:.6)} motion={motion}/></div><button className="ro-confirm" onClick={()=>navigate('menu')}><kbd>A</kbd> Done</button></section></main>:
   page==='garage'?<main className="ro-stub"><section className="ro-glass-panel"><ShaderMenuButton label="Garage" kind="kart" accent="#087bdc" selected onClick={()=>navigate('menu')} motion={motion} medal/><h1>Under construction</h1><p>Kart customization is coming later.</p><button className="ro-confirm" onClick={()=>navigate('menu')}><kbd>B</kbd> Back</button></section></main>:
   page==='ready'?<main className="ro-ready"><section className="ro-glass-panel"><h1>Start {active===2?'Time Trial':'Race'}?</h1><p>{cups[cup].tracks[course]} · {engine}cc · {playerTotal}P</p><button className="ro-large-ok" onClick={()=>navigate('race')}>OK</button><small>Confirm your place on the starting grid.</small></section></main>:
   <main className="ro-race"><h1>{cups[cup].tracks[course]}</h1><span className="ro-race-detail">{cups[cup].name} · {engine}cc · {playerTotal}P</span><div className="ro-race-board"><RacingLeaderboard players={DEFAULT_PLAYERS} selectedIndex={driver} onSelect={chooseDriver} interaction={interaction} time={0} replay={false} bloom={bloom} reducedMotion={!motion}/></div><div className="ro-countdown">{count||'GO!'}</div><span className="ro-lap">LAP <b>1 / 3</b></span><small className="ro-mock-label">UI MOCKUP · GAMEPLAY NOT CONNECTED</small></main>}
  </div>
  <footer className="ro-footer"><button onClick={back}><kbd>B</kbd> Back</button><strong>{titles[page]}</strong><span><kbd>↔</kbd>{page==='menu'&&active===1?' Players':' Select'} <kbd>A</kbd> OK</span></footer>
  {phase!=='idle'&&motion&&<div className="ro-checker-wipe" key={wipe} aria-hidden="true">{Array.from({length:96},(_,i)=><i key={i} style={{'--delay':`${(i%12+Math.floor(i/12))*5}ms`} as React.CSSProperties}/>)}</div>}
 </div>;
}
