import motion from './reference-motion.json';
export const DURATION=89/30;
export const DEFAULT_PLAYERS=[
 {id:'p4',name:'Player 4',color:'#d60075'},
 {id:'p3',name:'Player 3',color:'#00df48'},
 {id:'p2',name:'Player 2',color:'#087bdc'},
 {id:'p5',name:'Player 5',color:'#b700ec'},
 {id:'p6',name:'Player 6',color:'#ed8508'},
 {id:'p1',name:'Player 1',color:'#d4c300'},
];
export type Racer=typeof DEFAULT_PLAYERS[number];
export function smooth(x:number){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
export function referenceOpenness(time:number){
 const frame=Math.max(0,Math.min(88,time*30));const index=Math.floor(frame);const fraction=frame-index;
 return motion[index].map((v,i)=>v+(motion[Math.min(index+1,88)][i]-v)*fraction);
}
const openingCurve=motion.slice(11,34).map(frame=>frame[4]);
export function liveOpening(time:number){
 const frame=Math.max(0,Math.min(openingCurve.length-1,time*30));const index=Math.floor(frame);const fraction=frame-index;
 return openingCurve[index]+(openingCurve[Math.min(index+1,openingCurve.length-1)]-openingCurve[index])*fraction;
}
export function referenceSelected(time:number){return time<13/30?2:time<34/30?4:3;}
