import {Type} from 'angular2/src/facade/lang';
import {Directive} from 'angular2/src/core/annotations/annotations'

/**
 * Combination of a type with the Directive annotation
 */
export class DirectiveMetadata {
  type:Type;
  annotation:Directive;

  constructor(type:Type, annotation:Directive) {
    this.annotation = annotation;
    this.type = type;
  }
}
