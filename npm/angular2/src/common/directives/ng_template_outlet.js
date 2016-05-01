'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
/**
 * Creates and inserts an embedded view based on a prepared `TemplateRef`.
 *
 * ### Syntax
 * - `<template [ngTemplateOutlet]="templateRefExpression"></template>`
 */
var NgTemplateOutlet = (function () {
    function NgTemplateOutlet(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
    }
    Object.defineProperty(NgTemplateOutlet.prototype, "ngTemplateOutlet", {
        set: function (templateRef) {
            if (lang_1.isPresent(this._insertedViewRef)) {
                this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._insertedViewRef));
            }
            if (lang_1.isPresent(templateRef)) {
                this._insertedViewRef = this._viewContainerRef.createEmbeddedView(templateRef);
            }
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.Input(), 
        __metadata('design:type', core_1.TemplateRef), 
        __metadata('design:paramtypes', [core_1.TemplateRef])
    ], NgTemplateOutlet.prototype, "ngTemplateOutlet", null);
    NgTemplateOutlet = __decorate([
        core_1.Directive({ selector: '[ngTemplateOutlet]' }), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef])
    ], NgTemplateOutlet);
    return NgTemplateOutlet;
}());
exports.NgTemplateOutlet = NgTemplateOutlet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfdGVtcGxhdGVfb3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3RlbXBsYXRlX291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUJBQXVFLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZGLHFCQUF3QiwwQkFBMEIsQ0FBQyxDQUFBO0FBRW5EOzs7OztHQUtHO0FBRUg7SUFHRSwwQkFBb0IsaUJBQW1DO1FBQW5DLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7SUFBRyxDQUFDO0lBRzNELHNCQUFJLDhDQUFnQjthQUFwQixVQUFxQixXQUFnQztZQUNuRCxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDdkYsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2pGLENBQUM7UUFDSCxDQUFDOzs7T0FBQTtJQVREO1FBQUMsWUFBSyxFQUFFOzs7NERBQUE7SUFOVjtRQUFDLGdCQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsb0JBQW9CLEVBQUMsQ0FBQzs7d0JBQUE7SUFnQjVDLHVCQUFDO0FBQUQsQ0FBQyxBQWZELElBZUM7QUFmWSx3QkFBZ0IsbUJBZTVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgSW5wdXQsIFZpZXdDb250YWluZXJSZWYsIFZpZXdSZWYsIFRlbXBsYXRlUmVmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW5kIGluc2VydHMgYW4gZW1iZWRkZWQgdmlldyBiYXNlZCBvbiBhIHByZXBhcmVkIGBUZW1wbGF0ZVJlZmAuXG4gKlxuICogIyMjIFN5bnRheFxuICogLSBgPHRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cInRlbXBsYXRlUmVmRXhwcmVzc2lvblwiPjwvdGVtcGxhdGU+YFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1RlbXBsYXRlT3V0bGV0XSd9KVxuZXhwb3J0IGNsYXNzIE5nVGVtcGxhdGVPdXRsZXQge1xuICBwcml2YXRlIF9pbnNlcnRlZFZpZXdSZWY6IFZpZXdSZWY7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge31cblxuICBASW5wdXQoKVxuICBzZXQgbmdUZW1wbGF0ZU91dGxldCh0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0Pikge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5faW5zZXJ0ZWRWaWV3UmVmKSkge1xuICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5yZW1vdmUodGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMuX2luc2VydGVkVmlld1JlZikpO1xuICAgIH1cblxuICAgIGlmIChpc1ByZXNlbnQodGVtcGxhdGVSZWYpKSB7XG4gICAgICB0aGlzLl9pbnNlcnRlZFZpZXdSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0ZW1wbGF0ZVJlZik7XG4gICAgfVxuICB9XG59XG4iXX0=