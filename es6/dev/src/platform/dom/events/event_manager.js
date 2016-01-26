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
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Injectable, Inject, OpaqueToken } from 'angular2/src/core/di';
import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { ListWrapper } from 'angular2/src/facade/collection';
export const EVENT_MANAGER_PLUGINS = CONST_EXPR(new OpaqueToken("EventManagerPlugins"));
export let EventManager = class {
    constructor(plugins, _zone) {
        this._zone = _zone;
        plugins.forEach(p => p.manager = this);
        this._plugins = ListWrapper.reversed(plugins);
    }
    addEventListener(element, eventName, handler) {
        var plugin = this._findPluginFor(eventName);
        return plugin.addEventListener(element, eventName, handler);
    }
    addGlobalEventListener(target, eventName, handler) {
        var plugin = this._findPluginFor(eventName);
        return plugin.addGlobalEventListener(target, eventName, handler);
    }
    getZone() { return this._zone; }
    /** @internal */
    _findPluginFor(eventName) {
        var plugins = this._plugins;
        for (var i = 0; i < plugins.length; i++) {
            var plugin = plugins[i];
            if (plugin.supports(eventName)) {
                return plugin;
            }
        }
        throw new BaseException(`No event manager plugin found for event ${eventName}`);
    }
};
EventManager = __decorate([
    Injectable(),
    __param(0, Inject(EVENT_MANAGER_PLUGINS)), 
    __metadata('design:paramtypes', [Array, NgZone])
], EventManager);
export class EventManagerPlugin {
    // That is equivalent to having supporting $event.target
    supports(eventName) { return false; }
    addEventListener(element, eventName, handler) {
        throw "not implemented";
    }
    addGlobalEventListener(element, eventName, handler) {
        throw "not implemented";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2V2ZW50X21hbmFnZXIudHMiXSwibmFtZXMiOlsiRXZlbnRNYW5hZ2VyIiwiRXZlbnRNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiRXZlbnRNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIiLCJFdmVudE1hbmFnZXIuYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciIsIkV2ZW50TWFuYWdlci5nZXRab25lIiwiRXZlbnRNYW5hZ2VyLl9maW5kUGx1Z2luRm9yIiwiRXZlbnRNYW5hZ2VyUGx1Z2luIiwiRXZlbnRNYW5hZ2VyUGx1Z2luLnN1cHBvcnRzIiwiRXZlbnRNYW5hZ2VyUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJFdmVudE1hbmFnZXJQbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDNUMsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUMsTUFBTSxzQkFBc0I7T0FDN0QsRUFBQyxNQUFNLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDOUMsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7QUFFMUQsYUFBYSxxQkFBcUIsR0FDOUIsVUFBVSxDQUFDLElBQUksV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztBQUV2RDtJQUlFQSxZQUEyQ0EsT0FBNkJBLEVBQVVBLEtBQWFBO1FBQWJDLFVBQUtBLEdBQUxBLEtBQUtBLENBQVFBO1FBQzdGQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN2Q0EsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsV0FBV0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDaERBLENBQUNBO0lBRURELGdCQUFnQkEsQ0FBQ0EsT0FBb0JBLEVBQUVBLFNBQWlCQSxFQUFFQSxPQUFpQkE7UUFDekVFLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQzVDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE9BQU9BLEVBQUVBLFNBQVNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBQzlEQSxDQUFDQTtJQUVERixzQkFBc0JBLENBQUNBLE1BQWNBLEVBQUVBLFNBQWlCQSxFQUFFQSxPQUFpQkE7UUFDekVHLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQzVDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxzQkFBc0JBLENBQUNBLE1BQU1BLEVBQUVBLFNBQVNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBQ25FQSxDQUFDQTtJQUVESCxPQUFPQSxLQUFhSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV4Q0osZ0JBQWdCQTtJQUNoQkEsY0FBY0EsQ0FBQ0EsU0FBaUJBO1FBQzlCSyxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUM1QkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDeENBLElBQUlBLE1BQU1BLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0JBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1lBQ2hCQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUNEQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSwyQ0FBMkNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBO0lBQ2xGQSxDQUFDQTtBQUNITCxDQUFDQTtBQWhDRDtJQUFDLFVBQVUsRUFBRTtJQUlDLFdBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUE7O2lCQTRCM0M7QUFFRDtJQUdFTSx3REFBd0RBO0lBQ3hEQSxRQUFRQSxDQUFDQSxTQUFpQkEsSUFBYUMsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdERELGdCQUFnQkEsQ0FBQ0EsT0FBb0JBLEVBQUVBLFNBQWlCQSxFQUFFQSxPQUFpQkE7UUFDekVFLE1BQU1BLGlCQUFpQkEsQ0FBQ0E7SUFDMUJBLENBQUNBO0lBRURGLHNCQUFzQkEsQ0FBQ0EsT0FBZUEsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUMxRUcsTUFBTUEsaUJBQWlCQSxDQUFDQTtJQUMxQkEsQ0FBQ0E7QUFDSEgsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0LCBPcGFxdWVUb2tlbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5leHBvcnQgY29uc3QgRVZFTlRfTUFOQUdFUl9QTFVHSU5TOiBPcGFxdWVUb2tlbiA9XG4gICAgQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oXCJFdmVudE1hbmFnZXJQbHVnaW5zXCIpKTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlciB7XG4gIHByaXZhdGUgX3BsdWdpbnM6IEV2ZW50TWFuYWdlclBsdWdpbltdO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRVZFTlRfTUFOQUdFUl9QTFVHSU5TKSBwbHVnaW5zOiBFdmVudE1hbmFnZXJQbHVnaW5bXSwgcHJpdmF0ZSBfem9uZTogTmdab25lKSB7XG4gICAgcGx1Z2lucy5mb3JFYWNoKHAgPT4gcC5tYW5hZ2VyID0gdGhpcyk7XG4gICAgdGhpcy5fcGx1Z2lucyA9IExpc3RXcmFwcGVyLnJldmVyc2VkKHBsdWdpbnMpO1xuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHZhciBwbHVnaW4gPSB0aGlzLl9maW5kUGx1Z2luRm9yKGV2ZW50TmFtZSk7XG4gICAgcmV0dXJuIHBsdWdpbi5hZGRFdmVudExpc3RlbmVyKGVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICBhZGRHbG9iYWxFdmVudExpc3RlbmVyKHRhcmdldDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuX2ZpbmRQbHVnaW5Gb3IoZXZlbnROYW1lKTtcbiAgICByZXR1cm4gcGx1Z2luLmFkZEdsb2JhbEV2ZW50TGlzdGVuZXIodGFyZ2V0LCBldmVudE5hbWUsIGhhbmRsZXIpO1xuICB9XG5cbiAgZ2V0Wm9uZSgpOiBOZ1pvbmUgeyByZXR1cm4gdGhpcy5fem9uZTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpbmRQbHVnaW5Gb3IoZXZlbnROYW1lOiBzdHJpbmcpOiBFdmVudE1hbmFnZXJQbHVnaW4ge1xuICAgIHZhciBwbHVnaW5zID0gdGhpcy5fcGx1Z2lucztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwbHVnaW4gPSBwbHVnaW5zW2ldO1xuICAgICAgaWYgKHBsdWdpbi5zdXBwb3J0cyhldmVudE5hbWUpKSB7XG4gICAgICAgIHJldHVybiBwbHVnaW47XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyBldmVudCBtYW5hZ2VyIHBsdWdpbiBmb3VuZCBmb3IgZXZlbnQgJHtldmVudE5hbWV9YCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlclBsdWdpbiB7XG4gIG1hbmFnZXI6IEV2ZW50TWFuYWdlcjtcblxuICAvLyBUaGF0IGlzIGVxdWl2YWxlbnQgdG8gaGF2aW5nIHN1cHBvcnRpbmcgJGV2ZW50LnRhcmdldFxuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdGhyb3cgXCJub3QgaW1wbGVtZW50ZWRcIjtcbiAgfVxuXG4gIGFkZEdsb2JhbEV2ZW50TGlzdGVuZXIoZWxlbWVudDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdGhyb3cgXCJub3QgaW1wbGVtZW50ZWRcIjtcbiAgfVxufSJdfQ==