import {Type, FIELD} from 'facade/lang';
import {Directive} from '../annotations/directive'

/**
 * Combination of a type with the Directive annotation
 */
export class AnnotatedType {
  constructor(type:Type, annotation:Directive) {
    this.annotation = annotation;
    this.type = type;
  }
}
