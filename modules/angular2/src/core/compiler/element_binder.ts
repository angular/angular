import {int, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as eiModule from './element_injector';
import {DirectiveBinding} from './element_injector';
import {List, StringMap} from 'angular2/src/facade/collection';
import * as viewModule from './view';

export class ElementBinder {
  protoElementInjector:eiModule.ProtoElementInjector;
  componentDirective:DirectiveBinding;
  viewportDirective:DirectiveBinding;
  textNodeIndices:List<int>;
  hasElementPropertyBindings:boolean;
  nestedProtoView: viewModule.ProtoView;
  events:StringMap;
  contentTagSelector:string;
  parent:ElementBinder;
  index:int;
  distanceToParent:int;
  constructor(
    index:int, parent:ElementBinder, distanceToParent: int,
    protoElementInjector: eiModule.ProtoElementInjector, componentDirective:DirectiveBinding,
    viewportDirective:DirectiveBinding) {
    if (isBlank(index)) {
      throw new BaseException('null index not allowed.');
    }

    this.protoElementInjector = protoElementInjector;
    this.componentDirective = componentDirective;
    this.viewportDirective = viewportDirective;
    this.parent = parent;
    this.index = index;
    this.distanceToParent = distanceToParent;
    // updated later when events are bound
    this.events = null;
    // updated later when text nodes are bound
    this.textNodeIndices = null;
    // updated later when element properties are bound
    this.hasElementPropertyBindings = false;
    // updated later, so we are able to resolve cycles
    this.nestedProtoView = null;
    // updated later in the compilation pipeline
    this.contentTagSelector = null;
  }
}
