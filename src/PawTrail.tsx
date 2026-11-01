import {useEffect, useRef} from 'react';

interface PawPrint {x:number; y:number; angle:number; born:number}

// Cubic ellipse outlines match the reference's four rotated toe pads.
function ellipsePath(cx:number,cy:number,rx:number,ry:number,degrees:number){
  const radians=degrees*Math.PI/180;
  const cos=Math.cos(radians),sin=Math.sin(radians);
  const point=(x:number,y:number)=>`${(cx+x*cos-y*sin).toFixed(2)} ${(cy+x*sin+y*cos).toFixed(2)}`;
  return `M${point(rx,0)}C${point(rx,.5523*ry)} ${point(.5523*rx,ry)} ${point(0,ry)}C${point(-.5523*rx,ry)} ${point(-rx,.5523*ry)} ${point(-rx,0)}C${point(-rx,-.5523*ry)} ${point(-.5523*rx,-ry)} ${point(0,-ry)}C${point(.5523*rx,-ry)} ${point(rx,-.5523*ry)} ${point(rx,0)}Z`;
}

const pawPath='M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5z'
  +ellipsePath(14.6,29.2,5.3,6.9,-28)
  +ellipsePath(24.2,16.6,5.5,7.3,-10)
  +ellipsePath(39.8,16.6,5.5,7.3,10)
  +ellipsePath(49.4,29.2,5.3,6.9,28);

/** Mouse-only decoration, mounted once so it remains active across routes.
 * Reference values: 46px steps, alternating 7px offset, 0.27 scale,
 * toffee ink at 42% alpha, 600ms hold + 400ms quadratic fade, 14-print cap.
 */
export function PawTrail(){
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const element=canvas.current;
    if(!element)return;
    const context=element.getContext('2d');
    if(!context)return;
    const mouse=matchMedia('(hover: hover) and (pointer: fine)');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const path=new Path2D(pawPath);
    const prints:PawPrint[]=[];
    let ratio=1,frame=0,running=false;
    let previousX=NaN,previousY=NaN,distance=0,side=1;
    const clear=()=>{
      context.setTransform(1,0,0,1,0,0);
      context.clearRect(0,0,element.width,element.height);
    };
    const reset=()=>{
      cancelAnimationFrame(frame);running=false;prints.length=0;
      previousX=NaN;previousY=NaN;distance=0;side=1;clear();
    };
    const resize=()=>{
      ratio=Math.min(window.devicePixelRatio||1,2);
      element.width=Math.round(innerWidth*ratio);
      element.height=Math.round(innerHeight*ratio);
    };
    const draw=(now:number)=>{
      clear();
      for(let i=prints.length-1;i>=0;i--){
        const print=prints[i],age=now-print.born;
        if(age>1000){prints.splice(i,1);continue;}
        const opacity=age<600?1:1-(age-600)/400;
        context.globalAlpha=.42*opacity*opacity;
        context.setTransform(.27*ratio,0,0,.27*ratio,print.x*ratio,print.y*ratio);
        context.rotate(print.angle);context.translate(-32,-34);
        context.fillStyle='#c2622b';context.fill(path);
      }
      if(prints.length)frame=requestAnimationFrame(draw);else running=false;
    };
    const move=(event:PointerEvent)=>{
      if(event.pointerType!=='mouse'||!mouse.matches||reduced.matches)return;
      if(Number.isNaN(previousX)){previousX=event.clientX;previousY=event.clientY;return;}
      const dx=event.clientX-previousX,dy=event.clientY-previousY;
      distance+=Math.hypot(dx,dy);
      if(distance>=46){
        distance=0;
        const angle=Math.atan2(dy,dx)+Math.PI/2;
        const offset=7*(side=-side);
        prints.push({x:event.clientX+Math.cos(angle)*offset+14,y:event.clientY+Math.sin(angle)*offset+16,angle,born:performance.now()});
        if(prints.length>14)prints.shift();
        if(!running){running=true;frame=requestAnimationFrame(draw);}
      }
      previousX=event.clientX;previousY=event.clientY;
    };
    resize();
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('resize',resize);
    mouse.addEventListener('change',reset);reduced.addEventListener('change',reset);
    return()=>{
      window.removeEventListener('pointermove',move);window.removeEventListener('resize',resize);
      mouse.removeEventListener('change',reset);reduced.removeEventListener('change',reset);reset();
    };
  },[]);
  return <canvas ref={canvas} aria-hidden="true" data-cursor-paw-trail="true" className="pointer-events-none fixed inset-0 z-[70] size-full"/>;
}
