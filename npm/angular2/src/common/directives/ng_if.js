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
 * Removes or recreates a portion of the DOM tree based on an {expression}.
 *
 * If the expression assigned to `ngIf` evaluates to a false value then the element
 * is removed from the DOM, otherwise a clone of the element is reinserted into the DOM.
 *
 * ### Example ([live demo](http://plnkr.co/edit/fe0kgemFBtmQOY31b4tw?p=preview)):
 *
 * ```
 * <div *ngIf="errorCount > 0" class="error">
 *   <!-- Error message displayed when the errorCount property on the current context is greater
 * than 0. -->
 *   {{errorCount}} errors detected
 * </div>
 * ```
 *
 * ### Syntax
 *
 * - `<div *ngIf="condition">...</div>`
 * - `<div template="ngIf condition">...</div>`
 * - `<template [ngIf]="condition"><div>...</div></template>`
 */
var NgIf = (function () {
    function NgIf(_viewContainer, _templateRef) {
        this._viewContainer = _viewContainer;
        this._templateRef = _templateRef;
        this._prevCondition = null;
    }
    Object.defineProperty(NgIf.prototype, "ngIf", {
        set: function (newCondition /* boolean */) {
            if (newCondition && (lang_1.isBlank(this._prevCondition) || !this._prevCondition)) {
                this._prevCondition = true;
                this._viewContainer.createEmbeddedView(this._templateRef);
            }
            else if (!newCondition && (lang_1.isBlank(this._prevCondition) || this._prevCondition)) {
                this._prevCondition = false;
                this._viewContainer.clear();
            }
        },
        enumerable: true,
        configurable: true
    });
    NgIf = __decorate([
        core_1.Directive({ selector: '[ngIf]', inputs: ['ngIf'] }), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef])
    ], NgIf);
    return NgIf;
}());
exports.NgIf = NgIf;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfaWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL2RpcmVjdGl2ZXMvbmdfaWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFCQUF1RCxlQUFlLENBQUMsQ0FBQTtBQUN2RSxxQkFBc0IsMEJBQTBCLENBQUMsQ0FBQTtBQUVqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBRUg7SUFHRSxjQUFvQixjQUFnQyxFQUFVLFlBQWlDO1FBQTNFLG1CQUFjLEdBQWQsY0FBYyxDQUFrQjtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUZ2RixtQkFBYyxHQUFZLElBQUksQ0FBQztJQUd2QyxDQUFDO0lBRUQsc0JBQUksc0JBQUk7YUFBUixVQUFTLFlBQWlCLENBQUMsYUFBYTtZQUN0QyxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksQ0FBQyxjQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0UsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzVELENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLElBQUksQ0FBQyxjQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xGLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO2dCQUM1QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzlCLENBQUM7UUFDSCxDQUFDOzs7T0FBQTtJQWZIO1FBQUMsZ0JBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQzs7WUFBQTtJQWdCbEQsV0FBQztBQUFELENBQUMsQUFmRCxJQWVDO0FBZlksWUFBSSxPQWVoQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIFZpZXdDb250YWluZXJSZWYsIFRlbXBsYXRlUmVmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBSZW1vdmVzIG9yIHJlY3JlYXRlcyBhIHBvcnRpb24gb2YgdGhlIERPTSB0cmVlIGJhc2VkIG9uIGFuIHtleHByZXNzaW9ufS5cbiAqXG4gKiBJZiB0aGUgZXhwcmVzc2lvbiBhc3NpZ25lZCB0byBgbmdJZmAgZXZhbHVhdGVzIHRvIGEgZmFsc2UgdmFsdWUgdGhlbiB0aGUgZWxlbWVudFxuICogaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00sIG90aGVyd2lzZSBhIGNsb25lIG9mIHRoZSBlbGVtZW50IGlzIHJlaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9mZTBrZ2VtRkJ0bVFPWTMxYjR0dz9wPXByZXZpZXcpKTpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgKm5nSWY9XCJlcnJvckNvdW50ID4gMFwiIGNsYXNzPVwiZXJyb3JcIj5cbiAqICAgPCEtLSBFcnJvciBtZXNzYWdlIGRpc3BsYXllZCB3aGVuIHRoZSBlcnJvckNvdW50IHByb3BlcnR5IG9uIHRoZSBjdXJyZW50IGNvbnRleHQgaXMgZ3JlYXRlclxuICogdGhhbiAwLiAtLT5cbiAqICAge3tlcnJvckNvdW50fX0gZXJyb3JzIGRldGVjdGVkXG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqICMjIyBTeW50YXhcbiAqXG4gKiAtIGA8ZGl2ICpuZ0lmPVwiY29uZGl0aW9uXCI+Li4uPC9kaXY+YFxuICogLSBgPGRpdiB0ZW1wbGF0ZT1cIm5nSWYgY29uZGl0aW9uXCI+Li4uPC9kaXY+YFxuICogLSBgPHRlbXBsYXRlIFtuZ0lmXT1cImNvbmRpdGlvblwiPjxkaXY+Li4uPC9kaXY+PC90ZW1wbGF0ZT5gXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nSWZdJywgaW5wdXRzOiBbJ25nSWYnXX0pXG5leHBvcnQgY2xhc3MgTmdJZiB7XG4gIHByaXZhdGUgX3ByZXZDb25kaXRpb246IGJvb2xlYW4gPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHByaXZhdGUgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+KSB7XG4gIH1cblxuICBzZXQgbmdJZihuZXdDb25kaXRpb246IGFueSAvKiBib29sZWFuICovKSB7XG4gICAgaWYgKG5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLl9wcmV2Q29uZGl0aW9uKSB8fCAhdGhpcy5fcHJldkNvbmRpdGlvbikpIHtcbiAgICAgIHRoaXMuX3ByZXZDb25kaXRpb24gPSB0cnVlO1xuICAgICAgdGhpcy5fdmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYpO1xuICAgIH0gZWxzZSBpZiAoIW5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLl9wcmV2Q29uZGl0aW9uKSB8fCB0aGlzLl9wcmV2Q29uZGl0aW9uKSkge1xuICAgICAgdGhpcy5fcHJldkNvbmRpdGlvbiA9IGZhbHNlO1xuICAgICAgdGhpcy5fdmlld0NvbnRhaW5lci5jbGVhcigpO1xuICAgIH1cbiAgfVxufVxuIl19