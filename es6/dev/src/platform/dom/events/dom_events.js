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
import { EventManagerPlugin } from './event_manager';
export let DomEventsPlugin = class extends EventManagerPlugin {
    // This plugin should come last in the list of plugins, because it accepts all
    // events.
    supports(eventName) { return true; }
    addEventListener(element, eventName, handler) {
        var zone = this.manager.getZone();
        var outsideHandler = (event) => zone.run(() => handler(event));
        return this.manager.getZone().runOutsideAngular(() => DOM.onAndCancel(element, eventName, outsideHandler));
    }
    addGlobalEventListener(target, eventName, handler) {
        var element = DOM.getGlobalEventTarget(target);
        var zone = this.manager.getZone();
        var outsideHandler = (event) => zone.run(() => handler(event));
        return this.manager.getZone().runOutsideAngular(() => DOM.onAndCancel(element, eventName, outsideHandler));
    }
};
DomEventsPlugin = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], DomEventsPlugin);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2RvbV9ldmVudHMudHMiXSwibmFtZXMiOlsiRG9tRXZlbnRzUGx1Z2luIiwiRG9tRXZlbnRzUGx1Z2luLnN1cHBvcnRzIiwiRG9tRXZlbnRzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJEb21FdmVudHNQbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7T0FDbEQsRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BQ2pDLEVBQUMsa0JBQWtCLEVBQWUsTUFBTSxpQkFBaUI7QUFFaEUsMkNBQ3FDLGtCQUFrQjtJQUNyREEsOEVBQThFQTtJQUM5RUEsVUFBVUE7SUFDVkEsUUFBUUEsQ0FBQ0EsU0FBaUJBLElBQWFDLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRXJERCxnQkFBZ0JBLENBQUNBLE9BQW9CQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQ3pFRSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNsQ0EsSUFBSUEsY0FBY0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLGlCQUFpQkEsQ0FDM0NBLE1BQU1BLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLEVBQUVBLFNBQVNBLEVBQUVBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2pFQSxDQUFDQTtJQUVERixzQkFBc0JBLENBQUNBLE1BQWNBLEVBQUVBLFNBQWlCQSxFQUFFQSxPQUFpQkE7UUFDekVHLElBQUlBLE9BQU9BLEdBQUdBLEdBQUdBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDL0NBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ2xDQSxJQUFJQSxjQUFjQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsaUJBQWlCQSxDQUMzQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsRUFBRUEsU0FBU0EsRUFBRUEsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDakVBLENBQUNBO0FBQ0hILENBQUNBO0FBcEJEO0lBQUMsVUFBVSxFQUFFOztvQkFvQlo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0V2ZW50TWFuYWdlclBsdWdpbiwgRXZlbnRNYW5hZ2VyfSBmcm9tICcuL2V2ZW50X21hbmFnZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRG9tRXZlbnRzUGx1Z2luIGV4dGVuZHMgRXZlbnRNYW5hZ2VyUGx1Z2luIHtcbiAgLy8gVGhpcyBwbHVnaW4gc2hvdWxkIGNvbWUgbGFzdCBpbiB0aGUgbGlzdCBvZiBwbHVnaW5zLCBiZWNhdXNlIGl0IGFjY2VwdHMgYWxsXG4gIC8vIGV2ZW50cy5cbiAgc3VwcG9ydHMoZXZlbnROYW1lOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIHpvbmUgPSB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpO1xuICAgIHZhciBvdXRzaWRlSGFuZGxlciA9IChldmVudCkgPT4gem9uZS5ydW4oKCkgPT4gaGFuZGxlcihldmVudCkpO1xuICAgIHJldHVybiB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpLnJ1bk91dHNpZGVBbmd1bGFyKFxuICAgICAgICAoKSA9PiBET00ub25BbmRDYW5jZWwoZWxlbWVudCwgZXZlbnROYW1lLCBvdXRzaWRlSGFuZGxlcikpO1xuICB9XG5cbiAgYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcih0YXJnZXQ6IHN0cmluZywgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHZhciBlbGVtZW50ID0gRE9NLmdldEdsb2JhbEV2ZW50VGFyZ2V0KHRhcmdldCk7XG4gICAgdmFyIHpvbmUgPSB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpO1xuICAgIHZhciBvdXRzaWRlSGFuZGxlciA9IChldmVudCkgPT4gem9uZS5ydW4oKCkgPT4gaGFuZGxlcihldmVudCkpO1xuICAgIHJldHVybiB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpLnJ1bk91dHNpZGVBbmd1bGFyKFxuICAgICAgICAoKSA9PiBET00ub25BbmRDYW5jZWwoZWxlbWVudCwgZXZlbnROYW1lLCBvdXRzaWRlSGFuZGxlcikpO1xuICB9XG59XG4iXX0=