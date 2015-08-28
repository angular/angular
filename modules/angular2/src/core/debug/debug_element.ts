import {Type, isPresent, BaseException, isBlank} from 'angular2/src/core/facade/lang';
import {ListWrapper, MapWrapper, Predicate} from 'angular2/src/core/facade/collection';

import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {ElementInjector} from 'angular2/src/core/compiler/element_injector';
import {AppView} from 'angular2/src/core/compiler/view';
import {internalView} from 'angular2/src/core/compiler/view_ref';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';

/**
 * A DebugElement contains information from the Angular compiler about an
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

  get nativeElement(): any { return this.elementRef.nativeElement; }

  get elementRef(): ElementRef { return this._parentView.elementRefs[this._boundElementIndex]; }

  getDirectiveInstance(directiveIndex: number): any {
    return this._elementInjector.getDirectiveAtIndex(directiveIndex);
  }

  /**
   * Get child DebugElements from within the Light DOM.
   *
   * @return {DebugElement[]}
   */
  get children(): DebugElement[] {
    return this._getChildElements(this._parentView, this._boundElementIndex);
  }

  /**
   * Get the root DebugElement children of a component. Returns an empty
   * list if the current DebugElement is not a component root.
   *
   * @return {DebugElement[]}
   */
  get componentViewChildren(): DebugElement[] {
    var shadowView = this._parentView.getNestedView(this._boundElementIndex);

    if (!isPresent(shadowView)) {
      // The current element is not a component.
      return [];
    }

    return this._getChildElements(shadowView, null);
  }

  triggerEventHandler(eventName: string, eventObj: Event): void {
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

  getLocal(name: string): any { return this._parentView.locals.get(name); }

  /**
   * Return the first descendant TestElement matching the given predicate
   * and scope.
   *
   * @param {Function: boolean} predicate
   * @param {Scope} scope
   *
   * @return {DebugElement}
   */
  query(predicate: Predicate<DebugElement>, scope: Function = Scope.all): DebugElement {
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
   * @return {DebugElement[]}
   */
  queryAll(predicate: Predicate<DebugElement>, scope: Function = Scope.all): DebugElement[] {
    var elementsInScope = scope(this);

    return ListWrapper.filter(elementsInScope, predicate);
  }

  _getChildElements(view: AppView, parentBoundElementIndex: number): DebugElement[] {
    var els = [];
    var parentElementBinder = null;
    if (isPresent(parentBoundElementIndex)) {
      parentElementBinder = view.proto.elementBinders[parentBoundElementIndex - view.elementOffset];
    }
    for (var i = 0; i < view.proto.elementBinders.length; ++i) {
      var binder = view.proto.elementBinders[i];
      if (binder.parent == parentElementBinder) {
        els.push(new DebugElement(view, view.elementOffset + i));

        var views = view.viewContainers[view.elementOffset + i];
        if (isPresent(views)) {
          ListWrapper.forEach(views.views, (nextView) => {
            els = els.concat(this._getChildElements(nextView, null));
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

export function asNativeElements(arr: DebugElement[]): any[] {
  return arr.map((debugEl) => debugEl.nativeElement);
}

export class Scope {
  static all(debugElement: DebugElement): DebugElement[] {
    var scope = [];
    scope.push(debugElement);

    ListWrapper.forEach(debugElement.children,
                        (child) => { scope = scope.concat(Scope.all(child)); });

    ListWrapper.forEach(debugElement.componentViewChildren,
                        (child) => { scope = scope.concat(Scope.all(child)); });

    return scope;
  }
  static light(debugElement: DebugElement): DebugElement[] {
    var scope = [];
    ListWrapper.forEach(debugElement.children, (child) => {
      scope.push(child);
      scope = scope.concat(Scope.light(child));
    });
    return scope;
  }

  static view(debugElement: DebugElement): DebugElement[] {
    var scope = [];

    ListWrapper.forEach(debugElement.componentViewChildren, (child) => {
      scope.push(child);
      scope = scope.concat(Scope.light(child));
    });
    return scope;
  }
}

export class By {
  static all(): Function { return (debugElement) => true; }

  static css(selector: string): Predicate<DebugElement> {
    return (debugElement) => {
      return isPresent(debugElement.nativeElement) ?
                 DOM.elementMatches(debugElement.nativeElement, selector) :
                 false;
    };
  }
  static directive(type: Type): Predicate<DebugElement> {
    return (debugElement) => { return debugElement.hasDirective(type); };
  }
}
