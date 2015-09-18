import {isBlank} from 'angular2/src/core/facade/lang';
import {BaseException} from 'angular2/src/core/facade/exceptions';
import * as eiModule from './element_injector';
import {DirectiveProvider} from './element_injector';
import * as viewModule from './view';

export class ElementBinder {
  constructor(public index: number, public parent: ElementBinder, public distanceToParent: number,
              public protoElementInjector: eiModule.ProtoElementInjector,
              public componentDirective: DirectiveProvider,
              public nestedProtoView: viewModule.AppProtoView) {
    if (isBlank(index)) {
      throw new BaseException('null index not allowed.');
    }
  }
}
