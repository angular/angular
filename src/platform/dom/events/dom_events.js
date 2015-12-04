'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2V2ZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2RvbV9ldmVudHMudHMiXSwibmFtZXMiOlsiRG9tRXZlbnRzUGx1Z2luIiwiRG9tRXZlbnRzUGx1Z2luLmNvbnN0cnVjdG9yIiwiRG9tRXZlbnRzUGx1Z2luLnN1cHBvcnRzIiwiRG9tRXZlbnRzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJEb21FdmVudHNQbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRCQUFrQix1Q0FBdUMsQ0FBQyxDQUFBO0FBQzFELHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6Qyw4QkFBK0MsaUJBQWlCLENBQUMsQ0FBQTtBQUVqRTtJQUNxQ0EsbUNBQWtCQTtJQUR2REE7UUFDcUNDLDhCQUFrQkE7SUFvQnZEQSxDQUFDQTtJQWpCQ0QsOEVBQThFQTtJQUM5RUEsVUFBVUE7SUFDVkEsa0NBQVFBLEdBQVJBLFVBQVNBLFNBQWlCQSxJQUFhRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyREYsMENBQWdCQSxHQUFoQkEsVUFBaUJBLE9BQW9CQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQ3pFRyxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNsQ0EsSUFBSUEsY0FBY0EsR0FBR0EsVUFBQ0EsS0FBS0EsSUFBS0EsT0FBQUEsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBTUEsT0FBQUEsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBZEEsQ0FBY0EsQ0FBQ0EsRUFBOUJBLENBQThCQSxDQUFDQTtRQUMvREEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxjQUFRQSxpQkFBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsT0FBT0EsRUFBRUEsU0FBU0EsRUFBRUEsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDbEdBLENBQUNBO0lBRURILGdEQUFzQkEsR0FBdEJBLFVBQXVCQSxNQUFjQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQ3pFSSxJQUFJQSxPQUFPQSxHQUFHQSxpQkFBR0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUMvQ0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDbENBLElBQUlBLGNBQWNBLEdBQUdBLFVBQUNBLEtBQUtBLElBQUtBLE9BQUFBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLGNBQU1BLE9BQUFBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLEVBQWRBLENBQWNBLENBQUNBLEVBQTlCQSxDQUE4QkEsQ0FBQ0E7UUFDL0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLGlCQUFpQkEsQ0FDM0NBLGNBQVFBLE1BQU1BLENBQUNBLGlCQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxFQUFFQSxTQUFTQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3RUEsQ0FBQ0E7SUFwQkhKO1FBQUNBLGlCQUFVQSxFQUFFQTs7d0JBcUJaQTtJQUFEQSxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFyQkQsRUFDcUMsa0NBQWtCLEVBb0J0RDtBQXBCWSx1QkFBZSxrQkFvQjNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtFdmVudE1hbmFnZXJQbHVnaW4sIEV2ZW50TWFuYWdlcn0gZnJvbSAnLi9ldmVudF9tYW5hZ2VyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERvbUV2ZW50c1BsdWdpbiBleHRlbmRzIEV2ZW50TWFuYWdlclBsdWdpbiB7XG4gIG1hbmFnZXI6IEV2ZW50TWFuYWdlcjtcblxuICAvLyBUaGlzIHBsdWdpbiBzaG91bGQgY29tZSBsYXN0IGluIHRoZSBsaXN0IG9mIHBsdWdpbnMsIGJlY2F1c2UgaXQgYWNjZXB0cyBhbGxcbiAgLy8gZXZlbnRzLlxuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbikge1xuICAgIHZhciB6b25lID0gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKTtcbiAgICB2YXIgb3V0c2lkZUhhbmRsZXIgPSAoZXZlbnQpID0+IHpvbmUucnVuKCgpID0+IGhhbmRsZXIoZXZlbnQpKTtcbiAgICB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHsgRE9NLm9uKGVsZW1lbnQsIGV2ZW50TmFtZSwgb3V0c2lkZUhhbmRsZXIpOyB9KTtcbiAgfVxuXG4gIGFkZEdsb2JhbEV2ZW50TGlzdGVuZXIodGFyZ2V0OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB2YXIgZWxlbWVudCA9IERPTS5nZXRHbG9iYWxFdmVudFRhcmdldCh0YXJnZXQpO1xuICAgIHZhciB6b25lID0gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKTtcbiAgICB2YXIgb3V0c2lkZUhhbmRsZXIgPSAoZXZlbnQpID0+IHpvbmUucnVuKCgpID0+IGhhbmRsZXIoZXZlbnQpKTtcbiAgICByZXR1cm4gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKS5ydW5PdXRzaWRlQW5ndWxhcihcbiAgICAgICAgKCkgPT4geyByZXR1cm4gRE9NLm9uQW5kQ2FuY2VsKGVsZW1lbnQsIGV2ZW50TmFtZSwgb3V0c2lkZUhhbmRsZXIpOyB9KTtcbiAgfVxufVxuIl19