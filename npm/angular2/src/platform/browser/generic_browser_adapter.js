'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
}(dom_adapter_1.DomAdapter));
exports.GenericBrowserDomAdapter = GenericBrowserDomAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJpY19icm93c2VyX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci9nZW5lcmljX2Jyb3dzZXJfYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSxxQkFBMEMsMEJBQTBCLENBQUMsQ0FBQTtBQUNyRSw0QkFBeUIsdUNBQXVDLENBQUMsQ0FBQTtBQUNqRSx5QkFBc0Isd0NBQXdDLENBQUMsQ0FBQTtBQUcvRDs7R0FFRztBQUNIO0lBQXVELDRDQUFVO0lBRy9EO1FBSEYsaUJBbURDO1FBL0NHLGlCQUFPLENBQUM7UUFIRixxQkFBZ0IsR0FBVyxJQUFJLENBQUM7UUFDaEMsbUJBQWMsR0FBVyxJQUFJLENBQUM7UUFHcEMsSUFBSSxDQUFDO1lBQ0gsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDM0QsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUM3QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sSUFBSSxXQUFXLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzVDLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN4RSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUM7d0JBQ2pFLEtBQUssQ0FBQztvQkFDUixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBQ0QsSUFBSSxrQkFBa0IsR0FBNEI7Z0JBQ2hELGdCQUFnQixFQUFFLHFCQUFxQjtnQkFDdkMsYUFBYSxFQUFFLGVBQWU7Z0JBQzlCLFdBQVcsRUFBRSwrQkFBK0I7Z0JBQzVDLFVBQVUsRUFBRSxlQUFlO2FBQzVCLENBQUM7WUFDRiw2QkFBZ0IsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsVUFBQyxLQUFhLEVBQUUsR0FBVztnQkFDdEUsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxLQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0MsS0FBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7Z0JBQzlCLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1gsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztRQUM3QixDQUFDO0lBQ0gsQ0FBQztJQUVELHlDQUFNLEdBQU4sY0FBaUIsTUFBTSxDQUFDLGtCQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLHNEQUFtQixHQUFuQixVQUFvQixFQUFlLElBQVksTUFBTSxDQUFPLEVBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4RixvREFBaUIsR0FBakIsVUFBa0IsRUFBcUIsRUFBRSxPQUFlLEVBQUUsSUFBWTtRQUNwRSxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsT0FBTyxHQUFHLE9BQU8sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQzdELENBQUM7SUFDRCxvREFBaUIsR0FBakIsY0FBK0IsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDN0MsMERBQXVCLEdBQXZCO1FBQ0UsTUFBTSxDQUFDLGlCQUFVLENBQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFDRCxxREFBa0IsR0FBbEI7UUFDRSxNQUFNLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQ3ZFLENBQUM7SUFDRCxtREFBZ0IsR0FBaEIsY0FBNkIsTUFBTSxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoRyxvREFBaUIsR0FBakI7UUFDRSxNQUFNLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxnQkFBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBQ0gsK0JBQUM7QUFBRCxDQUFDLEFBbkRELENBQXVELHdCQUFVLEdBbURoRTtBQW5EcUIsZ0NBQXdCLDJCQW1EN0MsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNGdW5jdGlvbiwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7RG9tQWRhcHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge1hIUkltcGx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9icm93c2VyL3hocl9pbXBsJztcblxuXG4vKipcbiAqIFByb3ZpZGVzIERPTSBvcGVyYXRpb25zIGluIGFueSBicm93c2VyIGVudmlyb25tZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgR2VuZXJpY0Jyb3dzZXJEb21BZGFwdGVyIGV4dGVuZHMgRG9tQWRhcHRlciB7XG4gIHByaXZhdGUgX2FuaW1hdGlvblByZWZpeDogc3RyaW5nID0gbnVsbDtcbiAgcHJpdmF0ZSBfdHJhbnNpdGlvbkVuZDogc3RyaW5nID0gbnVsbDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuZGVmYXVsdERvYygpKTtcbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5nZXRTdHlsZShlbGVtZW50LCAnYW5pbWF0aW9uTmFtZScpKSkge1xuICAgICAgICB0aGlzLl9hbmltYXRpb25QcmVmaXggPSAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBkb21QcmVmaXhlcyA9IFsnV2Via2l0JywgJ01veicsICdPJywgJ21zJ107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZG9tUHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KHRoaXMuZ2V0U3R5bGUoZWxlbWVudCwgZG9tUHJlZml4ZXNbaV0gKyAnQW5pbWF0aW9uTmFtZScpKSkge1xuICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uUHJlZml4ID0gJy0nICsgZG9tUHJlZml4ZXNbaV0udG9Mb3dlckNhc2UoKSArICctJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gICAgICAgIFdlYmtpdFRyYW5zaXRpb246ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgTW96VHJhbnNpdGlvbjogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICBPVHJhbnNpdGlvbjogJ29UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgdHJhbnNpdGlvbjogJ3RyYW5zaXRpb25lbmQnXG4gICAgICB9O1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRyYW5zRW5kRXZlbnROYW1lcywgKHZhbHVlOiBzdHJpbmcsIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5nZXRTdHlsZShlbGVtZW50LCBrZXkpKSkge1xuICAgICAgICAgIHRoaXMuX3RyYW5zaXRpb25FbmQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fYW5pbWF0aW9uUHJlZml4ID0gbnVsbDtcbiAgICAgIHRoaXMuX3RyYW5zaXRpb25FbmQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldFhIUigpOiBUeXBlIHsgcmV0dXJuIFhIUkltcGw7IH1cbiAgZ2V0RGlzdHJpYnV0ZWROb2RlcyhlbDogSFRNTEVsZW1lbnQpOiBOb2RlW10geyByZXR1cm4gKDxhbnk+ZWwpLmdldERpc3RyaWJ1dGVkTm9kZXMoKTsgfVxuICByZXNvbHZlQW5kU2V0SHJlZihlbDogSFRNTEFuY2hvckVsZW1lbnQsIGJhc2VVcmw6IHN0cmluZywgaHJlZjogc3RyaW5nKSB7XG4gICAgZWwuaHJlZiA9IGhyZWYgPT0gbnVsbCA/IGJhc2VVcmwgOiBiYXNlVXJsICsgJy8uLi8nICsgaHJlZjtcbiAgfVxuICBzdXBwb3J0c0RPTUV2ZW50cygpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cbiAgc3VwcG9ydHNOYXRpdmVTaGFkb3dET00oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24oKDxhbnk+dGhpcy5kZWZhdWx0RG9jKCkuYm9keSkuY3JlYXRlU2hhZG93Um9vdCk7XG4gIH1cbiAgZ2V0QW5pbWF0aW9uUHJlZml4KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9hbmltYXRpb25QcmVmaXgpID8gdGhpcy5fYW5pbWF0aW9uUHJlZml4IDogXCJcIjtcbiAgfVxuICBnZXRUcmFuc2l0aW9uRW5kKCk6IHN0cmluZyB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5fdHJhbnNpdGlvbkVuZCkgPyB0aGlzLl90cmFuc2l0aW9uRW5kIDogXCJcIjsgfVxuICBzdXBwb3J0c0FuaW1hdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2FuaW1hdGlvblByZWZpeCkgJiYgaXNQcmVzZW50KHRoaXMuX3RyYW5zaXRpb25FbmQpO1xuICB9XG59XG4iXX0=