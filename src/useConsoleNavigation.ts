import {useEffect,useRef} from 'react';

export function useConsoleNavigation(page:string,locked:React.RefObject<boolean>,back:()=>void,confirmPlayers:()=>void){
 const actions=useRef({back,confirmPlayers});actions.current={back,confirmPlayers};
 useEffect(()=>{
  const scope=()=>document.querySelector<HTMLElement>('.ro-screen');
  const buttons=()=>Array.from(scope()?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]).filter(b=>b.getBoundingClientRect().width>0);
  const focusDefault=()=>{const list=buttons();(list.find(b=>b.getAttribute('aria-pressed')==='true')??list[0])?.focus({preventScroll:false});};
  focusDefault();
  const move=(key:string)=>{
   if(locked.current)return;
   if(key==='Escape'){actions.current.back();return;}
   const list=buttons(),current=document.activeElement as HTMLButtonElement;
   if(key==='Enter'){if(current?.closest('.ro-player-count'))actions.current.confirmPlayers();else if(list.includes(current))current.click();else focusDefault();return;}
   if(!list.includes(current)){focusDefault();return;}
   if(current.closest('.ro-mode-wrap')&&(key==='ArrowUp'||key==='ArrowDown')){
    const modes=Array.from(scope()?.querySelectorAll<HTMLButtonElement>('.ro-mode-wrap>.ro-menu-button')??[]);
    const index=modes.findIndex(b=>b.parentElement?.contains(current));
    const next=index+(key==='ArrowDown'?1:-1);
    (modes[next]??(next===modes.length?scope()?.querySelector<HTMLButtonElement>('.ro-extras button'):null))?.focus({preventScroll:false});return;
   }
   if(current.closest('.ro-extras')&&key==='ArrowUp'){
    const modes=scope()?.querySelectorAll<HTMLButtonElement>('.ro-mode-wrap>.ro-menu-button');modes?.[modes.length-1]?.focus({preventScroll:false});return;
   }
   if((key==='ArrowLeft'||key==='ArrowRight')&&current.closest('.ro-mode-wrap.multiplayer')){
    const counts=Array.from(scope()?.querySelectorAll<HTMLButtonElement>('.ro-player-count button')??[]);
    const index=counts.findIndex(b=>b.getAttribute('aria-pressed')==='true');
    counts[Math.max(0,Math.min(counts.length-1,index+(key==='ArrowRight'?1:-1)))]?.focus({preventScroll:false});return;
   }
   if(current.closest('.ro-mode-wrap'))return;
   const a=current.getBoundingClientRect(),x=a.x+a.width/2,y=a.y+a.height/2,vertical=key==='ArrowUp'||key==='ArrowDown',sign=key==='ArrowUp'||key==='ArrowLeft'?-1:1;
   const target=list.filter(b=>b!==current).map(b=>{const r=b.getBoundingClientRect(),dx=r.x+r.width/2-x,dy=r.y+r.height/2-y,forward=(vertical?dy:dx)*sign,side=Math.abs(vertical?dx:dy);return {b,forward,score:forward+side*3};}).filter(c=>c.forward>8).sort((a,b)=>a.score-b.score)[0];
   target?.b.focus({preventScroll:false});
  };
  const key=(e:KeyboardEvent)=>{if(e.target instanceof HTMLInputElement)return;const k=e.key.toLowerCase()==='a'?'Enter':e.key.toLowerCase()==='b'?'Escape':e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Escape'].includes(k)){e.preventDefault();if(!e.repeat||k.startsWith('Arrow'))move(k);}};
  const hover=(e:MouseEvent)=>{if(locked.current)return;const b=(e.target as Element).closest<HTMLButtonElement>('.ro-screen button');if(b&&document.activeElement!==b)b.focus({preventScroll:true});};
  window.addEventListener('keydown',key);document.addEventListener('mousemove',hover);
  let raf=0,held='',nextRepeat=0;
  const poll=(now:number)=>{const pad=Array.from(navigator.getGamepads?.()??[]).find(p=>p?.connected);if(pad){const b=pad.buttons,ax=pad.axes;const k=b[1]?.pressed?'Escape':b[0]?.pressed?'Enter':b[12]?.pressed||ax[1]<-.55?'ArrowUp':b[13]?.pressed||ax[1]>.55?'ArrowDown':b[14]?.pressed||ax[0]<-.55?'ArrowLeft':b[15]?.pressed||ax[0]>.55?'ArrowRight':'';if(k&&(k!==held||(k.startsWith('Arrow')&&now>nextRepeat))){move(k);nextRepeat=now+(k===held?150:340);}held=k;}else held='';raf=requestAnimationFrame(poll);};raf=requestAnimationFrame(poll);
  return()=>{window.removeEventListener('keydown',key);document.removeEventListener('mousemove',hover);cancelAnimationFrame(raf);};
 },[page,locked]);
}
