import * as viewModule from './view';
import {DOM, Node, Element} from 'angular2/src/facade/dom';
import {ListWrapper, MapWrapper, List} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/lang';
import {Injector} from 'angular2/di';
import * as eiModule from 'angular2/src/core/compiler/element_injector';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {EventManager} from 'angular2/src/core/events/event_manager';

export class ViewContainer {
  parentView: viewModule.View;
  templateElement: Element;
  defaultProtoView: viewModule.ProtoView;
  _views: List<viewModule.View>;
  _lightDom: any;
  _eventManager: EventManager;
  elementInjector: eiModule.ElementInjector;
  appInjector: Injector;
  hostElementInjector: eiModule.ElementInjector;

  constructor(parentView: viewModule.View, templateElement: Element, defaultProtoView: viewModule.ProtoView,
      elementInjector: eiModule.ElementInjector, eventManager: EventManager, lightDom = null) {
    this.parentView = parentView;
    this.templateElement = templateElement;
    this.defaultProtoView = defaultProtoView;
    this.elementInjector = elementInjector;
    this._lightDom = lightDom;

    // The order in this list matches the DOM order.
    this._views = [];
    this.appInjector = null;
    this.hostElementInjector = null;
    this._eventManager = eventManager;
  }

  hydrate(appInjector: Injector, hostElementInjector: eiModule.ElementInjector) {
    this.appInjector = appInjector;
    this.hostElementInjector = hostElementInjector;
  }

  dehydrate() {
    this.appInjector = null;
    this.hostElementInjector = null;
    this.clear();
  }

  clear() {
    for (var i = this._views.length - 1; i >= 0; i--) {
      this.remove(i);
    }
  }

  get(index: number): viewModule.View {
    return this._views[index];
  }

  get length() {
    return this._views.length;
  }

  _siblingToInsertAfter(index: number) {
    if (index == 0) return this.templateElement;
    return ListWrapper.last(this._views[index - 1].nodes);
  }

  hydrated() {
    return isPresent(this.appInjector);
  }

  // TODO(rado): profile and decide whether bounds checks should be added
  // to the methods below.
  create(atIndex=-1): viewModule.View {
    if (!this.hydrated()) throw new BaseException(
        'Cannot create views on a dehydrated ViewContainer');
    // TODO(rado): replace with viewFactory.
    var newView = this.defaultProtoView.instantiate(this.hostElementInjector, this._eventManager);
    newView.hydrate(this.appInjector, this.hostElementInjector, this.parentView.context);
    return this.insert(newView, atIndex);
  }

  insert(view, atIndex=-1): viewModule.View {
    if (atIndex == -1) atIndex = this._views.length;
    ListWrapper.insert(this._views, atIndex, view);
    if (isBlank(this._lightDom)) {
      ViewContainer.moveViewNodesAfterSibling(this._siblingToInsertAfter(atIndex), view);
    } else {
      this._lightDom.redistribute();
    }
    this.parentView.changeDetector.addChild(view.changeDetector);
    this._linkElementInjectors(view);
    return view;
  }

  remove(atIndex=-1) {
    if (atIndex == -1) atIndex = this._views.length - 1;
    var view = this.detach(atIndex);
    view.dehydrate();
    // TODO(rado): this needs to be delayed until after any pending animations.
    this.defaultProtoView.returnToPool(view);
    // view is intentionally not returned to the client.
  }

  /**
   * The method can be used together with insert to implement a view move, i.e.
   * moving the dom nodes while the directives in the view stay intact.
   */
  detach(atIndex=-1): viewModule.View {
    if (atIndex == -1) atIndex = this._views.length - 1;
    var detachedView = this.get(atIndex);
    ListWrapper.removeAt(this._views, atIndex);
    if (isBlank(this._lightDom)) {
      ViewContainer.removeViewNodesFromParent(this.templateElement.parentNode, detachedView);
    } else {
      this._lightDom.redistribute();
    }
    detachedView.changeDetector.remove();
    this._unlinkElementInjectors(detachedView);
    return detachedView;
  }

  contentTagContainers() {
    return this._views;
  }

  nodes():List<Node> {
    var r = [];
    for (var i = 0; i < this._views.length; ++i) {
      r = ListWrapper.concat(r, this._views[i].nodes);
    }
    return r;
  }

  _linkElementInjectors(view) {
    for (var i = 0; i < view.rootElementInjectors.length; ++i) {
      view.rootElementInjectors[i].parent = this.elementInjector;
    }
  }

  _unlinkElementInjectors(view) {
    for (var i = 0; i < view.rootElementInjectors.length; ++i) {
      view.rootElementInjectors[i].parent = null;
    }
  }

  static moveViewNodesAfterSibling(sibling, view) {
    for (var i = view.nodes.length - 1; i >= 0; --i) {
      DOM.insertAfter(sibling, view.nodes[i]);
    }
  }

  static removeViewNodesFromParent(parent, view) {
    for (var i = view.nodes.length - 1; i >= 0; --i) {
      DOM.removeChild(parent, view.nodes[i]);
    }
  }
}
