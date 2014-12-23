import {Type, FIELD} from 'facade/lang';
import {Directive} from '../annotations/annotations'
import {ShadowDomStrategy} from './shadow_dom';

/**
 * Combination of a type with the Directive annotation
 */
export class DirectiveMetadata {
  type:Type;
  annotation:Directive;
  shadowDomStrategy:ShadowDomStrategy;

  constructor(type:Type, annotation:Directive, shadowDomStrategy:ShadowDomStrategy) {
    this.annotation = annotation;
    this.type = type;
    this.shadowDomStrategy = shadowDomStrategy;
  }
}
