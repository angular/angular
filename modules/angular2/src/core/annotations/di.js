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

/**
 * The directive can inject a property setter that would allow setting this property on the
 * host element
 */
export class PropertySetter extends DependencyAnnotation {
  propName: string;
  @CONST()
  constructor(propName) {
    super();
    this.propName = propName;
  }
}

/**
 * The directive can inject the value of an attribute of the host element
 */
export class Attribute extends DependencyAnnotation {
  attributeName: string;
  @CONST()
  constructor(attributeName) {
    super();
    this.attributeName = attributeName;
  }
}
