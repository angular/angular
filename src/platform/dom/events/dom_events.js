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
        return this.manager.getZone().runOutsideAngular(function () { return dom_adapter_1.DOM.onAndCancel(element, eventName, outsideHandler); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2RvbV9ldmVudHMudHMiXSwibmFtZXMiOlsiRG9tRXZlbnRzUGx1Z2luIiwiRG9tRXZlbnRzUGx1Z2luLmNvbnN0cnVjdG9yIiwiRG9tRXZlbnRzUGx1Z2luLnN1cHBvcnRzIiwiRG9tRXZlbnRzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJEb21FdmVudHNQbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUMxRCxxQkFBeUIsZUFBZSxDQUFDLENBQUE7QUFDekMsOEJBQStDLGlCQUFpQixDQUFDLENBQUE7QUFFakU7SUFDcUNBLG1DQUFrQkE7SUFEdkRBO1FBQ3FDQyw4QkFBa0JBO0lBbUJ2REEsQ0FBQ0E7SUFsQkNELDhFQUE4RUE7SUFDOUVBLFVBQVVBO0lBQ1ZBLGtDQUFRQSxHQUFSQSxVQUFTQSxTQUFpQkEsSUFBYUUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckRGLDBDQUFnQkEsR0FBaEJBLFVBQWlCQSxPQUFvQkEsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUcsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDbENBLElBQUlBLGNBQWNBLEdBQUdBLFVBQUNBLEtBQUtBLElBQUtBLE9BQUFBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLGNBQU1BLE9BQUFBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLEVBQWRBLENBQWNBLENBQUNBLEVBQTlCQSxDQUE4QkEsQ0FBQ0E7UUFDL0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLGlCQUFpQkEsQ0FDM0NBLGNBQU1BLE9BQUFBLGlCQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxFQUFFQSxTQUFTQSxFQUFFQSxjQUFjQSxDQUFDQSxFQUFuREEsQ0FBbURBLENBQUNBLENBQUNBO0lBQ2pFQSxDQUFDQTtJQUVESCxnREFBc0JBLEdBQXRCQSxVQUF1QkEsTUFBY0EsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUksSUFBSUEsT0FBT0EsR0FBR0EsaUJBQUdBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDL0NBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ2xDQSxJQUFJQSxjQUFjQSxHQUFHQSxVQUFDQSxLQUFLQSxJQUFLQSxPQUFBQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxjQUFNQSxPQUFBQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUFkQSxDQUFjQSxDQUFDQSxFQUE5QkEsQ0FBOEJBLENBQUNBO1FBQy9EQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxpQkFBaUJBLENBQzNDQSxjQUFNQSxPQUFBQSxpQkFBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsRUFBRUEsU0FBU0EsRUFBRUEsY0FBY0EsQ0FBQ0EsRUFBbkRBLENBQW1EQSxDQUFDQSxDQUFDQTtJQUNqRUEsQ0FBQ0E7SUFuQkhKO1FBQUNBLGlCQUFVQSxFQUFFQTs7d0JBb0JaQTtJQUFEQSxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFwQkQsRUFDcUMsa0NBQWtCLEVBbUJ0RDtBQW5CWSx1QkFBZSxrQkFtQjNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtFdmVudE1hbmFnZXJQbHVnaW4sIEV2ZW50TWFuYWdlcn0gZnJvbSAnLi9ldmVudF9tYW5hZ2VyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERvbUV2ZW50c1BsdWdpbiBleHRlbmRzIEV2ZW50TWFuYWdlclBsdWdpbiB7XG4gIC8vIFRoaXMgcGx1Z2luIHNob3VsZCBjb21lIGxhc3QgaW4gdGhlIGxpc3Qgb2YgcGx1Z2lucywgYmVjYXVzZSBpdCBhY2NlcHRzIGFsbFxuICAvLyBldmVudHMuXG4gIHN1cHBvcnRzKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHZhciB6b25lID0gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKTtcbiAgICB2YXIgb3V0c2lkZUhhbmRsZXIgPSAoZXZlbnQpID0+IHpvbmUucnVuKCgpID0+IGhhbmRsZXIoZXZlbnQpKTtcbiAgICByZXR1cm4gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKS5ydW5PdXRzaWRlQW5ndWxhcihcbiAgICAgICAgKCkgPT4gRE9NLm9uQW5kQ2FuY2VsKGVsZW1lbnQsIGV2ZW50TmFtZSwgb3V0c2lkZUhhbmRsZXIpKTtcbiAgfVxuXG4gIGFkZEdsb2JhbEV2ZW50TGlzdGVuZXIodGFyZ2V0OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB2YXIgZWxlbWVudCA9IERPTS5nZXRHbG9iYWxFdmVudFRhcmdldCh0YXJnZXQpO1xuICAgIHZhciB6b25lID0gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKTtcbiAgICB2YXIgb3V0c2lkZUhhbmRsZXIgPSAoZXZlbnQpID0+IHpvbmUucnVuKCgpID0+IGhhbmRsZXIoZXZlbnQpKTtcbiAgICByZXR1cm4gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKS5ydW5PdXRzaWRlQW5ndWxhcihcbiAgICAgICAgKCkgPT4gRE9NLm9uQW5kQ2FuY2VsKGVsZW1lbnQsIGV2ZW50TmFtZSwgb3V0c2lkZUhhbmRsZXIpKTtcbiAgfVxufVxuIl19