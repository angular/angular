var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isPresent, isString, isArray } from 'angular2/src/facade/lang';
import { Directive, ElementRef, IterableDiffers, KeyValueDiffers, Renderer } from 'angular2/core';
import { StringMapWrapper, isListLikeIterable } from 'angular2/src/facade/collection';
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
export let NgClass = class {
    constructor(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._initialClasses = [];
    }
    set initialClasses(v) {
        this._applyInitialClasses(true);
        this._initialClasses = isPresent(v) && isString(v) ? v.split(' ') : [];
        this._applyInitialClasses(false);
        this._applyClasses(this._rawClass, false);
    }
    set rawClass(v) {
        this._cleanupClasses(this._rawClass);
        if (isString(v)) {
            v = v.split(' ');
        }
        this._rawClass = v;
        if (isPresent(v)) {
            if (isListLikeIterable(v)) {
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
    }
    ngDoCheck() {
        if (isPresent(this._differ)) {
            var changes = this._differ.diff(this._rawClass);
            if (isPresent(changes)) {
                if (this._mode == 'iterable') {
                    this._applyIterableChanges(changes);
                }
                else {
                    this._applyKeyValueChanges(changes);
                }
            }
        }
    }
    ngOnDestroy() { this._cleanupClasses(this._rawClass); }
    _cleanupClasses(rawClassVal) {
        this._applyClasses(rawClassVal, true);
        this._applyInitialClasses(false);
    }
    _applyKeyValueChanges(changes) {
        changes.forEachAddedItem((record) => { this._toggleClass(record.key, record.currentValue); });
        changes.forEachChangedItem((record) => { this._toggleClass(record.key, record.currentValue); });
        changes.forEachRemovedItem((record) => {
            if (record.previousValue) {
                this._toggleClass(record.key, false);
            }
        });
    }
    _applyIterableChanges(changes) {
        changes.forEachAddedItem((record) => { this._toggleClass(record.item, true); });
        changes.forEachRemovedItem((record) => { this._toggleClass(record.item, false); });
    }
    _applyInitialClasses(isCleanup) {
        this._initialClasses.forEach(className => this._toggleClass(className, !isCleanup));
    }
    _applyClasses(rawClassVal, isCleanup) {
        if (isPresent(rawClassVal)) {
            if (isArray(rawClassVal)) {
                rawClassVal.forEach(className => this._toggleClass(className, !isCleanup));
            }
            else if (rawClassVal instanceof Set) {
                rawClassVal.forEach(className => this._toggleClass(className, !isCleanup));
            }
            else {
                StringMapWrapper.forEach(rawClassVal, (expVal, className) => {
                    if (expVal)
                        this._toggleClass(className, !isCleanup);
                });
            }
        }
    }
    _toggleClass(className, enabled) {
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
    }
};
NgClass = __decorate([
    Directive({ selector: '[ngClass]', inputs: ['rawClass: ngClass', 'initialClasses: class'] }), 
    __metadata('design:paramtypes', [IterableDiffers, KeyValueDiffers, ElementRef, Renderer])
], NgClass);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOlsiTmdDbGFzcyIsIk5nQ2xhc3MuY29uc3RydWN0b3IiLCJOZ0NsYXNzLmluaXRpYWxDbGFzc2VzIiwiTmdDbGFzcy5yYXdDbGFzcyIsIk5nQ2xhc3MubmdEb0NoZWNrIiwiTmdDbGFzcy5uZ09uRGVzdHJveSIsIk5nQ2xhc3MuX2NsZWFudXBDbGFzc2VzIiwiTmdDbGFzcy5fYXBwbHlLZXlWYWx1ZUNoYW5nZXMiLCJOZ0NsYXNzLl9hcHBseUl0ZXJhYmxlQ2hhbmdlcyIsIk5nQ2xhc3MuX2FwcGx5SW5pdGlhbENsYXNzZXMiLCJOZ0NsYXNzLl9hcHBseUNsYXNzZXMiLCJOZ0NsYXNzLl90b2dnbGVDbGFzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsUUFBUSxFQUEwQixPQUFPLEVBQUMsTUFBTSwwQkFBMEI7T0FDdEYsRUFHTCxTQUFTLEVBQ1QsVUFBVSxFQUVWLGVBQWUsRUFFZixlQUFlLEVBQ2YsUUFBUSxFQUNULE1BQU0sZUFBZTtPQUNmLEVBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxnQ0FBZ0M7QUFFbkY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwREc7QUFDSDtJQU9FQSxZQUFvQkEsZ0JBQWlDQSxFQUFVQSxnQkFBaUNBLEVBQzVFQSxLQUFpQkEsRUFBVUEsU0FBbUJBO1FBRDlDQyxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQWlCQTtRQUFVQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQWlCQTtRQUM1RUEsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBWUE7UUFBVUEsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7UUFKMURBLG9CQUFlQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUl3Q0EsQ0FBQ0E7SUFFdEVELElBQUlBLGNBQWNBLENBQUNBLENBQUNBO1FBQ2xCRSxJQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2hDQSxJQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUN2RUEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNqQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDNUNBLENBQUNBO0lBRURGLElBQUlBLFFBQVFBLENBQUNBLENBQUNBO1FBQ1pHLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBRXJDQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBRURBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ25CQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzFEQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxVQUFVQSxDQUFDQTtZQUMxQkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzFEQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxVQUFVQSxDQUFDQTtZQUMxQkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURILFNBQVNBO1FBQ1BJLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUNoREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDN0JBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ05BLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxDQUFDQTtZQUNIQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVESixXQUFXQSxLQUFXSyxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyREwsZUFBZUEsQ0FBQ0EsV0FBV0E7UUFDakNNLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ3RDQSxJQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQ25DQSxDQUFDQTtJQUVPTixxQkFBcUJBLENBQUNBLE9BQVlBO1FBQ3hDTyxPQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLE1BQU1BLE9BQU9BLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzlGQSxPQUFPQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBLE1BQU1BLE9BQU9BLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ2hHQSxPQUFPQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBLE1BQU1BO1lBQ2hDQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekJBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3ZDQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUVPUCxxQkFBcUJBLENBQUNBLE9BQVlBO1FBQ3hDUSxPQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLE1BQU1BLE9BQU9BLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ2hGQSxPQUFPQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBLE1BQU1BLE9BQU9BLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3JGQSxDQUFDQTtJQUVPUixvQkFBb0JBLENBQUNBLFNBQWtCQTtRQUM3Q1MsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsSUFBSUEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDdEZBLENBQUNBO0lBRU9ULGFBQWFBLENBQUNBLFdBQTREQSxFQUM1REEsU0FBa0JBO1FBQ3RDVSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2RBLFdBQVlBLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLElBQUlBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pGQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxZQUFZQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDeEJBLFdBQVlBLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLElBQUlBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVGQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsZ0JBQWdCQSxDQUFDQSxPQUFPQSxDQUF3QkEsV0FBV0EsRUFBRUEsQ0FBQ0EsTUFBTUEsRUFBRUEsU0FBU0E7b0JBQzdFQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQTt3QkFBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZEQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNMQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVPVixZQUFZQSxDQUFDQSxTQUFpQkEsRUFBRUEsT0FBT0E7UUFDN0NXLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2hDQSxJQUFJQSxPQUFPQSxHQUFHQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDdENBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO29CQUNuREEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xFQSxDQUFDQTtZQUNIQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsU0FBU0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFDakVBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0FBQ0hYLENBQUNBO0FBekdEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSx1QkFBdUIsQ0FBQyxFQUFDLENBQUM7O1lBeUcxRjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGlzU3RyaW5nLCBTdHJpbmdXcmFwcGVyLCBpc0JsYW5rLCBpc0FycmF5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtcbiAgRG9DaGVjayxcbiAgT25EZXN0cm95LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEl0ZXJhYmxlRGlmZmVyLFxuICBJdGVyYWJsZURpZmZlcnMsXG4gIEtleVZhbHVlRGlmZmVyLFxuICBLZXlWYWx1ZURpZmZlcnMsXG4gIFJlbmRlcmVyXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBpc0xpc3RMaWtlSXRlcmFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbi8qKlxuICogVGhlIGBOZ0NsYXNzYCBkaXJlY3RpdmUgY29uZGl0aW9uYWxseSBhZGRzIGFuZCByZW1vdmVzIENTUyBjbGFzc2VzIG9uIGFuIEhUTUwgZWxlbWVudCBiYXNlZCBvblxuICogYW4gZXhwcmVzc2lvbidzIGV2YWx1YXRpb24gcmVzdWx0LlxuICpcbiAqIFRoZSByZXN1bHQgb2YgYW4gZXhwcmVzc2lvbiBldmFsdWF0aW9uIGlzIGludGVycHJldGVkIGRpZmZlcmVudGx5IGRlcGVuZGluZyBvbiB0eXBlIG9mXG4gKiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0aW9uIHJlc3VsdDpcbiAqIC0gYHN0cmluZ2AgLSBhbGwgdGhlIENTUyBjbGFzc2VzIGxpc3RlZCBpbiBhIHN0cmluZyAoc3BhY2UgZGVsaW1pdGVkKSBhcmUgYWRkZWRcbiAqIC0gYEFycmF5YCAtIGFsbCB0aGUgQ1NTIGNsYXNzZXMgKEFycmF5IGVsZW1lbnRzKSBhcmUgYWRkZWRcbiAqIC0gYE9iamVjdGAgLSBlYWNoIGtleSBjb3JyZXNwb25kcyB0byBhIENTUyBjbGFzcyBuYW1lIHdoaWxlIHZhbHVlcyBhcmUgaW50ZXJwcmV0ZWQgYXMgZXhwcmVzc2lvbnNcbiAqIGV2YWx1YXRpbmcgdG8gYEJvb2xlYW5gLiBJZiBhIGdpdmVuIGV4cHJlc3Npb24gZXZhbHVhdGVzIHRvIGB0cnVlYCBhIGNvcnJlc3BvbmRpbmcgQ1NTIGNsYXNzXG4gKiBpcyBhZGRlZCAtIG90aGVyd2lzZSBpdCBpcyByZW1vdmVkLlxuICpcbiAqIFdoaWxlIHRoZSBgTmdDbGFzc2AgZGlyZWN0aXZlIGNhbiBpbnRlcnByZXQgZXhwcmVzc2lvbnMgZXZhbHVhdGluZyB0byBgc3RyaW5nYCwgYEFycmF5YFxuICogb3IgYE9iamVjdGAsIHRoZSBgT2JqZWN0YC1iYXNlZCB2ZXJzaW9uIGlzIHRoZSBtb3N0IG9mdGVuIHVzZWQgYW5kIGhhcyBhbiBhZHZhbnRhZ2Ugb2Yga2VlcGluZ1xuICogYWxsIHRoZSBDU1MgY2xhc3MgbmFtZXMgaW4gYSB0ZW1wbGF0ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvYTRZZHRtV3l3aEozM3VxZnBQUG4/cD1wcmV2aWV3KSk6XG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge05nQ2xhc3N9IGZyb20gJ2FuZ3VsYXIyL2NvbW1vbic7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAndG9nZ2xlLWJ1dHRvbicsXG4gKiAgIGlucHV0czogWydpc0Rpc2FibGVkJ10sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgIDxkaXYgY2xhc3M9XCJidXR0b25cIiBbbmdDbGFzc109XCJ7YWN0aXZlOiBpc09uLCBkaXNhYmxlZDogaXNEaXNhYmxlZH1cIlxuICogICAgICAgICAgKGNsaWNrKT1cInRvZ2dsZSghaXNPbilcIj5cbiAqICAgICAgICAgIENsaWNrIG1lIVxuICogICAgICA8L2Rpdj5gLFxuICogICBzdHlsZXM6IFtgXG4gKiAgICAgLmJ1dHRvbiB7XG4gKiAgICAgICB3aWR0aDogMTIwcHg7XG4gKiAgICAgICBib3JkZXI6IG1lZGl1bSBzb2xpZCBibGFjaztcbiAqICAgICB9XG4gKlxuICogICAgIC5hY3RpdmUge1xuICogICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xuICogICAgfVxuICpcbiAqICAgICAuZGlzYWJsZWQge1xuICogICAgICAgY29sb3I6IGdyYXk7XG4gKiAgICAgICBib3JkZXI6IG1lZGl1bSBzb2xpZCBncmF5O1xuICogICAgIH1cbiAqICAgYF1cbiAqICAgZGlyZWN0aXZlczogW05nQ2xhc3NdXG4gKiB9KVxuICogY2xhc3MgVG9nZ2xlQnV0dG9uIHtcbiAqICAgaXNPbiA9IGZhbHNlO1xuICogICBpc0Rpc2FibGVkID0gZmFsc2U7XG4gKlxuICogICB0b2dnbGUobmV3U3RhdGUpIHtcbiAqICAgICBpZiAoIXRoaXMuaXNEaXNhYmxlZCkge1xuICogICAgICAgdGhpcy5pc09uID0gbmV3U3RhdGU7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdDbGFzc10nLCBpbnB1dHM6IFsncmF3Q2xhc3M6IG5nQ2xhc3MnLCAnaW5pdGlhbENsYXNzZXM6IGNsYXNzJ119KVxuZXhwb3J0IGNsYXNzIE5nQ2xhc3MgaW1wbGVtZW50cyBEb0NoZWNrLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9kaWZmZXI6IGFueTtcbiAgcHJpdmF0ZSBfbW9kZTogc3RyaW5nO1xuICBwcml2YXRlIF9pbml0aWFsQ2xhc3NlcyA9IFtdO1xuICBwcml2YXRlIF9yYXdDbGFzcztcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pdGVyYWJsZURpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycywgcHJpdmF0ZSBfa2V5VmFsdWVEaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsXG4gICAgICAgICAgICAgIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcikge31cblxuICBzZXQgaW5pdGlhbENsYXNzZXModikge1xuICAgIHRoaXMuX2FwcGx5SW5pdGlhbENsYXNzZXModHJ1ZSk7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzZXMgPSBpc1ByZXNlbnQodikgJiYgaXNTdHJpbmcodikgPyB2LnNwbGl0KCcgJykgOiBbXTtcbiAgICB0aGlzLl9hcHBseUluaXRpYWxDbGFzc2VzKGZhbHNlKTtcbiAgICB0aGlzLl9hcHBseUNsYXNzZXModGhpcy5fcmF3Q2xhc3MsIGZhbHNlKTtcbiAgfVxuXG4gIHNldCByYXdDbGFzcyh2KSB7XG4gICAgdGhpcy5fY2xlYW51cENsYXNzZXModGhpcy5fcmF3Q2xhc3MpO1xuXG4gICAgaWYgKGlzU3RyaW5nKHYpKSB7XG4gICAgICB2ID0gdi5zcGxpdCgnICcpO1xuICAgIH1cblxuICAgIHRoaXMuX3Jhd0NsYXNzID0gdjtcbiAgICBpZiAoaXNQcmVzZW50KHYpKSB7XG4gICAgICBpZiAoaXNMaXN0TGlrZUl0ZXJhYmxlKHYpKSB7XG4gICAgICAgIHRoaXMuX2RpZmZlciA9IHRoaXMuX2l0ZXJhYmxlRGlmZmVycy5maW5kKHYpLmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fbW9kZSA9ICdpdGVyYWJsZSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9rZXlWYWx1ZURpZmZlcnMuZmluZCh2KS5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuX21vZGUgPSAna2V5VmFsdWUnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kaWZmZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2RpZmZlcikpIHtcbiAgICAgIHZhciBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fcmF3Q2xhc3MpO1xuICAgICAgaWYgKGlzUHJlc2VudChjaGFuZ2VzKSkge1xuICAgICAgICBpZiAodGhpcy5fbW9kZSA9PSAnaXRlcmFibGUnKSB7XG4gICAgICAgICAgdGhpcy5fYXBwbHlJdGVyYWJsZUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYXBwbHlLZXlWYWx1ZUNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fY2xlYW51cENsYXNzZXModGhpcy5fcmF3Q2xhc3MpOyB9XG5cbiAgcHJpdmF0ZSBfY2xlYW51cENsYXNzZXMocmF3Q2xhc3NWYWwpOiB2b2lkIHtcbiAgICB0aGlzLl9hcHBseUNsYXNzZXMocmF3Q2xhc3NWYWwsIHRydWUpO1xuICAgIHRoaXMuX2FwcGx5SW5pdGlhbENsYXNzZXMoZmFsc2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlLZXlWYWx1ZUNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaENoYW5nZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHtcbiAgICAgIGlmIChyZWNvcmQucHJldmlvdXNWYWx1ZSkge1xuICAgICAgICB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUl0ZXJhYmxlQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICBjaGFuZ2VzLmZvckVhY2hBZGRlZEl0ZW0oKHJlY29yZCkgPT4geyB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQuaXRlbSwgdHJ1ZSk7IH0pO1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHsgdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLml0ZW0sIGZhbHNlKTsgfSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUluaXRpYWxDbGFzc2VzKGlzQ2xlYW51cDogYm9vbGVhbikge1xuICAgIHRoaXMuX2luaXRpYWxDbGFzc2VzLmZvckVhY2goY2xhc3NOYW1lID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGNsYXNzTmFtZSwgIWlzQ2xlYW51cCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlDbGFzc2VzKHJhd0NsYXNzVmFsOiBzdHJpbmdbXSB8IFNldDxzdHJpbmc+fCB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQ2xlYW51cDogYm9vbGVhbikge1xuICAgIGlmIChpc1ByZXNlbnQocmF3Q2xhc3NWYWwpKSB7XG4gICAgICBpZiAoaXNBcnJheShyYXdDbGFzc1ZhbCkpIHtcbiAgICAgICAgKDxzdHJpbmdbXT5yYXdDbGFzc1ZhbCkuZm9yRWFjaChjbGFzc05hbWUgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MoY2xhc3NOYW1lLCAhaXNDbGVhbnVwKSk7XG4gICAgICB9IGVsc2UgaWYgKHJhd0NsYXNzVmFsIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICg8U2V0PHN0cmluZz4+cmF3Q2xhc3NWYWwpLmZvckVhY2goY2xhc3NOYW1lID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGNsYXNzTmFtZSwgIWlzQ2xlYW51cCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKDx7W2s6IHN0cmluZ106IHN0cmluZ30+cmF3Q2xhc3NWYWwsIChleHBWYWwsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICAgIGlmIChleHBWYWwpIHRoaXMuX3RvZ2dsZUNsYXNzKGNsYXNzTmFtZSwgIWlzQ2xlYW51cCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3RvZ2dsZUNsYXNzKGNsYXNzTmFtZTogc3RyaW5nLCBlbmFibGVkKTogdm9pZCB7XG4gICAgY2xhc3NOYW1lID0gY2xhc3NOYW1lLnRyaW0oKTtcbiAgICBpZiAoY2xhc3NOYW1lLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChjbGFzc05hbWUuaW5kZXhPZignICcpID4gLTEpIHtcbiAgICAgICAgdmFyIGNsYXNzZXMgPSBjbGFzc05hbWUuc3BsaXQoL1xccysvZyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjbGFzc2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudENsYXNzKHRoaXMuX25nRWwsIGNsYXNzZXNbaV0sIGVuYWJsZWQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50Q2xhc3ModGhpcy5fbmdFbCwgY2xhc3NOYW1lLCBlbmFibGVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==