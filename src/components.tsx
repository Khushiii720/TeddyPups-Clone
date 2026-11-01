import {useEffect, useRef, useState} from 'react';
import type {CSSProperties, FormEvent, ReactNode} from 'react';
import type {Media, Puppy} from './types';

export const WHATSAPP = "https://wa.me/971541676733?text=Hi%20TeddyPups!%20I'd%20love%20to%20know%20more%20about%20your%20puppies.";

export function MediaImage({media, className = '', contain = false}: {media: Media; className?: string; contain?: boolean}) {
  const image = media.kind === 'video' ? media.poster || media : media;
  return <img src={image.url} alt={image.alt} className={className} loading="lazy" style={{width:'100%',height:'100%',objectFit:contain?'contain':'cover',objectPosition:`${image.focalX*100}% ${image.focalY*100}%`}}/>;
}

export function Lightbox({items, initialIndex, name, onClose}: {items:Media[]; initialIndex:number; name:string; onClose:()=>void}) {
  const [index,setIndex] = useState(initialIndex);
  const dialog = useRef<HTMLDialogElement>(null);
  const startX = useRef(0);
  const move = (delta:number) => setIndex(v => (v+delta+items.length)%items.length);
  useEffect(() => {
    const focus = document.activeElement as HTMLElement | null;
    const el = dialog.current;
    el?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow='hidden';
    return () => {document.body.style.overflow=overflow; el?.close(); focus?.focus();};
  },[]);
  const item=items[index];
  return <dialog ref={dialog} aria-label={`${name} photos`} className="clone-lightbox" onCancel={e=>{e.preventDefault();onClose();}}
    onKeyDown={e=>{if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1);}}
    onClick={e=>{if(e.target===e.currentTarget)onClose();}}
    onTouchStart={e=>{startX.current=e.touches[0].clientX;}}
    onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-startX.current;if(Math.abs(dx)>45)move(dx>0?-1:1);}}>
    <div className="clone-lightbox__bar"><p>{name}, {item.kind==='video'?'video':'photo'} {index+1} of {items.length}</p><button autoFocus onClick={onClose} aria-label="Close">✕</button></div>
    <div className="clone-lightbox__media" key={item.id}>
      {item.kind==='video'?<video src={item.url} poster={item.poster?.url} controls autoPlay playsInline aria-label={item.alt}/>:<MediaImage media={item} contain/>}
    </div>
    {items.length>1&&<><button className="clone-lightbox__prev" aria-label="Previous" onClick={()=>move(-1)}>‹</button><button className="clone-lightbox__next" aria-label="Next" onClick={()=>move(1)}>›</button></>}
    {item.caption&&<p className="clone-lightbox__caption font-scrawl">{item.caption}</p>}
  </dialog>;
}

export function Gallery({puppy,onOpen}: {puppy:Puppy;onOpen:(items:Media[],index:number,name:string)=>void}) {
  const [index,setIndex]=useState(0);
  const media=puppy.media;
  const active=media[index];
  const move=(delta:number)=>setIndex(i=>(i+delta+media.length)%media.length);
  if(!active)return null;
  return <div>
    <div className="tp-storypage relative aspect-[4/5] md:aspect-[5/6]">
      <div className="clone-gallery-page" key={active.id}>
        {active.kind==='video'?<video src={active.url} poster={active.poster?.url} controls playsInline preload="metadata" aria-label={active.alt} className="clone-gallery-video"/>:
          <button type="button" className="absolute inset-0 block size-full" aria-label={`Open ${puppy.displayName}, photo ${index+1} of ${media.length} full screen`} onClick={()=>onOpen(media,index,puppy.displayName)}><MediaImage media={active}/></button>}
      </div>
      {active.kind==='video'&&<button className="clone-video-expand" onClick={()=>onOpen(media,index,puppy.displayName)} aria-label="Open video full screen">⛶</button>}
      {media.length>1&&<div className="absolute inset-x-4 bottom-4 flex justify-between clone-gallery-controls">
        <button type="button" className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold" aria-label="Previous photo" onClick={()=>move(-1)}>‹</button>
        <span className="self-center rounded-full bg-cocoa/80 px-3 py-1 text-sm font-semibold text-milk">{index+1} / {media.length}</span>
        <button type="button" className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold" aria-label="Next photo" onClick={()=>move(1)}>›</button>
      </div>}
    </div>
    <ul className="mt-3 flex gap-3 overflow-x-auto px-1 pb-2 pt-2 [scrollbar-width:thin]" aria-label={`All photos of ${puppy.displayName}`}>
      {media.map((m,i)=><li key={m.id} className="shrink-0"><button type="button" aria-label={`${puppy.displayName}, ${m.kind==='video'?'video':'photo'} ${i+1} of ${media.length}`} aria-current={i===index}
        className={`relative block h-24 w-20 overflow-hidden rounded-[0.9rem] border-[3px] transition-transform duration-300 md:h-28 md:w-24 ${i===index?'-rotate-3 -translate-y-1 border-toffee-deep':'border-cocoa/30 hover:-rotate-2 hover:border-cocoa'}`} onClick={()=>setIndex(i)}>
        <MediaImage media={m}/>{m.kind==='video'&&<span className="absolute inset-0 grid place-items-center bg-cocoa/30 text-lg text-milk">▶</span>}
      </button></li>)}
    </ul>
  </div>;
}

export function Catalogue({puppies,cards,query,onQuery}: {puppies:Puppy[];cards:Map<string,ReactNode>;query:string;onQuery:(params:URLSearchParams)=>void}) {
  const params=new URLSearchParams(query);
  const filter=(key:string,value:string)=>{const next=new URLSearchParams(query);if(next.get(key)===value)next.delete(key);else next.set(key,value);onQuery(next);};
  const matches=puppies.filter(p=>(!params.get('origin')||p.origin?.slug===params.get('origin'))&&(!params.get('breed')||p.breeds?.some(b=>b.slug===params.get('breed')))&&(!params.get('gender')||p.gender===params.get('gender')||p.gender==='male-female')&&(!params.get('collection')||p.collections?.some(c=>c.slug===params.get('collection'))));
  const groups=[{label:'where',key:'origin',values:[...(puppies.some(p=>p.origin?.slug==='local')?[['local','In Dubai']]:[]),['imported','Imported']]},{label:'breed',key:'breed',values:[['maltipoo','Maltipoo'],['pomeranian','Pomeranian'],['poodle','Poodle'],['cavapoo','Cavapoo'],['shih-tzu','Shih Tzu']]},{label:'boy or girl',key:'gender',values:[['male','Boys'],['female','Girls']]}];
  return <div>
    <div role="group" aria-label="Filter puppies" className="tp-sketchpad flex flex-col gap-4">
      {groups.map(g=><div key={g.key} className="flex flex-wrap items-center gap-2"><span className="font-scrawl mr-1 w-full shrink-0 text-cocoa-soft sm:w-28">{g.label}</span>
        {g.key==='origin'&&<button className="tp-sticker-chip" aria-pressed={!params.get('origin')&&!params.get('collection')} onClick={()=>onQuery(new URLSearchParams())}>Everywhere</button>}
        {g.values.map(([value,label])=><button key={value} className="tp-sticker-chip" aria-pressed={params.get(g.key)===value} onClick={()=>filter(g.key,value)}>{label}</button>)}
        {g.key==='origin'&&<button className="tp-sticker-chip" aria-pressed={params.get('collection')==='korean-teacup'} onClick={()=>filter('collection','korean-teacup')}>Korean Teacup</button>}
        {g.key==='gender'&&query&&<button className="link-ink ml-auto text-[0.95rem] font-semibold" onClick={()=>onQuery(new URLSearchParams())}>Clear filters</button>}
      </div>)}
    </div>
    <p className="font-scrawl mt-10 text-lg text-[var(--ink-soft)]" aria-live="polite">{matches.length} {matches.length===1?'puppy':'puppies'} {query?'match':'looking for a home'}</p>
    {matches.length?<ul className="tp-sketches mt-8">{matches.map(p=><li key={p.slug} className="clone-filter-card">{cards.get(p.slug)}</li>)}</ul>:
      <div className="tp-sketchpad mt-10"><p className="font-plush text-big">No puppies match just now.</p><p className="mt-3">Tell us what you're hoping for and we'll let you know what's in our showroom or what we can bring in for you.</p><div className="mt-6 flex flex-wrap gap-3"><a href={WHATSAPP} className="btn btn-whatsapp" target="_blank" rel="noreferrer">Ask on WhatsApp</a><button className="btn btn-ghost" onClick={()=>onQuery(new URLSearchParams())}>Show all puppies</button></div></div>}
  </div>;
}

export function FaqNote({children,question,style}: {children:ReactNode;question:ReactNode;style?:CSSProperties}) {
  const [open,setOpen]=useState(false);
  return <li className="tp-note" style={style} data-revealed="true" data-unfolded={open?'true':undefined}><span aria-hidden="true" className="tp-note__pin"/><h2 className="tp-note__q"><button type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{question}<span aria-hidden="true" className="tp-note__chevron"/></button></h2><div className="tp-note__answer" aria-hidden={!open} inert={!open}><div className="tp-note__flap">{children}</div></div></li>;
}

export function EnquiryForm({children,className,puppy}: {children:ReactNode;className?:string;puppy?:Puppy}) {
  const [phase,setPhase]=useState('idle');
  const [error,setError]=useState('');
  const form=useRef<HTMLFormElement>(null);
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  const endpoint=import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined;
  const letter=className?.includes('tp-letterform');
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);},[]);
  useEffect(()=>{const post=form.current?.closest('.tp-post');post?.setAttribute('data-phase',phase);},[phase]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(phase!=='idle')return;
    const data=Object.fromEntries(new FormData(e.currentTarget));
    if(data.website)return;
    const phone=String(data.phone||'').replace(/[\s()-]/g,'');
    if(!/^\+?[0-9]{7,15}$/.test(phone)){setError('Please enter a valid phone number with country code.');return;}
    setError('');setPhase('sealing');
    try{
      if(endpoint){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,puppySlug:puppy?.slug})});if(!response.ok)throw new Error('Unable to send your enquiry. Please try again or contact us on WhatsApp.');}
      timers.current.push(setTimeout(()=>setPhase('posting'),650));
      timers.current.push(setTimeout(()=>setPhase('sent'),1700));
    }catch(err){setError(err instanceof Error?err.message:'Unable to send enquiry.');setPhase('idle');}
  }
  const link=puppy?`https://wa.me/971541676733?text=${encodeURIComponent(`Hi TeddyPups! I'm interested in ${puppy.displayName}, the ${puppy.breed}.`)}`:WHATSAPP;
  return <div className={`clone-enquiry ${letter?'clone-enquiry--letter':''}`} data-phase={phase}>
    {phase!=='sent'&&<form ref={form} className={className} onSubmit={submit}><fieldset disabled={phase!=='idle'}>{children}</fieldset>{error&&<p role="alert" className="clone-error">{error}</p>}</form>}
    {letter&&(phase==='sealing'||phase==='posting')&&<div className="tp-post__scene" aria-hidden="true"><svg viewBox="0 0 160 112" className="tp-post__envelope"><rect x="4" y="18" width="152" height="90" rx="6" fill="#fffdf8" stroke="#2a170e" strokeWidth="4"/><path d="M6 104 64 62M154 104 96 62" fill="none" stroke="#2a170e" strokeWidth="3"/><path className="tp-post__flap" d="M6 22 80 74 154 22" fill="#fbe3b4" stroke="#2a170e" strokeWidth="4"/><circle cx="80" cy="72" r="11" fill="#a24a1a"/></svg><svg viewBox="0 0 200 260" className="tp-post__box"><rect x="86" y="170" width="28" height="86" fill="#5a3a28" stroke="#2a170e" strokeWidth="4"/><path d="M30 70a70 54 0 0 1 140 0v104H30z" fill="#c2622b" stroke="#2a170e" strokeWidth="5"/><rect x="58" y="86" width="84" height="14" rx="7" fill="#2a170e"/><g className="tp-post__flag"><path d="M170 120V64" stroke="#2a170e" strokeWidth="5"/><path d="M170 64h22v16h-22" fill="#f2be6b" stroke="#2a170e" strokeWidth="4"/></g></svg></div>}
    {phase==='sent'&&<div className="tp-post__sent clone-success" role="status"><div className="font-plush text-big">{endpoint?'Message received!':'Demo complete'}</div><p className="mt-3">{endpoint?'Thank you — our team will get back to you promptly.':'Your form passed validation. No enquiry was sent; this project is running in demo mode.'}</p><a href={link} target="_blank" rel="noreferrer" className="btn btn-whatsapp mt-6">WhatsApp us</a><button className="btn btn-ghost mt-6" onClick={()=>setPhase('idle')}>Write another enquiry</button></div>}
    {!endpoint&&phase==='idle'&&<p className="clone-demo-note">Demo form · enquiries are not sent.</p>}
  </div>;
}
