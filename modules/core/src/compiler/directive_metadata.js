import {Type} from 'facade/src/lang';
import {Directive} from '../annotations/annotations'
import {List} from 'facade/src/collection'
import {ShadowDomStrategy} from './shadow_dom';

/**
 * Combination of a type with the Directive annotation
 */
export class DirectiveMetadata {
  type:Type;
  annotation:Directive;
  shadowDomStrategy:ShadowDomStrategy;
  componentDirectives:List<Type>;

  constructor(type:Type, annotation:Directive, shadowDomStrategy:ShadowDomStrategy,
              componentDirectives:List<Type>) {
    this.annotation = annotation;
    this.type = type;
    this.shadowDomStrategy = shadowDomStrategy;
    this.componentDirectives = componentDirectives;
  }
}
