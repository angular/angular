import {AST} from 'angular2/change_detection';
import {isBlank, isPresent, BaseException} from 'angular2/src/facade/lang';
import * as eiModule from './element_injector';
import {DirectiveBinding} from './element_injector';
import {List, StringMap} from 'angular2/src/facade/collection';
import * as viewModule from './view';

export class ElementBinder {
  nestedProtoView: viewModule.AppProtoView;
  hostListeners: StringMap<string, Map<number, AST>>;
  constructor(public index: int, public parent: ElementBinder, public distanceToParent: int,
              public protoElementInjector: eiModule.ProtoElementInjector,
              public componentDirective: DirectiveBinding) {
    if (isBlank(index)) {
      throw new BaseException('null index not allowed.');
    }
    // updated later when events are bound
    this.hostListeners = null;
    // updated later, so we are able to resolve cycles
    this.nestedProtoView = null;
  }

  hasStaticComponent() {
    return isPresent(this.componentDirective) && isPresent(this.nestedProtoView);
  }

  hasDynamicComponent() {
    return isPresent(this.componentDirective) && isBlank(this.nestedProtoView);
  }

  hasEmbeddedProtoView() {
    return !isPresent(this.componentDirective) && isPresent(this.nestedProtoView);
  }
}
