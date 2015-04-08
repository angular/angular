import {int, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as eiModule from './element_injector';
import {DirectiveBinding} from './element_injector';
import {List, StringMap} from 'angular2/src/facade/collection';
import * as viewModule from './view';

export class ElementBinder {
  protoElementInjector:eiModule.ProtoElementInjector;
  componentDirective:DirectiveBinding;
  viewportDirective:DirectiveBinding;
  nestedProtoView: viewModule.ProtoView;
  events:StringMap;
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
    // updated later, so we are able to resolve cycles
    this.nestedProtoView = null;
  }
}
