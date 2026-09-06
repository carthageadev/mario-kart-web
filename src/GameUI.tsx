import {useCallback,useEffect,useRef,useState} from 'react';
import {ShaderMenuButton,type MenuBadge} from './GameMaterials';
import {RacingLeaderboard} from './RacingLeaderboard';
import {DEFAULT_PLAYERS} from './timeline';
import {KartPreview,PartIcon,RacerPortrait,parts,racers} from './GameSelect';
import {useConsoleNavigation} from './useConsoleNavigation';
import './game.css';

type Page='menu'|'characters'|'kart'|'cups'|'garage'|'settings'|'mktv'|'amiibo'|'ready'|'race';
const backdrop='https://www.gameuidatabase.com/uploads/MarioKart8Deluxe04222020-114642.jpg';
const modes=[
 {title:'Grand Prix',detail:'Four courses. One champion.',symbol:'cup',badge:'trophy',color:'#7daaff'},
 {title:'Multiplayer',detail:'Share the starting grid.',symbol:'kart',badge:'players',color:'#f5c74f'},
 {title:'Time Trial',detail:'Race the clock. Find your perfect lap.',symbol:'coin',badge:'timer',color:'#f8c85c'},
 {title:'Battle',detail:'Pick your arena. Defend your balloons.',symbol:'gear',badge:'battle',color:'#ec6d95'}
] as const;
const extras=[{page:'garage',label:'Garage',icon:'◆'},{page:'settings',label:'Settings',icon:'⚙'},{page:'mktv',label:'MKTV',icon:'▣'},{page:'amiibo',label:'amiibo',icon:'♟'}] as const;
const cups=[
 {name:'Coastal Cup',symbol:'cup',color:'#79b9ff',tracks:['Harbor Run','Coral Tunnel','Cliffside Circuit','Midnight Marina']},
 {name:'Neon Cup',symbol:'coin',color:'#df81ff',tracks:['Neon Avenue','Skyline Sprint','Metro Loop','Afterglow Park']},
 {name:'Orbit Cup',symbol:'gear',color:'#ffcf68',tracks:['Launch Point','Satellite Strip','Lunar Drift','Starfall Road']}
] as const;
const arenas=['Balloon Bay','Block Plaza','Lunar Outpost','Neon Rooftop'];
export function GameUI(){
 const [page,setPage]=useState<Page>('menu'),[active,setActive]=useState(0),[selectedMenu,setSelectedMenu]=useState(0),[players,setPlayers]=useState(2),[cup,setCup]=useState(0),[course,setCourse]=useState(0),[engine,setEngine]=useState(150);
 const [racer,setRacer]=useState(0),[build,setBuild]=useState([0,0,0]),[battleRule,setBattleRule]=useState(0);
 const [bloom,setBloom]=useState(.6),[motion,setMotion]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches),[volume,setVolume]=useState(30),[count,setCount]=useState(3),[driver,setDriver]=useState(2);
 const [phase,setPhase]=useState<'idle'|'out'|'in'>('idle'),[wipe,setWipe]=useState(0),[imageLoaded,setImageLoaded]=useState(false),[confirmation,setConfirmation]=useState(0),[pending,setPending]=useState(false);
 const [interaction,setInteraction]=useState<{id:number;index:number;type:'open'|'confirm'}>({id:0,index:2,type:'open'});
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]),changing=useRef(false);
 const navigate=useCallback((next:Page,confirm=false)=>{
  if(changing.current||next===page)return;
  if(!motion){setPage(next);return;}
  changing.current=true;
  const delay=confirm?720:0;
  if(confirm){setConfirmation(n=>n+1);setPending(true);}
  timers.current.push(setTimeout(()=>{setPending(false);setPhase('out');setWipe(n=>n+1);},delay));
  timers.current.push(setTimeout(()=>{setPage(next);setPhase('in');},delay+300));
  timers.current.push(setTimeout(()=>{setPhase('idle');changing.current=false;timers.current=[];},delay+760));
 },[motion,page]);
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 const back=()=>navigate(page==='ready'||page==='race'?'cups':page==='cups'?'kart':page==='kart'?'characters':'menu');
 const enter=(i:number)=>{if(changing.current)return;setActive(i);setSelectedMenu(i);navigate('characters',true);};
 const chooseDriver=(i:number)=>{setInteraction(v=>({id:v.id+1,index:i,type:i===driver?'confirm':'open'}));setDriver(i);};
 useConsoleNavigation(page,changing,back,()=>enter(1));
 useEffect(()=>{document.title='RACE ORDER | Kart Racing';},[]);
 useEffect(()=>{if(page!=='race')return;setCount(3);const timer=setInterval(()=>setCount(n=>Math.max(0,n-1)),1000);return()=>clearInterval(timer);},[page]);
 useEffect(()=>{
  if(!volume)return;
  const click=(e:Event)=>{if(!(e.target instanceof Element)||!e.target.closest('.ro-game button'))return;const ctx=new AudioContext(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.setValueAtTime(700,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(1050,ctx.currentTime+.06);gain.gain.setValueAtTime(volume*.0007,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.09);osc.start();osc.stop(ctx.currentTime+.1);osc.onended=()=>{void ctx.close();};};
  document.addEventListener('click',click);return()=>document.removeEventListener('click',click);
 },[volume]);
 const playerTotal=active===1?players:1,battle=active===3,tracks=battle?arenas:cups[cup].tracks,track=tracks[course];
 const titles={menu:'Select a mode',characters:racers[racer].name,kart:`${parts[0].options[build[0]]} Kart`,cups:battle?'Choose an arena':cups[cup].name,garage:'Garage',settings:'Settings',mktv:'MKTV',amiibo:'amiibo',ready:'Ready to race?',race:track};
 const confirmButton=(next:Page,label='OK')=><button className="ro-confirm" onClick={()=>navigate(next,true)}><kbd>A</kbd> {label}</button>;
 return <div className={`ro-game ro-page-${page} ${!motion?'ro-still':''} ${pending?'ro-confirm-pending':''}`} style={{'--glow':`${bloom*14}px`} as React.CSSProperties}>
  <div className={`ro-racing-backdrop ${imageLoaded?'loaded':''}`} aria-hidden="true"><img src={backdrop} alt="" referrerPolicy="no-referrer" onLoad={()=>setImageLoaded(true)}/><div className="ro-backdrop-haze"/></div>
  <div className="ro-frost-wedge" aria-hidden="true"/>
  <header className="ro-header"><a href="/game" className="ro-logo"><span className="ro-emblem">»</span>RACE<span>ORDER</span><small>KART RACING</small></a><nav><a href="/">UI LAB ↗</a><span className="ro-profile">{racers[racer].name.toUpperCase()} <b>01</b></span></nav></header>
  <div className={`ro-screen ro-phase-${phase}`} key={page} aria-busy={pending} onClickCapture={e=>{if(changing.current){e.preventDefault();e.stopPropagation();}}}>
   {page==='menu'?<main className="ro-main-menu"><h1 className="ro-screen-heading">Select a mode</h1><section className="ro-mode-list" aria-label="Game modes">{modes.map((m,i)=><div className={`ro-mode-wrap ${selectedMenu===i?'active':''} ${i===1?'multiplayer':''}`} key={m.title} onFocus={()=>{if(!changing.current)setSelectedMenu(i);}}><ShaderMenuButton label={m.title} kind={m.symbol} accent={m.color} selected={selectedMenu===i} onClick={()=>enter(i)} motion={motion} confirmation={confirmation} badge={m.badge as MenuBadge}/>{i===1&&selectedMenu===1&&<div className="ro-player-count" role="group" aria-label="Number of local players">{[1,2,3,4].map(n=><button key={n} aria-label={`${n} players`} aria-pressed={players===n} onFocus={()=>{if(!changing.current)setPlayers(n);}} onClick={()=>{if(!changing.current)setPlayers(n);}}>{n}<small>P</small></button>)}</div>}</div>)}</section><p className="ro-menu-help">{selectedMenu<4?modes[selectedMenu].detail:extras[selectedMenu-4].label}</p><section className="ro-extras" aria-label="Extras">{extras.map((item,i)=><button key={item.page} aria-pressed={selectedMenu===i+4} onFocus={()=>{if(!changing.current)setSelectedMenu(i+4);}} onClick={()=>navigate(item.page,true)}><span aria-hidden="true">{item.icon}</span><b>{item.label}</b></button>)}</section><div className="ro-backdrop-caption"><strong>RACE ORDER</strong><small>KART RACING</small></div></main>:
   page==='characters'?<main className="ro-selection"><div className="ro-select-heading"><h1>Select your character</h1><span>{modes[active].title} · {playerTotal}P</span></div><section className="ro-character-grid" aria-label="Characters">{racers.map((r,i)=><button key={r.name} aria-label={r.name} aria-pressed={racer===i} onFocus={()=>{if(!changing.current)setRacer(i);}} onClick={()=>{setRacer(i);navigate('kart',true);}} style={{'--racer-color':r.color} as React.CSSProperties}><RacerPortrait index={i}/><span>{r.name}</span>{racer===i&&<b className="ro-player-tag">1P</b>}</button>)}</section><section className="ro-select-preview"><KartPreview racer={racer} motion={motion}/><h2>{racers[racer].name}</h2><span className="ro-preview-subtitle">READY FOR THE GRID</span></section><div className="ro-select-bottom"><span>Choose your racer</span>{confirmButton('kart')}</div></main>:
   page==='kart'?<main className="ro-selection"><div className="ro-select-heading"><h1>Select your kart</h1><span>{racers[racer].name} · {playerTotal}P</span></div><section className="ro-parts" aria-label="Kart parts">{parts.map((p,col)=><div className="ro-part-column" key={p.label}><h2>{p.label}</h2>{p.options.map((name,i)=><button key={name} aria-label={`${p.label}: ${name}`} aria-pressed={build[col]===i} onFocus={()=>{if(!changing.current)setBuild(v=>v.map((n,c)=>c===col?i:n));}} onClick={()=>{if(!changing.current)setBuild(v=>v.map((n,c)=>c===col?i:n));}}><PartIcon column={col} index={i}/><span>{name}</span></button>)}</div>)}</section><section className="ro-select-preview"><KartPreview racer={racer} body={build[0]} tires={build[1]} glider={build[2]} motion={motion}/><h2>{parts[0].options[build[0]]}</h2><div className="ro-kart-stats">{['Speed','Handling','Grip'].map((s,i)=><div key={s}><span>{s}</span><i style={{'--stat':`${45+((build[i]*17+i*9)%40)}%`} as React.CSSProperties}/></div>)}</div></section><div className="ro-select-bottom"><span>{parts[1].options[build[1]]} · {parts[2].options[build[2]]}</span>{confirmButton('cups')}</div></main>:
   page==='cups'?<main className="ro-cups"><div className="ro-cup-top"><h1>{battle?'Battle rules':active===2?'Time Trial':'Select a cup'}</h1><div className="ro-class-select" aria-label={battle?'Battle mode':'Engine class'}>{(battle?['Balloons','Coins','Bob-ombs']:[50,100,150,200]).map((v,i)=><button key={v} aria-pressed={battle?battleRule===i:engine===v} onClick={()=>battle?setBattleRule(i):setEngine(Number(v))}>{v}{!battle&&<small>cc</small>}</button>)}</div></div>{!battle&&<section className="ro-cup-choices" aria-label="Cups">{cups.map((c,i)=><div className="ro-medal-holder" key={c.name}><ShaderMenuButton label={c.name} kind={c.symbol} accent={c.color} selected={cup===i} onClick={()=>{setCup(i);setCourse(0);}} motion={motion} medal/><span className="ro-cup-stars">☆ ☆ ☆</span></div>)}</section>}{battle&&<div className="ro-battle-banner"><span>◉ ◉ ◉</span><h2>{['Balloon Battle','Coin Runners','Bob-omb Blast'][battleRule]}</h2><p>3 minutes · No teams · Normal items</p></div>}<section className="ro-course-tray" aria-label={battle?'Arenas':'Courses'}>{tracks.map((name,i)=><button key={name} className={`ro-course ${course===i?'selected':''}`} aria-pressed={course===i} onClick={()=>setCourse(i)}><div className={`ro-course-image course-${i}`}><img src={backdrop} alt="" referrerPolicy="no-referrer"/><span>{String(i+1).padStart(2,'0')}</span></div><strong>{name}</strong></button>)}</section><div className="ro-cup-summary"><span>{battle?'BATTLE':`${engine}cc`} · {playerTotal}P · {active===2?'PERSONAL BEST  --:--.---':racers[racer].name.toUpperCase()}</span>{confirmButton('ready')}</div></main>:
   page==='settings'?<main className="ro-settings"><section className="ro-glass-panel"><h1>Interface settings</h1><div className="ro-settings-row"><span>Bloom</span><div className="ro-adjust"><button aria-label="Reduce bloom" onClick={()=>setBloom(v=>Math.max(0,+(v-.1).toFixed(1)))}>‹</button><output>{Math.round(bloom*100)}%</output><button aria-label="Increase bloom" onClick={()=>setBloom(v=>Math.min(1.2,+(v+.1).toFixed(1)))}>›</button></div></div><div className="ro-settings-row"><span>Menu sound</span><div className="ro-adjust"><button aria-label="Reduce menu sound" onClick={()=>setVolume(v=>Math.max(0,v-10))}>‹</button><output>{volume}%</output><button aria-label="Increase menu sound" onClick={()=>setVolume(v=>Math.min(100,v+10))}>›</button></div></div><div className="ro-settings-row"><span>Interface motion</span><button className="ro-value-toggle" aria-pressed={motion} onClick={()=>setMotion(v=>!v)}>‹ <span>{motion?'On':'Off'}</span> ›</button></div><div className="ro-settings-preview"><ShaderMenuButton label="Preview" kind="gear" accent="#d1d8e4" selected onClick={()=>setConfirmation(n=>n+1)} confirmation={confirmation} motion={motion}/></div>{confirmButton('menu','Done')}</section></main>:
   page==='garage'||page==='mktv'||page==='amiibo'?<main className="ro-stub"><section className="ro-glass-panel"><div className="ro-stub-symbol" aria-hidden="true">{extras.find(e=>e.page===page)?.icon}</div><h1>{titles[page]}</h1><p>{page==='garage'?'Your garage is under construction.':page==='mktv'?'Your race highlights will appear here.':'Your amiibo collection will appear here.'}</p><small>Coming soon</small><button className="ro-confirm" onClick={()=>navigate('menu')}><kbd>B</kbd> Back</button></section></main>:
   page==='ready'?<main className="ro-ready"><section className="ro-glass-panel"><h1>Start {battle?'Battle':active===2?'Time Trial':'Race'}?</h1><p>{track} · {battle?['Balloon Battle','Coin Runners','Bob-omb Blast'][battleRule]:`${engine}cc`} · {playerTotal}P</p><p>{racers[racer].name} · {parts[0].options[build[0]]} Kart</p><button className="ro-large-ok" onClick={()=>navigate('race',true)}>OK</button></section></main>:
   <main className="ro-race"><h1>{track}</h1><span className="ro-race-detail">{battle?'BATTLE':cups[cup].name} · {engine}cc · {playerTotal}P</span><div className="ro-race-board"><RacingLeaderboard players={DEFAULT_PLAYERS} selectedIndex={driver} onSelect={chooseDriver} interaction={interaction} time={0} replay={false} bloom={bloom} reducedMotion={!motion}/></div><div className="ro-countdown">{count||'GO!'}</div><div className="ro-lap">{active===2?'TIME  00:00.000':battle?'3:00':'LAP  1 / 3'}</div><small className="ro-mock-label">UI MOCKUP · GAMEPLAY NOT CONNECTED</small></main>}
  </div>
  <footer className="ro-footer"><button onClick={back}><kbd>B</kbd> Back</button><strong>{titles[page]}</strong><span><kbd>✚</kbd> Select <kbd>A</kbd> OK</span></footer>
  {phase!=='idle'&&motion&&<div className="ro-checker-wipe" key={wipe} aria-hidden="true">{Array.from({length:96},(_,i)=><i key={i} style={{'--delay':`${(i%12+Math.floor(i/12))*5}ms`} as React.CSSProperties}/>)}</div>}
 </div>;
}
