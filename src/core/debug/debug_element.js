'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var view_1 = require('angular2/src/core/linker/view');
var view_ref_1 = require('angular2/src/core/linker/view_ref');
/**
 * A DebugElement contains information from the Angular compiler about an
 * element and provides access to the corresponding ElementInjector and
 * underlying DOM Element, as well as a way to query for children.
 *
 * A DebugElement can be obtained from a {@link ComponentFixture} or from an
 * {@link ElementRef} via {@link inspectElement}.
 */
var DebugElement = (function () {
    function DebugElement() {
    }
    Object.defineProperty(DebugElement.prototype, "componentInstance", {
        /**
         * Return the instance of the component associated with this element, if any.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(DebugElement.prototype, "nativeElement", {
        /**
         * Return the native HTML element for this DebugElement.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(DebugElement.prototype, "elementRef", {
        /**
         * Return an Angular {@link ElementRef} for this element.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(DebugElement.prototype, "children", {
        /**
         * Get child DebugElements from within the Light DOM.
         *
         * @return {DebugElement[]}
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(DebugElement.prototype, "componentViewChildren", {
        /**
         * Get the root DebugElement children of a component. Returns an empty
         * list if the current DebugElement is not a component root.
         *
         * @return {DebugElement[]}
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
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
    DebugElement.prototype.query = function (predicate, scope) {
        if (scope === void 0) { scope = Scope.all; }
        var results = this.queryAll(predicate, scope);
        return results.length > 0 ? results[0] : null;
    };
    /**
     * Return descendant TestElememts matching the given predicate
     * and scope.
     *
     * @param {Function: boolean} predicate
     * @param {Scope} scope
     *
     * @return {DebugElement[]}
     */
    DebugElement.prototype.queryAll = function (predicate, scope) {
        if (scope === void 0) { scope = Scope.all; }
        var elementsInScope = scope(this);
        return elementsInScope.filter(predicate);
    };
    return DebugElement;
})();
exports.DebugElement = DebugElement;
var DebugElement_ = (function (_super) {
    __extends(DebugElement_, _super);
    function DebugElement_(_parentView, _boundElementIndex) {
        _super.call(this);
        this._parentView = _parentView;
        this._boundElementIndex = _boundElementIndex;
        this._elementInjector = this._parentView.elementInjectors[this._boundElementIndex];
    }
    Object.defineProperty(DebugElement_.prototype, "componentInstance", {
        get: function () {
            if (!lang_1.isPresent(this._elementInjector)) {
                return null;
            }
            return this._elementInjector.getComponent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugElement_.prototype, "nativeElement", {
        get: function () { return this.elementRef.nativeElement; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugElement_.prototype, "elementRef", {
        get: function () { return this._parentView.elementRefs[this._boundElementIndex]; },
        enumerable: true,
        configurable: true
    });
    DebugElement_.prototype.getDirectiveInstance = function (directiveIndex) {
        return this._elementInjector.getDirectiveAtIndex(directiveIndex);
    };
    Object.defineProperty(DebugElement_.prototype, "children", {
        get: function () {
            return this._getChildElements(this._parentView, this._boundElementIndex);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugElement_.prototype, "componentViewChildren", {
        get: function () {
            var shadowView = this._parentView.getNestedView(this._boundElementIndex);
            if (!lang_1.isPresent(shadowView) || shadowView.proto.type !== view_1.ViewType.COMPONENT) {
                // The current element is not a component.
                return [];
            }
            return this._getChildElements(shadowView, null);
        },
        enumerable: true,
        configurable: true
    });
    DebugElement_.prototype.triggerEventHandler = function (eventName, eventObj) {
        this._parentView.triggerEventHandlers(eventName, eventObj, this._boundElementIndex);
    };
    DebugElement_.prototype.hasDirective = function (type) {
        if (!lang_1.isPresent(this._elementInjector)) {
            return false;
        }
        return this._elementInjector.hasDirective(type);
    };
    DebugElement_.prototype.inject = function (type) {
        if (!lang_1.isPresent(this._elementInjector)) {
            return null;
        }
        return this._elementInjector.get(type);
    };
    DebugElement_.prototype.getLocal = function (name) { return this._parentView.locals.get(name); };
    /** @internal */
    DebugElement_.prototype._getChildElements = function (view, parentBoundElementIndex) {
        var _this = this;
        var els = [];
        var parentElementBinder = null;
        if (lang_1.isPresent(parentBoundElementIndex)) {
            parentElementBinder = view.proto.elementBinders[parentBoundElementIndex - view.elementOffset];
        }
        for (var i = 0; i < view.proto.elementBinders.length; ++i) {
            var binder = view.proto.elementBinders[i];
            if (binder.parent == parentElementBinder) {
                els.push(new DebugElement_(view, view.elementOffset + i));
                var views = view.viewContainers[view.elementOffset + i];
                if (lang_1.isPresent(views)) {
                    views.views.forEach(function (nextView) { els = els.concat(_this._getChildElements(nextView, null)); });
                }
            }
        }
        return els;
    };
    return DebugElement_;
})(DebugElement);
exports.DebugElement_ = DebugElement_;
/**
 * Returns a {@link DebugElement} for an {@link ElementRef}.
 *
 * @param {ElementRef}: elementRef
 * @return {DebugElement}
 */
function inspectElement(elementRef) {
    return new DebugElement_(view_ref_1.internalView(elementRef.parentView), elementRef.boundElementIndex);
}
exports.inspectElement = inspectElement;
/**
 * Maps an array of {@link DebugElement}s to an array of native DOM elements.
 */
function asNativeElements(arr) {
    return arr.map(function (debugEl) { return debugEl.nativeElement; });
}
exports.asNativeElements = asNativeElements;
/**
 * Set of scope functions used with {@link DebugElement}'s query functionality.
 */
var Scope = (function () {
    function Scope() {
    }
    /**
     * Scope queries to both the light dom and view of an element and its
     * children.
     *
     * ## Example
     *
     * {@example core/debug/ts/debug_element/debug_element.ts region='scope_all'}
     */
    Scope.all = function (debugElement) {
        var scope = [];
        scope.push(debugElement);
        debugElement.children.forEach(function (child) { return scope = scope.concat(Scope.all(child)); });
        debugElement.componentViewChildren.forEach(function (child) { return scope = scope.concat(Scope.all(child)); });
        return scope;
    };
    /**
     * Scope queries to the light dom of an element and its children.
     *
     * ## Example
     *
     * {@example core/debug/ts/debug_element/debug_element.ts region='scope_light'}
     */
    Scope.light = function (debugElement) {
        var scope = [];
        debugElement.children.forEach(function (child) {
            scope.push(child);
            scope = scope.concat(Scope.light(child));
        });
        return scope;
    };
    /**
     * Scope queries to the view of an element of its children.
     *
     * ## Example
     *
     * {@example core/debug/ts/debug_element/debug_element.ts region='scope_view'}
     */
    Scope.view = function (debugElement) {
        var scope = [];
        debugElement.componentViewChildren.forEach(function (child) {
            scope.push(child);
            scope = scope.concat(Scope.light(child));
        });
        return scope;
    };
    return Scope;
})();
exports.Scope = Scope;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdfZWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2RlYnVnL2RlYnVnX2VsZW1lbnQudHMiXSwibmFtZXMiOlsiRGVidWdFbGVtZW50IiwiRGVidWdFbGVtZW50LmNvbnN0cnVjdG9yIiwiRGVidWdFbGVtZW50LmNvbXBvbmVudEluc3RhbmNlIiwiRGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQiLCJEZWJ1Z0VsZW1lbnQuZWxlbWVudFJlZiIsIkRlYnVnRWxlbWVudC5jaGlsZHJlbiIsIkRlYnVnRWxlbWVudC5jb21wb25lbnRWaWV3Q2hpbGRyZW4iLCJEZWJ1Z0VsZW1lbnQucXVlcnkiLCJEZWJ1Z0VsZW1lbnQucXVlcnlBbGwiLCJEZWJ1Z0VsZW1lbnRfIiwiRGVidWdFbGVtZW50Xy5jb25zdHJ1Y3RvciIsIkRlYnVnRWxlbWVudF8uY29tcG9uZW50SW5zdGFuY2UiLCJEZWJ1Z0VsZW1lbnRfLm5hdGl2ZUVsZW1lbnQiLCJEZWJ1Z0VsZW1lbnRfLmVsZW1lbnRSZWYiLCJEZWJ1Z0VsZW1lbnRfLmdldERpcmVjdGl2ZUluc3RhbmNlIiwiRGVidWdFbGVtZW50Xy5jaGlsZHJlbiIsIkRlYnVnRWxlbWVudF8uY29tcG9uZW50Vmlld0NoaWxkcmVuIiwiRGVidWdFbGVtZW50Xy50cmlnZ2VyRXZlbnRIYW5kbGVyIiwiRGVidWdFbGVtZW50Xy5oYXNEaXJlY3RpdmUiLCJEZWJ1Z0VsZW1lbnRfLmluamVjdCIsIkRlYnVnRWxlbWVudF8uZ2V0TG9jYWwiLCJEZWJ1Z0VsZW1lbnRfLl9nZXRDaGlsZEVsZW1lbnRzIiwiaW5zcGVjdEVsZW1lbnQiLCJhc05hdGl2ZUVsZW1lbnRzIiwiU2NvcGUiLCJTY29wZS5jb25zdHJ1Y3RvciIsIlNjb3BlLmFsbCIsIlNjb3BlLmxpZ2h0IiwiU2NvcGUudmlldyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUVsRSwyQkFBNEIs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LENBQUNBLEFBcERELElBb0RDO0FBcERZLGFBQUssUUFvRGpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXIsIFByZWRpY2F0ZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7RWxlbWVudEluamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudF9pbmplY3Rvcic7XG5pbXBvcnQge0FwcFZpZXcsIFZpZXdUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlldyc7XG5pbXBvcnQge2ludGVybmFsVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfcmVmJztcbmltcG9ydCB7RWxlbWVudFJlZiwgRWxlbWVudFJlZl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X3JlZic7XG5cbi8qKlxuICogQSBEZWJ1Z0VsZW1lbnQgY29udGFpbnMgaW5mb3JtYXRpb24gZnJvbSB0aGUgQW5ndWxhciBjb21waWxlciBhYm91dCBhblxuICogZWxlbWVudCBhbmQgcHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnRJbmplY3RvciBhbmRcbiAqIHVuZGVybHlpbmcgRE9NIEVsZW1lbnQsIGFzIHdlbGwgYXMgYSB3YXkgdG8gcXVlcnkgZm9yIGNoaWxkcmVuLlxuICpcbiAqIEEgRGVidWdFbGVtZW50IGNhbiBiZSBvYnRhaW5lZCBmcm9tIGEge0BsaW5rIENvbXBvbmVudEZpeHR1cmV9IG9yIGZyb20gYW5cbiAqIHtAbGluayBFbGVtZW50UmVmfSB2aWEge0BsaW5rIGluc3BlY3RFbGVtZW50fS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERlYnVnRWxlbWVudCB7XG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZWxlbWVudCwgaWYgYW55LlxuICAgKi9cbiAgZ2V0IGNvbXBvbmVudEluc3RhbmNlKCk6IGFueSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgbmF0aXZlIEhUTUwgZWxlbWVudCBmb3IgdGhpcyBEZWJ1Z0VsZW1lbnQuXG4gICAqL1xuICBnZXQgbmF0aXZlRWxlbWVudCgpOiBhbnkgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gYW4gQW5ndWxhciB7QGxpbmsgRWxlbWVudFJlZn0gZm9yIHRoaXMgZWxlbWVudC5cbiAgICovXG4gIGdldCBlbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRpcmVjdGl2ZSBhY3RpdmUgZm9yIHRoaXMgZWxlbWVudCB3aXRoIHRoZSBnaXZlbiBpbmRleCwgaWYgYW55LlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0RGlyZWN0aXZlSW5zdGFuY2UoZGlyZWN0aXZlSW5kZXg6IG51bWJlcik6IGFueTtcblxuICAvKipcbiAgICogR2V0IGNoaWxkIERlYnVnRWxlbWVudHMgZnJvbSB3aXRoaW4gdGhlIExpZ2h0IERPTS5cbiAgICpcbiAgICogQHJldHVybiB7RGVidWdFbGVtZW50W119XG4gICAqL1xuICBnZXQgY2hpbGRyZW4oKTogRGVidWdFbGVtZW50W10geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHJvb3QgRGVidWdFbGVtZW50IGNoaWxkcmVuIG9mIGEgY29tcG9uZW50LiBSZXR1cm5zIGFuIGVtcHR5XG4gICAqIGxpc3QgaWYgdGhlIGN1cnJlbnQgRGVidWdFbGVtZW50IGlzIG5vdCBhIGNvbXBvbmVudCByb290LlxuICAgKlxuICAgKiBAcmV0dXJuIHtEZWJ1Z0VsZW1lbnRbXX1cbiAgICovXG4gIGdldCBjb21wb25lbnRWaWV3Q2hpbGRyZW4oKTogRGVidWdFbGVtZW50W10geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBTaW11bGF0ZSBhbiBldmVudCBmcm9tIHRoaXMgZWxlbWVudCBhcyBpZiB0aGUgdXNlciBoYWQgY2F1c2VkXG4gICAqIHRoaXMgZXZlbnQgdG8gZmlyZSBmcm9tIHRoZSBwYWdlLlxuICAgKi9cbiAgYWJzdHJhY3QgdHJpZ2dlckV2ZW50SGFuZGxlcihldmVudE5hbWU6IHN0cmluZywgZXZlbnRPYmo6IEV2ZW50KTogdm9pZDtcblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgZWxlbWVudCBoYXMgYSBkaXJlY3RpdmUgd2l0aCB0aGUgZ2l2ZW4gdHlwZS5cbiAgICovXG4gIGFic3RyYWN0IGhhc0RpcmVjdGl2ZSh0eXBlOiBUeXBlKTogYm9vbGVhbjtcblxuICAvKipcbiAgICogSW5qZWN0IHRoZSBnaXZlbiB0eXBlIGZyb20gdGhlIGVsZW1lbnQgaW5qZWN0b3IuXG4gICAqL1xuICBhYnN0cmFjdCBpbmplY3QodHlwZTogVHlwZSk6IGFueTtcblxuXG4gIC8qKlxuICAgKiBSZWFkIGEgbG9jYWwgdmFyaWFibGUgZnJvbSB0aGUgZWxlbWVudCAoZS5nLiBvbmUgZGVmaW5lZCB3aXRoIGAjdmFyaWFibGVgKS5cbiAgICovXG4gIGFic3RyYWN0IGdldExvY2FsKG5hbWU6IHN0cmluZyk6IGFueTtcblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBmaXJzdCBkZXNjZW5kYW50IFRlc3RFbGVtZW50IG1hdGNoaW5nIHRoZSBnaXZlbiBwcmVkaWNhdGVcbiAgICogYW5kIHNjb3BlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9uOiBib29sZWFufSBwcmVkaWNhdGVcbiAgICogQHBhcmFtIHtTY29wZX0gc2NvcGVcbiAgICpcbiAgICogQHJldHVybiB7RGVidWdFbGVtZW50fVxuICAgKi9cbiAgcXVlcnkocHJlZGljYXRlOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50Piwgc2NvcGU6IEZ1bmN0aW9uID0gU2NvcGUuYWxsKTogRGVidWdFbGVtZW50IHtcbiAgICB2YXIgcmVzdWx0cyA9IHRoaXMucXVlcnlBbGwocHJlZGljYXRlLCBzY29wZSk7XG4gICAgcmV0dXJuIHJlc3VsdHMubGVuZ3RoID4gMCA/IHJlc3VsdHNbMF0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBkZXNjZW5kYW50IFRlc3RFbGVtZW10cyBtYXRjaGluZyB0aGUgZ2l2ZW4gcHJlZGljYXRlXG4gICAqIGFuZCBzY29wZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbjogYm9vbGVhbn0gcHJlZGljYXRlXG4gICAqIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gICAqXG4gICAqIEByZXR1cm4ge0RlYnVnRWxlbWVudFtdfVxuICAgKi9cbiAgcXVlcnlBbGwocHJlZGljYXRlOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50Piwgc2NvcGU6IEZ1bmN0aW9uID0gU2NvcGUuYWxsKTogRGVidWdFbGVtZW50W10ge1xuICAgIHZhciBlbGVtZW50c0luU2NvcGU6IGFueVtdID0gc2NvcGUodGhpcyk7XG5cbiAgICByZXR1cm4gZWxlbWVudHNJblNjb3BlLmZpbHRlcihwcmVkaWNhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z0VsZW1lbnRfIGV4dGVuZHMgRGVidWdFbGVtZW50IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZWxlbWVudEluamVjdG9yOiBFbGVtZW50SW5qZWN0b3I7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGFyZW50VmlldzogQXBwVmlldywgcHJpdmF0ZSBfYm91bmRFbGVtZW50SW5kZXg6IG51bWJlcikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fZWxlbWVudEluamVjdG9yID0gdGhpcy5fcGFyZW50Vmlldy5lbGVtZW50SW5qZWN0b3JzW3RoaXMuX2JvdW5kRWxlbWVudEluZGV4XTtcbiAgfVxuXG4gIGdldCBjb21wb25lbnRJbnN0YW5jZSgpOiBhbnkge1xuICAgIGlmICghaXNQcmVzZW50KHRoaXMuX2VsZW1lbnRJbmplY3RvcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudEluamVjdG9yLmdldENvbXBvbmVudCgpO1xuICB9XG5cbiAgZ2V0IG5hdGl2ZUVsZW1lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50OyB9XG5cbiAgZ2V0IGVsZW1lbnRSZWYoKTogRWxlbWVudFJlZiB7IHJldHVybiB0aGlzLl9wYXJlbnRWaWV3LmVsZW1lbnRSZWZzW3RoaXMuX2JvdW5kRWxlbWVudEluZGV4XTsgfVxuXG4gIGdldERpcmVjdGl2ZUluc3RhbmNlKGRpcmVjdGl2ZUluZGV4OiBudW1iZXIpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50SW5qZWN0b3IuZ2V0RGlyZWN0aXZlQXRJbmRleChkaXJlY3RpdmVJbmRleCk7XG4gIH1cblxuICBnZXQgY2hpbGRyZW4oKTogRGVidWdFbGVtZW50W10ge1xuICAgIHJldHVybiB0aGlzLl9nZXRDaGlsZEVsZW1lbnRzKHRoaXMuX3BhcmVudFZpZXcsIHRoaXMuX2JvdW5kRWxlbWVudEluZGV4KTtcbiAgfVxuXG4gIGdldCBjb21wb25lbnRWaWV3Q2hpbGRyZW4oKTogRGVidWdFbGVtZW50W10ge1xuICAgIHZhciBzaGFkb3dWaWV3ID0gdGhpcy5fcGFyZW50Vmlldy5nZXROZXN0ZWRWaWV3KHRoaXMuX2JvdW5kRWxlbWVudEluZGV4KTtcblxuICAgIGlmICghaXNQcmVzZW50KHNoYWRvd1ZpZXcpIHx8IHNoYWRvd1ZpZXcucHJvdG8udHlwZSAhPT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICAvLyBUaGUgY3VycmVudCBlbGVtZW50IGlzIG5vdCBhIGNvbXBvbmVudC5cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2hpbGRFbGVtZW50cyhzaGFkb3dWaWV3LCBudWxsKTtcbiAgfVxuXG4gIHRyaWdnZXJFdmVudEhhbmRsZXIoZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50T2JqOiBFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX3BhcmVudFZpZXcudHJpZ2dlckV2ZW50SGFuZGxlcnMoZXZlbnROYW1lLCBldmVudE9iaiwgdGhpcy5fYm91bmRFbGVtZW50SW5kZXgpO1xuICB9XG5cbiAgaGFzRGlyZWN0aXZlKHR5cGU6IFR5cGUpOiBib29sZWFuIHtcbiAgICBpZiAoIWlzUHJlc2VudCh0aGlzLl9lbGVtZW50SW5qZWN0b3IpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbGVtZW50SW5qZWN0b3IuaGFzRGlyZWN0aXZlKHR5cGUpO1xuICB9XG5cbiAgaW5qZWN0KHR5cGU6IFR5cGUpOiBhbnkge1xuICAgIGlmICghaXNQcmVzZW50KHRoaXMuX2VsZW1lbnRJbmplY3RvcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudEluamVjdG9yLmdldCh0eXBlKTtcbiAgfVxuXG4gIGdldExvY2FsKG5hbWU6IHN0cmluZyk6IGFueSB7IHJldHVybiB0aGlzLl9wYXJlbnRWaWV3LmxvY2Fscy5nZXQobmFtZSk7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZXRDaGlsZEVsZW1lbnRzKHZpZXc6IEFwcFZpZXcsIHBhcmVudEJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIpOiBEZWJ1Z0VsZW1lbnRbXSB7XG4gICAgdmFyIGVscyA9IFtdO1xuICAgIHZhciBwYXJlbnRFbGVtZW50QmluZGVyID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KHBhcmVudEJvdW5kRWxlbWVudEluZGV4KSkge1xuICAgICAgcGFyZW50RWxlbWVudEJpbmRlciA9IHZpZXcucHJvdG8uZWxlbWVudEJpbmRlcnNbcGFyZW50Qm91bmRFbGVtZW50SW5kZXggLSB2aWV3LmVsZW1lbnRPZmZzZXRdO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcucHJvdG8uZWxlbWVudEJpbmRlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBiaW5kZXIgPSB2aWV3LnByb3RvLmVsZW1lbnRCaW5kZXJzW2ldO1xuICAgICAgaWYgKGJpbmRlci5wYXJlbnQgPT0gcGFyZW50RWxlbWVudEJpbmRlcikge1xuICAgICAgICBlbHMucHVzaChuZXcgRGVidWdFbGVtZW50Xyh2aWV3LCB2aWV3LmVsZW1lbnRPZmZzZXQgKyBpKSk7XG5cbiAgICAgICAgdmFyIHZpZXdzID0gdmlldy52aWV3Q29udGFpbmVyc1t2aWV3LmVsZW1lbnRPZmZzZXQgKyBpXTtcbiAgICAgICAgaWYgKGlzUHJlc2VudCh2aWV3cykpIHtcbiAgICAgICAgICB2aWV3cy52aWV3cy5mb3JFYWNoKFxuICAgICAgICAgICAgICAobmV4dFZpZXcpID0+IHsgZWxzID0gZWxzLmNvbmNhdCh0aGlzLl9nZXRDaGlsZEVsZW1lbnRzKG5leHRWaWV3LCBudWxsKSk7IH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbHM7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEge0BsaW5rIERlYnVnRWxlbWVudH0gZm9yIGFuIHtAbGluayBFbGVtZW50UmVmfS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnRSZWZ9OiBlbGVtZW50UmVmXG4gKiBAcmV0dXJuIHtEZWJ1Z0VsZW1lbnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnNwZWN0RWxlbWVudChlbGVtZW50UmVmOiBFbGVtZW50UmVmKTogRGVidWdFbGVtZW50IHtcbiAgcmV0dXJuIG5ldyBEZWJ1Z0VsZW1lbnRfKGludGVybmFsVmlldygoPEVsZW1lbnRSZWZfPmVsZW1lbnRSZWYpLnBhcmVudFZpZXcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKDxFbGVtZW50UmVmXz5lbGVtZW50UmVmKS5ib3VuZEVsZW1lbnRJbmRleCk7XG59XG5cbi8qKlxuICogTWFwcyBhbiBhcnJheSBvZiB7QGxpbmsgRGVidWdFbGVtZW50fXMgdG8gYW4gYXJyYXkgb2YgbmF0aXZlIERPTSBlbGVtZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzTmF0aXZlRWxlbWVudHMoYXJyOiBEZWJ1Z0VsZW1lbnRbXSk6IGFueVtdIHtcbiAgcmV0dXJuIGFyci5tYXAoKGRlYnVnRWwpID0+IGRlYnVnRWwubmF0aXZlRWxlbWVudCk7XG59XG5cbi8qKlxuICogU2V0IG9mIHNjb3BlIGZ1bmN0aW9ucyB1c2VkIHdpdGgge0BsaW5rIERlYnVnRWxlbWVudH0ncyBxdWVyeSBmdW5jdGlvbmFsaXR5LlxuICovXG5leHBvcnQgY2xhc3MgU2NvcGUge1xuICAvKipcbiAgICogU2NvcGUgcXVlcmllcyB0byBib3RoIHRoZSBsaWdodCBkb20gYW5kIHZpZXcgb2YgYW4gZWxlbWVudCBhbmQgaXRzXG4gICAqIGNoaWxkcmVuLlxuICAgKlxuICAgKiAjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBjb3JlL2RlYnVnL3RzL2RlYnVnX2VsZW1lbnQvZGVidWdfZWxlbWVudC50cyByZWdpb249J3Njb3BlX2FsbCd9XG4gICAqL1xuICBzdGF0aWMgYWxsKGRlYnVnRWxlbWVudDogRGVidWdFbGVtZW50KTogRGVidWdFbGVtZW50W10ge1xuICAgIHZhciBzY29wZSA9IFtdO1xuICAgIHNjb3BlLnB1c2goZGVidWdFbGVtZW50KTtcblxuICAgIGRlYnVnRWxlbWVudC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHNjb3BlID0gc2NvcGUuY29uY2F0KFNjb3BlLmFsbChjaGlsZCkpKTtcblxuICAgIGRlYnVnRWxlbWVudC5jb21wb25lbnRWaWV3Q2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiBzY29wZSA9IHNjb3BlLmNvbmNhdChTY29wZS5hbGwoY2hpbGQpKSk7XG5cbiAgICByZXR1cm4gc2NvcGU7XG4gIH1cblxuICAvKipcbiAgICogU2NvcGUgcXVlcmllcyB0byB0aGUgbGlnaHQgZG9tIG9mIGFuIGVsZW1lbnQgYW5kIGl0cyBjaGlsZHJlbi5cbiAgICpcbiAgICogIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgY29yZS9kZWJ1Zy90cy9kZWJ1Z19lbGVtZW50L2RlYnVnX2VsZW1lbnQudHMgcmVnaW9uPSdzY29wZV9saWdodCd9XG4gICAqL1xuICBzdGF0aWMgbGlnaHQoZGVidWdFbGVtZW50OiBEZWJ1Z0VsZW1lbnQpOiBEZWJ1Z0VsZW1lbnRbXSB7XG4gICAgdmFyIHNjb3BlID0gW107XG4gICAgZGVidWdFbGVtZW50LmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgc2NvcGUucHVzaChjaGlsZCk7XG4gICAgICBzY29wZSA9IHNjb3BlLmNvbmNhdChTY29wZS5saWdodChjaGlsZCkpO1xuICAgIH0pO1xuICAgIHJldHVybiBzY29wZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY29wZSBxdWVyaWVzIHRvIHRoZSB2aWV3IG9mIGFuIGVsZW1lbnQgb2YgaXRzIGNoaWxkcmVuLlxuICAgKlxuICAgKiAjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBjb3JlL2RlYnVnL3RzL2RlYnVnX2VsZW1lbnQvZGVidWdfZWxlbWVudC50cyByZWdpb249J3Njb3BlX3ZpZXcnfVxuICAgKi9cbiAgc3RhdGljIHZpZXcoZGVidWdFbGVtZW50OiBEZWJ1Z0VsZW1lbnQpOiBEZWJ1Z0VsZW1lbnRbXSB7XG4gICAgdmFyIHNjb3BlID0gW107XG5cbiAgICBkZWJ1Z0VsZW1lbnQuY29tcG9uZW50Vmlld0NoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgc2NvcGUucHVzaChjaGlsZCk7XG4gICAgICBzY29wZSA9IHNjb3BlLmNvbmNhdChTY29wZS5saWdodChjaGlsZCkpO1xuICAgIH0pO1xuICAgIHJldHVybiBzY29wZTtcbiAgfVxufVxuIl19