import {Type} from 'angular2/src/facade/lang';
import {Directive} from 'angular2/src/core/annotations/annotations'
import {List} from 'angular2/src/facade/collection'
import {ShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';

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
