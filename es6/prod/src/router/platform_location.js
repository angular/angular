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
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { Injectable } from 'angular2/core';
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 */
export let PlatformLocation = class {
    constructor() {
        this._init();
    }
    // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it
    /** @internal */
    _init() {
        this._location = DOM.getLocation();
        this._history = DOM.getHistory();
    }
    getBaseHrefFromDOM() { return DOM.getBaseHref(); }
    onPopState(fn) {
        DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
    }
    onHashChange(fn) {
        DOM.getGlobalEventTarget('window').addEventListener('hashchange', fn, false);
    }
    get pathname() { return this._location.pathname; }
    get search() { return this._location.search; }
    get hash() { return this._location.hash; }
    set pathname(newPath) { this._location.pathname = newPath; }
    pushState(state, title, url) {
        this._history.pushState(state, title, url);
    }
    forward() { this._history.forward(); }
    back() { this._history.back(); }
};
PlatformLocation = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], PlatformLocation);
