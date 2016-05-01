var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, Input, ViewContainerRef, TemplateRef } from 'angular2/core';
import { isPresent } from 'angular2/src/facade/lang';
/**
 * Creates and inserts an embedded view based on a prepared `TemplateRef`.
 *
 * ### Syntax
 * - `<template [ngTemplateOutlet]="templateRefExpression"></template>`
 */
export let NgTemplateOutlet = class NgTemplateOutlet {
    constructor(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
    }
    set ngTemplateOutlet(templateRef) {
        if (isPresent(this._insertedViewRef)) {
            this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._insertedViewRef));
        }
        if (isPresent(templateRef)) {
            this._insertedViewRef = this._viewContainerRef.createEmbeddedView(templateRef);
        }
    }
};
__decorate([
    Input(), 
    __metadata('design:type', TemplateRef), 
    __metadata('design:paramtypes', [TemplateRef])
], NgTemplateOutlet.prototype, "ngTemplateOutlet", null);
NgTemplateOutlet = __decorate([
    Directive({ selector: '[ngTemplateOutlet]' }), 
    __metadata('design:paramtypes', [ViewContainerRef])
], NgTemplateOutlet);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfdGVtcGxhdGVfb3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3RlbXBsYXRlX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQVcsV0FBVyxFQUFDLE1BQU0sZUFBZTtPQUMvRSxFQUFDLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtBQUVsRDs7Ozs7R0FLRztBQUVIO0lBR0UsWUFBb0IsaUJBQW1DO1FBQW5DLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7SUFBRyxDQUFDO0lBRzNELElBQUksZ0JBQWdCLENBQUMsV0FBZ0M7UUFDbkQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQVZDO0lBQUMsS0FBSyxFQUFFOzs7d0RBQUE7QUFOVjtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxvQkFBb0IsRUFBQyxDQUFDOztvQkFBQTtBQWdCM0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgSW5wdXQsIFZpZXdDb250YWluZXJSZWYsIFZpZXdSZWYsIFRlbXBsYXRlUmVmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW5kIGluc2VydHMgYW4gZW1iZWRkZWQgdmlldyBiYXNlZCBvbiBhIHByZXBhcmVkIGBUZW1wbGF0ZVJlZmAuXG4gKlxuICogIyMjIFN5bnRheFxuICogLSBgPHRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cInRlbXBsYXRlUmVmRXhwcmVzc2lvblwiPjwvdGVtcGxhdGU+YFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1RlbXBsYXRlT3V0bGV0XSd9KVxuZXhwb3J0IGNsYXNzIE5nVGVtcGxhdGVPdXRsZXQge1xuICBwcml2YXRlIF9pbnNlcnRlZFZpZXdSZWY6IFZpZXdSZWY7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBASW5wdXQoKVxuICBzZXQgbmdUZW1wbGF0ZU91dGxldCh0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0Pikge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5faW5zZXJ0ZWRWaWV3UmVmKSkge1xuICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5yZW1vdmUodGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMuX2luc2VydGVkVmlld1JlZikpO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQodGVtcGxhdGVSZWYpKSB7XG4gICAgICB0aGlzLl9pbnNlcnRlZFZpZXdSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0ZW1wbGF0ZVJlZik7XG4gICAgfVxuICB9XG59XG4iXX0=