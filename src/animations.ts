import {useEffect} from 'react';
import type {Puppy} from './types';
import puppyData from './data/puppies.json';
import {cuePup} from './motion/reference-motion';

const clamp=(v:number)=>Math.max(0,Math.min(1,v));

export function usePageAnimations(path:string) {
  useEffect(()=>{
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame=0;
    const timers:ReturnType<typeof setTimeout>[]=[];
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        const node=entry.target as HTMLElement;
        if(entry.isIntersecting){node.dataset.revealed='true';node.dataset.visited='true';node.dataset.here='true';if(node.matches('[data-reveal]'))observer.unobserve(node);}
        else if(node.matches('[data-pup-scene]'))node.dataset.here='false';
      });
    },{threshold:.08});
    document.querySelectorAll<HTMLElement>('[data-reveal], [data-pup-scene]').forEach(el=>{if(reduced)el.dataset.revealed='true';else {el.dataset.armed='true';observer.observe(el);}});
    // Reference StoryRibbon offsets: ["start 30%", "end end"].
    const ribbon=document.querySelector<HTMLElement>('.tp-ribbon');
    const band=ribbon?.querySelector<HTMLElement>('.tp-ribbon__band');
    const updateRibbon=()=>{
      if(!ribbon||!band)return;
      const rect=ribbon.getBoundingClientRect();
      const distance=ribbon.clientHeight-innerHeight*.7;
      const progress=distance>0?clamp((innerHeight*.3-rect.top)/distance):0;
      band.style.transform=`scaleY(${progress})`;
    };
    const meet=document.querySelector<HTMLElement>('.tp-meet');
    const pin=meet?.querySelector<HTMLElement>('[data-pin-range]');
    const track=meet?.querySelector<HTMLElement>('.tp-meet__track');
    const hall=meet?.querySelector<HTMLElement>('.tp-meet__hall');
    const meetPuppy=meet?.querySelector<HTMLElement>('.tp-meet__teddy');
    let travel=0,trackX=0,targetX=0,velocity=0,trackFrame=0,lastFrame=0;
    const writeTrack=(x:number,notify=true)=>{
      if(!track)return;
      track.style.transform=`translate3d(${x.toFixed(2)}px,0,0)`;
      hall?.style.setProperty('--floor-x',`${x.toFixed(1)}px`);
      track.querySelectorAll<HTMLElement>('.tp-door').forEach(door=>{
        const open=door.offsetLeft+x<innerWidth*.36;
        if(door.dataset.open!==String(open)){
          door.dataset.open=String(open);
          if(open&&notify)cuePup({look:door,secs:.9});
        }
        // Let the original 78-degree hinge and hover rules control each door.
        const leaf=door.querySelector<HTMLElement>('.tp-door__leaf');if(leaf)leaf.style.removeProperty('transform');
      });
    };
    const animateTrack=(now:number)=>{
      const dt=Math.min(.05,lastFrame?(now-lastFrame)/1000:1/60);lastFrame=now;
      const steps=Math.max(1,Math.ceil(dt/(1/120))),step=dt/steps;
      for(let i=0;i<steps;i++){velocity+=((targetX-trackX)*170-velocity*32)/.35*step;trackX+=velocity*step;}
      writeTrack(trackX);
      if(Math.abs(targetX-trackX)>.05||Math.abs(velocity)>.05)trackFrame=requestAnimationFrame(animateTrack);
      else{trackX=targetX;velocity=0;trackFrame=0;lastFrame=0;writeTrack(trackX);}
    };
    const resize=()=>{
      updateRibbon();
      if(meet&&pin&&track&&!reduced&&innerWidth>=1024){
        meet.dataset.pinned='true';pin.style.setProperty('--pinned','1');
        const stage=meet.querySelector<HTMLElement>('.tp-meet__stage');
        const heading=meet.querySelector<HTMLElement>('.tp-meet__head');
        const plateHeight=Math.max(64,...Array.from(track.querySelectorAll<HTMLElement>('.tp-door__plate')).map(e=>e.offsetHeight));
        const floorHeight=hall?.querySelector<HTMLElement>('.tp-meet__floor')?.offsetHeight||0;
        const doorWidth=Math.max(128,Math.min(256,innerWidth*.15,((stage?.clientHeight||innerHeight)-(heading?heading.offsetTop+heading.offsetHeight:0)-floorHeight-plateHeight-40)/1.3));
        hall?.style.setProperty('--door-w',`${Math.round(doorWidth)}px`);
        travel=Math.max(0,track.scrollWidth-innerWidth);
        pin.style.height=`${innerHeight+Math.round(.8*travel)}px`;
        if(meetPuppy){meetPuppy.dataset.pose='walk';meetPuppy.dataset.act='treadmill';}
      }else if(meet&&pin&&track){delete meet.dataset.pinned;pin.style.height='';track.style.transform='';hall?.style.removeProperty('--door-w');if(meetPuppy){meetPuppy.dataset.pose='sit';delete meetPuppy.dataset.act;}}
    };
    const scroll=()=>{
      frame=0;
      updateRibbon();
      const header=document.getElementById('site-header');if(header)header.dataset.scrolled=String(scrollY>24);
      if(meet?.dataset.pinned&&pin&&track){
        const progress=clamp(-pin.getBoundingClientRect().top/Math.max(1,pin.offsetHeight-innerHeight));
        targetX=-progress*travel;
        if(!trackFrame)trackFrame=requestAnimationFrame(animateTrack);
      }
      const chat=document.querySelector<HTMLElement>('.tp-chat');
      if(chat){const progress=clamp((innerHeight*.7-chat.getBoundingClientRect().top)/Math.max(1,chat.offsetHeight*.6));const step=Math.min(2,Math.floor(progress*3));
        chat.querySelectorAll<HTMLElement>('.tp-chat__step').forEach((el,i)=>{el.dataset.active=String(i===step);el.dataset.done=String(i<step);});
        chat.querySelectorAll<HTMLElement>('.tp-msg-group').forEach((el,i)=>{el.dataset.show=String(i<=step);});
      }
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(scroll);};
    resize();scroll();addEventListener('resize',resize);addEventListener('scroll',schedule,{passive:true});
    document.fonts.ready.then(()=>{resize();schedule();});
    const pups=(puppyData as unknown as Puppy[]).filter(p=>p.status==='available');
    let seatIndex=0;
    const lineup=!reduced?setInterval(()=>{
      const seats=document.querySelectorAll<HTMLElement>('.tp-lineup:not(.tp-lineup--tags) .tp-lineup__pup');
      if(!seats.length)return;
      const index=seatIndex++%seats.length;const seat=seats[index];const pup=pups[(seatIndex+5)%pups.length];
      seat.dataset.state='dip';
      timers.push(setTimeout(()=>{
        const img=seat.querySelector('img');if(img){img.src=pup.cover.url;img.alt=pup.cover.alt;img.style.objectPosition=`${pup.cover.focalX*100}% ${pup.cover.focalY*100}%`;}
        seat.setAttribute('href',`/puppies/${pup.slug}`);seat.setAttribute('aria-label',`Meet ${pup.displayName}, ${pup.breed}`);seat.dataset.state='pop';
        const tag=document.querySelectorAll<HTMLElement>('.tp-lineup--tags .tp-lineup__ghost')[index];if(tag){const name=tag.querySelector('.tp-lineup__name');if(name)name.textContent=pup.displayName;tag.dataset.tag='show';timers.push(setTimeout(()=>{tag.dataset.tag='';},1800));}
      },340));
    },2800):undefined;
    return()=>{observer.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(trackFrame);removeEventListener('resize',resize);removeEventListener('scroll',schedule);clearInterval(lineup);timers.forEach(clearTimeout);};
  },[path]);
}
