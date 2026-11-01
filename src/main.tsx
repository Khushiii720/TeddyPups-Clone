import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Template} from './Template';
import {Lightbox} from './components';
import {PawTrail} from './PawTrail';
import {ScrollPuppy} from './ScrollPuppy';
import {usePageAnimations} from './animations';
import {useFlightMotion} from './FlightMotion';
import {useLivePagePuppies} from './LivePagePuppies';
import type {Media} from './types';
import pagesJson from './data/pages.json';
import shellHead from './templates/shell-head.html?raw';
import shellFoot from './templates/shell-foot.html?raw';
import './reference.css';
import './app.css';

const templates=import.meta.glob('./templates/*.html',{query:'?raw',import:'default',eager:true}) as Record<string,string>;
const pages=pagesJson as Record<string,{template:string;title:string;htmlClass:string}>;

function App(){
  const [location,setLocation]=useState({path:window.location.pathname.replace(/\/$/,'')||'/',query:window.location.search});
  const [curtain,setCurtain]=useState('intro');
  const [search,setSearch]=useState('');
  const [lightbox,setLightbox]=useState<{items:Media[];index:number;name:string}|null>(null);
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  const navigating=useRef(false);
  const {path,query}=location;
  const page=pages[path];
  usePageAnimations(path);
  useFlightMotion(path);
  useLivePagePuppies(path);
  useEffect(()=>{timers.current.push(setTimeout(()=>setCurtain('idle'),1100));return()=>timers.current.forEach(clearTimeout);},[]);
  useEffect(()=>{
    document.title=page?.title||'Page not found | TeddyPups';
    document.documentElement.className=page?.htmlClass||'';
    setSearch('');setLightbox(null);
    document.querySelector<HTMLDialogElement>('dialog[aria-label="Site menu"]')?.close();
  },[path,page]);
  useEffect(()=>{const pop=()=>{setLocation({path:window.location.pathname.replace(/\/$/,'')||'/',query:window.location.search});};addEventListener('popstate',pop);return()=>removeEventListener('popstate',pop);},[]);
  function navigate(href:string){
    const url=new URL(href,window.location.href);
    if(url.pathname===path){history.pushState(null,'',url.pathname+url.search+url.hash);setLocation({path,query:url.search});if(url.hash)document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView({behavior:'smooth'});return;}
    if(navigating.current)return;navigating.current=true;
    setCurtain('covering');document.querySelector<HTMLDialogElement>('dialog[aria-label="Site menu"]')?.close();
    timers.current.push(setTimeout(()=>{
      setCurtain('covered');history.pushState(null,'',url.pathname+url.search+url.hash);setLocation({path:url.pathname,query:url.search});window.scrollTo({top:0,behavior:'instant'});
      timers.current.push(setTimeout(()=>{setCurtain('lifting');if(url.hash)document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();timers.current.push(setTimeout(()=>{setCurtain('idle');navigating.current=false;},470));},140));
    },310));
  }
  const props={path,query,curtain,search,onSearch:setSearch,onQuery:(params:URLSearchParams)=>{const q=params.toString();history.replaceState(null,'',path+(q?'?'+q:''));setLocation({path,query:q?'?'+q:''});},onOpen:(items:Media[],index:number,name:string)=>setLightbox({items,index,name})};
  return <div onClick={e=>{const target=(e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');if(!target||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||target.target==='_blank'||target.hasAttribute('download'))return;const url=new URL(target.href,window.location.href);if(url.origin!==window.location.origin)return;e.preventDefault();navigate(url.pathname+url.search+url.hash);}}>
    <Template html={shellHead} {...props}/>
    <div className="clone-page-slot" key={path}>{page?<Template html={templates[`./templates/${page.template}.html`]} {...props}/>:<main className="gutter clone-not-found"><h1 className="font-plush text-huge">Page not found</h1><a href="/" className="btn btn-primary mt-6">Back home</a></main>}</div>
    <Template html={shellFoot} {...props}/>
    <PawTrail/>
    <ScrollPuppy path={path}/>
    {lightbox&&<Lightbox key={lightbox.name+lightbox.index} items={lightbox.items} initialIndex={lightbox.index} name={lightbox.name} onClose={()=>setLightbox(null)}/>}
  </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
