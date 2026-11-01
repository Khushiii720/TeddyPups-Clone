import {ReferencePuppyJourney} from './motion/reference-motion';

/** The reference's original gait, spring physics and scroll choreography.
 * Mount only on Home; cleanup restores static puppy artwork on other routes.
 */
export function ScrollPuppy({path}:{path:string}){
  return path==='/'?<ReferencePuppyJourney/>:null;
}
