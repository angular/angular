'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
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
    function DebugElement_(_appElement) {
        _super.call(this);
        this._appElement = _appElement;
    }
    Object.defineProperty(DebugElement_.prototype, "componentInstance", {
        get: function () {
            if (!lang_1.isPresent(this._appElement)) {
                return null;
            }
            return this._appElement.getComponent();
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
        get: function () { return this._appElement.ref; },
        enumerable: true,
        configurable: true
    });
    DebugElement_.prototype.getDirectiveInstance = function (directiveIndex) {
        return this._appElement.getDirectiveAtIndex(directiveIndex);
    };
    Object.defineProperty(DebugElement_.prototype, "children", {
        get: function () {
            return this._getChildElements(this._appElement.parentView, this._appElement);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugElement_.prototype, "componentViewChildren", {
        get: function () {
            if (!lang_1.isPresent(this._appElement.componentView)) {
                // The current element is not a component.
                return [];
            }
            return this._getChildElements(this._appElement.componentView, null);
        },
        enumerable: true,
        configurable: true
    });
    DebugElement_.prototype.triggerEventHandler = function (eventName, eventObj) {
        this._appElement.parentView.triggerEventHandlers(eventName, eventObj, this._appElement.proto.index);
    };
    DebugElement_.prototype.hasDirective = function (type) {
        if (!lang_1.isPresent(this._appElement)) {
            return false;
        }
        return this._appElement.hasDirective(type);
    };
    DebugElement_.prototype.inject = function (type) {
        if (!lang_1.isPresent(this._appElement)) {
            return null;
        }
        return this._appElement.get(type);
    };
    DebugElement_.prototype.getLocal = function (name) { return this._appElement.parentView.locals.get(name); };
    /** @internal */
    DebugElement_.prototype._getChildElements = function (view, parentAppElement) {
        var _this = this;
        var els = [];
        for (var i = 0; i < view.appElements.length; ++i) {
            var appEl = view.appElements[i];
            if (appEl.parent == parentAppElement) {
                els.push(new DebugElement_(appEl));
                var views = appEl.nestedViews;
                if (lang_1.isPresent(views)) {
                    views.forEach(function (nextView) { els = els.concat(_this._getChildElements(nextView, null)); });
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
    return new DebugElement_(elementRef.internalElement);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdfZWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2RlYnVnL2RlYnVnX2VsZW1lbnQudHMiXSwibmFtZXMiOlsiRGVidWdFbGVtZW50IiwiRGVidWdFbGVtZW50LmNvbnN0cnVjdG9yIiwiRGVidWdFbGVtZW50LmNvbXBvbmVudEluc3RhbmNlIiwiRGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQiLCJEZWJ1Z0VsZW1lbnQuZWxlbWVudFJlZiIsIkRlYnVnRWxlbWVudC5jaGlsZHJlbiIsIkRlYnVnRWxlbWVudC5jb21wb25lbnRWaWV3Q2hpbGRyZW4iLCJEZWJ1Z0VsZW1lbnQucXVlcnkiLCJEZWJ1Z0VsZW1lbnQucXVlcnlBbGwiLCJEZWJ1Z0VsZW1lbnRfIiwiRGVidWdFbGVtZW50Xy5jb25zdHJ1Y3RvciIsIkRlYnVnRWxlbWVudF8uY29tcG9uZW50SW5zdGFuY2UiLCJEZWJ1Z0VsZW1lbnRfLm5hdGl2ZUVsZW1lbnQiLCJEZWJ1Z0VsZW1lbnRfLmVsZW1lbnRSZWYiLCJEZWJ1Z0VsZW1lbnRfLmdldERpcmVjdGl2ZUluc3RhbmNlIiwiRGVidWdFbGVtZW50Xy5jaGlsZHJlbiIsIkRlYnVnRWxlbWVudF8uY29tcG9uZW50Vmlld0NoaWxkcmVuIiwiRGVidWdFbGVtZW50Xy50cmlnZ2VyRXZlbnRIYW5kbGVyIiwiRGVidWdFbGVtZW50Xy5oYXNEaXJlY3RpdmUiLCJEZWJ1Z0VsZW1lbnRfLmluamVjdCIsIkRlYnVnRWxlbWVudF8uZ2V0TG9jYWwiLCJEZWJ1Z0VsZW1lbnRfLl9nZXRDaGlsZEVsZW1lbnRzIiwiaW5zcGVjdEVsZW1lbnQiLCJhc05hdGl2ZUVsZW1lbnRzIiwiU2NvcGUiLCJTY29wZS5jb25zdHJ1Y3RvciIsIlNjb3BlLmFsbCIsIlNjb3BlLmxpZ2h0IiwiU2NvcGUudmlldyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUVsRSwyQkFBNEIs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QUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNsQkEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLENBQUNBLENBQUNBLENBQUNBO1FBQ0hBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2ZBLENBQUNBO0lBQ0hKLFlBQUNBO0FBQURBLENBQUNBLEFBcERELElBb0RDO0FBcERZLGFBQUssUUFvRGpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXIsIFByZWRpY2F0ZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuaW1wb3J0IHtBcHBFbGVtZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudCc7XG5pbXBvcnQge0FwcFZpZXd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3JztcbmltcG9ydCB7RWxlbWVudFJlZiwgRWxlbWVudFJlZl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X3JlZic7XG5cbi8qKlxuICogQSBEZWJ1Z0VsZW1lbnQgY29udGFpbnMgaW5mb3JtYXRpb24gZnJvbSB0aGUgQW5ndWxhciBjb21waWxlciBhYm91dCBhblxuICogZWxlbWVudCBhbmQgcHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnRJbmplY3RvciBhbmRcbiAqIHVuZGVybHlpbmcgRE9NIEVsZW1lbnQsIGFzIHdlbGwgYXMgYSB3YXkgdG8gcXVlcnkgZm9yIGNoaWxkcmVuLlxuICpcbiAqIEEgRGVidWdFbGVtZW50IGNhbiBiZSBvYnRhaW5lZCBmcm9tIGEge0BsaW5rIENvbXBvbmVudEZpeHR1cmV9IG9yIGZyb20gYW5cbiAqIHtAbGluayBFbGVtZW50UmVmfSB2aWEge0BsaW5rIGluc3BlY3RFbGVtZW50fS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERlYnVnRWxlbWVudCB7XG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZWxlbWVudCwgaWYgYW55LlxuICAgKi9cbiAgZ2V0IGNvbXBvbmVudEluc3RhbmNlKCk6IGFueSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgbmF0aXZlIEhUTUwgZWxlbWVudCBmb3IgdGhpcyBEZWJ1Z0VsZW1lbnQuXG4gICAqL1xuICBnZXQgbmF0aXZlRWxlbWVudCgpOiBhbnkgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gYW4gQW5ndWxhciB7QGxpbmsgRWxlbWVudFJlZn0gZm9yIHRoaXMgZWxlbWVudC5cbiAgICovXG4gIGdldCBlbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRpcmVjdGl2ZSBhY3RpdmUgZm9yIHRoaXMgZWxlbWVudCB3aXRoIHRoZSBnaXZlbiBpbmRleCwgaWYgYW55LlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0RGlyZWN0aXZlSW5zdGFuY2UoZGlyZWN0aXZlSW5kZXg6IG51bWJlcik6IGFueTtcblxuICAvKipcbiAgICogR2V0IGNoaWxkIERlYnVnRWxlbWVudHMgZnJvbSB3aXRoaW4gdGhlIExpZ2h0IERPTS5cbiAgICpcbiAgICogQHJldHVybiB7RGVidWdFbGVtZW50W119XG4gICAqL1xuICBnZXQgY2hpbGRyZW4oKTogRGVidWdFbGVtZW50W10geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHJvb3QgRGVidWdFbGVtZW50IGNoaWxkcmVuIG9mIGEgY29tcG9uZW50LiBSZXR1cm5zIGFuIGVtcHR5XG4gICAqIGxpc3QgaWYgdGhlIGN1cnJlbnQgRGVidWdFbGVtZW50IGlzIG5vdCBhIGNvbXBvbmVudCByb290LlxuICAgKlxuICAgKiBAcmV0dXJuIHtEZWJ1Z0VsZW1lbnRbXX1cbiAgICovXG4gIGdldCBjb21wb25lbnRWaWV3Q2hpbGRyZW4oKTogRGVidWdFbGVtZW50W10geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBTaW11bGF0ZSBhbiBldmVudCBmcm9tIHRoaXMgZWxlbWVudCBhcyBpZiB0aGUgdXNlciBoYWQgY2F1c2VkXG4gICAqIHRoaXMgZXZlbnQgdG8gZmlyZSBmcm9tIHRoZSBwYWdlLlxuICAgKi9cbiAgYWJzdHJhY3QgdHJpZ2dlckV2ZW50SGFuZGxlcihldmVudE5hbWU6IHN0cmluZywgZXZlbnRPYmo6IEV2ZW50KTogdm9pZDtcblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgZWxlbWVudCBoYXMgYSBkaXJlY3RpdmUgd2l0aCB0aGUgZ2l2ZW4gdHlwZS5cbiAgICovXG4gIGFic3RyYWN0IGhhc0RpcmVjdGl2ZSh0eXBlOiBUeXBlKTogYm9vbGVhbjtcblxuICAvKipcbiAgICogSW5qZWN0IHRoZSBnaXZlbiB0eXBlIGZyb20gdGhlIGVsZW1lbnQgaW5qZWN0b3IuXG4gICAqL1xuICBhYnN0cmFjdCBpbmplY3QodHlwZTogVHlwZSk6IGFueTtcblxuXG4gIC8qKlxuICAgKiBSZWFkIGEgbG9jYWwgdmFyaWFibGUgZnJvbSB0aGUgZWxlbWVudCAoZS5nLiBvbmUgZGVmaW5lZCB3aXRoIGAjdmFyaWFibGVgKS5cbiAgICovXG4gIGFic3RyYWN0IGdldExvY2FsKG5hbWU6IHN0cmluZyk6IGFueTtcblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBmaXJzdCBkZXNjZW5kYW50IFRlc3RFbGVtZW50IG1hdGNoaW5nIHRoZSBnaXZlbiBwcmVkaWNhdGVcbiAgICogYW5kIHNjb3BlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9uOiBib29sZWFufSBwcmVkaWNhdGVcbiAgICogQHBhcmFtIHtTY29wZX0gc2NvcGVcbiAgICpcbiAgICogQHJldHVybiB7RGVidWdFbGVtZW50fVxuICAgKi9cbiAgcXVlcnkocHJlZGljYXRlOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50Piwgc2NvcGU6IEZ1bmN0aW9uID0gU2NvcGUuYWxsKTogRGVidWdFbGVtZW50IHtcbiAgICB2YXIgcmVzdWx0cyA9IHRoaXMucXVlcnlBbGwocHJlZGljYXRlLCBzY29wZSk7XG4gICAgcmV0dXJuIHJlc3VsdHMubGVuZ3RoID4gMCA/IHJlc3VsdHNbMF0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBkZXNjZW5kYW50IFRlc3RFbGVtZW10cyBtYXRjaGluZyB0aGUgZ2l2ZW4gcHJlZGljYXRlXG4gICAqIGFuZCBzY29wZS5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbjogYm9vbGVhbn0gcHJlZGljYXRlXG4gICAqIEBwYXJhbSB7U2NvcGV9IHNjb3BlXG4gICAqXG4gICAqIEByZXR1cm4ge0RlYnVnRWxlbWVudFtdfVxuICAgKi9cbiAgcXVlcnlBbGwocHJlZGljYXRlOiBQcmVkaWNhdGU8RGVidWdFbGVtZW50Piwgc2NvcGU6IEZ1bmN0aW9uID0gU2NvcGUuYWxsKTogRGVidWdFbGVtZW50W10ge1xuICAgIHZhciBlbGVtZW50c0luU2NvcGU6IGFueVtdID0gc2NvcGUodGhpcyk7XG5cbiAgICByZXR1cm4gZWxlbWVudHNJblNjb3BlLmZpbHRlcihwcmVkaWNhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z0VsZW1lbnRfIGV4dGVuZHMgRGVidWdFbGVtZW50IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfYXBwRWxlbWVudDogQXBwRWxlbWVudCkgeyBzdXBlcigpOyB9XG5cbiAgZ2V0IGNvbXBvbmVudEluc3RhbmNlKCk6IGFueSB7XG4gICAgaWYgKCFpc1ByZXNlbnQodGhpcy5fYXBwRWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYXBwRWxlbWVudC5nZXRDb21wb25lbnQoKTtcbiAgfVxuXG4gIGdldCBuYXRpdmVFbGVtZW50KCk6IGFueSB7IHJldHVybiB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDsgfVxuXG4gIGdldCBlbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdGhpcy5fYXBwRWxlbWVudC5yZWY7IH1cblxuICBnZXREaXJlY3RpdmVJbnN0YW5jZShkaXJlY3RpdmVJbmRleDogbnVtYmVyKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fYXBwRWxlbWVudC5nZXREaXJlY3RpdmVBdEluZGV4KGRpcmVjdGl2ZUluZGV4KTtcbiAgfVxuXG4gIGdldCBjaGlsZHJlbigpOiBEZWJ1Z0VsZW1lbnRbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldENoaWxkRWxlbWVudHModGhpcy5fYXBwRWxlbWVudC5wYXJlbnRWaWV3LCB0aGlzLl9hcHBFbGVtZW50KTtcbiAgfVxuXG4gIGdldCBjb21wb25lbnRWaWV3Q2hpbGRyZW4oKTogRGVidWdFbGVtZW50W10ge1xuICAgIGlmICghaXNQcmVzZW50KHRoaXMuX2FwcEVsZW1lbnQuY29tcG9uZW50VmlldykpIHtcbiAgICAgIC8vIFRoZSBjdXJyZW50IGVsZW1lbnQgaXMgbm90IGEgY29tcG9uZW50LlxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9nZXRDaGlsZEVsZW1lbnRzKHRoaXMuX2FwcEVsZW1lbnQuY29tcG9uZW50VmlldywgbnVsbCk7XG4gIH1cblxuICB0cmlnZ2VyRXZlbnRIYW5kbGVyKGV2ZW50TmFtZTogc3RyaW5nLCBldmVudE9iajogRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9hcHBFbGVtZW50LnBhcmVudFZpZXcudHJpZ2dlckV2ZW50SGFuZGxlcnMoZXZlbnROYW1lLCBldmVudE9iaixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXBwRWxlbWVudC5wcm90by5pbmRleCk7XG4gIH1cblxuICBoYXNEaXJlY3RpdmUodHlwZTogVHlwZSk6IGJvb2xlYW4ge1xuICAgIGlmICghaXNQcmVzZW50KHRoaXMuX2FwcEVsZW1lbnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hcHBFbGVtZW50Lmhhc0RpcmVjdGl2ZSh0eXBlKTtcbiAgfVxuXG4gIGluamVjdCh0eXBlOiBUeXBlKTogYW55IHtcbiAgICBpZiAoIWlzUHJlc2VudCh0aGlzLl9hcHBFbGVtZW50KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hcHBFbGVtZW50LmdldCh0eXBlKTtcbiAgfVxuXG4gIGdldExvY2FsKG5hbWU6IHN0cmluZyk6IGFueSB7IHJldHVybiB0aGlzLl9hcHBFbGVtZW50LnBhcmVudFZpZXcubG9jYWxzLmdldChuYW1lKTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dldENoaWxkRWxlbWVudHModmlldzogQXBwVmlldywgcGFyZW50QXBwRWxlbWVudDogQXBwRWxlbWVudCk6IERlYnVnRWxlbWVudFtdIHtcbiAgICB2YXIgZWxzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3LmFwcEVsZW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgYXBwRWwgPSB2aWV3LmFwcEVsZW1lbnRzW2ldO1xuICAgICAgaWYgKGFwcEVsLnBhcmVudCA9PSBwYXJlbnRBcHBFbGVtZW50KSB7XG4gICAgICAgIGVscy5wdXNoKG5ldyBEZWJ1Z0VsZW1lbnRfKGFwcEVsKSk7XG5cbiAgICAgICAgdmFyIHZpZXdzID0gYXBwRWwubmVzdGVkVmlld3M7XG4gICAgICAgIGlmIChpc1ByZXNlbnQodmlld3MpKSB7XG4gICAgICAgICAgdmlld3MuZm9yRWFjaChcbiAgICAgICAgICAgICAgKG5leHRWaWV3KSA9PiB7IGVscyA9IGVscy5jb25jYXQodGhpcy5fZ2V0Q2hpbGRFbGVtZW50cyhuZXh0VmlldywgbnVsbCkpOyB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZWxzO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHtAbGluayBEZWJ1Z0VsZW1lbnR9IGZvciBhbiB7QGxpbmsgRWxlbWVudFJlZn0uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50UmVmfTogZWxlbWVudFJlZlxuICogQHJldHVybiB7RGVidWdFbGVtZW50fVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zcGVjdEVsZW1lbnQoZWxlbWVudFJlZjogRWxlbWVudFJlZik6IERlYnVnRWxlbWVudCB7XG4gIHJldHVybiBuZXcgRGVidWdFbGVtZW50XygoPEVsZW1lbnRSZWZfPmVsZW1lbnRSZWYpLmludGVybmFsRWxlbWVudCk7XG59XG5cbi8qKlxuICogTWFwcyBhbiBhcnJheSBvZiB7QGxpbmsgRGVidWdFbGVtZW50fXMgdG8gYW4gYXJyYXkgb2YgbmF0aXZlIERPTSBlbGVtZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzTmF0aXZlRWxlbWVudHMoYXJyOiBEZWJ1Z0VsZW1lbnRbXSk6IGFueVtdIHtcbiAgcmV0dXJuIGFyci5tYXAoKGRlYnVnRWwpID0+IGRlYnVnRWwubmF0aXZlRWxlbWVudCk7XG59XG5cbi8qKlxuICogU2V0IG9mIHNjb3BlIGZ1bmN0aW9ucyB1c2VkIHdpdGgge0BsaW5rIERlYnVnRWxlbWVudH0ncyBxdWVyeSBmdW5jdGlvbmFsaXR5LlxuICovXG5leHBvcnQgY2xhc3MgU2NvcGUge1xuICAvKipcbiAgICogU2NvcGUgcXVlcmllcyB0byBib3RoIHRoZSBsaWdodCBkb20gYW5kIHZpZXcgb2YgYW4gZWxlbWVudCBhbmQgaXRzXG4gICAqIGNoaWxkcmVuLlxuICAgKlxuICAgKiAjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBjb3JlL2RlYnVnL3RzL2RlYnVnX2VsZW1lbnQvZGVidWdfZWxlbWVudC50cyByZWdpb249J3Njb3BlX2FsbCd9XG4gICAqL1xuICBzdGF0aWMgYWxsKGRlYnVnRWxlbWVudDogRGVidWdFbGVtZW50KTogRGVidWdFbGVtZW50W10ge1xuICAgIHZhciBzY29wZSA9IFtdO1xuICAgIHNjb3BlLnB1c2goZGVidWdFbGVtZW50KTtcblxuICAgIGRlYnVnRWxlbWVudC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHNjb3BlID0gc2NvcGUuY29uY2F0KFNjb3BlLmFsbChjaGlsZCkpKTtcblxuICAgIGRlYnVnRWxlbWVudC5jb21wb25lbnRWaWV3Q2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiBzY29wZSA9IHNjb3BlLmNvbmNhdChTY29wZS5hbGwoY2hpbGQpKSk7XG5cbiAgICByZXR1cm4gc2NvcGU7XG4gIH1cblxuICAvKipcbiAgICogU2NvcGUgcXVlcmllcyB0byB0aGUgbGlnaHQgZG9tIG9mIGFuIGVsZW1lbnQgYW5kIGl0cyBjaGlsZHJlbi5cbiAgICpcbiAgICogIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgY29yZS9kZWJ1Zy90cy9kZWJ1Z19lbGVtZW50L2RlYnVnX2VsZW1lbnQudHMgcmVnaW9uPSdzY29wZV9saWdodCd9XG4gICAqL1xuICBzdGF0aWMgbGlnaHQoZGVidWdFbGVtZW50OiBEZWJ1Z0VsZW1lbnQpOiBEZWJ1Z0VsZW1lbnRbXSB7XG4gICAgdmFyIHNjb3BlID0gW107XG4gICAgZGVidWdFbGVtZW50LmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgc2NvcGUucHVzaChjaGlsZCk7XG4gICAgICBzY29wZSA9IHNjb3BlLmNvbmNhdChTY29wZS5saWdodChjaGlsZCkpO1xuICAgIH0pO1xuICAgIHJldHVybiBzY29wZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY29wZSBxdWVyaWVzIHRvIHRoZSB2aWV3IG9mIGFuIGVsZW1lbnQgb2YgaXRzIGNoaWxkcmVuLlxuICAgKlxuICAgKiAjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBjb3JlL2RlYnVnL3RzL2RlYnVnX2VsZW1lbnQvZGVidWdfZWxlbWVudC50cyByZWdpb249J3Njb3BlX3ZpZXcnfVxuICAgKi9cbiAgc3RhdGljIHZpZXcoZGVidWdFbGVtZW50OiBEZWJ1Z0VsZW1lbnQpOiBEZWJ1Z0VsZW1lbnRbXSB7XG4gICAgdmFyIHNjb3BlID0gW107XG5cbiAgICBkZWJ1Z0VsZW1lbnQuY29tcG9uZW50Vmlld0NoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgc2NvcGUucHVzaChjaGlsZCk7XG4gICAgICBzY29wZSA9IHNjb3BlLmNvbmNhdChTY29wZS5saWdodChjaGlsZCkpO1xuICAgIH0pO1xuICAgIHJldHVybiBzY29wZTtcbiAgfVxufVxuIl19