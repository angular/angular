import {Type, isPresent, isBlank} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, Predicate} from 'angular2/src/facade/collection';
import {unimplemented} from 'angular2/src/facade/exceptions';
import {ElementInjector} from 'angular2/src/core/linker/element_injector';
import {AppView, ViewType} from 'angular2/src/core/linker/view';
import {internalView} from 'angular2/src/core/linker/view_ref';
import {ElementRef, ElementRef_} from 'angular2/src/core/linker/element_ref';

/**
 * A DebugElement contains information from the Angular compiler about an
 * element and provides access to the corresponding ElementInjector and
 * underlying DOM Element, as well as a way to query for children.
 *
 * A DebugElement can be obtained from a {@link ComponentFixture} or from an
 * {@link ElementRef} via {@link inspectElement}.
 */
export abstract class DebugElement {
  /**
   * Return the instance of the component associated with this element, if any.
   */
  get componentInstance(): any { return unimplemented(); };

  /**
   * Return the native HTML element for this DebugElement.
   */
  get nativeElement(): any { return unimplemented(); };

  /**
   * Return an Angular {@link ElementRef} for this element.
   */
  get elementRef(): ElementRef { return unimplemented(); };

  /**
   * Get the directive active for this element with the given index, if any.
   */
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

  /**
   * Simulate an event from this element as if the user had caused
   * this event to fire from the page.
   */
  abstract triggerEventHandler(eventName: string, eventObj: Event): void;

  /**
   * Check whether the element has a directive with the given type.
   */
  abstract hasDirective(type: Type): boolean;

  /**
   * Inject the given type from the element injector.
   */
  abstract inject(type: Type): any;


  /**
   * Read a local variable from the element (e.g. one defined with `#variable`).
   */
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
    var elementsInScope: any[] = scope(this);

    return elementsInScope.filter(predicate);
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

    if (!isPresent(shadowView) || shadowView.proto.type !== ViewType.COMPONENT) {
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
 * Returns a {@link DebugElement} for an {@link ElementRef}.
 *
 * @param {ElementRef}: elementRef
 * @return {DebugElement}
 */
export function inspectElement(elementRef: ElementRef): DebugElement {
  return new DebugElement_(internalView((<ElementRef_>elementRef).parentView),
                           (<ElementRef_>elementRef).boundElementIndex);
}

/**
 * Maps an array of {@link DebugElement}s to an array of native DOM elements.
 */
export function asNativeElements(arr: DebugElement[]): any[] {
  return arr.map((debugEl) => debugEl.nativeElement);
}

/**
 * Set of scope functions used with {@link DebugElement}'s query functionality.
 */
export class Scope {
  /**
   * Scope queries to both the light dom and view of an element and its
   * children.
   *
   * ## Example
   *
   * {@example core/debug/ts/debug_element/debug_element.ts region='scope_all'}
   */
  static all(debugElement: DebugElement): DebugElement[] {
    var scope = [];
    scope.push(debugElement);

    debugElement.children.forEach(child => scope = scope.concat(Scope.all(child)));

    debugElement.componentViewChildren.forEach(child => scope = scope.concat(Scope.all(child)));

    return scope;
  }

  /**
   * Scope queries to the light dom of an element and its children.
   *
   * ## Example
   *
   * {@example core/debug/ts/debug_element/debug_element.ts region='scope_light'}
   */
  static light(debugElement: DebugElement): DebugElement[] {
    var scope = [];
    debugElement.children.forEach(child => {
      scope.push(child);
      scope = scope.concat(Scope.light(child));
    });
    return scope;
  }

  /**
   * Scope queries to the view of an element of its children.
   *
   * ## Example
   *
   * {@example core/debug/ts/debug_element/debug_element.ts region='scope_view'}
   */
  static view(debugElement: DebugElement): DebugElement[] {
    var scope = [];

    debugElement.componentViewChildren.forEach(child => {
      scope.push(child);
      scope = scope.concat(Scope.light(child));
    });
    return scope;
  }
}
