'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOlsiTmdDbGFzcyIsIk5nQ2xhc3MuY29uc3RydWN0b3IiLCJOZ0NsYXNzLmluaXRpYWxDbGFzc2VzIiwiTmdDbGFzcy5yYXdDbGFzcyIsIk5nQ2xhc3MubmdEb0NoZWNrIiwiTmdDbGFzcy5uZ09uRGVzdHJveSIsIk5nQ2xhc3MuX2NsZWFudXBDbGFzc2VzIiwiTmdDbGFzcy5fYXBwbHlLZXlWYWx1ZUNoYW5nZXMiLCJOZ0NsYXNzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyIsIk5nQ2xhc3MuX2FwcGx5SW5pdGlhbENsYXNzZXMiLCJOZ0NsYXNzLl9hcHBseUNsYXNzZXMiLCJOZ0NsYXNzLl90b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQkFBbUUsMEJBQTBCLENBQUMsQ0FBQTtBQUM5RixxQkFVTyxlQUFlLENBQUMsQ0FBQTtBQUN2QiwyQkFBbUQsZ0NBQWdDLENBQUMsQ0FBQTtBQUVwRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeURHO0FBQ0g7SUFPRUEsaUJBQW9CQSxnQkFBaUNBLEVBQVVBLGdCQUFpQ0EsRUFDNUVBLEtBQWlCQSxFQUFVQSxTQUFtQkE7UUFEOUNDLHFCQUFnQkEsR0FBaEJBLGdCQUFnQkEsQ0FBaUJBO1FBQVVBLHFCQUFnQkEsR0FBaEJBLGdCQUFnQkEsQ0FBaUJBO1FBQzVFQSxVQUFLQSxHQUFMQSxLQUFLQSxDQUFZQTtRQUFVQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtRQUoxREEsb0JBQWVBLEdBQUdBLEVBQUVBLENBQUNBO0lBSXdDQSxDQUFDQTtJQUV0RUQsc0JBQUlBLG1DQUFjQTthQUFsQkEsVUFBbUJBLENBQUNBO1lBQ2xCRSxJQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsZUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDdkVBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQzVDQSxDQUFDQTs7O09BQUFGO0lBRURBLHNCQUFJQSw2QkFBUUE7YUFBWkEsVUFBYUEsQ0FBQ0E7WUFDWkcsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFFckNBLEVBQUVBLENBQUNBLENBQUNBLGVBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNoQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLENBQUNBO1lBRURBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLENBQUNBLENBQUNBO1lBQ25CQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pCQSxFQUFFQSxDQUFDQSxDQUFDQSwrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUMxQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDMURBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLFVBQVVBLENBQUNBO2dCQUMxQkEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUNOQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUMxREEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsVUFBVUEsQ0FBQ0E7Z0JBQzFCQSxDQUFDQTtZQUNIQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDdEJBLENBQUNBO1FBQ0hBLENBQUNBOzs7T0FBQUg7SUFFREEsMkJBQVNBLEdBQVRBO1FBQ0VJLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFDaERBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdkJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLElBQUlBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO29CQUM3QkEsSUFBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtnQkFDdENBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDTkEsSUFBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtnQkFDdENBLENBQUNBO1lBQ0hBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURKLDZCQUFXQSxHQUFYQSxjQUFzQkssSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckRMLGlDQUFlQSxHQUF2QkEsVUFBd0JBLFdBQVdBO1FBQ2pDTSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxXQUFXQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN0Q0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNuQ0EsQ0FBQ0E7SUFFT04sdUNBQXFCQSxHQUE3QkEsVUFBOEJBLE9BQVlBO1FBQTFDTyxpQkFRQ0E7UUFQQ0EsT0FBT0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxVQUFDQSxNQUFNQSxJQUFPQSxLQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM5RkEsT0FBT0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxVQUFDQSxNQUFNQSxJQUFPQSxLQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNoR0EsT0FBT0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxVQUFDQSxNQUFNQTtZQUNoQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3pCQSxLQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUN2Q0EsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFT1AsdUNBQXFCQSxHQUE3QkEsVUFBOEJBLE9BQVlBO1FBQTFDUSxpQkFHQ0E7UUFGQ0EsT0FBT0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxVQUFDQSxNQUFNQSxJQUFPQSxLQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNoRkEsT0FBT0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxVQUFDQSxNQUFNQSxJQUFPQSxLQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNyRkEsQ0FBQ0E7SUFFT1Isc0NBQW9CQSxHQUE1QkEsVUFBNkJBLFNBQWtCQTtRQUEvQ1MsaUJBRUNBO1FBRENBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLE9BQU9BLENBQUNBLFVBQUFBLFNBQVNBLElBQUlBLE9BQUFBLEtBQUlBLENBQUNBLFlBQVlBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLFNBQVNBLENBQUNBLEVBQXhDQSxDQUF3Q0EsQ0FBQ0EsQ0FBQ0E7SUFDdEZBLENBQUNBO0lBRU9ULCtCQUFhQSxHQUFyQkEsVUFBc0JBLFdBQTREQSxFQUM1REEsU0FBa0JBO1FBRHhDVSxpQkFhQ0E7UUFYQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDZEEsV0FBWUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQUEsU0FBU0EsSUFBSUEsT0FBQUEsS0FBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBeENBLENBQXdDQSxDQUFDQSxDQUFDQTtZQUN6RkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsWUFBWUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hCQSxXQUFZQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFBQSxTQUFTQSxJQUFJQSxPQUFBQSxLQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUF4Q0EsQ0FBd0NBLENBQUNBLENBQUNBO1lBQzVGQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsNkJBQWdCQSxDQUFDQSxPQUFPQSxDQUF3QkEsV0FBV0EsRUFBRUEsVUFBQ0EsTUFBTUEsRUFBRUEsU0FBU0E7b0JBQzdFQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQTt3QkFBQ0EsS0FBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZEQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNMQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVPViw4QkFBWUEsR0FBcEJBLFVBQXFCQSxTQUFpQkEsRUFBRUEsT0FBT0E7UUFDN0NXLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2hDQSxJQUFJQSxPQUFPQSxHQUFHQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDdENBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO29CQUNuREEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xFQSxDQUFDQTtZQUNIQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsU0FBU0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFDakVBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBeEdIWDtRQUFDQSxnQkFBU0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBRUEsWUFBWUEsRUFBRUEsTUFBTUEsRUFBRUEsQ0FBQ0Esb0JBQW9CQSxFQUFFQSx1QkFBdUJBLENBQUNBLEVBQUNBLENBQUNBOztnQkF5RzVGQTtJQUFEQSxjQUFDQTtBQUFEQSxDQUFDQSxBQXpHRCxJQXlHQztBQXhHWSxlQUFPLFVBd0duQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGlzU3RyaW5nLCBTdHJpbmdXcmFwcGVyLCBpc0JsYW5rLCBpc0FycmF5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtcbiAgRG9DaGVjayxcbiAgT25EZXN0cm95LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEl0ZXJhYmxlRGlmZmVyLFxuICBJdGVyYWJsZURpZmZlcnMsXG4gIEtleVZhbHVlRGlmZmVyLFxuICBLZXlWYWx1ZURpZmZlcnMsXG4gIFJlbmRlcmVyXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBpc0xpc3RMaWtlSXRlcmFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbi8qKlxuICogVGhlIGBOZ0NsYXNzYCBkaXJlY3RpdmUgY29uZGl0aW9uYWxseSBhZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudCBiYXNlZCBvblxuICogYW4gZXhwcmVzc2lvbidzIGV2YWx1YXRpb24gcmVzdWx0LlxuICpcbiAqIFRoZSByZXN1bHQgb2YgYW4gZXhwcmVzc2lvbiBldmFsdWF0aW9uIGlzIGludGVycHJldGVkIGRpZmZlcmVudGx5IGRlcGVuZGluZyBvbiB0eXBlIG9mXG4gKiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0aW9uIHJlc3VsdDpcbiAqIC0gYHN0cmluZ2AgLSBhbGwgdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiBhIHN0cmluZyAoc3BhY2UgZGVsaW1pdGVkKSBhcmUgYWRkZWRcbiAqIC0gYEFycmF5YCAtIGFsbCB0aGUgQ1NTIGNsYXNzZXMgKEFycmF5IGVsZW1lbnRzKSBhcmUgYWRkZWRcbiAqIC0gYE9iamVjdGAgLSBlYWNoIGtleSBjb3JyZXNwb25kcyB0byBhIENTUyBjbGFzcyBuYW1lIHdoaWxlIHZhbHVlcyBhcmUgaW50ZXJwcmV0ZWQgYXMgZXhwcmVzc2lvbnNcbiAqIGV2YWx1YXRpbmcgdG8gYEJvb2xlYW5gLiBJZiBhIGdpdmVuIGV4cHJlc3Npb24gZXZhbHVhdGVzIHRvIGB0cnVlYCBhIGNvcnJlc3BvbmRpbmcgQ1NTIGNsYXNzXG4gKiBpcyBhZGRlZCAtIG90aGVyd2lzZSBpdCBpcyByZW1vdmVkLlxuICpcbiAqIFdoaWxlIHRoZSBgTmdDbGFzc2AgZGlyZWN0aXZlIGNhbiBpbnRlcnByZXQgZXhwcmVzc2lvbnMgZXZhbHVhdGluZyB0byBgc3RyaW5nYCwgYEFycmF5YFxuICogb3IgYE9iamVjdGAsIHRoZSBgT2JqZWN0YC1iYXNlZCB2ZXJzaW9uIGlzIHRoZSBtb3N0IG9mdGVuIHVzZWQgYW5kIGhhcyBhbiBhZHZhbnRhZ2Ugb2Yga2VlcGluZ1xuICogYWxsIHRoZSBDU1MgY2xhc3MgbmFtZXMgaW4gYSB0ZW1wbGF0ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvYTRZZHRtV3l3aEozM3VxZnBQUG4/cD1wcmV2aWV3KSk6XG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgTmdDbGFzc30gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3RvZ2dsZS1idXR0b24nLFxuICogICBpbnB1dHM6IFsnaXNEaXNhYmxlZCddLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uXCIgW25nLWNsYXNzXT1cInthY3RpdmU6IGlzT24sIGRpc2FibGVkOiBpc0Rpc2FibGVkfVwiXG4gKiAgICAgICAgICAoY2xpY2spPVwidG9nZ2xlKCFpc09uKVwiPlxuICogICAgICAgICAgQ2xpY2sgbWUhXG4gKiAgICAgIDwvZGl2PmAsXG4gKiAgIHN0eWxlczogW2BcbiAqICAgICAuYnV0dG9uIHtcbiAqICAgICAgIHdpZHRoOiAxMjBweDtcbiAqICAgICAgIGJvcmRlcjogbWVkaXVtIHNvbGlkIGJsYWNrO1xuICogICAgIH1cbiAqXG4gKiAgICAgLmFjdGl2ZSB7XG4gKiAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7XG4gKiAgICB9XG4gKlxuICogICAgIC5kaXNhYmxlZCB7XG4gKiAgICAgICBjb2xvcjogZ3JheTtcbiAqICAgICAgIGJvcmRlcjogbWVkaXVtIHNvbGlkIGdyYXk7XG4gKiAgICAgfVxuICogICBgXVxuICogICBkaXJlY3RpdmVzOiBbTmdDbGFzc11cbiAqIH0pXG4gKiBjbGFzcyBUb2dnbGVCdXR0b24ge1xuICogICBpc09uID0gZmFsc2U7XG4gKiAgIGlzRGlzYWJsZWQgPSBmYWxzZTtcbiAqXG4gKiAgIHRvZ2dsZShuZXdTdGF0ZSkge1xuICogICAgIGlmICghdGhpcy5pc0Rpc2FibGVkKSB7XG4gKiAgICAgICB0aGlzLmlzT24gPSBuZXdTdGF0ZTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZy1jbGFzc10nLCBpbnB1dHM6IFsncmF3Q2xhc3M6IG5nLWNsYXNzJywgJ2luaXRpYWxDbGFzc2VzOiBjbGFzcyddfSlcbmV4cG9ydCBjbGFzcyBOZ0NsYXNzIGltcGxlbWVudHMgRG9DaGVjaywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBhbnk7XG4gIHByaXZhdGUgX21vZGU6IHN0cmluZztcbiAgcHJpdmF0ZSBfaW5pdGlhbENsYXNzZXMgPSBbXTtcbiAgcHJpdmF0ZSBfcmF3Q2xhc3M7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaXRlcmFibGVEaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsIHByaXZhdGUgX2tleVZhbHVlRGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLFxuICAgICAgICAgICAgICBwcml2YXRlIF9uZ0VsOiBFbGVtZW50UmVmLCBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIpIHt9XG5cbiAgc2V0IGluaXRpYWxDbGFzc2VzKHYpIHtcbiAgICB0aGlzLl9hcHBseUluaXRpYWxDbGFzc2VzKHRydWUpO1xuICAgIHRoaXMuX2luaXRpYWxDbGFzc2VzID0gaXNQcmVzZW50KHYpICYmIGlzU3RyaW5nKHYpID8gdi5zcGxpdCgnICcpIDogW107XG4gICAgdGhpcy5fYXBwbHlJbml0aWFsQ2xhc3NlcyhmYWxzZSk7XG4gICAgdGhpcy5fYXBwbHlDbGFzc2VzKHRoaXMuX3Jhd0NsYXNzLCBmYWxzZSk7XG4gIH1cblxuICBzZXQgcmF3Q2xhc3Modikge1xuICAgIHRoaXMuX2NsZWFudXBDbGFzc2VzKHRoaXMuX3Jhd0NsYXNzKTtcblxuICAgIGlmIChpc1N0cmluZyh2KSkge1xuICAgICAgdiA9IHYuc3BsaXQoJyAnKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yYXdDbGFzcyA9IHY7XG4gICAgaWYgKGlzUHJlc2VudCh2KSkge1xuICAgICAgaWYgKGlzTGlzdExpa2VJdGVyYWJsZSh2KSkge1xuICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9pdGVyYWJsZURpZmZlcnMuZmluZCh2KS5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX21vZGUgPSAnaXRlcmFibGUnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZGlmZmVyID0gdGhpcy5fa2V5VmFsdWVEaWZmZXJzLmZpbmQodikuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9tb2RlID0gJ2tleVZhbHVlJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGlmZmVyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9kaWZmZXIpKSB7XG4gICAgICB2YXIgY2hhbmdlcyA9IHRoaXMuX2RpZmZlci5kaWZmKHRoaXMuX3Jhd0NsYXNzKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoY2hhbmdlcykpIHtcbiAgICAgICAgaWYgKHRoaXMuX21vZGUgPT0gJ2l0ZXJhYmxlJykge1xuICAgICAgICAgIHRoaXMuX2FwcGx5SXRlcmFibGVDaGFuZ2VzKGNoYW5nZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2FwcGx5S2V5VmFsdWVDaGFuZ2VzKGNoYW5nZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX2NsZWFudXBDbGFzc2VzKHRoaXMuX3Jhd0NsYXNzKTsgfVxuXG4gIHByaXZhdGUgX2NsZWFudXBDbGFzc2VzKHJhd0NsYXNzVmFsKTogdm9pZCB7XG4gICAgdGhpcy5fYXBwbHlDbGFzc2VzKHJhd0NsYXNzVmFsLCB0cnVlKTtcbiAgICB0aGlzLl9hcHBseUluaXRpYWxDbGFzc2VzKGZhbHNlKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5S2V5VmFsdWVDaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hDaGFuZ2VkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB7XG4gICAgICBpZiAocmVjb3JkLnByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlJdGVyYWJsZUNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLml0ZW0sIHRydWUpOyB9KTtcbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB7IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5pdGVtLCBmYWxzZSk7IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlJbml0aWFsQ2xhc3Nlcyhpc0NsZWFudXA6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9pbml0aWFsQ2xhc3Nlcy5mb3JFYWNoKGNsYXNzTmFtZSA9PiB0aGlzLl90b2dnbGVDbGFzcyhjbGFzc05hbWUsICFpc0NsZWFudXApKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2xhc3NlcyhyYXdDbGFzc1ZhbDogc3RyaW5nW10gfCBTZXQ8c3RyaW5nPnwge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0NsZWFudXA6IGJvb2xlYW4pIHtcbiAgICBpZiAoaXNQcmVzZW50KHJhd0NsYXNzVmFsKSkge1xuICAgICAgaWYgKGlzQXJyYXkocmF3Q2xhc3NWYWwpKSB7XG4gICAgICAgICg8c3RyaW5nW10+cmF3Q2xhc3NWYWwpLmZvckVhY2goY2xhc3NOYW1lID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGNsYXNzTmFtZSwgIWlzQ2xlYW51cCkpO1xuICAgICAgfSBlbHNlIGlmIChyYXdDbGFzc1ZhbCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAoPFNldDxzdHJpbmc+PnJhd0NsYXNzVmFsKS5mb3JFYWNoKGNsYXNzTmFtZSA9PiB0aGlzLl90b2dnbGVDbGFzcyhjbGFzc05hbWUsICFpc0NsZWFudXApKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCg8e1trOiBzdHJpbmddOiBzdHJpbmd9PnJhd0NsYXNzVmFsLCAoZXhwVmFsLCBjbGFzc05hbWUpID0+IHtcbiAgICAgICAgICBpZiAoZXhwVmFsKSB0aGlzLl90b2dnbGVDbGFzcyhjbGFzc05hbWUsICFpc0NsZWFudXApO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF90b2dnbGVDbGFzcyhjbGFzc05hbWU6IHN0cmluZywgZW5hYmxlZCk6IHZvaWQge1xuICAgIGNsYXNzTmFtZSA9IGNsYXNzTmFtZS50cmltKCk7XG4gICAgaWYgKGNsYXNzTmFtZS5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoY2xhc3NOYW1lLmluZGV4T2YoJyAnKSA+IC0xKSB7XG4gICAgICAgIHZhciBjbGFzc2VzID0gY2xhc3NOYW1lLnNwbGl0KC9cXHMrL2cpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2xhc3Nlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldEVsZW1lbnRDbGFzcyh0aGlzLl9uZ0VsLCBjbGFzc2VzW2ldLCBlbmFibGVkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudENsYXNzKHRoaXMuX25nRWwsIGNsYXNzTmFtZSwgZW5hYmxlZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=