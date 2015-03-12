import {ProtoElementInjector} from './element_injector';
import {DirectiveMetadata} from './directive_metadata';
import {List, StringMap} from 'angular2/src/facade/collection';
import {ProtoView} from './view';

export class ElementBinder {
  protoElementInjector:ProtoElementInjector;
  componentDirective:DirectiveMetadata;
  viewportDirective:DirectiveMetadata;
  textNodeIndices:List<int>;
  hasElementPropertyBindings:boolean;
  nestedProtoView: ProtoView;
  events:StringMap;
  constructor(
    protoElementInjector: ProtoElementInjector, componentDirective:DirectiveMetadata,
    viewportDirective:DirectiveMetadata) {
    this.protoElementInjector = protoElementInjector;
    this.componentDirective = componentDirective;
    this.viewportDirective = viewportDirective;
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
