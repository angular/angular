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
 * import {Component} from 'angular2/core';
 * import {NgClass} from 'angular2/common';
 *
 * @Component({
 *   selector: 'toggle-button',
 *   inputs: ['isDisabled'],
 *   template: `
 *      <div class="button" [ngClass]="{active: isOn, disabled: isDisabled}"
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
                    this._renderer.setElementClass(this._ngEl.nativeElement, classes[i], enabled);
                }
            }
            else {
                this._renderer.setElementClass(this._ngEl.nativeElement, className, enabled);
            }
        }
    };
    NgClass = __decorate([
        core_1.Directive({ selector: '[ngClass]', inputs: ['rawClass: ngClass', 'initialClasses: class'] }), 
        __metadata('design:paramtypes', [core_1.IterableDiffers, core_1.KeyValueDiffers, core_1.ElementRef, core_1.Renderer])
    ], NgClass);
    return NgClass;
})();
exports.NgClass = NgClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOlsiTmdDbGFzcyIsIk5nQ2xhc3MuY29uc3RydWN0b3IiLCJOZ0NsYXNzLmluaXRpYWxDbGFzc2VzIiwiTmdDbGFzcy5yYXdDbGFzcyIsIk5nQ2xhc3MubmdEb0NoZWNrIiwiTmdDbGFzcy5uZ09uRGVzdHJveSIsIk5nQ2xhc3MuX2NsZWFudXBDbGFzc2VzIiwiTmdDbGFzcy5fYXBwbHlLZXlWYWx1ZUNoYW5nZXMiLCJOZ0NsYXNzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyIsIk5nQ2xhc3MuX2FwcGx5SW5pdGlhbENsYXNzZXMiLCJOZ0NsYXNzLl9hcHBseUNsYXNzZXMiLCJOZ0NsYXNzLl90b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBQW1FLDBCQUEwQixDQUFDLENBQUE7QUFDOUYscUJBVU8sZUFBZSxDQUFDLENBQUE7QUFDdkIsMkJBQW1ELGdDQUFnQyxDQUFDLENBQUE7QUFFcEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwREc7QUFDSDtJQU9FQSxpQkFBb0JBLGdCQUFpQ0EsRUFBVUEsZ0JBQWlDQSxFQUM1RUEsS0FBaUJBLEVBQVVBLFNBQW1CQTtRQUQ5Q0MscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFpQkE7UUFBVUEscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFpQkE7UUFDNUVBLFVBQUtBLEdBQUxBLEtBQUtBLENBQVlBO1FBQVVBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBSjFEQSxvQkFBZUEsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFJd0NBLENBQUNBO0lBRXRFRCxzQkFBSUEsbUNBQWNBO2FBQWxCQSxVQUFtQkEsQ0FBQ0E7WUFDbEJFLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0Es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QSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtnQkFDaEZBLENBQUNBO1lBQ0hBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxFQUFFQSxTQUFTQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUMvRUEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUF4R0hYO1FBQUNBLGdCQUFTQSxDQUFDQSxFQUFDQSxRQUFRQSxFQUFFQSxXQUFXQSxFQUFFQSxNQUFNQSxFQUFFQSxDQUFDQSxtQkFBbUJBLEVBQUVBLHVCQUF1QkEsQ0FBQ0EsRUFBQ0EsQ0FBQ0E7O2dCQXlHMUZBO0lBQURBLGNBQUNBO0FBQURBLENBQUNBLEFBekdELElBeUdDO0FBeEdZLGVBQU8sVUF3R25CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNTdHJpbmcsIFN0cmluZ1dyYXBwZXIsIGlzQmxhbmssIGlzQXJyYXl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1xuICBEb0NoZWNrLFxuICBPbkRlc3Ryb3ksXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgSXRlcmFibGVEaWZmZXIsXG4gIEl0ZXJhYmxlRGlmZmVycyxcbiAgS2V5VmFsdWVEaWZmZXIsXG4gIEtleVZhbHVlRGlmZmVycyxcbiAgUmVuZGVyZXJcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIGlzTGlzdExpa2VJdGVyYWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBUaGUgYE5nQ2xhc3NgIGRpcmVjdGl2ZSBjb25kaXRpb25hbGx5IGFkZHMgYW5kIHJlbW92ZXMgQ1NTIGNsYXNzZXMgb24gYW4gSFRNTCBlbGVtZW50IGJhc2VkIG9uXG4gKiBhbiBleHByZXNzaW9uJ3MgZXZhbHVhdGlvbiByZXN1bHQuXG4gKlxuICogVGhlIHJlc3VsdCBvZiBhbiBleHByZXNzaW9uIGV2YWx1YXRpb24gaXMgaW50ZXJwcmV0ZWQgZGlmZmVyZW50bHkgZGVwZW5kaW5nIG9uIHR5cGUgb2ZcbiAqIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb24gcmVzdWx0OlxuICogLSBgc3RyaW5nYCAtIGFsbCB0aGUgQ1NTIGNsYXNzZXMgbGlzdGVkIGluIGEgc3RyaW5nIChzcGFjZSBkZWxpbWl0ZWQpIGFyZSBhZGRlZFxuICogLSBgQXJyYXlgIC0gYWxsIHRoZSBDU1MgY2xhc3NlcyAoQXJyYXkgZWxlbWVudHMpIGFyZSBhZGRlZFxuICogLSBgT2JqZWN0YCAtIGVhY2gga2V5IGNvcnJlc3BvbmRzIHRvIGEgQ1NTIGNsYXNzIG5hbWUgd2hpbGUgdmFsdWVzIGFyZSBpbnRlcnByZXRlZCBhcyBleHByZXNzaW9uc1xuICogZXZhbHVhdGluZyB0byBgQm9vbGVhbmAuIElmIGEgZ2l2ZW4gZXhwcmVzc2lvbiBldmFsdWF0ZXMgdG8gYHRydWVgIGEgY29ycmVzcG9uZGluZyBDU1MgY2xhc3NcbiAqIGlzIGFkZGVkIC0gb3RoZXJ3aXNlIGl0IGlzIHJlbW92ZWQuXG4gKlxuICogV2hpbGUgdGhlIGBOZ0NsYXNzYCBkaXJlY3RpdmUgY2FuIGludGVycHJldCBleHByZXNzaW9ucyBldmFsdWF0aW5nIHRvIGBzdHJpbmdgLCBgQXJyYXlgXG4gKiBvciBgT2JqZWN0YCwgdGhlIGBPYmplY3RgLWJhc2VkIHZlcnNpb24gaXMgdGhlIG1vc3Qgb2Z0ZW4gdXNlZCBhbmQgaGFzIGFuIGFkdmFudGFnZSBvZiBrZWVwaW5nXG4gKiBhbGwgdGhlIENTUyBjbGFzcyBuYW1lcyBpbiBhIHRlbXBsYXRlLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9hNFlkdG1XeXdoSjMzdXFmcFBQbj9wPXByZXZpZXcpKTpcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7TmdDbGFzc30gZnJvbSAnYW5ndWxhcjIvY29tbW9uJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICd0b2dnbGUtYnV0dG9uJyxcbiAqICAgaW5wdXRzOiBbJ2lzRGlzYWJsZWQnXSxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvblwiIFtuZ0NsYXNzXT1cInthY3RpdmU6IGlzT24sIGRpc2FibGVkOiBpc0Rpc2FibGVkfVwiXG4gKiAgICAgICAgICAoY2xpY2spPVwidG9nZ2xlKCFpc09uKVwiPlxuICogICAgICAgICAgQ2xpY2sgbWUhXG4gKiAgICAgIDwvZGl2PmAsXG4gKiAgIHN0eWxlczogW2BcbiAqICAgICAuYnV0dG9uIHtcbiAqICAgICAgIHdpZHRoOiAxMjBweDtcbiAqICAgICAgIGJvcmRlcjogbWVkaXVtIHNvbGlkIGJsYWNrO1xuICogICAgIH1cbiAqXG4gKiAgICAgLmFjdGl2ZSB7XG4gKiAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7XG4gKiAgICB9XG4gKlxuICogICAgIC5kaXNhYmxlZCB7XG4gKiAgICAgICBjb2xvcjogZ3JheTtcbiAqICAgICAgIGJvcmRlcjogbWVkaXVtIHNvbGlkIGdyYXk7XG4gKiAgICAgfVxuICogICBgXVxuICogICBkaXJlY3RpdmVzOiBbTmdDbGFzc11cbiAqIH0pXG4gKiBjbGFzcyBUb2dnbGVCdXR0b24ge1xuICogICBpc09uID0gZmFsc2U7XG4gKiAgIGlzRGlzYWJsZWQgPSBmYWxzZTtcbiAqXG4gKiAgIHRvZ2dsZShuZXdTdGF0ZSkge1xuICogICAgIGlmICghdGhpcy5pc0Rpc2FibGVkKSB7XG4gKiAgICAgICB0aGlzLmlzT24gPSBuZXdTdGF0ZTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ0NsYXNzXScsIGlucHV0czogWydyYXdDbGFzczogbmdDbGFzcycsICdpbml0aWFsQ2xhc3NlczogY2xhc3MnXX0pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBpbXBsZW1lbnRzIERvQ2hlY2ssIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX2RpZmZlcjogYW55O1xuICBwcml2YXRlIF9tb2RlOiBzdHJpbmc7XG4gIHByaXZhdGUgX2luaXRpYWxDbGFzc2VzID0gW107XG4gIHByaXZhdGUgX3Jhd0NsYXNzO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyczogSXRlcmFibGVEaWZmZXJzLCBwcml2YXRlIF9rZXlWYWx1ZURpZmZlcnM6IEtleVZhbHVlRGlmZmVycyxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZiwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyKSB7fVxuXG4gIHNldCBpbml0aWFsQ2xhc3Nlcyh2KSB7XG4gICAgdGhpcy5fYXBwbHlJbml0aWFsQ2xhc3Nlcyh0cnVlKTtcbiAgICB0aGlzLl9pbml0aWFsQ2xhc3NlcyA9IGlzUHJlc2VudCh2KSAmJiBpc1N0cmluZyh2KSA/IHYuc3BsaXQoJyAnKSA6IFtdO1xuICAgIHRoaXMuX2FwcGx5SW5pdGlhbENsYXNzZXMoZmFsc2UpO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9yYXdDbGFzcywgZmFsc2UpO1xuICB9XG5cbiAgc2V0IHJhd0NsYXNzKHYpIHtcbiAgICB0aGlzLl9jbGVhbnVwQ2xhc3Nlcyh0aGlzLl9yYXdDbGFzcyk7XG5cbiAgICBpZiAoaXNTdHJpbmcodikpIHtcbiAgICAgIHYgPSB2LnNwbGl0KCcgJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcmF3Q2xhc3MgPSB2O1xuICAgIGlmIChpc1ByZXNlbnQodikpIHtcbiAgICAgIGlmIChpc0xpc3RMaWtlSXRlcmFibGUodikpIHtcbiAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5faXRlcmFibGVEaWZmZXJzLmZpbmQodikuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9tb2RlID0gJ2l0ZXJhYmxlJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2tleVZhbHVlRGlmZmVycy5maW5kKHYpLmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fbW9kZSA9ICdrZXlWYWx1ZSc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RpZmZlciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fZGlmZmVyKSkge1xuICAgICAgdmFyIGNoYW5nZXMgPSB0aGlzLl9kaWZmZXIuZGlmZih0aGlzLl9yYXdDbGFzcyk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZXMpKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2RlID09ICdpdGVyYWJsZScpIHtcbiAgICAgICAgICB0aGlzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hcHBseUtleVZhbHVlQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9jbGVhbnVwQ2xhc3Nlcyh0aGlzLl9yYXdDbGFzcyk7IH1cblxuICBwcml2YXRlIF9jbGVhbnVwQ2xhc3NlcyhyYXdDbGFzc1ZhbCk6IHZvaWQge1xuICAgIHRoaXMuX2FwcGx5Q2xhc3NlcyhyYXdDbGFzc1ZhbCwgdHJ1ZSk7XG4gICAgdGhpcy5fYXBwbHlJbml0aWFsQ2xhc3NlcyhmYWxzZSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUtleVZhbHVlQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4geyB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQ2hhbmdlZEl0ZW0oKHJlY29yZCkgPT4geyB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4ge1xuICAgICAgaWYgKHJlY29yZC5wcmV2aW91c1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5SXRlcmFibGVDaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5pdGVtLCB0cnVlKTsgfSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4geyB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQuaXRlbSwgZmFsc2UpOyB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5SW5pdGlhbENsYXNzZXMoaXNDbGVhbnVwOiBib29sZWFuKSB7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzZXMuZm9yRWFjaChjbGFzc05hbWUgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lLCAhaXNDbGVhbnVwKSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUNsYXNzZXMocmF3Q2xhc3NWYWw6IHN0cmluZ1tdIHwgU2V0PHN0cmluZz58IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNDbGVhbnVwOiBib29sZWFuKSB7XG4gICAgaWYgKGlzUHJlc2VudChyYXdDbGFzc1ZhbCkpIHtcbiAgICAgIGlmIChpc0FycmF5KHJhd0NsYXNzVmFsKSkge1xuICAgICAgICAoPHN0cmluZ1tdPnJhd0NsYXNzVmFsKS5mb3JFYWNoKGNsYXNzTmFtZSA9PiB0aGlzLl90b2dnbGVDbGFzcyhjbGFzc05hbWUsICFpc0NsZWFudXApKTtcbiAgICAgIH0gZWxzZSBpZiAocmF3Q2xhc3NWYWwgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgKDxTZXQ8c3RyaW5nPj5yYXdDbGFzc1ZhbCkuZm9yRWFjaChjbGFzc05hbWUgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lLCAhaXNDbGVhbnVwKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goPHtbazogc3RyaW5nXTogc3RyaW5nfT5yYXdDbGFzc1ZhbCwgKGV4cFZhbCwgY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKGV4cFZhbCkgdGhpcy5fdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lLCAhaXNDbGVhbnVwKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcsIGVuYWJsZWQpOiB2b2lkIHtcbiAgICBjbGFzc05hbWUgPSBjbGFzc05hbWUudHJpbSgpO1xuICAgIGlmIChjbGFzc05hbWUubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKGNsYXNzTmFtZS5pbmRleE9mKCcgJykgPiAtMSkge1xuICAgICAgICB2YXIgY2xhc3NlcyA9IGNsYXNzTmFtZS5zcGxpdCgvXFxzKy9nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNsYXNzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50Q2xhc3ModGhpcy5fbmdFbC5uYXRpdmVFbGVtZW50LCBjbGFzc2VzW2ldLCBlbmFibGVkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudENsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwgY2xhc3NOYW1lLCBlbmFibGVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==