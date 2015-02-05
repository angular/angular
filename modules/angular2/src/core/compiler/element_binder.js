import {ProtoElementInjector} from './element_injector';
import {FIELD} from 'facade/src/lang';
import {MapWrapper} from 'facade/src/collection';
import {DirectiveMetadata} from './directive_metadata';
import {List, Map} from 'facade/src/collection';
import {ProtoView} from './view';

export class ElementBinder {
  protoElementInjector:ProtoElementInjector;
  componentDirective:DirectiveMetadata;
  templateDirective:DirectiveMetadata;
  textNodeIndices:List<int>;
  hasElementPropertyBindings:boolean;
  nestedProtoView: ProtoView;
  events:Map;
  constructor(
    protoElementInjector: ProtoElementInjector, componentDirective:DirectiveMetadata, templateDirective:DirectiveMetadata) {
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
