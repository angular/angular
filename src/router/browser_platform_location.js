'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var platform_location_1 = require('./platform_location');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 */
var BrowserPlatformLocation = (function (_super) {
    __extends(BrowserPlatformLocation, _super);
    function BrowserPlatformLocation() {
        _super.call(this);
        this._init();
    }
    // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it
    /** @internal */
    BrowserPlatformLocation.prototype._init = function () {
        this._location = dom_adapter_1.DOM.getLocation();
        this._history = dom_adapter_1.DOM.getHistory();
    };
    Object.defineProperty(BrowserPlatformLocation.prototype, "location", {
        /** @internal */
        get: function () { return this._location; },
        enumerable: true,
        configurable: true
    });
    BrowserPlatformLocation.prototype.getBaseHrefFromDOM = function () { return dom_adapter_1.DOM.getBaseHref(); };
    BrowserPlatformLocation.prototype.onPopState = function (fn) {
        dom_adapter_1.DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
    };
    BrowserPlatformLocation.prototype.onHashChange = function (fn) {
        dom_adapter_1.DOM.getGlobalEventTarget('window').addEventListener('hashchange', fn, false);
    };
    Object.defineProperty(BrowserPlatformLocation.prototype, "pathname", {
        get: function () { return this._location.pathname; },
        set: function (newPath) { this._location.pathname = newPath; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BrowserPlatformLocation.prototype, "search", {
        get: function () { return this._location.search; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BrowserPlatformLocation.prototype, "hash", {
        get: function () { return this._location.hash; },
        enumerable: true,
        configurable: true
    });
    BrowserPlatformLocation.prototype.pushState = function (state, title, url) {
        this._history.pushState(state, title, url);
    };
    BrowserPlatformLocation.prototype.replaceState = function (state, title, url) {
        this._history.replaceState(state, title, url);
    };
    BrowserPlatformLocation.prototype.forward = function () { this._history.forward(); };
    BrowserPlatformLocation.prototype.back = function () { this._history.back(); };
    BrowserPlatformLocation = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], BrowserPlatformLocation);
    return BrowserPlatformLocation;
})(platform_location_1.PlatformLocation);
exports.BrowserPlatformLocation = BrowserPlatformLocation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9wbGF0Zm9ybV9sb2NhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvYnJvd3Nlcl9wbGF0Zm9ybV9sb2NhdGlvbi50cyJdLCJuYW1lcyI6WyJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbiIsIkJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLmNvbnN0cnVjdG9yIiwiQnJvd3NlclBsYXRmb3JtTG9jYXRpb24uX2luaXQiLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5sb2NhdGlvbiIsIkJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLmdldEJhc2VIcmVmRnJvbURPTSIsIkJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLm9uUG9wU3RhdGUiLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5vbkhhc2hDaGFuZ2UiLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5wYXRobmFtZSIsIkJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLnNlYXJjaCIsIkJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLmhhc2giLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5wdXNoU3RhdGUiLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5yZXBsYWNlU3RhdGUiLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkIiwiQnJvd3NlclBsYXRmb3JtTG9jYXRpb24uYmFjayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFBeUIsZUFBZSxDQUFDLENBQUE7QUFHekMsa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFDckQsNEJBQWtCLHVDQUF1QyxDQUFDLENBQUE7QUFFMUQ7Ozs7R0FJRztBQUNIO0lBQzZDQSwyQ0FBZ0JBO0lBSTNEQTtRQUNFQyxpQkFBT0EsQ0FBQ0E7UUFDUkEsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFFREQsMEZBQTBGQTtJQUMxRkEsZ0JBQWdCQTtJQUNoQkEsdUNBQUtBLEdBQUxBO1FBQ0VFLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLGlCQUFHQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUNuQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsaUJBQUdBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO0lBQ25DQSxDQUFDQTtJQUdERixzQkFBSUEsNkNBQVFBO1FBRFpBLGdCQUFnQkE7YUFDaEJBLGNBQTJCRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFIO0lBRW5EQSxvREFBa0JBLEdBQWxCQSxjQUErQkksTUFBTUEsQ0FBQ0EsaUJBQUdBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRTFESiw0Q0FBVUEsR0FBVkEsVUFBV0EsRUFBcUJBO1FBQzlCSyxpQkFBR0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFVBQVVBLEVBQUVBLEVBQUVBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQzdFQSxDQUFDQTtJQUVETCw4Q0FBWUEsR0FBWkEsVUFBYUEsRUFBcUJBO1FBQ2hDTSxpQkFBR0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFlBQVlBLEVBQUVBLEVBQUVBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQy9FQSxDQUFDQTtJQUVETixzQkFBSUEsNkNBQVFBO2FBQVpBLGNBQXlCTyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTthQUcxRFAsVUFBYUEsT0FBZUEsSUFBSU8sSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUhWUDtJQUMxREEsc0JBQUlBLDJDQUFNQTthQUFWQSxjQUF1QlEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBUjtJQUN0REEsc0JBQUlBLHlDQUFJQTthQUFSQSxjQUFxQlMsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBVDtJQUdsREEsMkNBQVNBLEdBQVRBLFVBQVVBLEtBQVVBLEVBQUVBLEtBQWFBLEVBQUVBLEdBQVdBO1FBQzlDVSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFFRFYsOENBQVlBLEdBQVpBLFVBQWFBLEtBQVVBLEVBQUVBLEtBQWFBLEVBQUVBLEdBQVdBO1FBQ2pEVyxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNoREEsQ0FBQ0E7SUFFRFgseUNBQU9BLEdBQVBBLGNBQWtCWSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU1Q1osc0NBQUlBLEdBQUpBLGNBQWVhLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBN0N4Q2I7UUFBQ0EsaUJBQVVBLEVBQUVBOztnQ0E4Q1pBO0lBQURBLDhCQUFDQTtBQUFEQSxDQUFDQSxBQTlDRCxFQUM2QyxvQ0FBZ0IsRUE2QzVEO0FBN0NZLCtCQUF1QiwwQkE2Q25DLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtIaXN0b3J5LCBMb2NhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9icm93c2VyJztcbmltcG9ydCB7VXJsQ2hhbmdlTGlzdGVuZXJ9IGZyb20gJy4vcGxhdGZvcm1fbG9jYXRpb24nO1xuaW1wb3J0IHtQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3BsYXRmb3JtX2xvY2F0aW9uJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuLyoqXG4gKiBgUGxhdGZvcm1Mb2NhdGlvbmAgZW5jYXBzdWxhdGVzIGFsbCBvZiB0aGUgZGlyZWN0IGNhbGxzIHRvIHBsYXRmb3JtIEFQSXMuXG4gKiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseSBieSBhbiBhcHBsaWNhdGlvbiBkZXZlbG9wZXIuIEluc3RlYWQsIHVzZVxuICoge0BsaW5rIExvY2F0aW9ufS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uIGV4dGVuZHMgUGxhdGZvcm1Mb2NhdGlvbiB7XG4gIHByaXZhdGUgX2xvY2F0aW9uOiBMb2NhdGlvbjtcbiAgcHJpdmF0ZSBfaGlzdG9yeTogSGlzdG9yeTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuXG4gIC8vIFRoaXMgaXMgbW92ZWQgdG8gaXRzIG93biBtZXRob2Qgc28gdGhhdCBgTW9ja1BsYXRmb3JtTG9jYXRpb25TdHJhdGVneWAgY2FuIG92ZXJ3cml0ZSBpdFxuICAvKiogQGludGVybmFsICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuX2xvY2F0aW9uID0gRE9NLmdldExvY2F0aW9uKCk7XG4gICAgdGhpcy5faGlzdG9yeSA9IERPTS5nZXRIaXN0b3J5KCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIGdldCBsb2NhdGlvbigpOiBMb2NhdGlvbiB7IHJldHVybiB0aGlzLl9sb2NhdGlvbjsgfVxuXG4gIGdldEJhc2VIcmVmRnJvbURPTSgpOiBzdHJpbmcgeyByZXR1cm4gRE9NLmdldEJhc2VIcmVmKCk7IH1cblxuICBvblBvcFN0YXRlKGZuOiBVcmxDaGFuZ2VMaXN0ZW5lcik6IHZvaWQge1xuICAgIERPTS5nZXRHbG9iYWxFdmVudFRhcmdldCgnd2luZG93JykuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmbiwgZmFsc2UpO1xuICB9XG5cbiAgb25IYXNoQ2hhbmdlKGZuOiBVcmxDaGFuZ2VMaXN0ZW5lcik6IHZvaWQge1xuICAgIERPTS5nZXRHbG9iYWxFdmVudFRhcmdldCgnd2luZG93JykuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGZuLCBmYWxzZSk7XG4gIH1cblxuICBnZXQgcGF0aG5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2xvY2F0aW9uLnBhdGhuYW1lOyB9XG4gIGdldCBzZWFyY2goKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2xvY2F0aW9uLnNlYXJjaDsgfVxuICBnZXQgaGFzaCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fbG9jYXRpb24uaGFzaDsgfVxuICBzZXQgcGF0aG5hbWUobmV3UGF0aDogc3RyaW5nKSB7IHRoaXMuX2xvY2F0aW9uLnBhdGhuYW1lID0gbmV3UGF0aDsgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2hpc3RvcnkucHVzaFN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2hpc3RvcnkucmVwbGFjZVN0YXRlKHN0YXRlLCB0aXRsZSwgdXJsKTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMuX2hpc3RvcnkuZm9yd2FyZCgpOyB9XG5cbiAgYmFjaygpOiB2b2lkIHsgdGhpcy5faGlzdG9yeS5iYWNrKCk7IH1cbn1cbiJdfQ==