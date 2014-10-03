import {Type, FIELD} from 'facade/lang';
import {Directive} from '../annotations/directive'

export class AnnotatedType {
  constructor(annotation:Directive, type:Type) {
    this.annotation = annotation;
    this.type = type;
  }
}
