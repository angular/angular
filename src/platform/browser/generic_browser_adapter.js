'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJpY19icm93c2VyX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci9nZW5lcmljX2Jyb3dzZXJfYWRhcHRlci50cyJdLCJuYW1lcyI6WyJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuY29uc3RydWN0b3IiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuZ2V0WEhSIiwiR2VuZXJpY0Jyb3dzZXJEb21BZGFwdGVyLmdldERpc3RyaWJ1dGVkTm9kZXMiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIucmVzb2x2ZUFuZFNldEhyZWYiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuc3VwcG9ydHNET01FdmVudHMiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuc3VwcG9ydHNOYXRpdmVTaGFkb3dET00iLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuZ2V0QW5pbWF0aW9uUHJlZml4IiwiR2VuZXJpY0Jyb3dzZXJEb21BZGFwdGVyLmdldFRyYW5zaXRpb25FbmQiLCJHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIuc3VwcG9ydHNBbmltYXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0UscUJBQTBDLDBCQUEwQixDQUFDLENBQUE7QUFDckUsNEJBQXlCLHVDQUF1QyxDQUFDLENBQUE7QUFDakUseUJBQXNCLHdDQUF3QyxDQUFDLENBQUE7QUFHL0Q7O0dBRUc7QUFDSDtJQUF1REEsNENBQVVBO0lBRy9EQTtRQUhGQyxpQkFtRENBO1FBL0NHQSxpQkFBT0EsQ0FBQ0E7UUFIRkEscUJBQWdCQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUNoQ0EsbUJBQWNBLEdBQVdBLElBQUlBLENBQUNBO1FBR3BDQSxJQUFJQSxDQUFDQTtZQUNIQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFh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QUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQSxJQUFLQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO0lBQ3BFQSxDQUFDQTtJQUNETixxREFBa0JBLEdBQWxCQTtRQUNFTyxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLEVBQUVBLENBQUNBO0lBQ3ZFQSxDQUFDQTtJQUNEUCxtREFBZ0JBLEdBQWhCQSxjQUE2QlEsTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hHUixvREFBaUJBLEdBQWpCQTtRQUNFUyxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7SUFDNUVBLENBQUNBO0lBQ0hULCtCQUFDQTtBQUFEQSxDQUFDQSxBQW5ERCxFQUF1RCx3QkFBVSxFQW1EaEU7QUFuRHFCLGdDQUF3QiwyQkFtRDdDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzRnVuY3Rpb24sIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0RvbUFkYXB0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtYSFJJbXBsfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci94aHJfaW1wbCc7XG5cblxuLyoqXG4gKiBQcm92aWRlcyBET00gb3BlcmF0aW9ucyBpbiBhbnkgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEdlbmVyaWNCcm93c2VyRG9tQWRhcHRlciBleHRlbmRzIERvbUFkYXB0ZXIge1xuICBwcml2YXRlIF9hbmltYXRpb25QcmVmaXg6IHN0cmluZyA9IG51bGw7XG4gIHByaXZhdGUgX3RyYW5zaXRpb25FbmQ6IHN0cmluZyA9IG51bGw7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5jcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLmRlZmF1bHREb2MoKSk7XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuZ2V0U3R5bGUoZWxlbWVudCwgJ2FuaW1hdGlvbk5hbWUnKSkpIHtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uUHJlZml4ID0gJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZG9tUHJlZml4ZXMgPSBbJ1dlYmtpdCcsICdNb3onLCAnTycsICdtcyddO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRvbVByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLmdldFN0eWxlKGVsZW1lbnQsIGRvbVByZWZpeGVzW2ldICsgJ0FuaW1hdGlvbk5hbWUnKSkpIHtcbiAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvblByZWZpeCA9ICctJyArIGRvbVByZWZpeGVzW2ldLnRvTG93ZXJDYXNlKCkgKyAnLSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciB0cmFuc0VuZEV2ZW50TmFtZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge1xuICAgICAgICBXZWJraXRUcmFuc2l0aW9uOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAgIE1velRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgT1RyYW5zaXRpb246ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXG4gICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJ1xuICAgICAgfTtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh0cmFuc0VuZEV2ZW50TmFtZXMsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5nZXRTdHlsZShlbGVtZW50LCBrZXkpKSkge1xuICAgICAgICAgIHRoaXMuX3RyYW5zaXRpb25FbmQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fYW5pbWF0aW9uUHJlZml4ID0gbnVsbDtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25FbmQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldFhIUigpOiBUeXBlIHsgcmV0dXJuIFhIUkltcGw7IH1cbiAgZ2V0RGlzdHJpYnV0ZWROb2RlcyhlbDogSFRNTEVsZW1lbnQpOiBOb2RlW10geyByZXR1cm4gKDxhbnk+ZWwpLmdldERpc3RyaWJ1dGVkTm9kZXMoKTsgfVxuICByZXNvbHZlQW5kU2V0SHJlZihlbDogSFRNTEFuY2hvckVsZW1lbnQsIGJhc2VVcmw6IHN0cmluZywgaHJlZjogc3RyaW5nKSB7XG4gICAgZWwuaHJlZiA9IGhyZWYgPT0gbnVsbCA/IGJhc2VVcmwgOiBiYXNlVXJsICsgJy8uLi8nICsgaHJlZjtcbiAgfVxuICBzdXBwb3J0c0RPTUV2ZW50cygpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cbiAgc3VwcG9ydHNOYXRpdmVTaGFkb3dET00oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24oKDxhbnk+dGhpcy5kZWZhdWx0RG9jKCkuYm9keSkuY3JlYXRlU2hhZG93Um9vdCk7XG4gIH1cbiAgZ2V0QW5pbWF0aW9uUHJlZml4KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9hbmltYXRpb25QcmVmaXgpID8gdGhpcy5fYW5pbWF0aW9uUHJlZml4IDogXCJcIjtcbiAgfVxuICBnZXRUcmFuc2l0aW9uRW5kKCk6IHN0cmluZyB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5fdHJhbnNpdGlvbkVuZCkgPyB0aGlzLl90cmFuc2l0aW9uRW5kIDogXCJcIjsgfVxuICBzdXBwb3J0c0FuaW1hdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2FuaW1hdGlvblByZWZpeCkgJiYgaXNQcmVzZW50KHRoaXMuX3RyYW5zaXRpb25FbmQpO1xuICB9XG59XG4iXX0=