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
import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
export let MockNgZone = class extends NgZone {
    constructor() {
        super({ enableLongStackTrace: false });
        this._mockOnEventDone = new EventEmitter(false);
    }
    get onEventDone() { return this._mockOnEventDone; }
    run(fn) { return fn(); }
    runOutsideAngular(fn) { return fn(); }
    simulateZoneExit() { ObservableWrapper.callNext(this.onEventDone, null); }
};
MockNgZone = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockNgZone);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZV9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL21vY2svbmdfem9uZV9tb2NrLnRzIl0sIm5hbWVzIjpbIk1vY2tOZ1pvbmUiLCJNb2NrTmdab25lLmNvbnN0cnVjdG9yIiwiTW9ja05nWm9uZS5vbkV2ZW50RG9uZSIsIk1vY2tOZ1pvbmUucnVuIiwiTW9ja05nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciIsIk1vY2tOZ1pvbmUuc2ltdWxhdGVab25lRXhpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdDQUFnQztPQUM5QyxFQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQjtBQUV6RSxzQ0FDZ0MsTUFBTTtJQUlwQ0E7UUFDRUMsTUFBTUEsRUFBQ0Esb0JBQW9CQSxFQUFFQSxLQUFLQSxFQUFDQSxDQUFDQSxDQUFDQTtRQUNyQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxJQUFJQSxZQUFZQSxDQUFNQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN2REEsQ0FBQ0E7SUFFREQsSUFBSUEsV0FBV0EsS0FBS0UsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVuREYsR0FBR0EsQ0FBQ0EsRUFBWUEsSUFBU0csTUFBTUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdkNILGlCQUFpQkEsQ0FBQ0EsRUFBWUEsSUFBU0ksTUFBTUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckRKLGdCQUFnQkEsS0FBV0ssaUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNsRkwsQ0FBQ0E7QUFqQkQ7SUFBQyxVQUFVLEVBQUU7O2VBaUJaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7Tmdab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tOZ1pvbmUgZXh0ZW5kcyBOZ1pvbmUge1xuICAvKiogQGludGVybmFsICovXG4gIF9tb2NrT25FdmVudERvbmU6IEV2ZW50RW1pdHRlcjxhbnk+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHtlbmFibGVMb25nU3RhY2tUcmFjZTogZmFsc2V9KTtcbiAgICB0aGlzLl9tb2NrT25FdmVudERvbmUgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oZmFsc2UpO1xuICB9XG5cbiAgZ2V0IG9uRXZlbnREb25lKCkgeyByZXR1cm4gdGhpcy5fbW9ja09uRXZlbnREb25lOyB9XG5cbiAgcnVuKGZuOiBGdW5jdGlvbik6IGFueSB7IHJldHVybiBmbigpOyB9XG5cbiAgcnVuT3V0c2lkZUFuZ3VsYXIoZm46IEZ1bmN0aW9uKTogYW55IHsgcmV0dXJuIGZuKCk7IH1cblxuICBzaW11bGF0ZVpvbmVFeGl0KCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsTmV4dCh0aGlzLm9uRXZlbnREb25lLCBudWxsKTsgfVxufVxuIl19