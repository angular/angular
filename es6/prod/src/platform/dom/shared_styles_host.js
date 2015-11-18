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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DOM } from 'angular2/src/core/dom/dom_adapter';
import { Inject, Injectable } from 'angular2/src/core/di';
import { SetWrapper } from 'angular2/src/facade/collection';
import { DOCUMENT } from './dom_tokens';
export let SharedStylesHost = class {
    constructor() {
        /** @internal */
        this._styles = [];
        /** @internal */
        this._stylesSet = new Set();
    }
    addStyles(styles) {
        var additions = [];
        styles.forEach(style => {
            if (!SetWrapper.has(this._stylesSet, style)) {
                this._stylesSet.add(style);
                this._styles.push(style);
                additions.push(style);
            }
        });
        this.onStylesAdded(additions);
    }
    onStylesAdded(additions) { }
    getAllStyles() { return this._styles; }
};
SharedStylesHost = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], SharedStylesHost);
export let DomSharedStylesHost = class extends SharedStylesHost {
    constructor(doc) {
        super();
        this._hostNodes = new Set();
        this._hostNodes.add(doc.head);
    }
    /** @internal */
    _addStylesToHost(styles, host) {
        for (var i = 0; i < styles.length; i++) {
            var style = styles[i];
            DOM.appendChild(host, DOM.createStyleElement(style));
        }
    }
    addHost(hostNode) {
        this._addStylesToHost(this._styles, hostNode);
        this._hostNodes.add(hostNode);
    }
    removeHost(hostNode) { SetWrapper.delete(this._hostNodes, hostNode); }
    onStylesAdded(additions) {
        this._hostNodes.forEach((hostNode) => { this._addStylesToHost(additions, hostNode); });
    }
};
DomSharedStylesHost = __decorate([
    Injectable(),
    __param(0, Inject(DOCUMENT)), 
    __metadata('design:paramtypes', [Object])
], DomSharedStylesHost);
//# sourceMappingURL=shared_styles_host.js.map