import {CONST} from 'angular2/src/facade/lang';
import {DependencyAnnotation} from 'angular2/di';

/**
 * The directive can inject an emitter function that would emit events onto the
 * directive host element.
 */
export class EventEmitter extends DependencyAnnotation {
  eventName: string;
  @CONST()
  constructor(eventName) {
    super();
    this.eventName = eventName;
  }
}
