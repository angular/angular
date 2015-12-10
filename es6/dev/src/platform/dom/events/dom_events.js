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
        this.manager.getZone().runOutsideAngular(() => { DOM.on(element, eventName, outsideHandler); });
    }
    addGlobalEventListener(target, eventName, handler) {
        var element = DOM.getGlobalEventTarget(target);
        var zone = this.manager.getZone();
        var outsideHandler = (event) => zone.run(() => handler(event));
        return this.manager.getZone().runOutsideAngular(() => { return DOM.onAndCancel(element, eventName, outsideHandler); });
    }
};
DomEventsPlugin = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], DomEventsPlugin);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2RvbV9ldmVudHMudHMiXSwibmFtZXMiOlsiRG9tRXZlbnRzUGx1Z2luIiwiRG9tRXZlbnRzUGx1Z2luLnN1cHBvcnRzIiwiRG9tRXZlbnRzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJEb21FdmVudHNQbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7T0FDbEQsRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BQ2pDLEVBQUMsa0JBQWtCLEVBQWUsTUFBTSxpQkFBaUI7QUFFaEUsMkNBQ3FDLGtCQUFrQjtJQUdyREEsOEVBQThFQTtJQUM5RUEsVUFBVUE7SUFDVkEsUUFBUUEsQ0FBQ0EsU0FBaUJBLElBQWFDLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRXJERCxnQkFBZ0JBLENBQUNBLE9BQW9CQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQ3pFRSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNsQ0EsSUFBSUEsY0FBY0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0RBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsUUFBUUEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsT0FBT0EsRUFBRUEsU0FBU0EsRUFBRUEsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDbEdBLENBQUNBO0lBRURGLHNCQUFzQkEsQ0FBQ0EsTUFBY0EsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUcsSUFBSUEsT0FBT0EsR0FBR0EsR0FBR0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUMvQ0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDbENBLElBQUlBLGNBQWNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1FBQy9EQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxpQkFBaUJBLENBQzNDQSxRQUFRQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxFQUFFQSxTQUFTQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3RUEsQ0FBQ0E7QUFDSEgsQ0FBQ0E7QUFyQkQ7SUFBQyxVQUFVLEVBQUU7O29CQXFCWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7RXZlbnRNYW5hZ2VyUGx1Z2luLCBFdmVudE1hbmFnZXJ9IGZyb20gJy4vZXZlbnRfbWFuYWdlcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEb21FdmVudHNQbHVnaW4gZXh0ZW5kcyBFdmVudE1hbmFnZXJQbHVnaW4ge1xuICBtYW5hZ2VyOiBFdmVudE1hbmFnZXI7XG5cbiAgLy8gVGhpcyBwbHVnaW4gc2hvdWxkIGNvbWUgbGFzdCBpbiB0aGUgbGlzdCBvZiBwbHVnaW5zLCBiZWNhdXNlIGl0IGFjY2VwdHMgYWxsXG4gIC8vIGV2ZW50cy5cbiAgc3VwcG9ydHMoZXZlbnROYW1lOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcbiAgICB2YXIgem9uZSA9IHRoaXMubWFuYWdlci5nZXRab25lKCk7XG4gICAgdmFyIG91dHNpZGVIYW5kbGVyID0gKGV2ZW50KSA9PiB6b25lLnJ1bigoKSA9PiBoYW5kbGVyKGV2ZW50KSk7XG4gICAgdGhpcy5tYW5hZ2VyLmdldFpvbmUoKS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7IERPTS5vbihlbGVtZW50LCBldmVudE5hbWUsIG91dHNpZGVIYW5kbGVyKTsgfSk7XG4gIH1cblxuICBhZGRHbG9iYWxFdmVudExpc3RlbmVyKHRhcmdldDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIGVsZW1lbnQgPSBET00uZ2V0R2xvYmFsRXZlbnRUYXJnZXQodGFyZ2V0KTtcbiAgICB2YXIgem9uZSA9IHRoaXMubWFuYWdlci5nZXRab25lKCk7XG4gICAgdmFyIG91dHNpZGVIYW5kbGVyID0gKGV2ZW50KSA9PiB6b25lLnJ1bigoKSA9PiBoYW5kbGVyKGV2ZW50KSk7XG4gICAgcmV0dXJuIHRoaXMubWFuYWdlci5nZXRab25lKCkucnVuT3V0c2lkZUFuZ3VsYXIoXG4gICAgICAgICgpID0+IHsgcmV0dXJuIERPTS5vbkFuZENhbmNlbChlbGVtZW50LCBldmVudE5hbWUsIG91dHNpZGVIYW5kbGVyKTsgfSk7XG4gIH1cbn1cbiJdfQ==