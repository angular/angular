import {Directive} from 'angular2/src/core/annotations/annotations'
import * as viewModule from './view';
import * as eiModule from './element_injector';
import {ListWrapper} from 'angular2/src/facade/collection';
import {Type} from 'angular2/src/facade/lang';
import * as vfModule from './view_factory';

export class PrivateComponentLocation {
  _elementInjector:eiModule.ElementInjector;
  _view:viewModule.View;

  constructor(elementInjector:eiModule.ElementInjector, view:viewModule.View){
    this._elementInjector = elementInjector;
    this._view = view;
  }

  createComponent(viewFactory: vfModule.ViewFactory, type:Type, annotation:Directive, componentProtoView:viewModule.ProtoView) {
    var context = this._elementInjector.createPrivateComponent(type, annotation);

    var view = viewFactory.getView(componentProtoView);
    view.hydrate(this._elementInjector.getShadowDomAppInjector(), this._elementInjector, context, null);

    this._view.proto.renderer.setDynamicComponentView(
      this._view.render, this._elementInjector.getBoundElementIndex(), view.render
    );
    ListWrapper.push(this._view.componentChildViews, view);
    this._view.changeDetector.addChild(view.changeDetector);
  }
}
