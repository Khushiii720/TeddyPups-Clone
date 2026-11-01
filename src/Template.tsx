import {createElement} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import parse, {attributesToProps, domToReact, Element} from 'html-react-parser';
import type {DOMNode, HTMLReactParserOptions} from 'html-react-parser';
import {Catalogue, EnquiryForm, FaqNote, Gallery, WHATSAPP} from './components';
import type {Media,Puppy} from './types';
import puppyData from './data/puppies.json';
import families from './data/families.json';
import homeFamilies from './data/home-families.json';
import faqNotes from './data/faq.json';

const puppies=puppyData as unknown as Puppy[];
const has=(el:Element,cls:string)=>el.attribs.class?.split(' ').includes(cls);
function text(node:DOMNode):string {if('data' in node)return node.data;if('children' in node)return node.children.map(n=>text(n as DOMNode)).join('');return '';}
function find(el:Element,fn:(n:Element)=>boolean):Element|undefined {for(const child of el.children){if(child instanceof Element){if(fn(child))return child;const match=find(child,fn);if(match)return match;}}}

export interface TemplateProps {
  html:string; path:string; query:string; curtain?:string; search:string;
  onSearch:(value:string)=>void; onQuery:(p:URLSearchParams)=>void;
  onOpen:(items:Media[],index:number,name:string)=>void;
}

/** Original public markup and SVG artwork, rendered as React elements.
 * Stateful sections are replaced by typed React components below.
 * No scripts from the reference website are loaded or executed.
 */
export function Template({html,path,query,curtain,search,onSearch,onQuery,onOpen}:TemplateProps) {
  const puppy=puppies.find(p=>path===`/puppies/${p.slug}`);
  const options:HTMLReactParserOptions={replace(node){
    if(!(node instanceof Element))return;
    const el=node;
    const props=attributesToProps(el.attribs);
    const children=()=>domToReact(el.children as DOMNode[],options);
    const render=(extra:Record<string,unknown>={})=>createElement(el.name,{...props,...extra},...(['img','input','br','hr','source','area','wbr'].includes(el.name)?[]:[children()]));
    if(el.name==='script'||el.name==='template')return <></>;
    // The live React journey supplies these; omit inert server-rendered copies.
    if(has(el,'pup-layer')||has(el,'pup-probe')||has(el,'pup-prints'))return <></>;
    if(has(el,'tp-curtain'))return render({'data-state':curtain||'idle'});
    if(el.name==='header'&&el.attribs.id==='site-header')return render({'data-home':path==='/'?'true':'false'});
    if(el.name==='a'&&(has(el,'tp-nav-link')||has(el,'tp-menu-link'))){const active=path===el.attribs.href||(el.attribs.href==='/puppies'&&!!puppy);return render({'data-active':String(active),'aria-current':active?'page':undefined});}
    if(el.name==='button'&&el.attribs['aria-haspopup']==='dialog')return render({'aria-label':'Open menu',onClick:()=>{const d=document.querySelector<HTMLDialogElement>('dialog[aria-label="Site menu"]');d?.showModal();}});
    if(el.name==='button'&&text(el)==='Close')return render({onClick:()=>{const d=document.querySelector<HTMLDialogElement>('dialog[aria-label="Site menu"]');if(!d)return;d.dataset.closing='true';setTimeout(()=>{d.close();delete d.dataset.closing;},420);}});
    if(el.attribs['data-component']==='gallery'&&puppy)return <Gallery puppy={puppy} onOpen={onOpen}/>;
    if(el.attribs['data-component']==='catalogue'){
      const cards=new Map<string,ReactNode>();
      for(const li of el.children){if(li instanceof Element){const link=find(li,n=>n.name==='a');const slug=link?.attribs.href?.split('/').pop();if(slug&&link)cards.set(slug,domToReact([link],options));}}
      return <Catalogue puppies={puppies.filter(p=>p.status==='available')} cards={cards} query={query} onQuery={onQuery}/>;
    }
    if(el.name==='form')return <EnquiryForm className={el.attribs.class} puppy={puppy}>{children()}</EnquiryForm>;
    if(el.name==='input'&&el.attribs.type==='search'&&path==='/faq')return createElement('input',{...props,value:search,onChange:(e:React.ChangeEvent<HTMLInputElement>)=>onSearch(e.target.value)});
    if(has(el,'tp-note')){
      if(search&&!text(el).toLowerCase().includes(search.toLowerCase()))return <></>;
      const q=find(el,n=>has(n,'font-plush-text'));
      const answer=find(el,n=>has(n,'tp-note__flap'));
      return <FaqNote question={q?domToReact([q],options):''} style={props.style as CSSProperties}>{answer?domToReact(answer.children as DOMNode[],options):''}</FaqNote>;
    }
    if(el.name==='p'&&path==='/faq'&&text(el).includes('notes on the board')){const count=faqNotes.filter(n=>n.text.toLowerCase().includes(search.toLowerCase())).length;return <p {...props}>{search?`${count} ${count===1?'note':'notes'} found`:'9 notes on the board'}</p>;}
    if(el.name==='ul'&&path==='/faq'&&el.children.some(n=>n instanceof Element&&has(n,'tp-note'))){
      const matches=el.children.filter(n=>n instanceof Element&&has(n,'tp-note')&&text(n).toLowerCase().includes(search.toLowerCase()));
      return <>{render()}{!matches.length&&<div className="tp-note tp-note--empty"><p>No note about “{search}” yet.</p><p className="mt-3"><a className="link-ink" href={WHATSAPP}>Ask us on WhatsApp</a> and we'll answer.</p></div>}</>;
    }
    if(el.name==='button'&&el.attribs['aria-label']?.startsWith('Open photo ')){
      const match=el.attribs['aria-label'].match(/Open photo (\d+)/);
      const items=(path==='/'?homeFamilies:families) as Media[];
      return render({onClick:()=>onOpen(items,Number(match?.[1]||1)-1,'Happy families')});
    }
    if(el.attribs.role==='tab'){
      const imported=new URLSearchParams(query).get('journey')==='imported';
      const active=el.attribs.id===`tab-${imported?'imported':'local'}`;
      return render({'aria-selected':active,tabIndex:active?0:-1,onClick:()=>{const p=new URLSearchParams(query);if(el.attribs.id==='tab-imported')p.set('journey','imported');else p.delete('journey');onQuery(p);},onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const p=new URLSearchParams(query);if(imported)p.delete('journey');else p.set('journey','imported');onQuery(p);document.getElementById(imported?'tab-local':'tab-imported')?.focus();}}});
    }
    if(el.attribs.role==='tabpanel'){
      const imported=new URLSearchParams(query).get('journey')==='imported';
      return render({hidden:el.attribs.id!==`panel-${imported?'imported':'local'}`});
    }
    if(has(el,'tp-switch'))return render({style:{...(props.style as CSSProperties),'--at':new URLSearchParams(query).get('journey')==='imported'?1:0}});
  }};
  return <>{parse(html,options)}</>;
}
