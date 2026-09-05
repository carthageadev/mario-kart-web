export const vertexShader = /* glsl */`
varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;
export const fragmentShader = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uOpen;
uniform vec3 uColor;
uniform float uShine;
uniform float uGloss;
uniform float uSheenStrength;
uniform float uSheenOpacity;
uniform vec3 uSheenColor;
uniform float uBloom;
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return min(max(q.x,q.y),0.)+length(max(q,0.))-r;}
float shape(float d){return 1.-smoothstep(-.6,.7,d);}
void main(){
 vec2 p=vec2(vUv.x*600.,(1.-vUv.y)*88.);
 float e=uOpen;
 float left=mix(20.,140.,e), right=mix(84.,550.,e);
 vec2 q=vec2(p.x+.20*(p.y-42.),p.y);
 float sdf=box(q-vec2((left+right)*.5,42.),vec2((right-left)*.5,36.),12.);
 float mask=shape(sdf);
 float y=clamp((p.y-6.)/72.,0.,1.);
 vec3 pearl=mix(vec3(.985),vec3(.79,.80,.80),y);
 pearl+=vec3(.035)*exp(-pow((y-.12)/.22,2.));
 vec3 dark=mix(vec3(.11,.108,.15),vec3(.085,.084,.128),y);
 float shoulder=exp(-pow((y-.12)/.21,2.));
 dark+=vec3(.245,.242,.26)*shoulder*uGloss;
 dark+=vec3(.022,.02,.038)*smoothstep(.75,1.,y);
 float edge=right-83.-20.*smoothstep(24.,28.,p.y)-20.*smoothstep(47.,51.,p.y);
 float white=1.-smoothstep(edge-1.,edge+1.,q.x);
 vec3 col=mix(pearl,dark,white*e);
 for(int row=0;row<3;row++){
  for(int column=0;column<2;column++){
   if(row==2 && column==1)continue;
   float r=float(row),c=float(column);
   float size=10.5-c*(3.+r*2.);
   vec2 center=vec2(right-116.-r*20.-c*38.,20.+r*23.);
   float tile=shape(box(q-center,vec2(size,size*.86),2.8))*e;
   col=mix(col,pearl,tile);
  }
 }
 float sheenCenter=right-420.+uShine*640.;
 float sheenDistance=q.x-sheenCenter;
 float sheenShape=.72+.28*smoothstep(5.,18.,p.y)*(1.-smoothstep(70.,83.,p.y));
 float shine=exp(-pow(abs(sheenDistance)/48.,1.5))*sheenShape;
 float sheenHalo=exp(-pow(abs(sheenDistance)/25.,1.35))*sheenShape;
 float sheenEdge=exp(-pow(abs(sheenDistance+15.)/8.5,1.25))*sheenShape;
 vec3 sheenTint=mix(vec3(1.0),uSheenColor,.72);
 float sheenAmount=uSheenStrength*uSheenOpacity;
 col+=sheenTint*shine*e*uGloss*.72*sheenAmount;
 col+=uSheenColor*sheenHalo*e*uGloss*.5*sheenAmount*uBloom;
 col+=vec3(1.0,.99,.98)*sheenEdge*e*uGloss*.78*sheenAmount;
 float rim=1.-smoothstep(0.,1.6,abs(sdf+1.2));
 col=mix(col,vec3(.98),rim*(1.-y)*.82);
 col*=1.-rim*y*.06;
 float stripe=shape(box(q-vec2(right-15.,42.),vec2(5.5,30.),5.5));
 vec3 accent=uColor*(1.-y*.12)+vec3(.035)*(1.-y);
 col=mix(col,accent,stripe);
 gl_FragColor=vec4(col,mask);
}
`;
