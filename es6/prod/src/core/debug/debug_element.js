import { isPresent } from 'angular2/src/facade/lang';
import { unimplemented } from 'angular2/src/facade/exceptions';
import { ViewType } from 'angular2/src/core/linker/view';
import { internalView } from 'angular2/src/core/linker/view_ref';
/**
 * A DebugElement contains information from the Angular compiler about an
 * element and provides access to the corresponding ElementInjector and
 * underlying DOM Element, as well as a way to query for children.
 *
 * A DebugElement can be obtained from a {@link ComponentFixture} or from an
 * {@link ElementRef} via {@link inspectElement}.
 */
export class DebugElement {
    /**
     * Return the instance of the component associated with this element, if any.
     */
    get componentInstance() { return unimplemented(); }
    ;
    /**
     * Return the native HTML element for this DebugElement.
     */
    get nativeElement() { return unimplemented(); }
    ;
    /**
     * Return an Angular {@link ElementRef} for this element.
     */
    get elementRef() { return unimplemented(); }
    ;
    /**
     * Get child DebugElements from within the Light DOM.
     *
     * @return {DebugElement[]}
     */
    get children() { return unimplemented(); }
    ;
    /**
     * Get the root DebugElement children of a component. Returns an empty
     * list if the current DebugElement is not a component root.
     *
     * @return {DebugElement[]}
     */
    get componentViewChildren() { return unimplemented(); }
    ;
    /**
     * Return the first descendant TestElement matching the given predicate
     * and scope.
     *
     * @param {Function: boolean} predicate
     * @param {Scope} scope
     *
     * @return {DebugElement}
     */
    query(predicate, scope = Scope.all) {
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
    queryAll(predicate, scope = Scope.all) {
        var elementsInScope = scope(this);
        return elementsInScope.filter(predicate);
    }
}
export class DebugElement_ extends DebugElement {
    constructor(_parentView, _boundElementIndex) {
        super();
        this._parentView = _parentView;
        this._boundElementIndex = _boundElementIndex;
        this._elementInjector = this._parentView.elementInjectors[this._boundElementIndex];
    }
    get componentInstance() {
        if (!isPresent(this._elementInjector)) {
            return null;
        }
        return this._elementInjector.getComponent();
    }
    get nativeElement() { return this.elementRef.nativeElement; }
    get elementRef() { return this._parentView.elementRefs[this._boundElementIndex]; }
    getDirectiveInstance(directiveIndex) {
        return this._elementInjector.getDirectiveAtIndex(directiveIndex);
    }
    get children() {
        return this._getChildElements(this._parentView, this._boundElementIndex);
    }
    get componentViewChildren() {
        var shadowView = this._parentView.getNestedView(this._boundElementIndex);
        if (!isPresent(shadowView) || shadowView.proto.type !== ViewType.COMPONENT) {
            // The current element is not a component.
            return [];
        }
        return this._getChildElements(shadowView, null);
    }
    triggerEventHandler(eventName, eventObj) {
        this._parentView.triggerEventHandlers(eventName, eventObj, this._boundElementIndex);
    }
    hasDirective(type) {
        if (!isPresent(this._elementInjector)) {
            return false;
        }
        return this._elementInjector.hasDirective(type);
    }
    inject(type) {
        if (!isPresent(this._elementInjector)) {
            return null;
        }
        return this._elementInjector.get(type);
    }
    getLocal(name) { return this._parentView.locals.get(name); }
    /** @internal */
    _getChildElements(view, parentBoundElementIndex) {
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
                    views.views.forEach((nextView) => { els = els.concat(this._getChildElements(nextView, null)); });
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
export function inspectElement(elementRef) {
    return new DebugElement_(internalView(elementRef.parentView), elementRef.boundElementIndex);
}
/**
 * Maps an array of {@link DebugElement}s to an array of native DOM elements.
 */
export function asNativeElements(arr) {
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
    static all(debugElement) {
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
    static light(debugElement) {
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
    static view(debugElement) {
        var scope = [];
        debugElement.componentViewChildren.forEach(child => {
            scope.push(child);
            scope = scope.concat(Scope.light(child));
        });
        return scope;
    }
}
