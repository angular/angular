import {Type, isPresent, BaseException, isBlank} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {ElementInjector} from 'angular2/src/core/compiler/element_injector';
import {AppView} from 'angular2/src/core/compiler/view';
import {internalView} from 'angular2/src/core/compiler/view_ref';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';

import {resolveInternalDomView} from 'angular2/src/render/dom/view/view';

/**
 * @exportedAs angular2/test
 *
 * An DebugElement contains information from the Angular compiler about an
 * element and provides access to the corresponding ElementInjector and
 * underlying dom Element, as well as a way to query for children.
 */
export class DebugElement {
  _elementInjector: ElementInjector;

  constructor(private _parentView: AppView, private _boundElementIndex: number) {
    this._elementInjector = this._parentView.elementInjectors[this._boundElementIndex];
  }

  static create(elementRef: ElementRef): DebugElement {
    return new DebugElement(internalView(elementRef.parentView), elementRef.boundElementIndex);
  }

  get componentInstance(): any {
    if (!isPresent(this._elementInjector)) {
      return null;
    }
    return this._elementInjector.getComponent();
  }

  get dynamicallyCreatedComponentInstance(): any {
    if (!isPresent(this._elementInjector)) {
      return null;
    }
    return this._elementInjector.getDynamicallyLoadedComponent();
  }

  get domElement(): any {
    return resolveInternalDomView(this._parentView.render)
        .boundElements[this._boundElementIndex]
        .element;
  }

  getDirectiveInstance(directiveIndex: number): any {
    return this._elementInjector.getDirectiveAtIndex(directiveIndex);
  }

  /**
   * Get child DebugElements from within the Light DOM.
   *
   * @return {List<DebugElement>}
   */
  get children(): List<DebugElement> {
    var thisElementBinder = this._parentView.proto.elementBinders[this._boundElementIndex];

    return this._getChildElements(this._parentView, thisElementBinder.index);
  }

  /**
   * Get the root DebugElement children of a component. Returns an empty
   * list if the current DebugElement is not a component root.
   *
   * @return {List<DebugElement>}
   */
  get componentViewChildren(): List<DebugElement> {
    var shadowView = this._parentView.componentChildViews[this._boundElementIndex];

    if (!isPresent(shadowView)) {
      // The current element is not a component.
      return ListWrapper.create();
    }

    return this._getChildElements(shadowView, null);
  }

  triggerEventHandler(eventName, eventObj): void {
    this._parentView.triggerEventHandlers(eventName, eventObj, this._boundElementIndex);
  }

  hasDirective(type: Type): boolean {
    if (!isPresent(this._elementInjector)) {
      return false;
    }
    return this._elementInjector.hasDirective(type);
  }

  inject(type: Type): any {
    if (!isPresent(this._elementInjector)) {
      return null;
    }
    return this._elementInjector.get(type);
  }

  /**
   * Return the first descendant TestElememt matching the given predicate
   * and scope.
   *
   * @param {Function: boolean} predicate
   * @param {Scope} scope
   *
   * @return {DebugElement}
   */
  query(predicate: Function, scope = Scope.all): DebugElement {
    var results = this.queryAll(predicate, scope);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Return descendant TestElememts matching the given predicate
   * and scope.
   *
   * @param {Function: boolean} predicate
   * @param {Scope} scope
   *
   * @return {List<DebugElement>}
   */
  queryAll(predicate: Function, scope = Scope.all): List<DebugElement> {
    var elementsInScope = scope(this);

    return ListWrapper.filter(elementsInScope, predicate);
  }

  _getChildElements(view: AppView, parentBoundElementIndex: number): List<DebugElement> {
    var els = ListWrapper.create();
    var parentElementBinder = null;
    if (isPresent(parentBoundElementIndex)) {
      parentElementBinder = view.proto.elementBinders[parentBoundElementIndex];
    }
    for (var i = 0; i < view.proto.elementBinders.length; ++i) {
      var binder = view.proto.elementBinders[i];
      if (binder.parent == parentElementBinder) {
        ListWrapper.push(els, new DebugElement(view, i));

        var views = view.viewContainers[i];
        if (isPresent(views)) {
          ListWrapper.forEach(views.views, (nextView) => {
            els = ListWrapper.concat(els, this._getChildElements(nextView, null));
          });
        }
      }
    }
    return els;
  }
}

export function inspectElement(elementRef: ElementRef): DebugElement {
  return DebugElement.create(elementRef);
}

/**
 * @exportedAs angular2/test
 */
export class Scope {
  static all(debugElement): List<DebugElement> {
    var scope = ListWrapper.create();
    ListWrapper.push(scope, debugElement);

    ListWrapper.forEach(debugElement.children,
                        (child) => { scope = ListWrapper.concat(scope, Scope.all(child)); });

    ListWrapper.forEach(debugElement.componentViewChildren,
                        (child) => { scope = ListWrapper.concat(scope, Scope.all(child)); });

    return scope;
  }
  static light(debugElement): List<DebugElement> {
    var scope = ListWrapper.create();
    ListWrapper.forEach(debugElement.children, (child) => {
      ListWrapper.push(scope, child);
      scope = ListWrapper.concat(scope, Scope.light(child));
    });
    return scope;
  }

  static view(debugElement): List<DebugElement> {
    var scope = ListWrapper.create();

    ListWrapper.forEach(debugElement.componentViewChildren, (child) => {
      ListWrapper.push(scope, child);
      scope = ListWrapper.concat(scope, Scope.light(child));
    });
    return scope;
  }
}

/**
 * @exportedAs angular2/test
 */
export class By {
  static all(): Function { return (debugElement) => true; }

  static css(selector: string): Function {
    return (debugElement) => { return DOM.elementMatches(debugElement.domElement, selector); };
  }
  static directive(type: Type): Function {
    return (debugElement) => { return debugElement.hasDirective(type); };
  }
}
