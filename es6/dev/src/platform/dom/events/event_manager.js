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
        plugin.addEventListener(element, eventName, handler);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2V2ZW50X21hbmFnZXIudHMiXSwibmFtZXMiOlsiRXZlbnRNYW5hZ2VyIiwiRXZlbnRNYW5hZ2VyLmNvbnN0cnVjdG9yIiwiRXZlbnRNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIiLCJFdmVudE1hbmFnZXIuYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciIsIkV2ZW50TWFuYWdlci5nZXRab25lIiwiRXZlbnRNYW5hZ2VyLl9maW5kUGx1Z2luRm9yIiwiRXZlbnRNYW5hZ2VyUGx1Z2luIiwiRXZlbnRNYW5hZ2VyUGx1Z2luLnN1cHBvcnRzIiwiRXZlbnRNYW5hZ2VyUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiLCJFdmVudE1hbmFnZXJQbHVnaW4uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUM1QyxFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxNQUFNLHNCQUFzQjtPQUM3RCxFQUFDLE1BQU0sRUFBQyxNQUFNLGdDQUFnQztPQUM5QyxFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztBQUUxRCxhQUFhLHFCQUFxQixHQUM5QixVQUFVLENBQUMsSUFBSSxXQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0FBRXZEO0lBSUVBLFlBQTJDQSxPQUE2QkEsRUFBVUEsS0FBYUE7UUFBYkMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBUUE7UUFDN0ZBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO1FBQ3ZDQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxXQUFXQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNoREEsQ0FBQ0E7SUFFREQsZ0JBQWdCQSxDQUFDQSxPQUFvQkEsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUUsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLE1BQU1BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsRUFBRUEsU0FBU0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDdkRBLENBQUNBO0lBRURGLHNCQUFzQkEsQ0FBQ0EsTUFBY0EsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUcsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLHNCQUFzQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsU0FBU0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDbkVBLENBQUNBO0lBRURILE9BQU9BLEtBQWFJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO0lBRXhDSixnQkFBZ0JBO0lBQ2hCQSxjQUFjQSxDQUFDQSxTQUFpQkE7UUFDOUJLLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO1FBQzVCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUN4Q0EsSUFBSUEsTUFBTUEsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvQkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7WUFDaEJBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0RBLE1BQU1BLElBQUlBLGFBQWFBLENBQUNBLDJDQUEyQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDbEZBLENBQUNBO0FBQ0hMLENBQUNBO0FBaENEO0lBQUMsVUFBVSxFQUFFO0lBSUMsV0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQTs7aUJBNEIzQztBQUVEO0lBR0VNLHdEQUF3REE7SUFDeERBLFFBQVFBLENBQUNBLFNBQWlCQSxJQUFhQyxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV0REQsZ0JBQWdCQSxDQUFDQSxPQUFvQkEsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUUsTUFBTUEsaUJBQWlCQSxDQUFDQTtJQUMxQkEsQ0FBQ0E7SUFFREYsc0JBQXNCQSxDQUFDQSxPQUFlQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQzFFRyxNQUFNQSxpQkFBaUJBLENBQUNBO0lBQzFCQSxDQUFDQTtBQUNISCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmV4cG9ydCBjb25zdCBFVkVOVF9NQU5BR0VSX1BMVUdJTlM6IE9wYXF1ZVRva2VuID1cbiAgICBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbihcIkV2ZW50TWFuYWdlclBsdWdpbnNcIikpO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRXZlbnRNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBfcGx1Z2luczogRXZlbnRNYW5hZ2VyUGx1Z2luW107XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChFVkVOVF9NQU5BR0VSX1BMVUdJTlMpIHBsdWdpbnM6IEV2ZW50TWFuYWdlclBsdWdpbltdLCBwcml2YXRlIF96b25lOiBOZ1pvbmUpIHtcbiAgICBwbHVnaW5zLmZvckVhY2gocCA9PiBwLm1hbmFnZXIgPSB0aGlzKTtcbiAgICB0aGlzLl9wbHVnaW5zID0gTGlzdFdyYXBwZXIucmV2ZXJzZWQocGx1Z2lucyk7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5fZmluZFBsdWdpbkZvcihldmVudE5hbWUpO1xuICAgIHBsdWdpbi5hZGRFdmVudExpc3RlbmVyKGVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gIH1cblxuICBhZGRHbG9iYWxFdmVudExpc3RlbmVyKHRhcmdldDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuX2ZpbmRQbHVnaW5Gb3IoZXZlbnROYW1lKTtcbiAgICByZXR1cm4gcGx1Z2luLmFkZEdsb2JhbEV2ZW50TGlzdGVuZXIodGFyZ2V0LCBldmVudE5hbWUsIGhhbmRsZXIpO1xuICB9XG5cbiAgZ2V0Wm9uZSgpOiBOZ1pvbmUgeyByZXR1cm4gdGhpcy5fem9uZTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpbmRQbHVnaW5Gb3IoZXZlbnROYW1lOiBzdHJpbmcpOiBFdmVudE1hbmFnZXJQbHVnaW4ge1xuICAgIHZhciBwbHVnaW5zID0gdGhpcy5fcGx1Z2lucztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsdWdpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwbHVnaW4gPSBwbHVnaW5zW2ldO1xuICAgICAgaWYgKHBsdWdpbi5zdXBwb3J0cyhldmVudE5hbWUpKSB7XG4gICAgICAgIHJldHVybiBwbHVnaW47XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyBldmVudCBtYW5hZ2VyIHBsdWdpbiBmb3VuZCBmb3IgZXZlbnQgJHtldmVudE5hbWV9YCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEV2ZW50TWFuYWdlclBsdWdpbiB7XG4gIG1hbmFnZXI6IEV2ZW50TWFuYWdlcjtcblxuICAvLyBUaGF0IGlzIGVxdWl2YWxlbnQgdG8gaGF2aW5nIHN1cHBvcnRpbmcgJGV2ZW50LnRhcmdldFxuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcbiAgICB0aHJvdyBcIm5vdCBpbXBsZW1lbnRlZFwiO1xuICB9XG5cbiAgYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBzdHJpbmcsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICB0aHJvdyBcIm5vdCBpbXBsZW1lbnRlZFwiO1xuICB9XG59Il19