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
 */
var DebugElement = (function () {
    function DebugElement() {
    }
    Object.defineProperty(DebugElement.prototype, "componentInstance", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(DebugElement.prototype, "nativeElement", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(DebugElement.prototype, "elementRef", {
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
 * Returns a DebugElement for a ElementRef.
 *
 * @param {ElementRef}: elementRef
 * @return {DebugElement}
 */
function inspectElement(elementRef) {
    return new DebugElement_(view_ref_1.internalView(elementRef.parentView), elementRef.boundElementIndex);
}
exports.inspectElement = inspectElement;
function asNativeElements(arr) {
    return arr.map(function (debugEl) { return debugEl.nativeElement; });
}
exports.asNativeElements = asNativeElements;
var Scope = (function () {
    function Scope() {
    }
    Scope.all = function (debugElement) {
        var scope = [];
        scope.push(debugElement);
        debugElement.children.forEach(function (child) { return scope = scope.concat(Scope.all(child)); });
        debugElement.componentViewChildren.forEach(function (child) { return scope = scope.concat(Scope.all(child)); });
        return scope;
    };
    Scope.light = function (debugElement) {
        var scope = [];
        debugElement.children.forEach(function (child) {
            scope.push(child);
            scope = scope.concat(Scope.light(child));
        });
        return scope;
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdfZWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2RlYnVnL2RlYnVnX2VsZW1lbnQudHMiXSwibmFtZXMiOlsiRGVidWdFbGVtZW50IiwiRGVidWdFbGVtZW50LmNvbnN0cnVjdG9yIiwiRGVidWdFbGVtZW50LmNvbXBvbmVudEluc3RhbmNlIiwiRGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQiLCJEZWJ1Z0VsZW1lbnQuZWxlbWVudFJlZiIsIkRlYnVnRWxlbWVudC5jaGlsZHJlbiIsIkRlYnVnRWxlbWVudC5jb21wb25lbnRWaWV3Q2hpbGRyZW4iLCJEZWJ1Z0VsZW1lbnQucXVlcnkiLCJEZWJ1Z0VsZW1lbnQucXVlcnlBbGwiLCJEZWJ1Z0VsZW1lbnRfIiwiRGVidWdFbGVtZW50Xy5jb25zdHJ1Y3RvciIsIkRlYnVnRWxlbWVudF8uY29tcG9uZW50SW5zdGFuY2UiLCJEZWJ1Z0VsZW1lbnRfLm5hdGl2ZUVsZW1lbnQiLCJEZWJ1Z0VsZW1lbnRfLmVsZW1lbnRSZWYiLCJEZWJ1Z0VsZW1lbnRfLmdldERpcmVjdGl2ZUluc3RhbmNlIiwiRGVidWdFbGVtZW50Xy5jaGlsZHJlbiIsIkRlYnVnRWxlbWVudF8uY29tcG9uZW50Vmlld0NoaWxkcmVuIiwiRGVidWdFbGVtZW50Xy50cmlnZ2VyRXZlbnRIYW5kbGVyIiwiRGVidWdFbGVtZW50Xy5oYXNEaXJlY3RpdmUiLCJEZWJ1Z0VsZW1lbnRfLmluamVjdCIsIkRlYnVnRWxlbWVudF8uZ2V0TG9jYWwiLCJEZWJ1Z0VsZW1lbnRfLl9nZXRDaGlsZEVsZW1lbnRzIiwiaW5zcGVjdEVsZW1lbnQiLCJhc05hdGl2ZUVsZW1lbnRzIiwiU2NvcGUiLCJTY29wZS5jb25zdHJ1Y3RvciIsIlNjb3BlLmFsbCIsIlNjb3BlLmxpZ2h0IiwiU2NvcGUudmlldyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUVsRSwyQkFBNEIs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LENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEVBQXRDQSxDQUFzQ0EsQ0FBQ0EsQ0FBQ0E7UUFFNUZBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2ZBLENBQUNBO0lBQ01GLFdBQUtBLEdBQVpBLFVBQWFBLFlBQTBCQTtRQUNyQ0csSUFBSUEsS0FBS0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDZkEsWUFBWUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQUEsS0FBS0E7WUFDakNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQ2xCQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDSEEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFFTUgsVUFBSUEsR0FBWEEsVUFBWUEsWUFBMEJBO1FBQ3BDSSxJQUFJQSxLQUFLQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUVmQSxZQUFZQSxDQUFDQSxxQkFBcUJBLENBQUNBLE9BQU9BLENBQUNBLFVBQUFBLEtBQUtBO1lBQzlDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNsQkEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLENBQUNBLENBQUNBLENBQUNBO1FBQ0hBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO0lBQ2ZBLENBQUNBO0lBQ0hKLFlBQUNBO0FBQURBLENBQUNBLEFBN0JELElBNkJDO0FBN0JZLGFBQUssUUE2QmpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXIsIFByZWRpY2F0ZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7RWxlbWVudEluamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudF9pbmplY3Rvcic7XG5pbXBvcnQge0FwcFZpZXcsIFZpZXdUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlldyc7XG5pbXBvcnQge2ludGVybmFsVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfcmVmJztcbmltcG9ydCB7RWxlbWVudFJlZiwgRWxlbWVudFJlZl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X3JlZic7XG5cbi8qKlxuICogQSBEZWJ1Z0VsZW1lbnQgY29udGFpbnMgaW5mb3JtYXRpb24gZnJvbSB0aGUgQW5ndWxhciBjb21waWxlciBhYm91dCBhblxuICogZWxlbWVudCBhbmQgcHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnRJbmplY3RvciBhbmRcbiAqIHVuZGVybHlpbmcgRE9NIEVsZW1lbnQsIGFzIHdlbGwgYXMgYSB3YXkgdG8gcXVlcnkgZm9yIGNoaWxkcmVuLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRGVidWdFbGVtZW50IHtcbiAgZ2V0IGNvbXBvbmVudEluc3RhbmNlKCk6IGFueSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgZ2V0IG5hdGl2ZUVsZW1lbnQoKTogYW55IHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICBnZXQgZWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICBhYnN0cmFjdCBnZXREaXJlY3RpdmVJbnN0YW5jZShkaXJlY3RpdmVJbmRleDogbnVtYmVyKTogYW55O1xuXG4gIC8qKlxuICAgKiBHZXQgY2hpbGQgRGVidWdFbGVtZW50cyBmcm9tIHdpdGhpbiB0aGUgTGlnaHQgRE9NLlxuICAgKlxuICAgKiBAcmV0dXJuIHtEZWJ1Z0VsZW1lbnRbXX1cbiAgICovXG4gIGdldCBjaGlsZHJlbigpOiBEZWJ1Z0VsZW1lbnRbXSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcm9vdCBEZWJ1Z0VsZW1lbnQgY2hpbGRyZW4gb2YgYSBjb21wb25lbnQuIFJldHVybnMgYW4gZW1wdHlcbiAgICogbGlzdCBpZiB0aGUgY3VycmVudCBEZWJ1Z0VsZW1lbnQgaXMgbm90IGEgY29tcG9uZW50IHJvb3QuXG4gICAqXG4gICAqIEByZXR1cm4ge0RlYnVnRWxlbWVudFtdfVxuICAgKi9cbiAgZ2V0IGNvbXBvbmVudFZpZXdDaGlsZHJlbigpOiBEZWJ1Z0VsZW1lbnRbXSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgYWJzdHJhY3QgdHJpZ2dlckV2ZW50SGFuZGxlcihldmVudE5hbWU6IHN0cmluZywgZXZlbnRPYmo6IEV2ZW50KTogdm9pZDtcblxuICBhYnN0cmFjdCBoYXNEaXJlY3RpdmUodHlwZTogVHlwZSk6IGJvb2xlYW47XG5cbiAgYWJzdHJhY3QgaW5qZWN0KHR5cGU6IFR5cGUpOiBhbnk7XG5cbiAgYWJzdHJhY3QgZ2V0TG9jYWwobmFtZTogc3RyaW5nKTogYW55O1xuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGZpcnN0IGRlc2NlbmRhbnQgVGVzdEVsZW1lbnQgbWF0Y2hpbmcgdGhlIGdpdmVuIHByZWRpY2F0ZVxuICAgKiBhbmQgc2NvcGUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb246IGJvb2xlYW59IHByZWRpY2F0ZVxuICAgKiBAcGFyYW0ge1Njb3BlfSBzY29wZVxuICAgKlxuICAgKiBAcmV0dXJuIHtEZWJ1Z0VsZW1lbnR9XG4gICAqL1xuICBxdWVyeShwcmVkaWNhdGU6IFByZWRpY2F0ZTxEZWJ1Z0VsZW1lbnQ+LCBzY29wZTogRnVuY3Rpb24gPSBTY29wZS5hbGwpOiBEZWJ1Z0VsZW1lbnQge1xuICAgIHZhciByZXN1bHRzID0gdGhpcy5xdWVyeUFsbChwcmVkaWNhdGUsIHNjb3BlKTtcbiAgICByZXR1cm4gcmVzdWx0cy5sZW5ndGggPiAwID8gcmVzdWx0c1swXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGRlc2NlbmRhbnQgVGVzdEVsZW1lbXRzIG1hdGNoaW5nIHRoZSBnaXZlbiBwcmVkaWNhdGVcbiAgICogYW5kIHNjb3BlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9uOiBib29sZWFufSBwcmVkaWNhdGVcbiAgICogQHBhcmFtIHtTY29wZX0gc2NvcGVcbiAgICpcbiAgICogQHJldHVybiB7RGVidWdFbGVtZW50W119XG4gICAqL1xuICBxdWVyeUFsbChwcmVkaWNhdGU6IFByZWRpY2F0ZTxEZWJ1Z0VsZW1lbnQ+LCBzY29wZTogRnVuY3Rpb24gPSBTY29wZS5hbGwpOiBEZWJ1Z0VsZW1lbnRbXSB7XG4gICAgdmFyIGVsZW1lbnRzSW5TY29wZTogYW55W10gPSBzY29wZSh0aGlzKTtcblxuICAgIHJldHVybiBlbGVtZW50c0luU2NvcGUuZmlsdGVyKHByZWRpY2F0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnRWxlbWVudF8gZXh0ZW5kcyBEZWJ1Z0VsZW1lbnQge1xuICAvKiogQGludGVybmFsICovXG4gIF9lbGVtZW50SW5qZWN0b3I6IEVsZW1lbnRJbmplY3RvcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wYXJlbnRWaWV3OiBBcHBWaWV3LCBwcml2YXRlIF9ib3VuZEVsZW1lbnRJbmRleDogbnVtYmVyKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9lbGVtZW50SW5qZWN0b3IgPSB0aGlzLl9wYXJlbnRWaWV3LmVsZW1lbnRJbmplY3RvcnNbdGhpcy5fYm91bmRFbGVtZW50SW5kZXhdO1xuICB9XG5cbiAgZ2V0IGNvbXBvbmVudEluc3RhbmNlKCk6IGFueSB7XG4gICAgaWYgKCFpc1ByZXNlbnQodGhpcy5fZWxlbWVudEluamVjdG9yKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbGVtZW50SW5qZWN0b3IuZ2V0Q29tcG9uZW50KCk7XG4gIH1cblxuICBnZXQgbmF0aXZlRWxlbWVudCgpOiBhbnkgeyByZXR1cm4gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7IH1cblxuICBnZXQgZWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHsgcmV0dXJuIHRoaXMuX3BhcmVudFZpZXcuZWxlbWVudFJlZnNbdGhpcy5fYm91bmRFbGVtZW50SW5kZXhdOyB9XG5cbiAgZ2V0RGlyZWN0aXZlSW5zdGFuY2UoZGlyZWN0aXZlSW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRJbmplY3Rvci5nZXREaXJlY3RpdmVBdEluZGV4KGRpcmVjdGl2ZUluZGV4KTtcbiAgfVxuXG4gIGdldCBjaGlsZHJlbigpOiBEZWJ1Z0VsZW1lbnRbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldENoaWxkRWxlbWVudHModGhpcy5fcGFyZW50VmlldywgdGhpcy5fYm91bmRFbGVtZW50SW5kZXgpO1xuICB9XG5cbiAgZ2V0IGNvbXBvbmVudFZpZXdDaGlsZHJlbigpOiBEZWJ1Z0VsZW1lbnRbXSB7XG4gICAgdmFyIHNoYWRvd1ZpZXcgPSB0aGlzLl9wYXJlbnRWaWV3LmdldE5lc3RlZFZpZXcodGhpcy5fYm91bmRFbGVtZW50SW5kZXgpO1xuXG4gICAgaWYgKCFpc1ByZXNlbnQoc2hhZG93VmlldykgfHwgc2hhZG93Vmlldy5wcm90by50eXBlICE9PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgIC8vIFRoZSBjdXJyZW50IGVsZW1lbnQgaXMgbm90IGEgY29tcG9uZW50LlxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9nZXRDaGlsZEVsZW1lbnRzKHNoYWRvd1ZpZXcsIG51bGwpO1xuICB9XG5cbiAgdHJpZ2dlckV2ZW50SGFuZGxlcihldmVudE5hbWU6IHN0cmluZywgZXZlbnRPYmo6IEV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5fcGFyZW50Vmlldy50cmlnZ2VyRXZlbnRIYW5kbGVycyhldmVudE5hbWUsIGV2ZW50T2JqLCB0aGlzLl9ib3VuZEVsZW1lbnRJbmRleCk7XG4gIH1cblxuICBoYXNEaXJlY3RpdmUodHlwZTogVHlwZSk6IGJvb2xlYW4ge1xuICAgIGlmICghaXNQcmVzZW50KHRoaXMuX2VsZW1lbnRJbmplY3RvcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRJbmplY3Rvci5oYXNEaXJlY3RpdmUodHlwZSk7XG4gIH1cblxuICBpbmplY3QodHlwZTogVHlwZSk6IGFueSB7XG4gICAgaWYgKCFpc1ByZXNlbnQodGhpcy5fZWxlbWVudEluamVjdG9yKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbGVtZW50SW5qZWN0b3IuZ2V0KHR5cGUpO1xuICB9XG5cbiAgZ2V0TG9jYWwobmFtZTogc3RyaW5nKTogYW55IHsgcmV0dXJuIHRoaXMuX3BhcmVudFZpZXcubG9jYWxzLmdldChuYW1lKTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dldENoaWxkRWxlbWVudHModmlldzogQXBwVmlldywgcGFyZW50Qm91bmRFbGVtZW50SW5kZXg6IG51bWJlcik6IERlYnVnRWxlbWVudFtdIHtcbiAgICB2YXIgZWxzID0gW107XG4gICAgdmFyIHBhcmVudEVsZW1lbnRCaW5kZXIgPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQocGFyZW50Qm91bmRFbGVtZW50SW5kZXgpKSB7XG4gICAgICBwYXJlbnRFbGVtZW50QmluZGVyID0gdmlldy5wcm90by5lbGVtZW50QmluZGVyc1twYXJlbnRCb3VuZEVsZW1lbnRJbmRleCAtIHZpZXcuZWxlbWVudE9mZnNldF07XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5wcm90by5lbGVtZW50QmluZGVycy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGJpbmRlciA9IHZpZXcucHJvdG8uZWxlbWVudEJpbmRlcnNbaV07XG4gICAgICBpZiAoYmluZGVyLnBhcmVudCA9PSBwYXJlbnRFbGVtZW50QmluZGVyKSB7XG4gICAgICAgIGVscy5wdXNoKG5ldyBEZWJ1Z0VsZW1lbnRfKHZpZXcsIHZpZXcuZWxlbWVudE9mZnNldCArIGkpKTtcblxuICAgICAgICB2YXIgdmlld3MgPSB2aWV3LnZpZXdDb250YWluZXJzW3ZpZXcuZWxlbWVudE9mZnNldCArIGldO1xuICAgICAgICBpZiAoaXNQcmVzZW50KHZpZXdzKSkge1xuICAgICAgICAgIHZpZXdzLnZpZXdzLmZvckVhY2goXG4gICAgICAgICAgICAgIChuZXh0VmlldykgPT4geyBlbHMgPSBlbHMuY29uY2F0KHRoaXMuX2dldENoaWxkRWxlbWVudHMobmV4dFZpZXcsIG51bGwpKTsgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVscztcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBEZWJ1Z0VsZW1lbnQgZm9yIGEgRWxlbWVudFJlZi5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnRSZWZ9OiBlbGVtZW50UmVmXG4gKiBAcmV0dXJuIHtEZWJ1Z0VsZW1lbnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnNwZWN0RWxlbWVudChlbGVtZW50UmVmOiBFbGVtZW50UmVmKTogRGVidWdFbGVtZW50IHtcbiAgcmV0dXJuIG5ldyBEZWJ1Z0VsZW1lbnRfKGludGVybmFsVmlldygoPEVsZW1lbnRSZWZfPmVsZW1lbnRSZWYpLnBhcmVudFZpZXcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKDxFbGVtZW50UmVmXz5lbGVtZW50UmVmKS5ib3VuZEVsZW1lbnRJbmRleCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc05hdGl2ZUVsZW1lbnRzKGFycjogRGVidWdFbGVtZW50W10pOiBhbnlbXSB7XG4gIHJldHVybiBhcnIubWFwKChkZWJ1Z0VsKSA9PiBkZWJ1Z0VsLm5hdGl2ZUVsZW1lbnQpO1xufVxuXG5leHBvcnQgY2xhc3MgU2NvcGUge1xuICBzdGF0aWMgYWxsKGRlYnVnRWxlbWVudDogRGVidWdFbGVtZW50KTogRGVidWdFbGVtZW50W10ge1xuICAgIHZhciBzY29wZSA9IFtdO1xuICAgIHNjb3BlLnB1c2goZGVidWdFbGVtZW50KTtcblxuICAgIGRlYnVnRWxlbWVudC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHNjb3BlID0gc2NvcGUuY29uY2F0KFNjb3BlLmFsbChjaGlsZCkpKTtcblxuICAgIGRlYnVnRWxlbWVudC5jb21wb25lbnRWaWV3Q2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiBzY29wZSA9IHNjb3BlLmNvbmNhdChTY29wZS5hbGwoY2hpbGQpKSk7XG5cbiAgICByZXR1cm4gc2NvcGU7XG4gIH1cbiAgc3RhdGljIGxpZ2h0KGRlYnVnRWxlbWVudDogRGVidWdFbGVtZW50KTogRGVidWdFbGVtZW50W10ge1xuICAgIHZhciBzY29wZSA9IFtdO1xuICAgIGRlYnVnRWxlbWVudC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgIHNjb3BlLnB1c2goY2hpbGQpO1xuICAgICAgc2NvcGUgPSBzY29wZS5jb25jYXQoU2NvcGUubGlnaHQoY2hpbGQpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2NvcGU7XG4gIH1cblxuICBzdGF0aWMgdmlldyhkZWJ1Z0VsZW1lbnQ6IERlYnVnRWxlbWVudCk6IERlYnVnRWxlbWVudFtdIHtcbiAgICB2YXIgc2NvcGUgPSBbXTtcblxuICAgIGRlYnVnRWxlbWVudC5jb21wb25lbnRWaWV3Q2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICBzY29wZS5wdXNoKGNoaWxkKTtcbiAgICAgIHNjb3BlID0gc2NvcGUuY29uY2F0KFNjb3BlLmxpZ2h0KGNoaWxkKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNjb3BlO1xuICB9XG59XG4iXX0=