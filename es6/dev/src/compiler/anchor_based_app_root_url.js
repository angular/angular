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
import { AppRootUrl } from "angular2/src/compiler/app_root_url";
import { DOM } from "angular2/src/core/dom/dom_adapter";
import { Injectable } from "angular2/src/core/di";
/**
 * Extension of {@link AppRootUrl} that uses a DOM anchor tag to set the root url to
 * the current page's url.
 */
export let AnchorBasedAppRootUrl = class extends AppRootUrl {
    constructor() {
        super("");
        // compute the root url to pass to AppRootUrl
        var a = DOM.createElement('a');
        DOM.resolveAndSetHref(a, './', null);
        this.value = DOM.getHref(a);
    }
};
AnchorBasedAppRootUrl = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], AnchorBasedAppRootUrl);
//# sourceMappingURL=anchor_based_app_root_url.js.map