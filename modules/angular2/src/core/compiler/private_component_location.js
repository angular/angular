import {Directive} from 'angular2/src/core/annotations/annotations'
import {NgElement} from 'angular2/src/core/dom/element';
import {ElementInjector} from './element_injector';
import {ProtoView, View} from './view';
import {ShadowDomStrategy} from './shadow_dom_strategy';
import {EventManager} from 'angular2/src/core/events/event_manager';
import {ListWrapper} from 'angular2/src/facade/collection';
import {Type} from 'angular2/src/facade/lang';


export class PrivateComponentLocation {
  _elementInjector:ElementInjector;
  _elt:NgElement;
  _view:View;

  constructor(elementInjector:ElementInjector, elt:NgElement, view:View){
    this._elementInjector = elementInjector;
    this._elt = elt;
    this._view = view;
  }

  createComponent(type:Type, annotation:Directive, componentProtoView:ProtoView,
                  eventManager:EventManager, shadowDomStrategy:ShadowDomStrategy) {
    var context = this._elementInjector.createPrivateComponent(type, annotation);

    var view = componentProtoView.instantiate(this._elementInjector, eventManager);
    view.hydrate(this._elementInjector.getShadowDomAppInjector(), this._elementInjector, null, context, null);

    shadowDomStrategy.attachTemplate(this._elt.domElement, view);

    ListWrapper.push(this._view.componentChildViews, view);
    this._view.changeDetector.addChild(view.changeDetector);
  }
}
