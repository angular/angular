'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var collection_1 = require('angular2/src/facade/collection');
/**
 * The `NgClass` directive conditionally adds and removes CSS classes on an HTML element based on
 * an expression's evaluation result.
 *
 * The result of an expression evaluation is interpreted differently depending on type of
 * the expression evaluation result:
 * - `string` - all the CSS classes listed in a string (space delimited) are added
 * - `Array` - all the CSS classes (Array elements) are added
 * - `Object` - each key corresponds to a CSS class name while values are interpreted as expressions
 * evaluating to `Boolean`. If a given expression evaluates to `true` a corresponding CSS class
 * is added - otherwise it is removed.
 *
 * While the `NgClass` directive can interpret expressions evaluating to `string`, `Array`
 * or `Object`, the `Object`-based version is the most often used and has an advantage of keeping
 * all the CSS class names in a template.
 *
 * ### Example ([live demo](http://plnkr.co/edit/a4YdtmWywhJ33uqfpPPn?p=preview)):
 *
 * ```
 * import {Component, NgClass} from 'angular2/angular2';
 *
 * @Component({
 *   selector: 'toggle-button',
 *   inputs: ['isDisabled'],
 *   template: `
 *      <div class="button" [ng-class]="{active: isOn, disabled: isDisabled}"
 *          (click)="toggle(!isOn)">
 *          Click me!
 *      </div>`,
 *   styles: [`
 *     .button {
 *       width: 120px;
 *       border: medium solid black;
 *     }
 *
 *     .active {
 *       background-color: red;
 *    }
 *
 *     .disabled {
 *       color: gray;
 *       border: medium solid gray;
 *     }
 *   `]
 *   directives: [NgClass]
 * })
 * class ToggleButton {
 *   isOn = false;
 *   isDisabled = false;
 *
 *   toggle(newState) {
 *     if (!this.isDisabled) {
 *       this.isOn = newState;
 *     }
 *   }
 * }
 * ```
 */
var NgClass = (function () {
    function NgClass(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._initialClasses = [];
    }
    Object.defineProperty(NgClass.prototype, "initialClasses", {
        set: function (v) {
            this._applyInitialClasses(true);
            this._initialClasses = lang_1.isPresent(v) && lang_1.isString(v) ? v.split(' ') : [];
            this._applyInitialClasses(false);
            this._applyClasses(this._rawClass, false);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgClass.prototype, "rawClass", {
        set: function (v) {
            this._cleanupClasses(this._rawClass);
            if (lang_1.isString(v)) {
                v = v.split(' ');
            }
            this._rawClass = v;
            if (lang_1.isPresent(v)) {
                if (collection_1.isListLikeIterable(v)) {
                    this._differ = this._iterableDiffers.find(v).create(null);
                    this._mode = 'iterable';
                }
                else {
                    this._differ = this._keyValueDiffers.find(v).create(null);
                    this._mode = 'keyValue';
                }
            }
            else {
                this._differ = null;
            }
        },
        enumerable: true,
        configurable: true
    });
    NgClass.prototype.ngDoCheck = function () {
        if (lang_1.isPresent(this._differ)) {
            var changes = this._differ.diff(this._rawClass);
            if (lang_1.isPresent(changes)) {
                if (this._mode == 'iterable') {
                    this._applyIterableChanges(changes);
                }
                else {
                    this._applyKeyValueChanges(changes);
                }
            }
        }
    };
    NgClass.prototype.ngOnDestroy = function () { this._cleanupClasses(this._rawClass); };
    NgClass.prototype._cleanupClasses = function (rawClassVal) {
        this._applyClasses(rawClassVal, true);
        this._applyInitialClasses(false);
    };
    NgClass.prototype._applyKeyValueChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { _this._toggleClass(record.key, record.currentValue); });
        changes.forEachChangedItem(function (record) { _this._toggleClass(record.key, record.currentValue); });
        changes.forEachRemovedItem(function (record) {
            if (record.previousValue) {
                _this._toggleClass(record.key, false);
            }
        });
    };
    NgClass.prototype._applyIterableChanges = function (changes) {
        var _this = this;
        changes.forEachAddedItem(function (record) { _this._toggleClass(record.item, true); });
        changes.forEachRemovedItem(function (record) { _this._toggleClass(record.item, false); });
    };
    NgClass.prototype._applyInitialClasses = function (isCleanup) {
        var _this = this;
        this._initialClasses.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
    };
    NgClass.prototype._applyClasses = function (rawClassVal, isCleanup) {
        var _this = this;
        if (lang_1.isPresent(rawClassVal)) {
            if (lang_1.isArray(rawClassVal)) {
                rawClassVal.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
            }
            else if (rawClassVal instanceof Set) {
                rawClassVal.forEach(function (className) { return _this._toggleClass(className, !isCleanup); });
            }
            else {
                collection_1.StringMapWrapper.forEach(rawClassVal, function (expVal, className) {
                    if (expVal)
                        _this._toggleClass(className, !isCleanup);
                });
            }
        }
    };
    NgClass.prototype._toggleClass = function (className, enabled) {
        className = className.trim();
        if (className.length > 0) {
            if (className.indexOf(' ') > -1) {
                var classes = className.split(/\s+/g);
                for (var i = 0, len = classes.length; i < len; i++) {
                    this._renderer.setElementClass(this._ngEl, classes[i], enabled);
                }
            }
            else {
                this._renderer.setElementClass(this._ngEl, className, enabled);
            }
        }
    };
    NgClass = __decorate([
        core_1.Directive({ selector: '[ng-class]', inputs: ['rawClass: ng-class', 'initialClasses: class'] }), 
        __metadata('design:paramtypes', [core_1.IterableDiffers, core_1.KeyValueDiffers, core_1.ElementRef, core_1.Renderer])
    ], NgClass);
    return NgClass;
})();
exports.NgClass = NgClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOlsiTmdDbGFzcyIsIk5nQ2xhc3MuY29uc3RydWN0b3IiLCJOZ0NsYXNzLmluaXRpYWxDbGFzc2VzIiwiTmdDbGFzcy5yYXdDbGFzcyIsIk5nQ2xhc3MubmdEb0NoZWNrIiwiTmdDbGFzcy5uZ09uRGVzdHJveSIsIk5nQ2xhc3MuX2NsZWFudXBDbGFzc2VzIiwiTmdDbGFzcy5fYXBwbHlLZXlWYWx1ZUNoYW5nZXMiLCJOZ0NsYXNzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyIsIk5nQ2xhc3MuX2FwcGx5SW5pdGlhbENsYXNzZXMiLCJOZ0NsYXNzLl9hcHBseUNsYXNzZXMiLCJOZ0NsYXNzLl90b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBQW1FLDBCQUEwQixDQUFDLENBQUE7QUFDOUYscUJBVU8sZUFBZSxDQUFDLENBQUE7QUFDdkIsMkJBQW1ELGdDQUFnQyxDQUFDLENBQUE7QUFFcEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlERztBQUNIO0lBT0VBLGlCQUFvQkEsZ0JBQWlDQSxFQUFVQSxnQkFBaUNBLEVBQzVFQSxLQUFpQkEsRUFBVUEsU0FBbUJBO1FBRDlDQyxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQWlCQTtRQUFVQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQWlCQTtRQUM1RUEsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBWUE7UUFBVUEsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7UUFKMURBLG9CQUFlQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUl3Q0EsQ0FBQ0E7SUFFdEVELHNCQUFJQSxtQ0FBY0E7YUFBbEJBLFVBQW1CQSxDQUFDQTtZQUNsQkUsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxJ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LENBQUNBLENBQUNBLENBQUNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO2dCQUNsRUEsQ0FBQ0E7WUFDSEEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLFNBQVNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1lBQ2pFQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQXhHSFg7UUFBQ0EsZ0JBQVNBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLFlBQVlBLEVBQUVBLE1BQU1BLEVBQUVBLENBQUNBLG9CQUFvQkEsRUFBRUEsdUJBQXVCQSxDQUFDQSxFQUFDQSxDQUFDQTs7Z0JBeUc1RkE7SUFBREEsY0FBQ0E7QUFBREEsQ0FBQ0EsQUF6R0QsSUF5R0M7QUF4R1ksZUFBTyxVQXdHbkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc1N0cmluZywgU3RyaW5nV3JhcHBlciwgaXNCbGFuaywgaXNBcnJheX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7XG4gIERvQ2hlY2ssXG4gIE9uRGVzdHJveSxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJdGVyYWJsZURpZmZlcixcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBLZXlWYWx1ZURpZmZlcixcbiAgS2V5VmFsdWVEaWZmZXJzLFxuICBSZW5kZXJlclxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlciwgaXNMaXN0TGlrZUl0ZXJhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG4vKipcbiAqIFRoZSBgTmdDbGFzc2AgZGlyZWN0aXZlIGNvbmRpdGlvbmFsbHkgYWRkcyBhbmQgcmVtb3ZlcyBDU1MgY2xhc3NlcyBvbiBhbiBIVE1MIGVsZW1lbnQgYmFzZWQgb25cbiAqIGFuIGV4cHJlc3Npb24ncyBldmFsdWF0aW9uIHJlc3VsdC5cbiAqXG4gKiBUaGUgcmVzdWx0IG9mIGFuIGV4cHJlc3Npb24gZXZhbHVhdGlvbiBpcyBpbnRlcnByZXRlZCBkaWZmZXJlbnRseSBkZXBlbmRpbmcgb24gdHlwZSBvZlxuICogdGhlIGV4cHJlc3Npb24gZXZhbHVhdGlvbiByZXN1bHQ6XG4gKiAtIGBzdHJpbmdgIC0gYWxsIHRoZSBDU1MgY2xhc3NlcyBsaXN0ZWQgaW4gYSBzdHJpbmcgKHNwYWNlIGRlbGltaXRlZCkgYXJlIGFkZGVkXG4gKiAtIGBBcnJheWAgLSBhbGwgdGhlIENTUyBjbGFzc2VzIChBcnJheSBlbGVtZW50cykgYXJlIGFkZGVkXG4gKiAtIGBPYmplY3RgIC0gZWFjaCBrZXkgY29ycmVzcG9uZHMgdG8gYSBDU1MgY2xhc3MgbmFtZSB3aGlsZSB2YWx1ZXMgYXJlIGludGVycHJldGVkIGFzIGV4cHJlc3Npb25zXG4gKiBldmFsdWF0aW5nIHRvIGBCb29sZWFuYC4gSWYgYSBnaXZlbiBleHByZXNzaW9uIGV2YWx1YXRlcyB0byBgdHJ1ZWAgYSBjb3JyZXNwb25kaW5nIENTUyBjbGFzc1xuICogaXMgYWRkZWQgLSBvdGhlcndpc2UgaXQgaXMgcmVtb3ZlZC5cbiAqXG4gKiBXaGlsZSB0aGUgYE5nQ2xhc3NgIGRpcmVjdGl2ZSBjYW4gaW50ZXJwcmV0IGV4cHJlc3Npb25zIGV2YWx1YXRpbmcgdG8gYHN0cmluZ2AsIGBBcnJheWBcbiAqIG9yIGBPYmplY3RgLCB0aGUgYE9iamVjdGAtYmFzZWQgdmVyc2lvbiBpcyB0aGUgbW9zdCBvZnRlbiB1c2VkIGFuZCBoYXMgYW4gYWR2YW50YWdlIG9mIGtlZXBpbmdcbiAqIGFsbCB0aGUgQ1NTIGNsYXNzIG5hbWVzIGluIGEgdGVtcGxhdGUuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2E0WWR0bVd5d2hKMzN1cWZwUFBuP3A9cHJldmlldykpOlxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIE5nQ2xhc3N9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICd0b2dnbGUtYnV0dG9uJyxcbiAqICAgaW5wdXRzOiBbJ2lzRGlzYWJsZWQnXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvblwiIFtuZy1jbGFzc109XCJ7YWN0aXZlOiBpc09uLCBkaXNhYmxlZDogaXNEaXNhYmxlZH1cIlxuICogICAgICAgICAgKGNsaWNrKT1cInRvZ2dsZSghaXNPbilcIj5cbiAqICAgICAgICAgIENsaWNrIG1lIVxuICogICAgICA8L2Rpdj5gLFxuICogICBzdHlsZXM6IFtgXG4gKiAgICAgLmJ1dHRvbiB7XG4gKiAgICAgICB3aWR0aDogMTIwcHg7XG4gKiAgICAgICBib3JkZXI6IG1lZGl1bSBzb2xpZCBibGFjaztcbiAqICAgICB9XG4gKlxuICogICAgIC5hY3RpdmUge1xuICogICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xuICogICAgfVxuICpcbiAqICAgICAuZGlzYWJsZWQge1xuICogICAgICAgY29sb3I6IGdyYXk7XG4gKiAgICAgICBib3JkZXI6IG1lZGl1bSBzb2xpZCBncmF5O1xuICogICAgIH1cbiAqICAgYF1cbiAqICAgZGlyZWN0aXZlczogW05nQ2xhc3NdXG4gKiB9KVxuICogY2xhc3MgVG9nZ2xlQnV0dG9uIHtcbiAqICAgaXNPbiA9IGZhbHNlO1xuICogICBpc0Rpc2FibGVkID0gZmFsc2U7XG4gKlxuICogICB0b2dnbGUobmV3U3RhdGUpIHtcbiAqICAgICBpZiAoIXRoaXMuaXNEaXNhYmxlZCkge1xuICogICAgICAgdGhpcy5pc09uID0gbmV3U3RhdGU7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmctY2xhc3NdJywgaW5wdXRzOiBbJ3Jhd0NsYXNzOiBuZy1jbGFzcycsICdpbml0aWFsQ2xhc3NlczogY2xhc3MnXX0pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBpbXBsZW1lbnRzIERvQ2hlY2ssIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2RpZmZlcjogYW55O1xuICBwcml2YXRlIF9tb2RlOiBzdHJpbmc7XG4gIHByaXZhdGUgX2luaXRpYWxDbGFzc2VzID0gW107XG4gIHByaXZhdGUgX3Jhd0NsYXNzO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyczogSXRlcmFibGVEaWZmZXJzLCBwcml2YXRlIF9rZXlWYWx1ZURpZmZlcnM6IEtleVZhbHVlRGlmZmVycyxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZiwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyKSB7fVxuXG4gIHNldCBpbml0aWFsQ2xhc3Nlcyh2KSB7XG4gICAgdGhpcy5fYXBwbHlJbml0aWFsQ2xhc3Nlcyh0cnVlKTtcbiAgICB0aGlzLl9pbml0aWFsQ2xhc3NlcyA9IGlzUHJlc2VudCh2KSAmJiBpc1N0cmluZyh2KSA/IHYuc3BsaXQoJyAnKSA6IFtdO1xuICAgIHRoaXMuX2FwcGx5SW5pdGlhbENsYXNzZXMoZmFsc2UpO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9yYXdDbGFzcywgZmFsc2UpO1xuICB9XG5cbiAgc2V0IHJhd0NsYXNzKHYpIHtcbiAgICB0aGlzLl9jbGVhbnVwQ2xhc3Nlcyh0aGlzLl9yYXdDbGFzcyk7XG5cbiAgICBpZiAoaXNTdHJpbmcodikpIHtcbiAgICAgIHYgPSB2LnNwbGl0KCcgJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcmF3Q2xhc3MgPSB2O1xuICAgIGlmIChpc1ByZXNlbnQodikpIHtcbiAgICAgIGlmIChpc0xpc3RMaWtlSXRlcmFibGUodikpIHtcbiAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5faXRlcmFibGVEaWZmZXJzLmZpbmQodikuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9tb2RlID0gJ2l0ZXJhYmxlJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2tleVZhbHVlRGlmZmVycy5maW5kKHYpLmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fbW9kZSA9ICdrZXlWYWx1ZSc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RpZmZlciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fZGlmZmVyKSkge1xuICAgICAgdmFyIGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9yYXdDbGFzcyk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZXMpKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2RlID09ICdpdGVyYWJsZScpIHtcbiAgICAgICAgICB0aGlzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hcHBseUtleVZhbHVlQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9jbGVhbnVwQ2xhc3Nlcyh0aGlzLl9yYXdDbGFzcyk7IH1cblxuICBwcml2YXRlIF9jbGVhbnVwQ2xhc3NlcyhyYXdDbGFzc1ZhbCk6IHZvaWQge1xuICAgIHRoaXMuX2FwcGx5Q2xhc3NlcyhyYXdDbGFzc1ZhbCwgdHJ1ZSk7XG4gICAgdGhpcy5fYXBwbHlJbml0aWFsQ2xhc3NlcyhmYWxzZSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUtleVZhbHVlQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4geyB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQ2hhbmdlZEl0ZW0oKHJlY29yZCkgPT4geyB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4ge1xuICAgICAgaWYgKHJlY29yZC5wcmV2aW91c1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5SXRlcmFibGVDaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5pdGVtLCB0cnVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4geyB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQuaXRlbSwgZmFsc2UpOyB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5SW5pdGlhbENsYXNzZXMoaXNDbGVhbnVwOiBib29sZWFuKSB7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzZXMuZm9yRWFjaChjbGFzc05hbWUgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lLCAhaXNDbGVhbnVwKSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNsYXNzZXMocmF3Q2xhc3NWYWw6IHN0cmluZ1tdIHwgU2V0PHN0cmluZz58IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNDbGVhbnVwOiBib29sZWFuKSB7XG4gICAgaWYgKGlzUHJlc2VudChyYXdDbGFzc1ZhbCkpIHtcbiAgICAgIGlmIChpc0FycmF5KHJhd0NsYXNzVmFsKSkge1xuICAgICAgICAoPHN0cmluZ1tdPnJhd0NsYXNzVmFsKS5mb3JFYWNoKGNsYXNzTmFtZSA9PiB0aGlzLl90b2dnbGVDbGFzcyhjbGFzc05hbWUsICFpc0NsZWFudXApKTtcbiAgICAgIH0gZWxzZSBpZiAocmF3Q2xhc3NWYWwgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgKDxTZXQ8c3RyaW5nPj5yYXdDbGFzc1ZhbCkuZm9yRWFjaChjbGFzc05hbWUgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lLCAhaXNDbGVhbnVwKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goPHtbazogc3RyaW5nXTogc3RyaW5nfT5yYXdDbGFzc1ZhbCwgKGV4cFZhbCwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKGV4cFZhbCkgdGhpcy5fdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lLCAhaXNDbGVhbnVwKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcsIGVuYWJsZWQpOiB2b2lkIHtcbiAgICBjbGFzc05hbWUgPSBjbGFzc05hbWUudHJpbSgpO1xuICAgIGlmIChjbGFzc05hbWUubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCcgJykgPiAtMSkge1xuICAgICAgICB2YXIgY2xhc3NlcyA9IGNsYXNzTmFtZS5zcGxpdCgvXFxzKy9nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNsYXNzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50Q2xhc3ModGhpcy5fbmdFbCwgY2xhc3Nlc1tpXSwgZW5hYmxlZCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRDbGFzcyh0aGlzLl9uZ0VsLCBjbGFzc05hbWUsIGVuYWJsZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19