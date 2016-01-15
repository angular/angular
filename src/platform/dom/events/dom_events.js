'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var core_1 = require('angular2/core');
var event_manager_1 = require('./event_manager');
var DomEventsPlugin = (function (_super) {
    __extends(DomEventsPlugin, _super);
    function DomEventsPlugin() {
        _super.apply(this, arguments);
    }
    // This plugin should come last in the list of plugins, because it accepts all
    // events.
    DomEventsPlugin.prototype.supports = function (eventName) { return true; };
    DomEventsPlugin.prototype.addEventListener = function (element, eventName, handler) {
        var zone = this.manager.getZone();
        var outsideHandler = function (event) { return zone.run(function () { return handler(event); }); };
        this.manager.getZone().runOutsideAngular(function () { dom_adapter_1.DOM.on(element, eventName, outsideHandler); });
    };
    DomEventsPlugin.prototype.addGlobalEventListener = function (target, eventName, handler) {
        var element = dom_adapter_1.DOM.getGlobalEventTarget(target);
        var zone = this.manager.getZone();
        var outsideHandler = function (event) { return zone.run(function () { return handler(event); }); };
        return this.manager.getZone().runOutsideAngular(function () { return dom_adapter_1.DOM.onAndCancel(element, eventName, outsideHandler); });
    };
    DomEventsPlugin = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DomEventsPlugin);
    return DomEventsPlugin;
})(event_manager_1.EventManagerPlugin);
exports.DomEventsPlugin = DomEventsPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2RvbV9ldmVudHMudHMiXSwibmFtZXMiOlsiRG9tRXZlbnRzUGx1Z2luIiwiRG9tRXZlbnRzUGx1Z2luLmNvbnN0cnVjdG9yIiwiRG9tRXZlbnRzUGx1Z2luLnN1cHBvcnRzIiwiRG9tRXZlbnRzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJEb21FdmVudHNQbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUMxRCxxQkFBeUIsZUFBZSxDQUFDLENBQUE7QUFDekMsOEJBQStDLGlCQUFpQixDQUFDLENBQUE7QUFFakU7SUFDcUNBLG1DQUFrQkE7SUFEdkRBO1FBQ3FDQyw4QkFBa0JBO0lBb0J2REEsQ0FBQ0E7SUFqQkNELDhFQUE4RUE7SUFDOUVBLFVBQVVBO0lBQ1ZBLGtDQUFRQSxHQUFSQSxVQUFTQSxTQUFpQkEsSUFBYUUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckRGLDBDQUFnQkEsR0FBaEJBLFVBQWlCQSxPQUFvQkEsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUcsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDbENBLElBQUlBLGNBQWNBLEdBQUdBLFVBQUNBLEtBQUtBLElBQUtBLE9BQUFBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLGNBQU1BLE9BQUFBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLEVBQWRBLENBQWNBLENBQUNBLEVBQTlCQSxDQUE4QkEsQ0FBQ0E7UUFDL0RBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsY0FBUUEsaUJBQUdBLENBQUNBLEVBQUVBLENBQUNBLE9BQU9BLEVBQUVBLFNBQVNBLEVBQUVBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2xHQSxDQUFDQTtJQUVESCxnREFBc0JBLEdBQXRCQSxVQUF1QkEsTUFBY0EsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUksSUFBSUEsT0FBT0EsR0FBR0EsaUJBQUdBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDL0NBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ2xDQSxJQUFJQSxjQUFjQSxHQUFHQSxVQUFDQSxLQUFLQSxJQUFLQSxPQUFBQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxjQUFNQSxPQUFBQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUFkQSxDQUFjQSxDQUFDQSxFQUE5QkEsQ0FBOEJBLENBQUNBO1FBQy9EQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxpQkFBaUJBLENBQzNDQSxjQUFRQSxNQUFNQSxDQUFDQSxpQkFBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsRUFBRUEsU0FBU0EsRUFBRUEsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0VBLENBQUNBO0lBcEJISjtRQUFDQSxpQkFBVUEsRUFBRUE7O3dCQXFCWkE7SUFBREEsc0JBQUNBO0FBQURBLENBQUNBLEFBckJELEVBQ3FDLGtDQUFrQixFQW9CdEQ7QUFwQlksdUJBQWUsa0JBb0IzQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7RXZlbnRNYW5hZ2VyUGx1Z2luLCBFdmVudE1hbmFnZXJ9IGZyb20gJy4vZXZlbnRfbWFuYWdlcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEb21FdmVudHNQbHVnaW4gZXh0ZW5kcyBFdmVudE1hbmFnZXJQbHVnaW4ge1xuICBtYW5hZ2VyOiBFdmVudE1hbmFnZXI7XG5cbiAgLy8gVGhpcyBwbHVnaW4gc2hvdWxkIGNvbWUgbGFzdCBpbiB0aGUgbGlzdCBvZiBwbHVnaW5zLCBiZWNhdXNlIGl0IGFjY2VwdHMgYWxsXG4gIC8vIGV2ZW50cy5cbiAgc3VwcG9ydHMoZXZlbnROYW1lOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcbiAgICB2YXIgem9uZSA9IHRoaXMubWFuYWdlci5nZXRab25lKCk7XG4gICAgdmFyIG91dHNpZGVIYW5kbGVyID0gKGV2ZW50KSA9PiB6b25lLnJ1bigoKSA9PiBoYW5kbGVyKGV2ZW50KSk7XG4gICAgdGhpcy5tYW5hZ2VyLmdldFpvbmUoKS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7IERPTS5vbihlbGVtZW50LCBldmVudE5hbWUsIG91dHNpZGVIYW5kbGVyKTsgfSk7XG4gIH1cblxuICBhZGRHbG9iYWxFdmVudExpc3RlbmVyKHRhcmdldDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIGVsZW1lbnQgPSBET00uZ2V0R2xvYmFsRXZlbnRUYXJnZXQodGFyZ2V0KTtcbiAgICB2YXIgem9uZSA9IHRoaXMubWFuYWdlci5nZXRab25lKCk7XG4gICAgdmFyIG91dHNpZGVIYW5kbGVyID0gKGV2ZW50KSA9PiB6b25lLnJ1bigoKSA9PiBoYW5kbGVyKGV2ZW50KSk7XG4gICAgcmV0dXJuIHRoaXMubWFuYWdlci5nZXRab25lKCkucnVuT3V0c2lkZUFuZ3VsYXIoXG4gICAgICAgICgpID0+IHsgcmV0dXJuIERPTS5vbkFuZENhbmNlbChlbGVtZW50LCBldmVudE5hbWUsIG91dHNpZGVIYW5kbGVyKTsgfSk7XG4gIH1cbn1cbiJdfQ==