import {useEffect} from 'react';
import {PuppyDriver} from './motion/reference-motion';

const pages=new Set(['/puppies','/happy-families','/how-it-works','/faq','/contact']);

/** Give the page mascots the same eye, tail and petting physics as Home.
 * Existing SVG artwork, pose, facing and layout are preserved.
 */
export function useLivePagePuppies(path:string){
  useEffect(()=>{
    if(!pages.has(path))return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let dispose=()=>{};
    const start=()=>{
      dispose();
      if(reduced.matches)return;
      const entries=Array.from(document.querySelectorAll<HTMLElement>('#main .pup-buddy')).filter(el=>!el.closest('[data-pup-stop]')).flatMap(element=>{
        const svg=element.querySelector<SVGSVGElement>('svg');if(!svg)return [];
        const original=Array.from(svg.querySelectorAll<SVGElement>('[data-p]')).map(node=>({node,transform:node.getAttribute('transform'),opacity:node.getAttribute('opacity')}));
        const body=svg.querySelector('[data-p="body"]')?.getAttribute('transform')||'';
        const pose=/rotate\(15(?:\s|\))/.test(body)?'bow':'sit';
        const driver=new PuppyDriver(svg,pose,element.dataset.facing==='left'?-1:1);
        const rect=element.getBoundingClientRect();
        const entry={element,svg,driver,original,visible:rect.bottom>0&&rect.top<innerHeight};
        element.dataset.live='true';element.dataset.petting='false';driver.wag(.6);
        return [entry];
      });
      if(!entries.length)return;
      let frame=0,last=0,pointer:{x:number;y:number;at:number}|null=null;
      const tick=(now:number)=>{
        frame=0;const seconds=now/1000,delta=Math.min(.05,last?(now-last)/1000:1/60);last=now;
        entries.forEach(entry=>{
          if(!entry.visible)return;
          entry.driver.lookAt(pointer&&now-pointer.at<2500?pointer:null);
          entry.driver.tick(delta,seconds);
        });
        if(entries.some(e=>e.visible))frame=requestAnimationFrame(tick);else last=0;
      };
      const wake=()=>{if(!frame&&entries.some(e=>e.visible))frame=requestAnimationFrame(tick);};
      const observer=new IntersectionObserver(changes=>{
        for(const change of changes){const entry=entries.find(e=>e.element===change.target);if(entry)entry.visible=change.isIntersecting;}
        wake();
      },{threshold:0});
      const subscriptions=entries.map(entry=>{
        const enter=(event:PointerEvent)=>{
          if(event.pointerType!=='mouse')return;
          entry.element.dataset.petting='true';entry.driver.petting(true);entry.driver.wag(1);wake();
        };
        const leave=()=>{entry.element.dataset.petting='false';entry.driver.petting(false);entry.driver.wag(.6);};
        entry.element.addEventListener('pointerenter',enter);entry.element.addEventListener('pointerleave',leave);
        observer.observe(entry.element);
        return()=>{entry.element.removeEventListener('pointerenter',enter);entry.element.removeEventListener('pointerleave',leave);};
      });
      const move=(event:PointerEvent)=>{if(event.pointerType==='mouse'){pointer={x:event.clientX,y:event.clientY,at:performance.now()};wake();}};
      window.addEventListener('pointermove',move,{passive:true});wake();
      dispose=()=>{
        cancelAnimationFrame(frame);observer.disconnect();subscriptions.forEach(unsubscribe=>unsubscribe());
        window.removeEventListener('pointermove',move);
        entries.forEach(({element,original})=>{
          delete element.dataset.live;delete element.dataset.petting;
          original.forEach(({node,transform,opacity})=>{
            if(transform===null)node.removeAttribute('transform');else node.setAttribute('transform',transform);
            if(opacity===null)node.removeAttribute('opacity');else node.setAttribute('opacity',opacity);
          });
        });
      };
    };
    start();reduced.addEventListener('change',start);
    return()=>{reduced.removeEventListener('change',start);dispose();};
  },[path]);
}
