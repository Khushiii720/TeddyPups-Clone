import type {ComponentType} from 'react';
export const ReferencePuppyJourney: ComponentType;
export function cuePup(detail:{look?:Element;secs?:number;say?:string}):void;
export class PuppyDriver {
  constructor(svg:SVGSVGElement,pose?:string,facing?:number);
  wag(amount:number):void;
  lookAt(point:{x:number;y:number}|null):void;
  petting(active:boolean):void;
  tick(deltaSeconds:number,timeSeconds:number):void;
}
