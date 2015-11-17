var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var dom_adapter_1 = require('./dom_adapter');
var xhr_impl_1 = require('angular2/src/platform/browser/xhr_impl');
/**
 * Provides DOM operations in any browser environment.
 */
var GenericBrowserDomAdapter = (function (_super) {
    __extends(GenericBrowserDomAdapter, _super);
    function GenericBrowserDomAdapter() {
        var _this = this;
        _super.call(this);
        this._animationPrefix = null;
        this._transitionEnd = null;
        try {
            var element = this.createElement('div', this.defaultDoc());
            if (lang_1.isPresent(this.getStyle(element, 'animationName'))) {
                this._animationPrefix = '';
            }
            else {
                var domPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
                for (var i = 0; i < domPrefixes.length; i++) {
                    if (lang_1.isPresent(this.getStyle(element, domPrefixes[i] + 'AnimationName'))) {
                        this._animationPrefix = '-' + domPrefixes[i].toLowerCase() + '-';
                        break;
                    }
                }
            }
            var transEndEventNames = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd otransitionend',
                transition: 'transitionend'
            };
            collection_1.StringMapWrapper.forEach(transEndEventNames, function (value, key) {
                if (lang_1.isPresent(_this.getStyle(element, key))) {
                    _this._transitionEnd = value;
                }
            });
        }
        catch (e) {
            this._animationPrefix = null;
            this._transitionEnd = null;
        }
    }
    GenericBrowserDomAdapter.prototype.getXHR = function () { return xhr_impl_1.XHRImpl; };
    GenericBrowserDomAdapter.prototype.getDistributedNodes = function (el) { return el.getDistributedNodes(); };
    GenericBrowserDomAdapter.prototype.resolveAndSetHref = function (el, baseUrl, href) {
        el.href = href == null ? baseUrl : baseUrl + '/../' + href;
    };
    GenericBrowserDomAdapter.prototype.supportsDOMEvents = function () { return true; };
    GenericBrowserDomAdapter.prototype.supportsNativeShadowDOM = function () {
        return lang_1.isFunction(this.defaultDoc().body.createShadowRoot);
    };
    GenericBrowserDomAdapter.prototype.getAnimationPrefix = function () {
        return lang_1.isPresent(this._animationPrefix) ? this._animationPrefix : "";
    };
    GenericBrowserDomAdapter.prototype.getTransitionEnd = function () { return lang_1.isPresent(this._transitionEnd) ? this._transitionEnd : ""; };
    GenericBrowserDomAdapter.prototype.supportsAnimation = function () {
        return lang_1.isPresent(this._animationPrefix) && lang_1.isPresent(this._transitionEnd);
    };
    return GenericBrowserDomAdapter;
})(dom_adapter_1.DomAdapter);
exports.GenericBrowserDomAdapter = GenericBrowserDomAdapter;
//# sourceMappingURL=generic_browser_adapter.js.map