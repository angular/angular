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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/facade/collection');
var dom_tokens_1 = require('./dom_tokens');
var SharedStylesHost = (function () {
    function SharedStylesHost() {
        /** @internal */
        this._styles = [];
        /** @internal */
        this._stylesSet = new Set();
    }
    SharedStylesHost.prototype.addStyles = function (styles) {
        var _this = this;
        var additions = [];
        styles.forEach(function (style) {
            if (!collection_1.SetWrapper.has(_this._stylesSet, style)) {
                _this._stylesSet.add(style);
                _this._styles.push(style);
                additions.push(style);
            }
        });
        this.onStylesAdded(additions);
    };
    SharedStylesHost.prototype.onStylesAdded = function (additions) { };
    SharedStylesHost.prototype.getAllStyles = function () { return this._styles; };
    SharedStylesHost = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], SharedStylesHost);
    return SharedStylesHost;
})();
exports.SharedStylesHost = SharedStylesHost;
var DomSharedStylesHost = (function (_super) {
    __extends(DomSharedStylesHost, _super);
    function DomSharedStylesHost(doc) {
        _super.call(this);
        this._hostNodes = new Set();
        this._hostNodes.add(doc.head);
    }
    /** @internal */
    DomSharedStylesHost.prototype._addStylesToHost = function (styles, host) {
        for (var i = 0; i < styles.length; i++) {
            var style = styles[i];
            dom_adapter_1.DOM.appendChild(host, dom_adapter_1.DOM.createStyleElement(style));
        }
    };
    DomSharedStylesHost.prototype.addHost = function (hostNode) {
        this._addStylesToHost(this._styles, hostNode);
        this._hostNodes.add(hostNode);
    };
    DomSharedStylesHost.prototype.removeHost = function (hostNode) { collection_1.SetWrapper.delete(this._hostNodes, hostNode); };
    DomSharedStylesHost.prototype.onStylesAdded = function (additions) {
        var _this = this;
        this._hostNodes.forEach(function (hostNode) { _this._addStylesToHost(additions, hostNode); });
    };
    DomSharedStylesHost = __decorate([
        di_1.Injectable(),
        __param(0, di_1.Inject(dom_tokens_1.DOCUMENT)), 
        __metadata('design:paramtypes', [Object])
    ], DomSharedStylesHost);
    return DomSharedStylesHost;
})(SharedStylesHost);
exports.DomSharedStylesHost = DomSharedStylesHost;
//# sourceMappingURL=shared_styles_host.js.map