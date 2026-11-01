import {useEffect} from 'react';

/** Reference offsets: target start at 95% viewport to target end at 25%. */
export function flightProgress(top:number,height:number,viewportHeight:number){
  return Math.max(0,Math.min(1,(viewportHeight*.95-top)/Math.max(1,height+viewportHeight*.7)));
}

/** Move the existing SVG plane along its existing dotted SVG path.
 * Scroll position, rather than a timer, controls travel in both directions.
 * Uses the reference's arc-length sampling, tangent rotation and fade-in.
 */
export function useFlightMotion(path:string){
  useEffect(()=>{
    if(path!=='/'&&path!=='/how-it-works')return;
    const flights=Array.from(document.querySelectorAll<HTMLElement>('.tp-flight')).map(container=>({
      container,
      route:container.querySelector<SVGPathElement>('.tp-flight__route'),
      plane:container.querySelector<SVGGElement>('svg > g'),
    })).filter((flight):flight is {container:HTMLElement;route:SVGPathElement;plane:SVGGElement}=>!!flight.route&&!!flight.plane);
    if(!flights.length)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,disposed=false;
    const originals=flights.map(({plane})=>({transform:plane.getAttribute('transform'),opacity:plane.style.opacity}));
    const update=()=>{
      frame=0;if(disposed)return;
      flights.forEach(({container,route,plane})=>{
        const rect=container.getBoundingClientRect();
        const progress=reduced.matches ? .62 : flightProgress(rect.top,rect.height,document.documentElement.clientHeight);
        const length=route.getTotalLength();
        const distance=Math.max(0,Math.min(length,progress*length));
        const point=route.getPointAtLength(distance);
        const after=route.getPointAtLength(Math.min(length,distance+1));
        const before=route.getPointAtLength(Math.max(0,distance-1));
        const angle=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI;
        plane.setAttribute('transform',`translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
        plane.style.opacity=String(Math.max(0,Math.min(1,(progress-.11)/.06)));
        container.dataset.flightMotion='scroll';
        container.dataset.flightProgress=progress.toFixed(5);
      });
    };
    const schedule=()=>{if(!disposed&&!frame)frame=requestAnimationFrame(update);};
    const resize=new ResizeObserver(schedule);
    resize.observe(document.body);flights.forEach(({container})=>resize.observe(container));
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
    reduced.addEventListener('change',schedule);
    document.fonts.ready.then(schedule);
    update();
    return()=>{
      disposed=true;cancelAnimationFrame(frame);resize.disconnect();
      removeEventListener('scroll',schedule);removeEventListener('resize',schedule);
      reduced.removeEventListener('change',schedule);
      flights.forEach(({container,plane},i)=>{
        delete container.dataset.flightMotion;delete container.dataset.flightProgress;
        if(originals[i].transform===null)plane.removeAttribute('transform');else plane.setAttribute('transform',originals[i].transform!);
        plane.style.opacity=originals[i].opacity;
      });
    };
  },[path]);
}
