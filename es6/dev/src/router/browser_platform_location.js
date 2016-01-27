var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/core';
import { PlatformLocation } from './platform_location';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 */
export let BrowserPlatformLocation = class extends PlatformLocation {
    constructor() {
        super();
        this._init();
    }
    // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it
    /** @internal */
    _init() {
        this._location = DOM.getLocation();
        this._history = DOM.getHistory();
    }
    /** @internal */
    get location() { return this._location; }
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
BrowserPlatformLocation = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], BrowserPlatformLocation);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9wbGF0Zm9ybV9sb2NhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvYnJvd3Nlcl9wbGF0Zm9ybV9sb2NhdGlvbi50cyJdLCJuYW1lcyI6WyJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbiIsIkJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLmNvbnN0cnVjdG9yIiwiQnJvd3NlclBsYXRmb3JtTG9jYXRpb24uX2luaXQiLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5sb2NhdGlvbiIsIkJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLmdldEJhc2VIcmVmRnJvbURPTSIsIkJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLm9uUG9wU3RhdGUiLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5vbkhhc2hDaGFuZ2UiLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5wYXRobmFtZSIsIkJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLnNlYXJjaCIsIkJyb3dzZXJQbGF0Zm9ybUxvY2F0aW9uLmhhc2giLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5wdXNoU3RhdGUiLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5yZXBsYWNlU3RhdGUiLCJCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbi5mb3J3YXJkIiwiQnJvd3NlclBsYXRmb3JtTG9jYXRpb24uYmFjayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BR2pDLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7T0FDN0MsRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7QUFFekQ7Ozs7R0FJRztBQUNILG1EQUM2QyxnQkFBZ0I7SUFJM0RBO1FBQ0VDLE9BQU9BLENBQUNBO1FBQ1JBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO0lBQ2ZBLENBQUNBO0lBRURELDBGQUEwRkE7SUFDMUZBLGdCQUFnQkE7SUFDaEJBLEtBQUtBO1FBQ0hFLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEdBQUdBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ25DQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxHQUFHQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtJQUNuQ0EsQ0FBQ0E7SUFFREYsZ0JBQWdCQTtJQUNoQkEsSUFBSUEsUUFBUUEsS0FBZUcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFbkRILGtCQUFrQkEsS0FBYUksTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFMURKLFVBQVVBLENBQUNBLEVBQXFCQTtRQUM5QkssR0FBR0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFVBQVVBLEVBQUVBLEVBQUVBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQzdFQSxDQUFDQTtJQUVETCxZQUFZQSxDQUFDQSxFQUFxQkE7UUFDaENNLEdBQUdBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxZQUFZQSxFQUFFQSxFQUFFQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUMvRUEsQ0FBQ0E7SUFFRE4sSUFBSUEsUUFBUUEsS0FBYU8sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDMURQLElBQUlBLE1BQU1BLEtBQWFRLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO0lBQ3REUixJQUFJQSxJQUFJQSxLQUFhUyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNsRFQsSUFBSUEsUUFBUUEsQ0FBQ0EsT0FBZUEsSUFBSU8sSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFcEVQLFNBQVNBLENBQUNBLEtBQVVBLEVBQUVBLEtBQWFBLEVBQUVBLEdBQVdBO1FBQzlDVSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFFRFYsWUFBWUEsQ0FBQ0EsS0FBVUEsRUFBRUEsS0FBYUEsRUFBRUEsR0FBV0E7UUFDakRXLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFlBQVlBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0lBQ2hEQSxDQUFDQTtJQUVEWCxPQUFPQSxLQUFXWSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU1Q1osSUFBSUEsS0FBV2EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDeENiLENBQUNBO0FBOUNEO0lBQUMsVUFBVSxFQUFFOzs0QkE4Q1o7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0hpc3RvcnksIExvY2F0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2Jyb3dzZXInO1xuaW1wb3J0IHtVcmxDaGFuZ2VMaXN0ZW5lcn0gZnJvbSAnLi9wbGF0Zm9ybV9sb2NhdGlvbic7XG5pbXBvcnQge1BsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vcGxhdGZvcm1fbG9jYXRpb24nO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG4vKipcbiAqIGBQbGF0Zm9ybUxvY2F0aW9uYCBlbmNhcHN1bGF0ZXMgYWxsIG9mIHRoZSBkaXJlY3QgY2FsbHMgdG8gcGxhdGZvcm0gQVBJcy5cbiAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5IGJ5IGFuIGFwcGxpY2F0aW9uIGRldmVsb3Blci4gSW5zdGVhZCwgdXNlXG4gKiB7QGxpbmsgTG9jYXRpb259LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3NlclBsYXRmb3JtTG9jYXRpb24gZXh0ZW5kcyBQbGF0Zm9ybUxvY2F0aW9uIHtcbiAgcHJpdmF0ZSBfbG9jYXRpb246IExvY2F0aW9uO1xuICBwcml2YXRlIF9oaXN0b3J5OiBIaXN0b3J5O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgLy8gVGhpcyBpcyBtb3ZlZCB0byBpdHMgb3duIG1ldGhvZCBzbyB0aGF0IGBNb2NrUGxhdGZvcm1Mb2NhdGlvblN0cmF0ZWd5YCBjYW4gb3ZlcndyaXRlIGl0XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy5fbG9jYXRpb24gPSBET00uZ2V0TG9jYXRpb24oKTtcbiAgICB0aGlzLl9oaXN0b3J5ID0gRE9NLmdldEhpc3RvcnkoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgZ2V0IGxvY2F0aW9uKCk6IExvY2F0aW9uIHsgcmV0dXJuIHRoaXMuX2xvY2F0aW9uOyB9XG5cbiAgZ2V0QmFzZUhyZWZGcm9tRE9NKCk6IHN0cmluZyB7IHJldHVybiBET00uZ2V0QmFzZUhyZWYoKTsgfVxuXG4gIG9uUG9wU3RhdGUoZm46IFVybENoYW5nZUxpc3RlbmVyKTogdm9pZCB7XG4gICAgRE9NLmdldEdsb2JhbEV2ZW50VGFyZ2V0KCd3aW5kb3cnKS5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGZuLCBmYWxzZSk7XG4gIH1cblxuICBvbkhhc2hDaGFuZ2UoZm46IFVybENoYW5nZUxpc3RlbmVyKTogdm9pZCB7XG4gICAgRE9NLmdldEdsb2JhbEV2ZW50VGFyZ2V0KCd3aW5kb3cnKS5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgZm4sIGZhbHNlKTtcbiAgfVxuXG4gIGdldCBwYXRobmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fbG9jYXRpb24ucGF0aG5hbWU7IH1cbiAgZ2V0IHNlYXJjaCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fbG9jYXRpb24uc2VhcmNoOyB9XG4gIGdldCBoYXNoKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9sb2NhdGlvbi5oYXNoOyB9XG4gIHNldCBwYXRobmFtZShuZXdQYXRoOiBzdHJpbmcpIHsgdGhpcy5fbG9jYXRpb24ucGF0aG5hbWUgPSBuZXdQYXRoOyB9XG5cbiAgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5faGlzdG9yeS5wdXNoU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5faGlzdG9yeS5yZXBsYWNlU3RhdGUoc3RhdGUsIHRpdGxlLCB1cmwpO1xuICB9XG5cbiAgZm9yd2FyZCgpOiB2b2lkIHsgdGhpcy5faGlzdG9yeS5mb3J3YXJkKCk7IH1cblxuICBiYWNrKCk6IHZvaWQgeyB0aGlzLl9oaXN0b3J5LmJhY2soKTsgfVxufVxuIl19