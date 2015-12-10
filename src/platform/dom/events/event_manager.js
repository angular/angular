'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2V2ZW50X21hbmFnZXIudHMiXSwibmFtZXMiOlsiRXZlbnRNYW5hZ2VyIiwiRXZlbnRNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiRXZlbnRNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIiLCJFdmVudE1hbmFnZXIuYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciIsIkV2ZW50TWFuYWdlci5nZXRab25lIiwiRXZlbnRNYW5hZ2VyLl9maW5kUGx1Z2luRm9yIiwiRXZlbnRNYW5hZ2VyUGx1Z2luIiwiRXZlbnRNYW5hZ2VyUGx1Z2luLmNvbnN0cnVjdG9yIiwiRXZlbnRNYW5hZ2VyUGx1Z2luLnN1cHBvcnRzIiwiRXZlbnRNYW5hZ2VyUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJFdmVudE1hbmFnZXJQbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRCwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSxtQkFBOEMsc0JBQXNCLENBQUMsQ0FBQTtBQUNyRSx3QkFBcUIsZ0NBQWdDLENBQUMsQ0FBQTtBQUN0RCwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUU5Qyw2QkFBcUIsR0FDOUIsaUJBQVUsQ0FBQyxJQUFJLGdCQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0FBRXZEO0lBSUVBLHNCQUEyQ0EsT0FBNkJBLEVBQVVBLEtBQWFBO1FBSmpHQyxpQkFnQ0NBO1FBNUJtRkEsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBUUE7UUFDN0ZBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLFVBQUFBLENBQUNBLElBQUlBLE9BQUFBLENBQUNBLENBQUNBLE9BQU9BLEdBQUdBLEtBQUlBLEVBQWhCQSxDQUFnQkEsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLHdCQUFXQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNoREEsQ0FBQ0E7SUFFREQsdUNBQWdCQSxHQUFoQkEsVUFBaUJBLE9BQW9CQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQ3pFRSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUM1Q0EsTUFBTUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxPQUFPQSxFQUFFQSxTQUFTQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUN2REEsQ0FBQ0E7SUFFREYsNkNBQXNCQSxHQUF0QkEsVUFBdUJBLE1BQWNBLEVBQUVBLFNBQWlCQSxFQUFFQSxPQUFpQkE7UUFDekVHLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQzVDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxzQkFBc0JBLENBQUNBLE1BQU1BLEVBQUVBLFNBQVNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBQ25FQSxDQUFDQTtJQUVESCw4QkFBT0EsR0FBUEEsY0FBb0JJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO0lBRXhDSixnQkFBZ0JBO0lBQ2hCQSxxQ0FBY0EsR0FBZEEsVUFBZUEsU0FBaUJBO1FBQzlCSyxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUM1QkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDeENBLElBQUlBLE1BQU1BLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0JBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1lBQ2hCQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUNEQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsNkNBQTJDQSxTQUFXQSxDQUFDQSxDQUFDQTtJQUNsRkEsQ0FBQ0E7SUEvQkhMO1FBQUNBLGVBQVVBLEVBQUVBO1FBSUNBLFdBQUNBLFdBQU1BLENBQUNBLDZCQUFxQkEsQ0FBQ0EsQ0FBQUE7O3FCQTRCM0NBO0lBQURBLG1CQUFDQTtBQUFEQSxDQUFDQSxBQWhDRCxJQWdDQztBQS9CWSxvQkFBWSxlQStCeEIsQ0FBQTtBQUVEO0lBQUFNO0lBYUFDLENBQUNBO0lBVkNELHdEQUF3REE7SUFDeERBLHFDQUFRQSxHQUFSQSxVQUFTQSxTQUFpQkEsSUFBYUUsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdERGLDZDQUFnQkEsR0FBaEJBLFVBQWlCQSxPQUFvQkEsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUcsTUFBTUEsaUJBQWlCQSxDQUFDQTtJQUMxQkEsQ0FBQ0E7SUFFREgsbURBQXNCQSxHQUF0QkEsVUFBdUJBLE9BQWVBLEVBQUVBLFNBQWlCQSxFQUFFQSxPQUFpQkE7UUFDMUVJLE1BQU1BLGlCQUFpQkEsQ0FBQ0E7SUFDMUJBLENBQUNBO0lBQ0hKLHlCQUFDQTtBQUFEQSxDQUFDQSxBQWJELElBYUM7QUFiWSwwQkFBa0IscUJBYTlCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7Tmdab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuZXhwb3J0IGNvbnN0IEVWRU5UX01BTkFHRVJfUExVR0lOUzogT3BhcXVlVG9rZW4gPVxuICAgIENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKFwiRXZlbnRNYW5hZ2VyUGx1Z2luc1wiKSk7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFdmVudE1hbmFnZXIge1xuICBwcml2YXRlIF9wbHVnaW5zOiBFdmVudE1hbmFnZXJQbHVnaW5bXTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KEVWRU5UX01BTkFHRVJfUExVR0lOUykgcGx1Z2luczogRXZlbnRNYW5hZ2VyUGx1Z2luW10sIHByaXZhdGUgX3pvbmU6IE5nWm9uZSkge1xuICAgIHBsdWdpbnMuZm9yRWFjaChwID0+IHAubWFuYWdlciA9IHRoaXMpO1xuICAgIHRoaXMuX3BsdWdpbnMgPSBMaXN0V3JhcHBlci5yZXZlcnNlZChwbHVnaW5zKTtcbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbikge1xuICAgIHZhciBwbHVnaW4gPSB0aGlzLl9maW5kUGx1Z2luRm9yKGV2ZW50TmFtZSk7XG4gICAgcGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgfVxuXG4gIGFkZEdsb2JhbEV2ZW50TGlzdGVuZXIodGFyZ2V0OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5fZmluZFBsdWdpbkZvcihldmVudE5hbWUpO1xuICAgIHJldHVybiBwbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcih0YXJnZXQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICBnZXRab25lKCk6IE5nWm9uZSB7IHJldHVybiB0aGlzLl96b25lOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmluZFBsdWdpbkZvcihldmVudE5hbWU6IHN0cmluZyk6IEV2ZW50TWFuYWdlclBsdWdpbiB7XG4gICAgdmFyIHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBsdWdpbiA9IHBsdWdpbnNbaV07XG4gICAgICBpZiAocGx1Z2luLnN1cHBvcnRzKGV2ZW50TmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHBsdWdpbjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vIGV2ZW50IG1hbmFnZXIgcGx1Z2luIGZvdW5kIGZvciBldmVudCAke2V2ZW50TmFtZX1gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXZlbnRNYW5hZ2VyUGx1Z2luIHtcbiAgbWFuYWdlcjogRXZlbnRNYW5hZ2VyO1xuXG4gIC8vIFRoYXQgaXMgZXF1aXZhbGVudCB0byBoYXZpbmcgc3VwcG9ydGluZyAkZXZlbnQudGFyZ2V0XG4gIHN1cHBvcnRzKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbikge1xuICAgIHRocm93IFwibm90IGltcGxlbWVudGVkXCI7XG4gIH1cblxuICBhZGRHbG9iYWxFdmVudExpc3RlbmVyKGVsZW1lbnQ6IHN0cmluZywgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHRocm93IFwibm90IGltcGxlbWVudGVkXCI7XG4gIH1cbn0iXX0=