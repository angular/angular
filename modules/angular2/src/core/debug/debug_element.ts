import {Type, isPresent, isBlank} from 'angular2/src/core/facade/lang';
import {ListWrapper, MapWrapper, Predicate} from 'angular2/src/core/facade/collection';
import {unimplemented} from 'angular2/src/core/facade/exceptions';

import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {ElementInjector} from 'angular2/src/core/linker/element_injector';
import {AppView} from 'angular2/src/core/linker/view';
import {internalView} from 'angular2/src/core/linker/view_ref';
import {ElementRef, ElementRef_} from 'angular2/src/core/linker/element_ref';

/**
 * A DebugElement contains information from the Angular compiler about an
 * element and provides access to the corresponding ElementInjector and
 * underlying DOM Element, as well as a way to query for children.
 */
export abstract class DebugElement {
  get componentInstance(): any { return unimplemented(); };

  get nativeElement(): any { return unimplemented(); };

  get elementRef(): ElementRef { return unimplemented(); };

  abstract getDirectiveInstance(directiveIndex: number): any;

  /**
   * Get child DebugElements from within the Light DOM.
   *
   * @return {DebugElement[]}
   */
  get children(): DebugElement[] { return unimplemented(); };

  /**
   * Get the root DebugElement children of a component. Returns an empty
   * list if the current DebugElement is not a component root.
   *
   * @return {DebugElement[]}
   */
  get componentViewChildren(): DebugElement[] { return unimplemented(); };

  abstract triggerEventHandler(eventName: string, eventObj: Event): void;

  abstract hasDirective(type: Type): boolean;

  abstract inject(type: Type): any;

  abstract getLocal(name: string): any;

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
}

export class DebugElement_ extends DebugElement {
  /** @internal */
  _elementInjector: ElementInjector;

  constructor(private _parentView: AppView, private _boundElementIndex: number) {
    super();
    this._elementInjector = this._parentView.elementInjectors[this._boundElementIndex];
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

  get children(): DebugElement[] {
    return this._getChildElements(this._parentView, this._boundElementIndex);
  }

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

  /** @internal */
  _getChildElements(view: AppView, parentBoundElementIndex: number): DebugElement[] {
    var els = [];
    var parentElementBinder = null;
    if (isPresent(parentBoundElementIndex)) {
      parentElementBinder = view.proto.elementBinders[parentBoundElementIndex - view.elementOffset];
    }
    for (var i = 0; i < view.proto.elementBinders.length; ++i) {
      var binder = view.proto.elementBinders[i];
      if (binder.parent == parentElementBinder) {
        els.push(new DebugElement_(view, view.elementOffset + i));

        var views = view.viewContainers[view.elementOffset + i];
        if (isPresent(views)) {
          views.views.forEach(
              (nextView) => { els = els.concat(this._getChildElements(nextView, null)); });
        }
      }
    }
    return els;
  }
}

/**
 * Returns a DebugElement for a ElementRef.
 *
 * @param {ElementRef}: elementRef
 * @return {DebugElement}
 */
export function inspectElement(elementRef: ElementRef): DebugElement {
  return new DebugElement_(internalView((<ElementRef_>elementRef).parentView),
                           (<ElementRef_>elementRef).boundElementIndex);
}

export function asNativeElements(arr: DebugElement[]): any[] {
  return arr.map((debugEl) => debugEl.nativeElement);
}

export class Scope {
  static all(debugElement: DebugElement): DebugElement[] {
    var scope = [];
    scope.push(debugElement);

    debugElement.children.forEach(child => scope = scope.concat(Scope.all(child)));

    debugElement.componentViewChildren.forEach(child => scope = scope.concat(Scope.all(child)));

    return scope;
  }
  static light(debugElement: DebugElement): DebugElement[] {
    var scope = [];
    debugElement.children.forEach(child => {
      scope.push(child);
      scope = scope.concat(Scope.light(child));
    });
    return scope;
  }

  static view(debugElement: DebugElement): DebugElement[] {
    var scope = [];

    debugElement.componentViewChildren.forEach(child => {
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
