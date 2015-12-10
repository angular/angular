var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { AppRootUrl } from "angular2/src/compiler/app_root_url";
import { DOM } from "angular2/src/platform/dom/dom_adapter";
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
