import {CONST, addAnnotation} from 'angular2/src/facade/lang';
import {DependencyAnnotationClass} from 'angular2/di';

/**
 * The directive can inject an emitter function that would emit events onto the
 * directive host element.
 */
export class EventEmitterAnnotation extends DependencyAnnotationClass {
  eventName: string;
  //@CONST()
  constructor(eventName) {
    super();
    this.eventName = eventName;
  }

  get token() {
    return Function;
  }
}

export function EventEmitter(eventName:string) {
  return (c) => { addAnnotation(c, new EventEmitterAnnotation(eventName)); }
}

/**
 * The directive can inject a property setter that would allow setting this property on the
 * host element
 */
export class PropertySetterAnnotation extends DependencyAnnotationClass {
  propName: string;
  //@CONST()
  constructor(propName) {
    super();
    this.propName = propName;
  }

  get token() {
    return Function;
  }
}

export function PropertySetter(propName:string) {
  return (c) => { addAnnotation(c, new PropertySetterAnnotation(propName)); }
}

/**
 * The directive can inject the value of an attribute of the host element
 */
export class AttributeAnnotation extends DependencyAnnotationClass {
  attributeName: string;
  //@CONST()
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

export function Attribute(attributeName:string) {
  return (c) => { addAnnotation(c, new AttributeAnnotation(attributeName)); }
}
