'use client';

import { useEffect, useRef } from 'react';

export function MoltenHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;
    const webgl = gl;

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let heroVisible = true;
    let frame = 0;
    const start = performance.now();

    const vertexShader = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fragmentShader = [
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

    function compile(type: number, source: string) {
      const shader = webgl.createShader(type);
      if (!shader) return null;
      webgl.shaderSource(shader, source);
      webgl.compileShader(shader);
      return shader;
    }

    const vertex = compile(webgl.VERTEX_SHADER, vertexShader);
    const fragment = compile(webgl.FRAGMENT_SHADER, fragmentShader);
    const program = webgl.createProgram();
    if (!vertex || !fragment || !program) return;

    webgl.attachShader(program, vertex);
    webgl.attachShader(program, fragment);
    webgl.linkProgram(program);
    webgl.useProgram(program);

    const buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), webgl.STATIC_DRAW);

    const position = webgl.getAttribLocation(program, 'p');
    webgl.enableVertexAttribArray(position);
    webgl.vertexAttribPointer(position, 2, webgl.FLOAT, false, 0, 0);

    const uRes = webgl.getUniformLocation(program, 'u_res');
    const uTime = webgl.getUniformLocation(program, 'u_time');
    const uMouse = webgl.getUniformLocation(program, 'u_mouse');

    const size = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
      canvas.width = Math.floor(canvas.clientWidth * scale);
      canvas.height = Math.floor(canvas.clientHeight * scale);
      webgl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = (now: number) => {
      if (heroVisible) {
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        webgl.uniform2f(uRes, canvas.width, canvas.height);
        webgl.uniform1f(uTime, (now - start) / 1000);
        webgl.uniform2f(uMouse, mouse.x, 1 - mouse.y);
        webgl.drawArrays(webgl.TRIANGLES, 0, 3);
      }

      if (!reduced) {
        frame = requestAnimationFrame(render);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.tx = event.clientX / window.innerWidth;
      mouse.ty = event.clientY / window.innerHeight;
    };

    size();
    window.addEventListener('resize', size);
    window.addEventListener('mousemove', handleMouseMove);

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
          heroVisible = entries[0]?.isIntersecting ?? true;
        }, { threshold: 0 })
      : null;

    observer?.observe(canvas);
    frame = requestAnimationFrame(render);

    if (reduced) {
      render(performance.now() + 1);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', size);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas className="foundrie-molten-canvas" aria-hidden="true" ref={canvasRef} />;
}
