'use client';

import { useEffect, useRef } from 'react';

/**
 * The homepage hero's WebGL "molten" animation, packaged as a reusable canvas.
 * Fills its parent; respects prefers-reduced-motion (renders a single frame).
 */
export function MoltenCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;',
      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
      'float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);',
      ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
      'float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,4.6);a*=.5;}return v;}',
      'vec3 ramp(float t){',
      ' vec3 c1=vec3(1.,.769,0.);vec3 c2=vec3(1.,.478,0.);vec3 c3=vec3(1.,.188,0.);vec3 c4=vec3(1.,0.,.333);vec3 c5=vec3(.902,0.,.788);',
      ' t=clamp(t,0.,1.);',
      ' if(t<.25)return mix(c1,c2,t*4.);',
      ' if(t<.5)return mix(c2,c3,(t-.25)*4.);',
      ' if(t<.75)return mix(c3,c4,(t-.5)*4.);',
      ' return mix(c4,c5,(t-.75)*4.);}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
      ' vec2 p=uv;p.x*=u_res.x/u_res.y;',
      ' float t=u_time*.06;',
      ' vec2 q=vec2(fbm(p*1.9+t),fbm(p*1.9-t*.7));',
      ' vec2 r=vec2(fbm(p*1.9+q*1.6+vec2(1.7,9.2)+t*.5),fbm(p*1.9+q*1.6+vec2(8.3,2.8)-t*.35));',
      ' float f=fbm(p*1.9+r*2.1);',
      ' vec2 m=vec2(u_mouse.x*u_res.x/u_res.y,u_mouse.y);',
      ' float d=length(p-m);',
      ' f+=exp(-d*2.6)*.32;',
      ' float pos=clamp(uv.x+(r.x-.5)*.9,0.,1.);',
      ' vec3 molten=ramp(pos);',
      ' vec3 ink=vec3(.031,.027,.047);',
      ' float vein=smoothstep(.44,.88,f);',
      ' float core=smoothstep(.72,.98,f);',
      ' vec3 col=mix(ink,molten,vein*.92);',
      ' col+=vec3(1.,.9,.75)*core*.35;',
      ' float vig=smoothstep(1.25,.35,length(uv-.5));',
      ' col*=mix(.8,1.,vig);',
      ' gl_FragColor=vec4(col,1.);}',
    ].join('\n');

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const size = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) / rect.width;
      mouse.ty = (e.clientY - rect.top) / rect.height;
    };
    canvas.addEventListener('pointermove', onMove);

    const start = performance.now();
    let raf = 0;
    const render = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, 1.0 - mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced) raf = requestAnimationFrame(render);
    };
    if (reduced) render(start + 1);
    else raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
