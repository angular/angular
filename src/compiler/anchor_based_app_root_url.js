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
var dom_adapter_1 = require("angular2/src/core/dom/dom_adapter");
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
//# sourceMappingURL=anchor_based_app_root_url.js.map