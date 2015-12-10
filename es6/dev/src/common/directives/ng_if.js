var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ViewContainerRef, TemplateRef } from 'angular2/core';
import { isBlank } from 'angular2/src/facade/lang';
/**
 * Removes or recreates a portion of the DOM tree based on an {expression}.
 *
 * If the expression assigned to `ng-if` evaluates to a false value then the element
 * is removed from the DOM, otherwise a clone of the element is reinserted into the DOM.
 *
 * ### Example ([live demo](http://plnkr.co/edit/fe0kgemFBtmQOY31b4tw?p=preview)):
 *
 * ```
 * <div *ng-if="errorCount > 0" class="error">
 *   <!-- Error message displayed when the errorCount property on the current context is greater
 * than 0. -->
 *   {{errorCount}} errors detected
 * </div>
 * ```
 *
 * ### Syntax
 *
 * - `<div *ng-if="condition">...</div>`
 * - `<div template="ng-if condition">...</div>`
 * - `<template [ng-if]="condition"><div>...</div></template>`
 */
export let NgIf = class {
    constructor(_viewContainer, _templateRef) {
        this._viewContainer = _viewContainer;
        this._templateRef = _templateRef;
        this._prevCondition = null;
    }
    set ngIf(newCondition /* boolean */) {
        if (newCondition && (isBlank(this._prevCondition) || !this._prevCondition)) {
            this._prevCondition = true;
            this._viewContainer.createEmbeddedView(this._templateRef);
        }
        else if (!newCondition && (isBlank(this._prevCondition) || this._prevCondition)) {
            this._prevCondition = false;
            this._viewContainer.clear();
        }
    }
};
NgIf = __decorate([
    Directive({ selector: '[ng-if]', inputs: ['ngIf'] }), 
    __metadata('design:paramtypes', [ViewContainerRef, TemplateRef])
], NgIf);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfaWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfaWYudHMiXSwibmFtZXMiOlsiTmdJZiIsIk5nSWYuY29uc3RydWN0b3IiLCJOZ0lmLm5nSWYiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWU7T0FDL0QsRUFBQyxPQUFPLEVBQUMsTUFBTSwwQkFBMEI7QUFFaEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNIO0lBSUVBLFlBQW9CQSxjQUFnQ0EsRUFBVUEsWUFBeUJBO1FBQW5FQyxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBa0JBO1FBQVVBLGlCQUFZQSxHQUFaQSxZQUFZQSxDQUFhQTtRQUYvRUEsbUJBQWNBLEdBQVlBLElBQUlBLENBQUNBO0lBRW1EQSxDQUFDQTtJQUUzRkQsSUFBSUEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsYUFBYUE7UUFDakNFLEVBQUVBLENBQUNBLENBQUNBLFlBQVlBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNFQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUMzQkEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUM1REEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEZBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLEtBQUtBLENBQUNBO1lBQzVCQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSEYsQ0FBQ0E7QUFmRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQzs7U0FlbEQ7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBWaWV3Q29udGFpbmVyUmVmLCBUZW1wbGF0ZVJlZn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogUmVtb3ZlcyBvciByZWNyZWF0ZXMgYSBwb3J0aW9uIG9mIHRoZSBET00gdHJlZSBiYXNlZCBvbiBhbiB7ZXhwcmVzc2lvbn0uXG4gKlxuICogSWYgdGhlIGV4cHJlc3Npb24gYXNzaWduZWQgdG8gYG5nLWlmYCBldmFsdWF0ZXMgdG8gYSBmYWxzZSB2YWx1ZSB0aGVuIHRoZSBlbGVtZW50XG4gKiBpcyByZW1vdmVkIGZyb20gdGhlIERPTSwgb3RoZXJ3aXNlIGEgY2xvbmUgb2YgdGhlIGVsZW1lbnQgaXMgcmVpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2ZlMGtnZW1GQnRtUU9ZMzFiNHR3P3A9cHJldmlldykpOlxuICpcbiAqIGBgYFxuICogPGRpdiAqbmctaWY9XCJlcnJvckNvdW50ID4gMFwiIGNsYXNzPVwiZXJyb3JcIj5cbiAqICAgPCEtLSBFcnJvciBtZXNzYWdlIGRpc3BsYXllZCB3aGVuIHRoZSBlcnJvckNvdW50IHByb3BlcnR5IG9uIHRoZSBjdXJyZW50IGNvbnRleHQgaXMgZ3JlYXRlclxuICogdGhhbiAwLiAtLT5cbiAqICAge3tlcnJvckNvdW50fX0gZXJyb3JzIGRldGVjdGVkXG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqICMjIyBTeW50YXhcbiAqXG4gKiAtIGA8ZGl2ICpuZy1pZj1cImNvbmRpdGlvblwiPi4uLjwvZGl2PmBcbiAqIC0gYDxkaXYgdGVtcGxhdGU9XCJuZy1pZiBjb25kaXRpb25cIj4uLi48L2Rpdj5gXG4gKiAtIGA8dGVtcGxhdGUgW25nLWlmXT1cImNvbmRpdGlvblwiPjxkaXY+Li4uPC9kaXY+PC90ZW1wbGF0ZT5gXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nLWlmXScsIGlucHV0czogWyduZ0lmJ119KVxuZXhwb3J0IGNsYXNzIE5nSWYge1xuICBwcml2YXRlIF9wcmV2Q29uZGl0aW9uOiBib29sZWFuID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYpIHt9XG5cbiAgc2V0IG5nSWYobmV3Q29uZGl0aW9uIC8qIGJvb2xlYW4gKi8pIHtcbiAgICBpZiAobmV3Q29uZGl0aW9uICYmIChpc0JsYW5rKHRoaXMuX3ByZXZDb25kaXRpb24pIHx8ICF0aGlzLl9wcmV2Q29uZGl0aW9uKSkge1xuICAgICAgdGhpcy5fcHJldkNvbmRpdGlvbiA9IHRydWU7XG4gICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90ZW1wbGF0ZVJlZik7XG4gICAgfSBlbHNlIGlmICghbmV3Q29uZGl0aW9uICYmIChpc0JsYW5rKHRoaXMuX3ByZXZDb25kaXRpb24pIHx8IHRoaXMuX3ByZXZDb25kaXRpb24pKSB7XG4gICAgICB0aGlzLl9wcmV2Q29uZGl0aW9uID0gZmFsc2U7XG4gICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gICAgfVxuICB9XG59XG4iXX0=