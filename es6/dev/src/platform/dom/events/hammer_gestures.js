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
import { HammerGesturesPluginCommon } from './hammer_common';
import { isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Injectable } from 'angular2/src/core/di';
export let HammerGesturesPlugin = class extends HammerGesturesPluginCommon {
    supports(eventName) {
        if (!super.supports(eventName))
            return false;
        if (!isPresent(window['Hammer'])) {
            throw new BaseException(`Hammer.js is not loaded, can not bind ${eventName} event`);
        }
        return true;
    }
    addEventListener(element, eventName, handler) {
        var zone = this.manager.getZone();
        eventName = eventName.toLowerCase();
        zone.runOutsideAngular(function () {
            // Creating the manager bind events, must be done outside of angular
            var mc = new Hammer(element);
            mc.get('pinch').set({ enable: true });
            mc.get('rotate').set({ enable: true });
            mc.on(eventName, function (eventObj) { zone.run(function () { handler(eventObj); }); });
        });
    }
};
HammerGesturesPlugin = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], HammerGesturesPlugin);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFtbWVyX2dlc3R1cmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9ldmVudHMvaGFtbWVyX2dlc3R1cmVzLnRzIl0sIm5hbWVzIjpbIkhhbW1lckdlc3R1cmVzUGx1Z2luIiwiSGFtbWVyR2VzdHVyZXNQbHVnaW4uc3VwcG9ydHMiLCJIYW1tZXJHZXN0dXJlc1BsdWdpbi5hZGRFdmVudExpc3RlbmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSxpQkFBaUI7T0FDbkQsRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDM0MsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO0FBRS9DLGdEQUMwQywwQkFBMEI7SUFDbEVBLFFBQVFBLENBQUNBLFNBQWlCQTtRQUN4QkMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFFN0NBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSx5Q0FBeUNBLFNBQVNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3RGQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVERCxnQkFBZ0JBLENBQUNBLE9BQW9CQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQ3pFRSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNsQ0EsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFFcENBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0E7WUFDckIsb0VBQW9FO1lBQ3BFLElBQUksRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFDcEMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUVyQyxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFTLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RixDQUFDLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0FBQ0hGLENBQUNBO0FBekJEO0lBQUMsVUFBVSxFQUFFOzt5QkF5Qlo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SGFtbWVyR2VzdHVyZXNQbHVnaW5Db21tb259IGZyb20gJy4vaGFtbWVyX2NvbW1vbic7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSGFtbWVyR2VzdHVyZXNQbHVnaW4gZXh0ZW5kcyBIYW1tZXJHZXN0dXJlc1BsdWdpbkNvbW1vbiB7XG4gIHN1cHBvcnRzKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCFzdXBlci5zdXBwb3J0cyhldmVudE5hbWUpKSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAoIWlzUHJlc2VudCh3aW5kb3dbJ0hhbW1lciddKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYEhhbW1lci5qcyBpcyBub3QgbG9hZGVkLCBjYW4gbm90IGJpbmQgJHtldmVudE5hbWV9IGV2ZW50YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcbiAgICB2YXIgem9uZSA9IHRoaXMubWFuYWdlci5nZXRab25lKCk7XG4gICAgZXZlbnROYW1lID0gZXZlbnROYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ3JlYXRpbmcgdGhlIG1hbmFnZXIgYmluZCBldmVudHMsIG11c3QgYmUgZG9uZSBvdXRzaWRlIG9mIGFuZ3VsYXJcbiAgICAgIHZhciBtYyA9IG5ldyBIYW1tZXIoZWxlbWVudCk7XG4gICAgICBtYy5nZXQoJ3BpbmNoJykuc2V0KHtlbmFibGU6IHRydWV9KTtcbiAgICAgIG1jLmdldCgncm90YXRlJykuc2V0KHtlbmFibGU6IHRydWV9KTtcblxuICAgICAgbWMub24oZXZlbnROYW1lLCBmdW5jdGlvbihldmVudE9iaikgeyB6b25lLnJ1bihmdW5jdGlvbigpIHsgaGFuZGxlcihldmVudE9iaik7IH0pOyB9KTtcbiAgICB9KTtcbiAgfVxufVxuIl19