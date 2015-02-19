import {Type} from 'angular2/src/facade/lang';
import {DirectiveAnnotation} from 'angular2/src/core/annotations/annotations'

/**
 * Combination of a type with the Directive annotation
 */
export class DirectiveMetadata {
  type:Type;
  annotation: DirectiveAnnotation;

  constructor(type: Type, annotation: DirectiveAnnotation) {
    this.annotation = annotation;
    this.type = type;
  }
}
