'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var core_1 = require('angular2/core');
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 */
var PlatformLocation = (function () {
    function PlatformLocation() {
        this._init();
    }
    // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it
    /** @internal */
    PlatformLocation.prototype._init = function () {
        this._location = dom_adapter_1.DOM.getLocation();
        this._history = dom_adapter_1.DOM.getHistory();
    };
    PlatformLocation.prototype.getBaseHrefFromDOM = function () { return dom_adapter_1.DOM.getBaseHref(); };
    PlatformLocation.prototype.onPopState = function (fn) {
        dom_adapter_1.DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
    };
    PlatformLocation.prototype.onHashChange = function (fn) {
        dom_adapter_1.DOM.getGlobalEventTarget('window').addEventListener('hashchange', fn, false);
    };
    Object.defineProperty(PlatformLocation.prototype, "pathname", {
        get: function () { return this._location.pathname; },
        set: function (newPath) { this._location.pathname = newPath; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlatformLocation.prototype, "search", {
        get: function () { return this._location.search; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlatformLocation.prototype, "hash", {
        get: function () { return this._location.hash; },
        enumerable: true,
        configurable: true
    });
    PlatformLocation.prototype.pushState = function (state, title, url) {
        this._history.pushState(state, title, url);
    };
    PlatformLocation.prototype.replaceState = function (state, title, url) {
        this._history.replaceState(state, title, url);
    };
    PlatformLocation.prototype.forward = function () { this._history.forward(); };
    PlatformLocation.prototype.back = function () { this._history.back(); };
    PlatformLocation = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PlatformLocation);
    return PlatformLocation;
})();
exports.PlatformLocation = PlatformLocation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbIlBsYXRmb3JtTG9jYXRpb24iLCJQbGF0Zm9ybUxvY2F0aW9uLmNvbnN0cnVjdG9yIiwiUGxhdGZvcm1Mb2NhdGlvbi5faW5pdCIsIlBsYXRmb3JtTG9jYXRpb24uZ2V0QmFzZUhyZWZGcm9tRE9NIiwiUGxhdGZvcm1Mb2NhdGlvbi5vblBvcFN0YXRlIiwiUGxhdGZvcm1Mb2NhdGlvbi5vbkhhc2hDaGFuZ2UiLCJQbGF0Zm9ybUxvY2F0aW9uLnBhdGhuYW1lIiwiUGxhdGZvcm1Mb2NhdGlvbi5zZWFyY2giLCJQbGF0Zm9ybUxvY2F0aW9uLmhhc2giLCJQbGF0Zm9ybUxvY2F0aW9uLnB1c2hTdGF0ZSIsIlBsYXRmb3JtTG9jYXRpb24ucmVwbGFjZVN0YXRlIiwiUGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkIiwiUGxhdGZvcm1Mb2NhdGlvbi5iYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLDRCQUFrQix1Q0FBdUMsQ0FBQyxDQUFBO0FBQzFELHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUd6Qzs7OztHQUlHO0FBQ0g7SUFLRUE7UUFBZ0JDLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO0lBQUNBLENBQUNBO0lBRS9CRCwwRkFBMEZBO0lBQzFGQSxnQkFBZ0JBO0lBQ2hCQSxnQ0FBS0EsR0FBTEE7UUFDRUUsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsaUJBQUdBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ25DQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxpQkFBR0EsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7SUFDbkNBLENBQUNBO0lBRURGLDZDQUFrQkEsR0FBbEJBLGNBQStCRyxNQUFNQSxDQUFDQSxpQkFBR0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFMURILHFDQUFVQSxHQUFWQSxVQUFXQSxFQUFpQkE7UUFDMUJJLGlCQUFHQSxDQUFDQSxvQkFBb0JBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsVUFBVUEsRUFBRUEsRUFBRUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDN0VBLENBQUNBO0lBRURKLHVDQUFZQSxHQUFaQSxVQUFhQSxFQUFpQkE7UUFDNUJLLGlCQUFHQSxDQUFDQSxvQkFBb0JBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsWUFBWUEsRUFBRUEsRUFBRUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDL0VBLENBQUNBO0lBRURMLHNCQUFJQSxzQ0FBUUE7YUFBWkEsY0FBeUJNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO2FBRzFETixVQUFhQSxPQUFlQSxJQUFJTSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxHQUFHQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BSFZOO0lBQzFEQSxzQkFBSUEsb0NBQU1BO2FBQVZBLGNBQXVCTyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFQO0lBQ3REQSxzQkFBSUEsa0NBQUlBO2FBQVJBLGNBQXFCUSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFSO0lBR2xEQSxvQ0FBU0EsR0FBVEEsVUFBVUEsS0FBVUEsRUFBRUEsS0FBYUEsRUFBRUEsR0FBV0E7UUFDOUNTLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0lBQzdDQSxDQUFDQTtJQUVEVCx1Q0FBWUEsR0FBWkEsVUFBYUEsS0FBVUEsRUFBRUEsS0FBYUEsRUFBRUEsR0FBV0E7UUFDakRVLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFlBQVlBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0lBQ2hEQSxDQUFDQTtJQUVEVixrQ0FBT0EsR0FBUEEsY0FBa0JXLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRTVDWCwrQkFBSUEsR0FBSkEsY0FBZVksSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUF2Q3hDWjtRQUFDQSxpQkFBVUEsRUFBRUE7O3lCQXdDWkE7SUFBREEsdUJBQUNBO0FBQURBLENBQUNBLEFBeENELElBd0NDO0FBdkNZLHdCQUFnQixtQkF1QzVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtFdmVudExpc3RlbmVyLCBIaXN0b3J5LCBMb2NhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9icm93c2VyJztcblxuLyoqXG4gKiBgUGxhdGZvcm1Mb2NhdGlvbmAgZW5jYXBzdWxhdGVzIGFsbCBvZiB0aGUgZGlyZWN0IGNhbGxzIHRvIHBsYXRmb3JtIEFQSXMuXG4gKiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseSBieSBhbiBhcHBsaWNhdGlvbiBkZXZlbG9wZXIuIEluc3RlYWQsIHVzZVxuICoge0BsaW5rIExvY2F0aW9ufS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBwcml2YXRlIF9sb2NhdGlvbjogTG9jYXRpb247XG4gIHByaXZhdGUgX2hpc3Rvcnk6IEhpc3Rvcnk7XG5cbiAgY29uc3RydWN0b3IoKSB7IHRoaXMuX2luaXQoKTsgfVxuXG4gIC8vIFRoaXMgaXMgbW92ZWQgdG8gaXRzIG93biBtZXRob2Qgc28gdGhhdCBgTW9ja1BsYXRmb3JtTG9jYXRpb25TdHJhdGVneWAgY2FuIG92ZXJ3cml0ZSBpdFxuICAvKiogQGludGVybmFsICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuX2xvY2F0aW9uID0gRE9NLmdldExvY2F0aW9uKCk7XG4gICAgdGhpcy5faGlzdG9yeSA9IERPTS5nZXRIaXN0b3J5KCk7XG4gIH1cblxuICBnZXRCYXNlSHJlZkZyb21ET00oKTogc3RyaW5nIHsgcmV0dXJuIERPTS5nZXRCYXNlSHJlZigpOyB9XG5cbiAgb25Qb3BTdGF0ZShmbjogRXZlbnRMaXN0ZW5lcik6IHZvaWQge1xuICAgIERPTS5nZXRHbG9iYWxFdmVudFRhcmdldCgnd2luZG93JykuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmbiwgZmFsc2UpO1xuICB9XG5cbiAgb25IYXNoQ2hhbmdlKGZuOiBFdmVudExpc3RlbmVyKTogdm9pZCB7XG4gICAgRE9NLmdldEdsb2JhbEV2ZW50VGFyZ2V0KCd3aW5kb3cnKS5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgZm4sIGZhbHNlKTtcbiAgfVxuXG4gIGdldCBwYXRobmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fbG9jYXRpb24ucGF0aG5hbWU7IH1cbiAgZ2V0IHNlYXJjaCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fbG9jYXRpb24uc2VhcmNoOyB9XG4gIGdldCBoYXNoKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9sb2NhdGlvbi5oYXNoOyB9XG4gIHNldCBwYXRobmFtZShuZXdQYXRoOiBzdHJpbmcpIHsgdGhpcy5fbG9jYXRpb24ucGF0aG5hbWUgPSBuZXdQYXRoOyB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5faGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5faGlzdG9yeS5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5faGlzdG9yeS5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9oaXN0b3J5LmJhY2soKTsgfVxufVxuIl19