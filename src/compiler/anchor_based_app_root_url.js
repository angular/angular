'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var app_root_url_1 = require("angular2/src/compiler/app_root_url");
var dom_adapter_1 = require("angular2/src/platform/dom/dom_adapter");
var di_1 = require("angular2/src/core/di");
/**
 * Extension of {@link AppRootUrl} that uses a DOM anchor tag to set the root url to
 * the current page's url.
 */
var AnchorBasedAppRootUrl = (function (_super) {
    __extends(AnchorBasedAppRootUrl, _super);
    function AnchorBasedAppRootUrl() {
        _super.call(this, "");
        // compute the root url to pass to AppRootUrl
        var a = dom_adapter_1.DOM.createElement('a');
        dom_adapter_1.DOM.resolveAndSetHref(a, './', null);
        this.value = dom_adapter_1.DOM.getHref(a);
    }
    AnchorBasedAppRootUrl = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], AnchorBasedAppRootUrl);
    return AnchorBasedAppRootUrl;
})(app_root_url_1.AppRootUrl);
exports.AnchorBasedAppRootUrl = AnchorBasedAppRootUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yX2Jhc2VkX2FwcF9yb290X3VybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9hbmNob3JfYmFzZWRfYXBwX3Jvb3RfdXJsLnRzIl0sIm5hbWVzIjpbIkFuY2hvckJhc2VkQXBwUm9vdFVybCIsIkFuY2hvckJhc2VkQXBwUm9vdFVybC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZCQUF5QixvQ0FBb0MsQ0FBQyxDQUFBO0FBQzlELDRCQUFrQix1Q0FBdUMsQ0FBQyxDQUFBO0FBQzFELG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBRWhEOzs7R0FHRztBQUNIO0lBQzJDQSx5Q0FBVUE7SUFDbkRBO1FBQ0VDLGtCQUFNQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNWQSw2Q0FBNkNBO1FBQzdDQSxJQUFJQSxDQUFDQSxHQUFHQSxpQkFBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLGlCQUFHQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ3JDQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxpQkFBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDOUJBLENBQUNBO0lBUkhEO1FBQUNBLGVBQVVBLEVBQUVBOzs4QkFTWkE7SUFBREEsNEJBQUNBO0FBQURBLENBQUNBLEFBVEQsRUFDMkMseUJBQVUsRUFRcEQ7QUFSWSw2QkFBcUIsd0JBUWpDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FwcFJvb3RVcmx9IGZyb20gXCJhbmd1bGFyMi9zcmMvY29tcGlsZXIvYXBwX3Jvb3RfdXJsXCI7XG5pbXBvcnQge0RPTX0gZnJvbSBcImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXJcIjtcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb3JlL2RpXCI7XG5cbi8qKlxuICogRXh0ZW5zaW9uIG9mIHtAbGluayBBcHBSb290VXJsfSB0aGF0IHVzZXMgYSBET00gYW5jaG9yIHRhZyB0byBzZXQgdGhlIHJvb3QgdXJsIHRvXG4gKiB0aGUgY3VycmVudCBwYWdlJ3MgdXJsLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5jaG9yQmFzZWRBcHBSb290VXJsIGV4dGVuZHMgQXBwUm9vdFVybCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFwiXCIpO1xuICAgIC8vIGNvbXB1dGUgdGhlIHJvb3QgdXJsIHRvIHBhc3MgdG8gQXBwUm9vdFVybFxuICAgIHZhciBhID0gRE9NLmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBET00ucmVzb2x2ZUFuZFNldEhyZWYoYSwgJy4vJywgbnVsbCk7XG4gICAgdGhpcy52YWx1ZSA9IERPTS5nZXRIcmVmKGEpO1xuICB9XG59XG4iXX0=