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
var hammer_common_1 = require('./hammer_common');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var di_1 = require('angular2/src/core/di');
var HammerGesturesPlugin = (function (_super) {
    __extends(HammerGesturesPlugin, _super);
    function HammerGesturesPlugin() {
        _super.apply(this, arguments);
    }
    HammerGesturesPlugin.prototype.supports = function (eventName) {
        if (!_super.prototype.supports.call(this, eventName))
            return false;
        if (!lang_1.isPresent(window['Hammer'])) {
            throw new exceptions_1.BaseException("Hammer.js is not loaded, can not bind " + eventName + " event");
        }
        return true;
    };
    HammerGesturesPlugin.prototype.addEventListener = function (element, eventName, handler) {
        var zone = this.manager.getZone();
        eventName = eventName.toLowerCase();
        zone.runOutsideAngular(function () {
            // Creating the manager bind events, must be done outside of angular
            var mc = new Hammer(element);
            mc.get('pinch').set({ enable: true });
            mc.get('rotate').set({ enable: true });
            mc.on(eventName, function (eventObj) { zone.run(function () { handler(eventObj); }); });
        });
    };
    HammerGesturesPlugin = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], HammerGesturesPlugin);
    return HammerGesturesPlugin;
})(hammer_common_1.HammerGesturesPluginCommon);
exports.HammerGesturesPlugin = HammerGesturesPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFtbWVyX2dlc3R1cmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9ldmVudHMvaGFtbWVyX2dlc3R1cmVzLnRzIl0sIm5hbWVzIjpbIkhhbW1lckdlc3R1cmVzUGx1Z2luIiwiSGFtbWVyR2VzdHVyZXNQbHVnaW4uY29uc3RydWN0b3IiLCJIYW1tZXJHZXN0dXJlc1BsdWdpbi5zdXBwb3J0cyIsIkhhbW1lckdlc3R1cmVzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOEJBQXlDLGlCQUFpQixDQUFDLENBQUE7QUFDM0QscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFDbkQsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFFaEQ7SUFDMENBLHdDQUEwQkE7SUFEcEVBO1FBQzBDQyw4QkFBMEJBO0lBd0JwRUEsQ0FBQ0E7SUF2QkNELHVDQUFRQSxHQUFSQSxVQUFTQSxTQUFpQkE7UUFDeEJFLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGdCQUFLQSxDQUFDQSxRQUFRQSxZQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUU3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsMkNBQXlDQSxTQUFTQSxXQUFRQSxDQUFDQSxDQUFDQTtRQUN0RkEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFREYsK0NBQWdCQSxHQUFoQkEsVUFBaUJBLE9BQW9CQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQ3pFRyxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNsQ0EsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFFcENBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0E7WUFDckIsb0VBQW9FO1lBQ3BFLElBQUksRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFDcEMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUVyQyxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFTLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RixDQUFDLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBeEJISDtRQUFDQSxlQUFVQSxFQUFFQTs7NkJBeUJaQTtJQUFEQSwyQkFBQ0E7QUFBREEsQ0FBQ0EsQUF6QkQsRUFDMEMsMENBQTBCLEVBd0JuRTtBQXhCWSw0QkFBb0IsdUJBd0JoQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtIYW1tZXJHZXN0dXJlc1BsdWdpbkNvbW1vbn0gZnJvbSAnLi9oYW1tZXJfY29tbW9uJztcbmltcG9ydCB7aXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIYW1tZXJHZXN0dXJlc1BsdWdpbiBleHRlbmRzIEhhbW1lckdlc3R1cmVzUGx1Z2luQ29tbW9uIHtcbiAgc3VwcG9ydHMoZXZlbnROYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXN1cGVyLnN1cHBvcnRzKGV2ZW50TmFtZSkpIHJldHVybiBmYWxzZTtcblxuICAgIGlmICghaXNQcmVzZW50KHdpbmRvd1snSGFtbWVyJ10pKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgSGFtbWVyLmpzIGlzIG5vdCBsb2FkZWQsIGNhbiBub3QgYmluZCAke2V2ZW50TmFtZX0gZXZlbnRgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoZWxlbWVudDogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbikge1xuICAgIHZhciB6b25lID0gdGhpcy5tYW5hZ2VyLmdldFpvbmUoKTtcbiAgICBldmVudE5hbWUgPSBldmVudE5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgIHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDcmVhdGluZyB0aGUgbWFuYWdlciBiaW5kIGV2ZW50cywgbXVzdCBiZSBkb25lIG91dHNpZGUgb2YgYW5ndWxhclxuICAgICAgdmFyIG1jID0gbmV3IEhhbW1lcihlbGVtZW50KTtcbiAgICAgIG1jLmdldCgncGluY2gnKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgICAgbWMuZ2V0KCdyb3RhdGUnKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuXG4gICAgICBtYy5vbihldmVudE5hbWUsIGZ1bmN0aW9uKGV2ZW50T2JqKSB7IHpvbmUucnVuKGZ1bmN0aW9uKCkgeyBoYW5kbGVyKGV2ZW50T2JqKTsgfSk7IH0pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=