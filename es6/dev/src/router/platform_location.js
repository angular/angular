var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
    replaceState(state, title, url) {
        this._history.replaceState(state, title, url);
    }
    forward() { this._history.forward(); }
    back() { this._history.back(); }
};
PlatformLocation = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], PlatformLocation);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbIlBsYXRmb3JtTG9jYXRpb24iLCJQbGF0Zm9ybUxvY2F0aW9uLmNvbnN0cnVjdG9yIiwiUGxhdGZvcm1Mb2NhdGlvbi5faW5pdCIsIlBsYXRmb3JtTG9jYXRpb24uZ2V0QmFzZUhyZWZGcm9tRE9NIiwiUGxhdGZvcm1Mb2NhdGlvbi5vblBvcFN0YXRlIiwiUGxhdGZvcm1Mb2NhdGlvbi5vbkhhc2hDaGFuZ2UiLCJQbGF0Zm9ybUxvY2F0aW9uLnBhdGhuYW1lIiwiUGxhdGZvcm1Mb2NhdGlvbi5zZWFyY2giLCJQbGF0Zm9ybUxvY2F0aW9uLmhhc2giLCJQbGF0Zm9ybUxvY2F0aW9uLnB1c2hTdGF0ZSIsIlBsYXRmb3JtTG9jYXRpb24ucmVwbGFjZVN0YXRlIiwiUGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkIiwiUGxhdGZvcm1Mb2NhdGlvbi5iYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLHVDQUF1QztPQUNsRCxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWU7QUFHeEM7Ozs7R0FJRztBQUNIO0lBS0VBO1FBQWdCQyxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUUvQkQsMEZBQTBGQTtJQUMxRkEsZ0JBQWdCQTtJQUNoQkEsS0FBS0E7UUFDSEUsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDbkNBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLEdBQUdBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO0lBQ25DQSxDQUFDQTtJQUVERixrQkFBa0JBLEtBQWFHLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRTFESCxVQUFVQSxDQUFDQSxFQUFpQkE7UUFDMUJJLEdBQUdBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxVQUFVQSxFQUFFQSxFQUFFQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUM3RUEsQ0FBQ0E7SUFFREosWUFBWUEsQ0FBQ0EsRUFBaUJBO1FBQzVCSyxHQUFHQSxDQUFDQSxvQkFBb0JBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsWUFBWUEsRUFBRUEsRUFBRUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDL0VBLENBQUNBO0lBRURMLElBQUlBLFFBQVFBLEtBQWFNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO0lBQzFETixJQUFJQSxNQUFNQSxLQUFhTyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN0RFAsSUFBSUEsSUFBSUEsS0FBYVEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDbERSLElBQUlBLFFBQVFBLENBQUNBLE9BQWVBLElBQUlNLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO0lBRXBFTixTQUFTQSxDQUFDQSxLQUFVQSxFQUFFQSxLQUFhQSxFQUFFQSxHQUFXQTtRQUM5Q1MsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDN0NBLENBQUNBO0lBRURULFlBQVlBLENBQUNBLEtBQVVBLEVBQUVBLEtBQWFBLEVBQUVBLEdBQVdBO1FBQ2pEVSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNoREEsQ0FBQ0E7SUFFRFYsT0FBT0EsS0FBV1csSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFNUNYLElBQUlBLEtBQVdZLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQ3hDWixDQUFDQTtBQXhDRDtJQUFDLFVBQVUsRUFBRTs7cUJBd0NaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtFdmVudExpc3RlbmVyLCBIaXN0b3J5LCBMb2NhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9icm93c2VyJztcblxuLyoqXG4gKiBgUGxhdGZvcm1Mb2NhdGlvbmAgZW5jYXBzdWxhdGVzIGFsbCBvZiB0aGUgZGlyZWN0IGNhbGxzIHRvIHBsYXRmb3JtIEFQSXMuXG4gKiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseSBieSBhbiBhcHBsaWNhdGlvbiBkZXZlbG9wZXIuIEluc3RlYWQsIHVzZVxuICoge0BsaW5rIExvY2F0aW9ufS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBsYXRmb3JtTG9jYXRpb24ge1xuICBwcml2YXRlIF9sb2NhdGlvbjogTG9jYXRpb247XG4gIHByaXZhdGUgX2hpc3Rvcnk6IEhpc3Rvcnk7XG5cbiAgY29uc3RydWN0b3IoKSB7IHRoaXMuX2luaXQoKTsgfVxuXG4gIC8vIFRoaXMgaXMgbW92ZWQgdG8gaXRzIG93biBtZXRob2Qgc28gdGhhdCBgTW9ja1BsYXRmb3JtTG9jYXRpb25TdHJhdGVneWAgY2FuIG92ZXJ3cml0ZSBpdFxuICAvKiogQGludGVybmFsICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuX2xvY2F0aW9uID0gRE9NLmdldExvY2F0aW9uKCk7XG4gICAgdGhpcy5faGlzdG9yeSA9IERPTS5nZXRIaXN0b3J5KCk7XG4gIH1cblxuICBnZXRCYXNlSHJlZkZyb21ET00oKTogc3RyaW5nIHsgcmV0dXJuIERPTS5nZXRCYXNlSHJlZigpOyB9XG5cbiAgb25Qb3BTdGF0ZShmbjogRXZlbnRMaXN0ZW5lcik6IHZvaWQge1xuICAgIERPTS5nZXRHbG9iYWxFdmVudFRhcmdldCgnd2luZG93JykuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmbiwgZmFsc2UpO1xuICB9XG5cbiAgb25IYXNoQ2hhbmdlKGZuOiBFdmVudExpc3RlbmVyKTogdm9pZCB7XG4gICAgRE9NLmdldEdsb2JhbEV2ZW50VGFyZ2V0KCd3aW5kb3cnKS5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgZm4sIGZhbHNlKTtcbiAgfVxuXG4gIGdldCBwYXRobmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fbG9jYXRpb24ucGF0aG5hbWU7IH1cbiAgZ2V0IHNlYXJjaCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fbG9jYXRpb24uc2VhcmNoOyB9XG4gIGdldCBoYXNoKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9sb2NhdGlvbi5oYXNoOyB9XG4gIHNldCBwYXRobmFtZShuZXdQYXRoOiBzdHJpbmcpIHsgdGhpcy5fbG9jYXRpb24ucGF0aG5hbWUgPSBuZXdQYXRoOyB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5faGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5faGlzdG9yeS5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5faGlzdG9yeS5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9oaXN0b3J5LmJhY2soKTsgfVxufVxuIl19