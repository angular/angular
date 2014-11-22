import {ProtoElementInjector} from './element_injector';
import {FIELD} from 'facade/lang';
import {MapWrapper} from 'facade/collection';
import {AnnotatedType} from './annotated_type';
import {List, Map} from 'facade/collection';
import {ProtoView} from './view';

export class ElementBinder {
  protoElementInjector:ProtoElementInjector;
  componentDirective:AnnotatedType;
  templateDirective:AnnotatedType;
  textNodeIndices:List<int>;
  hasElementPropertyBindings:boolean;
  nestedProtoView: ProtoView;
  events:Map;
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
