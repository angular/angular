var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
/**
 * A spy for {@link Location} that allows tests to fire simulated location events.
 */
export let SpyLocation = class SpyLocation {
    constructor() {
        this.urlChanges = [];
        /** @internal */
        this._path = '';
        /** @internal */
        this._query = '';
        /** @internal */
        this._subject = new EventEmitter();
        /** @internal */
        this._baseHref = '';
        // TODO: remove these once Location is an interface, and can be implemented cleanly
        this.platformStrategy = null;
    }
    setInitialPath(url) { this._path = url; }
    setBaseHref(url) { this._baseHref = url; }
    path() { return this._path; }
    simulateUrlPop(pathname) {
        ObservableWrapper.callEmit(this._subject, { 'url': pathname, 'pop': true });
    }
    simulateHashChange(pathname) {
        // Because we don't prevent the native event, the browser will independently update the path
        this.setInitialPath(pathname);
        this.urlChanges.push('hash: ' + pathname);
        ObservableWrapper.callEmit(this._subject, { 'url': pathname, 'pop': true, 'type': 'hashchange' });
    }
    prepareExternalUrl(url) {
        if (url.length > 0 && !url.startsWith('/')) {
            url = '/' + url;
        }
        return this._baseHref + url;
    }
    go(path, query = '') {
        path = this.prepareExternalUrl(path);
        if (this._path == path && this._query == query) {
            return;
        }
        this._path = path;
        this._query = query;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push(url);
    }
    replaceState(path, query = '') {
        path = this.prepareExternalUrl(path);
        this._path = path;
        this._query = query;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push('replace: ' + url);
    }
    forward() {
        // TODO
    }
    back() {
        // TODO
    }
    subscribe(onNext, onThrow = null, onReturn = null) {
        return ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
    }
    normalize(url) { return null; }
};
SpyLocation = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], SpyLocation);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9tb2NrL2xvY2F0aW9uX21vY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7QUFJekU7O0dBRUc7QUFFSDtJQUFBO1FBQ0UsZUFBVSxHQUFhLEVBQUUsQ0FBQztRQUMxQixnQkFBZ0I7UUFDaEIsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQUNuQixnQkFBZ0I7UUFDaEIsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixnQkFBZ0I7UUFDaEIsYUFBUSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ2pELGdCQUFnQjtRQUNoQixjQUFTLEdBQVcsRUFBRSxDQUFDO1FBNER2QixtRkFBbUY7UUFDbkYscUJBQWdCLEdBQVEsSUFBSSxDQUFDO0lBRS9CLENBQUM7SUE3REMsY0FBYyxDQUFDLEdBQVcsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFakQsV0FBVyxDQUFDLEdBQVcsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFbEQsSUFBSSxLQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUVyQyxjQUFjLENBQUMsUUFBZ0I7UUFDN0IsaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxRQUFnQjtRQUNqQyw0RkFBNEY7UUFDNUYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDMUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBQyxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUVELGtCQUFrQixDQUFDLEdBQVc7UUFDNUIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNsQixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBQzlCLENBQUM7SUFFRCxFQUFFLENBQUMsSUFBWSxFQUFFLEtBQUssR0FBVyxFQUFFO1FBQ2pDLElBQUksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQztRQUNULENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUVwQixJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsWUFBWSxDQUFDLElBQVksRUFBRSxLQUFLLEdBQVcsRUFBRTtRQUMzQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRXBCLElBQUksR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsT0FBTztRQUNMLE9BQU87SUFDVCxDQUFDO0lBRUQsSUFBSTtRQUNGLE9BQU87SUFDVCxDQUFDO0lBRUQsU0FBUyxDQUFDLE1BQTRCLEVBQUUsT0FBTyxHQUF5QixJQUFJLEVBQ2xFLFFBQVEsR0FBZSxJQUFJO1FBQ25DLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFJRCxTQUFTLENBQUMsR0FBVyxJQUFZLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUF6RUQ7SUFBQyxVQUFVLEVBQUU7O2VBQUE7QUF5RVoiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vY29tbW9uJztcblxuLyoqXG4gKiBBIHNweSBmb3Ige0BsaW5rIExvY2F0aW9ufSB0aGF0IGFsbG93cyB0ZXN0cyB0byBmaXJlIHNpbXVsYXRlZCBsb2NhdGlvbiBldmVudHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTcHlMb2NhdGlvbiBpbXBsZW1lbnRzIExvY2F0aW9uIHtcbiAgdXJsQ2hhbmdlczogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGF0aDogc3RyaW5nID0gJyc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3F1ZXJ5OiBzdHJpbmcgPSAnJztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Jhc2VIcmVmOiBzdHJpbmcgPSAnJztcblxuICBzZXRJbml0aWFsUGF0aCh1cmw6IHN0cmluZykgeyB0aGlzLl9wYXRoID0gdXJsOyB9XG5cbiAgc2V0QmFzZUhyZWYodXJsOiBzdHJpbmcpIHsgdGhpcy5fYmFzZUhyZWYgPSB1cmw7IH1cblxuICBwYXRoKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9wYXRoOyB9XG5cbiAgc2ltdWxhdGVVcmxQb3AocGF0aG5hbWU6IHN0cmluZykge1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3N1YmplY3QsIHsndXJsJzogcGF0aG5hbWUsICdwb3AnOiB0cnVlfSk7XG4gIH1cblxuICBzaW11bGF0ZUhhc2hDaGFuZ2UocGF0aG5hbWU6IHN0cmluZykge1xuICAgIC8vIEJlY2F1c2Ugd2UgZG9uJ3QgcHJldmVudCB0aGUgbmF0aXZlIGV2ZW50LCB0aGUgYnJvd3NlciB3aWxsIGluZGVwZW5kZW50bHkgdXBkYXRlIHRoZSBwYXRoXG4gICAgdGhpcy5zZXRJbml0aWFsUGF0aChwYXRobmFtZSk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goJ2hhc2g6ICcgKyBwYXRobmFtZSk7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc3ViamVjdCwgeyd1cmwnOiBwYXRobmFtZSwgJ3BvcCc6IHRydWUsICd0eXBlJzogJ2hhc2hjaGFuZ2UnfSk7XG4gIH1cblxuICBwcmVwYXJlRXh0ZXJuYWxVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh1cmwubGVuZ3RoID4gMCAmJiAhdXJsLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgdXJsID0gJy8nICsgdXJsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYmFzZUhyZWYgKyB1cmw7XG4gIH1cblxuICBnbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJykge1xuICAgIHBhdGggPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoKTtcbiAgICBpZiAodGhpcy5fcGF0aCA9PSBwYXRoICYmIHRoaXMuX3F1ZXJ5ID09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuICAgIHRoaXMuX3F1ZXJ5ID0gcXVlcnk7XG5cbiAgICB2YXIgdXJsID0gcGF0aCArIChxdWVyeS5sZW5ndGggPiAwID8gKCc/JyArIHF1ZXJ5KSA6ICcnKTtcbiAgICB0aGlzLnVybENoYW5nZXMucHVzaCh1cmwpO1xuICB9XG5cbiAgcmVwbGFjZVN0YXRlKHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyA9ICcnKSB7XG4gICAgcGF0aCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGgpO1xuICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuICAgIHRoaXMuX3F1ZXJ5ID0gcXVlcnk7XG5cbiAgICB2YXIgdXJsID0gcGF0aCArIChxdWVyeS5sZW5ndGggPiAwID8gKCc/JyArIHF1ZXJ5KSA6ICcnKTtcbiAgICB0aGlzLnVybENoYW5nZXMucHVzaCgncmVwbGFjZTogJyArIHVybCk7XG4gIH1cblxuICBmb3J3YXJkKCkge1xuICAgIC8vIFRPRE9cbiAgfVxuXG4gIGJhY2soKSB7XG4gICAgLy8gVE9ET1xuICB9XG5cbiAgc3Vic2NyaWJlKG9uTmV4dDogKHZhbHVlOiBhbnkpID0+IHZvaWQsIG9uVGhyb3c6IChlcnJvcjogYW55KSA9PiB2b2lkID0gbnVsbCxcbiAgICAgICAgICAgIG9uUmV0dXJuOiAoKSA9PiB2b2lkID0gbnVsbCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh0aGlzLl9zdWJqZWN0LCBvbk5leHQsIG9uVGhyb3csIG9uUmV0dXJuKTtcbiAgfVxuXG4gIC8vIFRPRE86IHJlbW92ZSB0aGVzZSBvbmNlIExvY2F0aW9uIGlzIGFuIGludGVyZmFjZSwgYW5kIGNhbiBiZSBpbXBsZW1lbnRlZCBjbGVhbmx5XG4gIHBsYXRmb3JtU3RyYXRlZ3k6IGFueSA9IG51bGw7XG4gIG5vcm1hbGl6ZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBudWxsOyB9XG59XG4iXX0=