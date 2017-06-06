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
/**
 * A mock implementation of {@link NgZone}.
 */
export let MockNgZone = class MockNgZone extends NgZone {
    constructor() {
        super({ enableLongStackTrace: false });
        /** @internal */
        this._mockOnStable = new EventEmitter(false);
    }
    get onStable() { return this._mockOnStable; }
    run(fn) { return fn(); }
    runOutsideAngular(fn) { return fn(); }
    simulateZoneExit() { ObservableWrapper.callNext(this.onStable, null); }
};
MockNgZone = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockNgZone);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZV9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL21vY2svbmdfem9uZV9tb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsTUFBTSxFQUFDLE1BQU0sZ0NBQWdDO09BQzlDLEVBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO0FBRXpFOztHQUVHO0FBRUgsaURBQWdDLE1BQU07SUFJcEM7UUFBZ0IsTUFBTSxFQUFDLG9CQUFvQixFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7UUFIckQsZ0JBQWdCO1FBQ1Isa0JBQWEsR0FBc0IsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFYixDQUFDO0lBRXZELElBQUksUUFBUSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUU3QyxHQUFHLENBQUMsRUFBWSxJQUFTLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFdkMsaUJBQWlCLENBQUMsRUFBWSxJQUFTLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFckQsZ0JBQWdCLEtBQVcsaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9FLENBQUM7QUFkRDtJQUFDLFVBQVUsRUFBRTs7Y0FBQTtBQWNaIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbi8qKlxuICogQSBtb2NrIGltcGxlbWVudGF0aW9uIG9mIHtAbGluayBOZ1pvbmV9LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja05nWm9uZSBleHRlbmRzIE5nWm9uZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfbW9ja09uU3RhYmxlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoZmFsc2UpO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcih7ZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IGZhbHNlfSk7IH1cblxuICBnZXQgb25TdGFibGUoKSB7IHJldHVybiB0aGlzLl9tb2NrT25TdGFibGU7IH1cblxuICBydW4oZm46IEZ1bmN0aW9uKTogYW55IHsgcmV0dXJuIGZuKCk7IH1cblxuICBydW5PdXRzaWRlQW5ndWxhcihmbjogRnVuY3Rpb24pOiBhbnkgeyByZXR1cm4gZm4oKTsgfVxuXG4gIHNpbXVsYXRlWm9uZUV4aXQoKTogdm9pZCB7IE9ic2VydmFibGVXcmFwcGVyLmNhbGxOZXh0KHRoaXMub25TdGFibGUsIG51bGwpOyB9XG59XG4iXX0=