import {ProtoElementInjector} from './element_injector';
import {FIELD} from 'facade/lang';
import {MapWrapper} from 'facade/collection';
import {AnnotatedType} from './annotated_type';
// Comment out as dartanalyzer does not look into @FIELD
// import {List} from 'facade/collection';
// import {ProtoView} from './view';

export class ElementBinder {
  @FIELD('final protoElementInjector:ProtoElementInjector')
  @FIELD('final componentDirective:AnnotatedType')
  @FIELD('final templateDirective:AnnotatedType')
  @FIELD('final textNodeIndices:List<int>')
  @FIELD('hasElementPropertyBindings:bool')
  constructor(
    protoElementInjector: ProtoElementInjector, componentDirective:AnnotatedType, templateDirective:AnnotatedType) {
    this.protoElementInjector = protoElementInjector;
    this.componentDirective = componentDirective;
    this.templateDirective = templateDirective;
    // updated later when events are bound
    this.events = null;
    // updated later when text nodes are bound
    this.textNodeIndices = null;
    // updated later when element properties are bound
    this.hasElementPropertyBindings = false;
    // updated later, so we are able to resolve cycles
    this.nestedProtoView = null;
  }
}
