import {View, ProtoView} from './view';
import {DOM, Node, Element} from 'facade/dom';
import {ListWrapper, MapWrapper, List} from 'facade/collection';
import {BaseException} from 'facade/lang';
import {Injector} from 'di/di';
import {ElementInjector} from 'core/compiler/element_injector';
import {isPresent, isBlank} from 'facade/lang';

export class ViewPort {
  parentView: View;
  templateElement: Element;
  defaultProtoView: ProtoView;
  _views: List<View>;
  _viewLastNode: List<Node>;
  elementInjector: ElementInjector;
  appInjector: Injector;
  hostElementInjector: ElementInjector;

  constructor(parentView: View, templateElement: Element, defaultProtoView: ProtoView,
      elementInjector: ElementInjector) {
    this.parentView = parentView;
    this.templateElement = templateElement;
    this.defaultProtoView = defaultProtoView;
    this.elementInjector = elementInjector;

    // The order in this list matches the DOM order.
    this._views = [];
    this.appInjector = null;
    this.hostElementInjector = null;
  }

  hydrate(appInjector: Injector, hostElementInjector: ElementInjector) {
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

  get(index: number): View {
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
  create(atIndex=-1): View {
    if (!this.hydrated()) throw new BaseException(
        'Cannot create views on a dehydrated view port');
    // TODO(rado): replace with viewFactory.
    var newView = this.defaultProtoView.instantiate(this.hostElementInjector);
    newView.hydrate(this.appInjector, this.hostElementInjector, this.parentView.context);
    return this.insert(newView, atIndex);
  }

  insert(view, atIndex=-1): View {
    if (atIndex == -1) atIndex = this._views.length;
    ListWrapper.insert(this._views, atIndex, view);
    ViewPort.moveViewNodesAfterSibling(this._siblingToInsertAfter(atIndex), view);
    this.parentView.recordRange.addRange(view.recordRange);
    this._linkElementInjectors(view);
    return view;
  }

  remove(atIndex=-1): View {
    if (atIndex == -1) atIndex = this._views.length - 1;
    var removedView = this.get(atIndex);
    ListWrapper.removeAt(this._views, atIndex);
    ViewPort.removeViewNodesFromParent(this.templateElement.parentNode, removedView);
    removedView.recordRange.remove();
    this._unlinkElementInjectors(removedView);
    return removedView;
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
