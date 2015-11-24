var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfaWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfaWYudHMiXSwibmFtZXMiOlsiTmdJZiIsIk5nSWYuY29uc3RydWN0b3IiLCJOZ0lmLm5nSWYiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZTtPQUMvRCxFQUFDLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtBQUVoRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0g7SUFJRUEsWUFBb0JBLGNBQWdDQSxFQUFVQSxZQUF5QkE7UUFBbkVDLG1CQUFjQSxHQUFkQSxjQUFjQSxDQUFrQkE7UUFBVUEsaUJBQVlBLEdBQVpBLFlBQVlBLENBQWFBO1FBRi9FQSxtQkFBY0EsR0FBWUEsSUFBSUEsQ0FBQ0E7SUFFbURBLENBQUNBO0lBRTNGRCxJQUFJQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxhQUFhQTtRQUNqQ0UsRUFBRUEsQ0FBQ0EsQ0FBQ0EsWUFBWUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0VBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzNCQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBQzVEQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsRkEsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDNUJBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO1FBQzlCQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNIRixDQUFDQTtBQWZEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBQyxDQUFDOztTQWVsRDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIFZpZXdDb250YWluZXJSZWYsIFRlbXBsYXRlUmVmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBSZW1vdmVzIG9yIHJlY3JlYXRlcyBhIHBvcnRpb24gb2YgdGhlIERPTSB0cmVlIGJhc2VkIG9uIGFuIHtleHByZXNzaW9ufS5cbiAqXG4gKiBJZiB0aGUgZXhwcmVzc2lvbiBhc3NpZ25lZCB0byBgbmctaWZgIGV2YWx1YXRlcyB0byBhIGZhbHNlIHZhbHVlIHRoZW4gdGhlIGVsZW1lbnRcbiAqIGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLCBvdGhlcndpc2UgYSBjbG9uZSBvZiB0aGUgZWxlbWVudCBpcyByZWluc2VydGVkIGludG8gdGhlIERPTS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZmUwa2dlbUZCdG1RT1kzMWI0dHc/cD1wcmV2aWV3KSk6XG4gKlxuICogYGBgXG4gKiA8ZGl2ICpuZy1pZj1cImVycm9yQ291bnQgPiAwXCIgY2xhc3M9XCJlcnJvclwiPlxuICogICA8IS0tIEVycm9yIG1lc3NhZ2UgZGlzcGxheWVkIHdoZW4gdGhlIGVycm9yQ291bnQgcHJvcGVydHkgb24gdGhlIGN1cnJlbnQgY29udGV4dCBpcyBncmVhdGVyXG4gKiB0aGFuIDAuIC0tPlxuICogICB7e2Vycm9yQ291bnR9fSBlcnJvcnMgZGV0ZWN0ZWRcbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogIyMjIFN5bnRheFxuICpcbiAqIC0gYDxkaXYgKm5nLWlmPVwiY29uZGl0aW9uXCI+Li4uPC9kaXY+YFxuICogLSBgPGRpdiB0ZW1wbGF0ZT1cIm5nLWlmIGNvbmRpdGlvblwiPi4uLjwvZGl2PmBcbiAqIC0gYDx0ZW1wbGF0ZSBbbmctaWZdPVwiY29uZGl0aW9uXCI+PGRpdj4uLi48L2Rpdj48L3RlbXBsYXRlPmBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmctaWZdJywgaW5wdXRzOiBbJ25nSWYnXX0pXG5leHBvcnQgY2xhc3MgTmdJZiB7XG4gIHByaXZhdGUgX3ByZXZDb25kaXRpb246IGJvb2xlYW4gPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHByaXZhdGUgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZikge31cblxuICBzZXQgbmdJZihuZXdDb25kaXRpb24gLyogYm9vbGVhbiAqLykge1xuICAgIGlmIChuZXdDb25kaXRpb24gJiYgKGlzQmxhbmsodGhpcy5fcHJldkNvbmRpdGlvbikgfHwgIXRoaXMuX3ByZXZDb25kaXRpb24pKSB7XG4gICAgICB0aGlzLl9wcmV2Q29uZGl0aW9uID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMuX3RlbXBsYXRlUmVmKTtcbiAgICB9IGVsc2UgaWYgKCFuZXdDb25kaXRpb24gJiYgKGlzQmxhbmsodGhpcy5fcHJldkNvbmRpdGlvbikgfHwgdGhpcy5fcHJldkNvbmRpdGlvbikpIHtcbiAgICAgIHRoaXMuX3ByZXZDb25kaXRpb24gPSBmYWxzZTtcbiAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIuY2xlYXIoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==