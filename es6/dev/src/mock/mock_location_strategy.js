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
import { Injectable } from 'angular2/src/core/di';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { LocationStrategy } from 'angular2/src/router/location_strategy';
export let MockLocationStrategy = class extends LocationStrategy {
    constructor() {
        super();
        this.internalBaseHref = '/';
        this.internalPath = '/';
        this.internalTitle = '';
        this.urlChanges = [];
        /** @internal */
        this._subject = new EventEmitter();
    }
    simulatePopState(url) {
        this.internalPath = url;
        ObservableWrapper.callEmit(this._subject, null);
    }
    path() { return this.internalPath; }
    prepareExternalUrl(internal) {
        if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
            return this.internalBaseHref + internal.substring(1);
        }
        return this.internalBaseHref + internal;
    }
    simulateUrlPop(pathname) {
        ObservableWrapper.callEmit(this._subject, { 'url': pathname });
    }
    pushState(ctx, title, path, query) {
        this.internalTitle = title;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        var external = this.prepareExternalUrl(url);
        this.urlChanges.push(external);
    }
    onPopState(fn) { ObservableWrapper.subscribe(this._subject, fn); }
    getBaseHref() { return this.internalBaseHref; }
    back() {
        if (this.urlChanges.length > 0) {
            this.urlChanges.pop();
            var nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
            this.simulatePopState(nextUrl);
        }
    }
    forward() { throw 'not implemented'; }
};
MockLocationStrategy = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockLocationStrategy);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9tb2NrL21vY2tfbG9jYXRpb25fc3RyYXRlZ3kudHMiXSwibmFtZXMiOlsiTW9ja0xvY2F0aW9uU3RyYXRlZ3kiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5jb25zdHJ1Y3RvciIsIk1vY2tMb2NhdGlvblN0cmF0ZWd5LnNpbXVsYXRlUG9wU3RhdGUiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5wYXRoIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kuc2ltdWxhdGVVcmxQb3AiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5wdXNoU3RhdGUiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5vblBvcFN0YXRlIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kuZ2V0QmFzZUhyZWYiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5iYWNrIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kuZm9yd2FyZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQjtPQUNsRSxFQUFDLGdCQUFnQixFQUFDLE1BQU0sdUNBQXVDO0FBR3RFLGdEQUMwQyxnQkFBZ0I7SUFPeERBO1FBQWdCQyxPQUFPQSxDQUFDQTtRQU54QkEscUJBQWdCQSxHQUFXQSxHQUFHQSxDQUFDQTtRQUMvQkEsaUJBQVlBLEdBQVdBLEdBQUdBLENBQUNBO1FBQzNCQSxrQkFBYUEsR0FBV0EsRUFBRUEsQ0FBQ0E7UUFDM0JBLGVBQVVBLEdBQWFBLEVBQUVBLENBQUNBO1FBQzFCQSxnQkFBZ0JBO1FBQ2hCQSxhQUFRQSxHQUFzQkEsSUFBSUEsWUFBWUEsRUFBRUEsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBRTFCRCxnQkFBZ0JBLENBQUNB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bSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL3JvdXRlci9sb2NhdGlvbl9zdHJhdGVneSc7XG5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tMb2NhdGlvblN0cmF0ZWd5IGV4dGVuZHMgTG9jYXRpb25TdHJhdGVneSB7XG4gIGludGVybmFsQmFzZUhyZWY6IHN0cmluZyA9ICcvJztcbiAgaW50ZXJuYWxQYXRoOiBzdHJpbmcgPSAnLyc7XG4gIGludGVybmFsVGl0bGU6IHN0cmluZyA9ICcnO1xuICB1cmxDaGFuZ2VzOiBzdHJpbmdbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKCk7IH1cblxuICBzaW11bGF0ZVBvcFN0YXRlKHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcm5hbFBhdGggPSB1cmw7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc3ViamVjdCwgbnVsbCk7XG4gIH1cblxuICBwYXRoKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmludGVybmFsUGF0aDsgfVxuXG4gIHByZXBhcmVFeHRlcm5hbFVybChpbnRlcm5hbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoaW50ZXJuYWwuc3RhcnRzV2l0aCgnLycpICYmIHRoaXMuaW50ZXJuYWxCYXNlSHJlZi5lbmRzV2l0aCgnLycpKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEJhc2VIcmVmICsgaW50ZXJuYWwuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEJhc2VIcmVmICsgaW50ZXJuYWw7XG4gIH1cblxuICBzaW11bGF0ZVVybFBvcChwYXRobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc3ViamVjdCwgeyd1cmwnOiBwYXRobmFtZX0pO1xuICB9XG5cbiAgcHVzaFN0YXRlKGN0eDogYW55LCB0aXRsZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmludGVybmFsVGl0bGUgPSB0aXRsZTtcblxuICAgIHZhciB1cmwgPSBwYXRoICsgKHF1ZXJ5Lmxlbmd0aCA+IDAgPyAoJz8nICsgcXVlcnkpIDogJycpO1xuICAgIHRoaXMuaW50ZXJuYWxQYXRoID0gdXJsO1xuXG4gICAgdmFyIGV4dGVybmFsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsKTtcbiAgICB0aGlzLnVybENoYW5nZXMucHVzaChleHRlcm5hbCk7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fc3ViamVjdCwgZm4pOyB9XG5cbiAgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuaW50ZXJuYWxCYXNlSHJlZjsgfVxuXG4gIGJhY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudXJsQ2hhbmdlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnVybENoYW5nZXMucG9wKCk7XG4gICAgICB2YXIgbmV4dFVybCA9IHRoaXMudXJsQ2hhbmdlcy5sZW5ndGggPiAwID8gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlcy5sZW5ndGggLSAxXSA6ICcnO1xuICAgICAgdGhpcy5zaW11bGF0ZVBvcFN0YXRlKG5leHRVcmwpO1xuICAgIH1cbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG59XG4iXX0=