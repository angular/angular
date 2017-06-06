'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var exceptions_1 = require('angular2/src/facade/exceptions');
var di_1 = require('angular2/src/core/di');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var collection_1 = require('angular2/src/facade/collection');
exports.EVENT_MANAGER_PLUGINS = 
/*@ts2dart_const*/ new di_1.OpaqueToken("EventManagerPlugins");
var EventManager = (function () {
    function EventManager(plugins, _zone) {
        var _this = this;
        this._zone = _zone;
        plugins.forEach(function (p) { return p.manager = _this; });
        this._plugins = collection_1.ListWrapper.reversed(plugins);
    }
    EventManager.prototype.addEventListener = function (element, eventName, handler) {
        var plugin = this._findPluginFor(eventName);
        return plugin.addEventListener(element, eventName, handler);
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
}());
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
}());
exports.EventManagerPlugin = EventManagerPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2V2ZW50X21hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9FLG1CQUE4QyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3JFLHdCQUFxQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ3RELDJCQUEwQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTlDLDZCQUFxQjtBQUM5QixrQkFBa0IsQ0FBQyxJQUFJLGdCQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUc5RDtJQUdFLHNCQUEyQyxPQUE2QixFQUFVLEtBQWE7UUFIakcsaUJBK0JDO1FBNUJtRixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQzdGLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsT0FBTyxHQUFHLEtBQUksRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLEdBQUcsd0JBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELHVDQUFnQixHQUFoQixVQUFpQixPQUFvQixFQUFFLFNBQWlCLEVBQUUsT0FBaUI7UUFDekUsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVELDZDQUFzQixHQUF0QixVQUF1QixNQUFjLEVBQUUsU0FBaUIsRUFBRSxPQUFpQjtRQUN6RSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsOEJBQU8sR0FBUCxjQUFvQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFeEMsZ0JBQWdCO0lBQ2hCLHFDQUFjLEdBQWQsVUFBZSxTQUFpQjtRQUM5QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3hDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNoQixDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sSUFBSSwwQkFBYSxDQUFDLDZDQUEyQyxTQUFXLENBQUMsQ0FBQztJQUNsRixDQUFDO0lBL0JIO1FBQUMsZUFBVSxFQUFFO21CQUlFLFdBQU0sQ0FBQyw2QkFBcUIsQ0FBQzs7b0JBSi9CO0lBZ0NiLG1CQUFDO0FBQUQsQ0FBQyxBQS9CRCxJQStCQztBQS9CWSxvQkFBWSxlQStCeEIsQ0FBQTtBQUVEO0lBQUE7SUFhQSxDQUFDO0lBVkMsd0RBQXdEO0lBQ3hELHFDQUFRLEdBQVIsVUFBUyxTQUFpQixJQUFhLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRXRELDZDQUFnQixHQUFoQixVQUFpQixPQUFvQixFQUFFLFNBQWlCLEVBQUUsT0FBaUI7UUFDekUsTUFBTSxpQkFBaUIsQ0FBQztJQUMxQixDQUFDO0lBRUQsbURBQXNCLEdBQXRCLFVBQXVCLE9BQWUsRUFBRSxTQUFpQixFQUFFLE9BQWlCO1FBQzFFLE1BQU0saUJBQWlCLENBQUM7SUFDMUIsQ0FBQztJQUNILHlCQUFDO0FBQUQsQ0FBQyxBQWJELElBYUM7QUFiWSwwQkFBa0IscUJBYTlCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7Tmdab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuZXhwb3J0IGNvbnN0IEVWRU5UX01BTkFHRVJfUExVR0lOUzogT3BhcXVlVG9rZW4gPVxuICAgIC8qQHRzMmRhcnRfY29uc3QqLyBuZXcgT3BhcXVlVG9rZW4oXCJFdmVudE1hbmFnZXJQbHVnaW5zXCIpO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRXZlbnRNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBfcGx1Z2luczogRXZlbnRNYW5hZ2VyUGx1Z2luW107XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChFVkVOVF9NQU5BR0VSX1BMVUdJTlMpIHBsdWdpbnM6IEV2ZW50TWFuYWdlclBsdWdpbltdLCBwcml2YXRlIF96b25lOiBOZ1pvbmUpIHtcbiAgICBwbHVnaW5zLmZvckVhY2gocCA9PiBwLm1hbmFnZXIgPSB0aGlzKTtcbiAgICB0aGlzLl9wbHVnaW5zID0gTGlzdFdyYXBwZXIucmV2ZXJzZWQocGx1Z2lucyk7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuX2ZpbmRQbHVnaW5Gb3IoZXZlbnROYW1lKTtcbiAgICByZXR1cm4gcGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgfVxuXG4gIGFkZEdsb2JhbEV2ZW50TGlzdGVuZXIodGFyZ2V0OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5fZmluZFBsdWdpbkZvcihldmVudE5hbWUpO1xuICAgIHJldHVybiBwbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcih0YXJnZXQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICBnZXRab25lKCk6IE5nWm9uZSB7IHJldHVybiB0aGlzLl96b25lOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmluZFBsdWdpbkZvcihldmVudE5hbWU6IHN0cmluZyk6IEV2ZW50TWFuYWdlclBsdWdpbiB7XG4gICAgdmFyIHBsdWdpbnMgPSB0aGlzLl9wbHVnaW5zO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBsdWdpbiA9IHBsdWdpbnNbaV07XG4gICAgICBpZiAocGx1Z2luLnN1cHBvcnRzKGV2ZW50TmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHBsdWdpbjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vIGV2ZW50IG1hbmFnZXIgcGx1Z2luIGZvdW5kIGZvciBldmVudCAke2V2ZW50TmFtZX1gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXZlbnRNYW5hZ2VyUGx1Z2luIHtcbiAgbWFuYWdlcjogRXZlbnRNYW5hZ2VyO1xuXG4gIC8vIFRoYXQgaXMgZXF1aXZhbGVudCB0byBoYXZpbmcgc3VwcG9ydGluZyAkZXZlbnQudGFyZ2V0XG4gIHN1cHBvcnRzKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB0aHJvdyBcIm5vdCBpbXBsZW1lbnRlZFwiO1xuICB9XG5cbiAgYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB0aHJvdyBcIm5vdCBpbXBsZW1lbnRlZFwiO1xuICB9XG59XG4iXX0=