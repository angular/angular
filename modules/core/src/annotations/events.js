import {CONST} from 'facade/src/lang';
import {DependencyAnnotation} from 'di/di';

/**
 * The directive can inject an emitter function that would emit events onto the
 * directive host element.
 */
export class EventEmitter extends DependencyAnnotation {
  eventName: string;
  @CONST()
  constructor(eventName) {
    this.eventName = eventName;
  }
}
