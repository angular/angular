'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var di_1 = require('angular2/src/core/di');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var collection_1 = require('angular2/src/facade/collection');
exports.EVENT_MANAGER_PLUGINS = lang_1.CONST_EXPR(new di_1.OpaqueToken("EventManagerPlugins"));
var EventManager = (function () {
    function EventManager(plugins, _zone) {
        var _this = this;
        this._zone = _zone;
        plugins.forEach(function (p) { return p.manager = _this; });
        this._plugins = collection_1.ListWrapper.reversed(plugins);
    }
    EventManager.prototype.addEventListener = function (element, eventName, handler) {
        var plugin = this._findPluginFor(eventName);
        plugin.addEventListener(element, eventName, handler);
    };
    EventManager.prototype.addGlobalEventListener = function (target, eventName, handler) {
        var plugin = this._findPluginFor(eventName);
        return plugin.addGlobalEventListener(target, eventName, handler);
    };
    EventManager.prototype.getZone = function () { return this._zone; };
    /** @internal */
    EventManager.prototype._findPluginFor = function (eventName) {
        var plugins = this._plugins;
        for (var i = 0; i < plugins.length; i++) {
            var plugin = plugins[i];
            if (plugin.supports(eventName)) {
                return plugin;
            }
        }
        throw new exceptions_1.BaseException("No event manager plugin found for event " + eventName);
    };
    EventManager = __decorate([
        di_1.Injectable(),
        __param(0, di_1.Inject(exports.EVENT_MANAGER_PLUGINS)), 
        __metadata('design:paramtypes', [Array, ng_zone_1.NgZone])
    ], EventManager);
    return EventManager;
})();
exports.EventManager = EventManager;
var EventManagerPlugin = (function () {
    function EventManagerPlugin() {
    }
    // That is equivalent to having supporting $event.target
    EventManagerPlugin.prototype.supports = function (eventName) { return false; };
    EventManagerPlugin.prototype.addEventListener = function (element, eventName, handler) {
        throw "not implemented";
    };
    EventManagerPlugin.prototype.addGlobalEventListener = function (element, eventName, handler) {
        throw "not implemented";
    };
    return EventManagerPlugin;
})();
exports.EventManagerPlugin = EventManagerPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2V2ZW50X21hbmFnZXIudHMiXSwibmFtZXMiOlsiRXZlbnRNYW5hZ2VyIiwiRXZlbnRNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiRXZlbnRNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIiLCJFdmVudE1hbmFnZXIuYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciIsIkV2ZW50TWFuYWdlci5nZXRab25lIiwiRXZlbnRNYW5hZ2VyLl9maW5kUGx1Z2luRm9yIiwiRXZlbnRNYW5hZ2VyUGx1Z2luIiwiRXZlbnRNYW5hZ2VyUGx1Z2luLmNvbnN0cnVjdG9yIiwiRXZlbnRNYW5hZ2VyUGx1Z2luLnN1cHBvcnRzIiwiRXZlbnRNYW5hZ2VyUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJFdmVudE1hbmFnZXJQbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUJBQXlCLDBCQUEwQixDQUFDLENBQUE7QUFDcEQsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsbUJBQThDLHNCQUFzQixDQUFDLENBQUE7QUFDckUsd0JBQXFCLGdDQUFnQyxDQUFDLENBQUE7QUFDdEQsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFFOUMsNkJBQXFCLEdBQzlCLGlCQUFVLENBQUMsSUFBSSxnQkFBVyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztBQUV2RDtJQUlFQSxzQkFBMkNBLE9BQTZCQSxFQUFVQSxLQUFhQTtRQUpqR0MsaUJBZ0NDQTtRQTVCbUZBLFVBQUtBLEdBQUxBLEtBQUtBLENBQVFBO1FBQzdGQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFBQSxDQUFDQSxJQUFJQSxPQUFBQSxDQUFDQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFJQSxFQUFoQkEsQ0FBZ0JBLENBQUNBLENBQUNBO1FBQ3ZDQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSx3QkFBV0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDaERBLENBQUNBO0lBRURELHVDQUFnQkEsR0FBaEJBLFVBQWlCQSxPQUFvQkEsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUUsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLE1BQU1BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsRUFBRUEsU0FBU0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDdkRBLENBQUNBO0lBRURGLDZDQUFzQkEsR0FBdEJBLFVBQXVCQSxNQUFjQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQ3pFRyxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUM1Q0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxNQUFNQSxFQUFFQSxTQUFTQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNuRUEsQ0FBQ0E7SUFFREgsOEJBQU9BLEdBQVBBLGNBQW9CSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV4Q0osZ0JBQWdCQTtJQUNoQkEscUNBQWNBLEdBQWRBLFVBQWVBLFNBQWlCQTtRQUM5QkssSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFDNUJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1lBQ3hDQSxJQUFJQSxNQUFNQSxHQUFHQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9CQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtZQUNoQkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLDZDQUEyQ0EsU0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDbEZBLENBQUNBO0lBL0JITDtRQUFDQSxlQUFVQSxFQUFFQTtRQUlDQSxXQUFDQSxXQUFNQSxDQUFDQSw2QkFBcUJBLENBQUNBLENBQUFBOztxQkE0QjNDQTtJQUFEQSxtQkFBQ0E7QUFBREEsQ0FBQ0EsQUFoQ0QsSUFnQ0M7QUEvQlksb0JBQVksZUErQnhCLENBQUE7QUFFRDtJQUFBTTtJQWFBQyxDQUFDQTtJQVZDRCx3REFBd0RBO0lBQ3hEQSxxQ0FBUUEsR0FBUkEsVUFBU0EsU0FBaUJBLElBQWFFLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO0lBRXRERiw2Q0FBZ0JBLEdBQWhCQSxVQUFpQkEsT0FBb0JBLEVBQUVBLFNBQWlCQSxFQUFFQSxPQUFpQkE7UUFDekVHLE1BQU1BLGlCQUFpQkEsQ0FBQ0E7SUFDMUJBLENBQUNBO0lBRURILG1EQUFzQkEsR0FBdEJBLFVBQXVCQSxPQUFlQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQzFFSSxNQUFNQSxpQkFBaUJBLENBQUNBO0lBQzFCQSxDQUFDQTtJQUNISix5QkFBQ0E7QUFBREEsQ0FBQ0EsQUFiRCxJQWFDO0FBYlksMEJBQWtCLHFCQWE5QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmV4cG9ydCBjb25zdCBFVkVOVF9NQU5BR0VSX1BMVUdJTlM6IE9wYXF1ZVRva2VuID1cbiAgICBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbihcIkV2ZW50TWFuYWdlclBsdWdpbnNcIikpO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRXZlbnRNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBfcGx1Z2luczogRXZlbnRNYW5hZ2VyUGx1Z2luW107XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChFVkVOVF9NQU5BR0VSX1BMVUdJTlMpIHBsdWdpbnM6IEV2ZW50TWFuYWdlclBsdWdpbltdLCBwcml2YXRlIF96b25lOiBOZ1pvbmUpIHtcbiAgICBwbHVnaW5zLmZvckVhY2gocCA9PiBwLm1hbmFnZXIgPSB0aGlzKTtcbiAgICB0aGlzLl9wbHVnaW5zID0gTGlzdFdyYXBwZXIucmV2ZXJzZWQocGx1Z2lucyk7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5fZmluZFBsdWdpbkZvcihldmVudE5hbWUpO1xuICAgIHBsdWdpbi5hZGRFdmVudExpc3RlbmVyKGVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICBhZGRHbG9iYWxFdmVudExpc3RlbmVyKHRhcmdldDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuX2ZpbmRQbHVnaW5Gb3IoZXZlbnROYW1lKTtcbiAgICByZXR1cm4gcGx1Z2luLmFkZEdsb2JhbEV2ZW50TGlzdGVuZXIodGFyZ2V0LCBldmVudE5hbWUsIGhhbmRsZXIpO1xuICB9XG5cbiAgZ2V0Wm9uZSgpOiBOZ1pvbmUgeyByZXR1cm4gdGhpcy5fem9uZTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpbmRQbHVnaW5Gb3IoZXZlbnROYW1lOiBzdHJpbmcpOiBFdmVudE1hbmFnZXJQbHVnaW4ge1xuICAgIHZhciBwbHVnaW5zID0gdGhpcy5fcGx1Z2lucztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwbHVnaW4gPSBwbHVnaW5zW2ldO1xuICAgICAgaWYgKHBsdWdpbi5zdXBwb3J0cyhldmVudE5hbWUpKSB7XG4gICAgICAgIHJldHVybiBwbHVnaW47XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyBldmVudCBtYW5hZ2VyIHBsdWdpbiBmb3VuZCBmb3IgZXZlbnQgJHtldmVudE5hbWV9YCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlclBsdWdpbiB7XG4gIG1hbmFnZXI6IEV2ZW50TWFuYWdlcjtcblxuICAvLyBUaGF0IGlzIGVxdWl2YWxlbnQgdG8gaGF2aW5nIHN1cHBvcnRpbmcgJGV2ZW50LnRhcmdldFxuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcbiAgICB0aHJvdyBcIm5vdCBpbXBsZW1lbnRlZFwiO1xuICB9XG5cbiAgYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB0aHJvdyBcIm5vdCBpbXBsZW1lbnRlZFwiO1xuICB9XG59Il19