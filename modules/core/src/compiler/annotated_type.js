import {Type, FIELD} from 'facade/lang';
import {Directive} from '../annotations/annotations'

/**
 * Combination of a type with the Directive annotation
 */
export class AnnotatedType {
  type:Type;
  annotation:Directive;
  constructor(type:Type, annotation:Directive) {
    this.annotation = annotation;
    this.type = type;
  }
}
