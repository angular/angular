import {Type} from 'facade/src/lang';
import {Directive} from '../annotations/annotations';
import {List} from 'facade/src/collection';

/**
 * Combination of a type with the Directive annotation
 */
export class DirectiveMetadata {
  type:Type;
  annotation:Directive;
  componentDirectives:List<Type>;

  constructor(type:Type,
              annotation:Directive,
              componentDirectives:List<Type>) {
    this.annotation = annotation;
    this.type = type;
    this.componentDirectives = componentDirectives;
  }
}
