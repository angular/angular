var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFtbWVyX2dlc3R1cmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9ldmVudHMvaGFtbWVyX2dlc3R1cmVzLnRzIl0sIm5hbWVzIjpbIkhhbW1lckdlc3R1cmVzUGx1Z2luIiwiSGFtbWVyR2VzdHVyZXNQbHVnaW4uc3VwcG9ydHMiLCJIYW1tZXJHZXN0dXJlc1BsdWdpbi5hZGRFdmVudExpc3RlbmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0saUJBQWlCO09BQ25ELEVBQUMsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BQzNDLEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUN2RSxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtBQUUvQyxnREFDMEMsMEJBQTBCO0lBQ2xFQSxRQUFRQSxDQUFDQSxTQUFpQkE7UUFDeEJDLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBRTdDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQ0EsTUFBTUEsSUFBSUEsYUFBYUEsQ0FBQ0EseUNBQXlDQSxTQUFTQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUN0RkEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFREQsZ0JBQWdCQSxDQUFDQSxPQUFvQkEsRUFBRUEsU0FBaUJBLEVBQUVBLE9BQWlCQTtRQUN6RUUsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDbENBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBRXBDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBO1lBQ3JCLG9FQUFvRTtZQUNwRSxJQUFJLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QixFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFFckMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBUyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFhLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEYsQ0FBQyxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtBQUNIRixDQUFDQTtBQXpCRDtJQUFDLFVBQVUsRUFBRTs7eUJBeUJaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0hhbW1lckdlc3R1cmVzUGx1Z2luQ29tbW9ufSBmcm9tICcuL2hhbW1lcl9jb21tb24nO1xuaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEhhbW1lckdlc3R1cmVzUGx1Z2luIGV4dGVuZHMgSGFtbWVyR2VzdHVyZXNQbHVnaW5Db21tb24ge1xuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghc3VwZXIuc3VwcG9ydHMoZXZlbnROYW1lKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKCFpc1ByZXNlbnQod2luZG93WydIYW1tZXInXSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBIYW1tZXIuanMgaXMgbm90IGxvYWRlZCwgY2FuIG5vdCBiaW5kICR7ZXZlbnROYW1lfSBldmVudGApO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKSB7XG4gICAgdmFyIHpvbmUgPSB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpO1xuICAgIGV2ZW50TmFtZSA9IGV2ZW50TmFtZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgem9uZS5ydW5PdXRzaWRlQW5ndWxhcihmdW5jdGlvbigpIHtcbiAgICAgIC8vIENyZWF0aW5nIHRoZSBtYW5hZ2VyIGJpbmQgZXZlbnRzLCBtdXN0IGJlIGRvbmUgb3V0c2lkZSBvZiBhbmd1bGFyXG4gICAgICB2YXIgbWMgPSBuZXcgSGFtbWVyKGVsZW1lbnQpO1xuICAgICAgbWMuZ2V0KCdwaW5jaCcpLnNldCh7ZW5hYmxlOiB0cnVlfSk7XG4gICAgICBtYy5nZXQoJ3JvdGF0ZScpLnNldCh7ZW5hYmxlOiB0cnVlfSk7XG5cbiAgICAgIG1jLm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oZXZlbnRPYmopIHsgem9uZS5ydW4oZnVuY3Rpb24oKSB7IGhhbmRsZXIoZXZlbnRPYmopOyB9KTsgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==