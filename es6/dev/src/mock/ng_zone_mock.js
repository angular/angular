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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZV9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL21vY2svbmdfem9uZV9tb2NrLnRzIl0sIm5hbWVzIjpbIk1vY2tOZ1pvbmUiLCJNb2NrTmdab25lLmNvbnN0cnVjdG9yIiwiTW9ja05nWm9uZS5vbkV2ZW50RG9uZSIsIk1vY2tOZ1pvbmUucnVuIiwiTW9ja05nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciIsIk1vY2tOZ1pvbmUuc2ltdWxhdGVab25lRXhpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxNQUFNLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDOUMsRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7QUFFekUsc0NBQ2dDLE1BQU07SUFJcENBO1FBQ0VDLE1BQU1BLEVBQUNBLG9CQUFvQkEsRUFBRUEsS0FBS0EsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckNBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsWUFBWUEsQ0FBTUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDdkRBLENBQUNBO0lBRURELElBQUlBLFdBQVdBLEtBQUtFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFbkRGLEdBQUdBLENBQUNBLEVBQVlBLElBQVNHLE1BQU1BLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRXZDSCxpQkFBaUJBLENBQUNBLEVBQVlBLElBQVNJLE1BQU1BLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRXJESixnQkFBZ0JBLEtBQVdLLGlCQUFpQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDbEZMLENBQUNBO0FBakJEO0lBQUMsVUFBVSxFQUFFOztlQWlCWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrTmdab25lIGV4dGVuZHMgTmdab25lIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbW9ja09uRXZlbnREb25lOiBFdmVudEVtaXR0ZXI8YW55PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7ZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IGZhbHNlfSk7XG4gICAgdGhpcy5fbW9ja09uRXZlbnREb25lID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KGZhbHNlKTtcbiAgfVxuXG4gIGdldCBvbkV2ZW50RG9uZSgpIHsgcmV0dXJuIHRoaXMuX21vY2tPbkV2ZW50RG9uZTsgfVxuXG4gIHJ1bihmbjogRnVuY3Rpb24pOiBhbnkgeyByZXR1cm4gZm4oKTsgfVxuXG4gIHJ1bk91dHNpZGVBbmd1bGFyKGZuOiBGdW5jdGlvbik6IGFueSB7IHJldHVybiBmbigpOyB9XG5cbiAgc2ltdWxhdGVab25lRXhpdCgpOiB2b2lkIHsgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbE5leHQodGhpcy5vbkV2ZW50RG9uZSwgbnVsbCk7IH1cbn1cbiJdfQ==