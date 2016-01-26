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
        return zone.runOutsideAngular(function () {
            // Creating the manager bind events, must be done outside of angular
            var mc = new Hammer(element);
            mc.get('pinch').set({ enable: true });
            mc.get('rotate').set({ enable: true });
            var handler = function (eventObj) { zone.run(function () { handler(eventObj); }); };
            mc.on(eventName, handler);
            return function () { mc.off(eventName, handler); };
        });
    };
    HammerGesturesPlugin = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], HammerGesturesPlugin);
    return HammerGesturesPlugin;
})(hammer_common_1.HammerGesturesPluginCommon);
exports.HammerGesturesPlugin = HammerGesturesPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFtbWVyX2dlc3R1cmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9ldmVudHMvaGFtbWVyX2dlc3R1cmVzLnRzIl0sIm5hbWVzIjpbIkhhbW1lckdlc3R1cmVzUGx1Z2luIiwiSGFtbWVyR2VzdHVyZXNQbHVnaW4uY29uc3RydWN0b3IiLCJIYW1tZXJHZXN0dXJlc1BsdWdpbi5zdXBwb3J0cyIsIkhhbW1lckdlc3R1cmVzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOEJBQXlDLGlCQUFpQixDQUFDLENBQUE7QUFDM0QscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFDbkQsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFFaEQ7SUFDMENBLHdDQUEwQkE7SUFEcEVBO1FBQzBDQyw4QkFBMEJBO0lBeUJwRUEsQ0FBQ0E7SUF4QkNELHVDQUFRQSxHQUFSQSxVQUFTQSxTQUFpQkE7UUFDeEJFLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGdCQUFLQSxDQUFDQSxRQUFRQSxZQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUU3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsMkNBQXlDQSxTQUFTQSxXQUFRQSxDQUFDQSxDQUFDQTtRQUN0RkEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFREYsK0NBQWdCQSxHQUFoQkEsVUFBaUJBLE9BQW9CQSxFQUFFQSxTQUFpQkEsRUFBRUEsT0FBaUJBO1FBQ3pFRyxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNsQ0EsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFFcENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0E7WUFDNUIsb0VBQW9FO1lBQ3BFLElBQUksRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFDcEMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLE9BQU8sR0FBRyxVQUFTLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEYsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDMUIsTUFBTSxDQUFDLGNBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQyxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQXpCSEg7UUFBQ0EsZUFBVUEsRUFBRUE7OzZCQTBCWkE7SUFBREEsMkJBQUNBO0FBQURBLENBQUNBLEFBMUJELEVBQzBDLDBDQUEwQixFQXlCbkU7QUF6QlksNEJBQW9CLHVCQXlCaEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SGFtbWVyR2VzdHVyZXNQbHVnaW5Db21tb259IGZyb20gJy4vaGFtbWVyX2NvbW1vbic7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSGFtbWVyR2VzdHVyZXNQbHVnaW4gZXh0ZW5kcyBIYW1tZXJHZXN0dXJlc1BsdWdpbkNvbW1vbiB7XG4gIHN1cHBvcnRzKGV2ZW50TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCFzdXBlci5zdXBwb3J0cyhldmVudE5hbWUpKSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAoIWlzUHJlc2VudCh3aW5kb3dbJ0hhbW1lciddKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYEhhbW1lci5qcyBpcyBub3QgbG9hZGVkLCBjYW4gbm90IGJpbmQgJHtldmVudE5hbWV9IGV2ZW50YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhZGRFdmVudExpc3RlbmVyKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIHpvbmUgPSB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpO1xuICAgIGV2ZW50TmFtZSA9IGV2ZW50TmFtZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgcmV0dXJuIHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDcmVhdGluZyB0aGUgbWFuYWdlciBiaW5kIGV2ZW50cywgbXVzdCBiZSBkb25lIG91dHNpZGUgb2YgYW5ndWxhclxuICAgICAgdmFyIG1jID0gbmV3IEhhbW1lcihlbGVtZW50KTtcbiAgICAgIG1jLmdldCgncGluY2gnKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgICAgbWMuZ2V0KCdyb3RhdGUnKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgICAgdmFyIGhhbmRsZXIgPSBmdW5jdGlvbihldmVudE9iaikgeyB6b25lLnJ1bihmdW5jdGlvbigpIHsgaGFuZGxlcihldmVudE9iaik7IH0pOyB9O1xuICAgICAgbWMub24oZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgICAgIHJldHVybiAoKSA9PiB7IG1jLm9mZihldmVudE5hbWUsIGhhbmRsZXIpOyB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=