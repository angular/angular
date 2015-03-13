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

  get token() {
    return Function;
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

  get token() {
    return Function;
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

  get token() {
    //Normally one would default a token to a type of an injected value but here
    //the type of a variable is "string" and we can't use primitive type as a return value
    //so we use instance of Attribute instead. This doesn't matter much in practice as arguments
    //with @Attribute annotation are injected by ElementInjector that doesn't take tokens into account.
    return this;
  }
}

/**
 * The directive can inject an query that would reflect a list of ancestor directives
 */
export class Query extends DependencyAnnotation {
  directive;
  @CONST()
  constructor(directive) {
    super();
    this.directive = directive;
  }
}
