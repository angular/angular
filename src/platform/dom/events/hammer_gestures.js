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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFtbWVyX2dlc3R1cmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9ldmVudHMvaGFtbWVyX2dlc3R1cmVzLnRzIl0sIm5hbWVzIjpbIkhhbW1lckdlc3R1cmVzUGx1Z2luIiwiSGFtbWVyR2VzdHVyZXNQbHVnaW4uY29uc3RydWN0b3IiLCJIYW1tZXJHZXN0dXJlc1BsdWdpbi5zdXBwb3J0cyIsIkhhbW1lckdlc3R1cmVzUGx1Z2luLmFkZEV2ZW50TGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw4QkFBeUMsaUJBQWlCLENBQUMsQ0FBQTtBQUMzRCxxQkFBd0IsMEJBQTBCLENBQUMsQ0FBQTtBQUNuRCwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRDtJQUMwQ0Esd0NBQTBCQTtJQURwRUE7UUFDMENDLDhCQUEwQkE7SUF3QnBFQSxDQUFDQTtJQXZCQ0QsdUNBQVFBLEdBQVJBLFVBQVNBLFNBQWlCQTtRQUN4QkUsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQUtBLENBQUNBLFFBQVFBLFlBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBRTdDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSwyQ0FBeUNBLFNBQVNBLFdBQVFBLENBQUNBLENBQUNBO1FBQ3RGQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVERiwrQ0FBZ0JBLEdBQWhCQSxVQUFpQkEsT0FBb0JBLEVBQUVBLFNBQWlCQSxFQUFFQSxPQUFpQkE7UUFDekVHLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ2xDQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUVwQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtZQUNyQixvRUFBb0U7WUFDcEUsSUFBSSxFQUFFLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUNwQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBRXJDLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVMsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hGLENBQUMsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUF4QkhIO1FBQUNBLGVBQVVBLEVBQUVBOzs2QkF5QlpBO0lBQURBLDJCQUFDQTtBQUFEQSxDQUFDQSxBQXpCRCxFQUMwQywwQ0FBMEIsRUF3Qm5FO0FBeEJZLDRCQUFvQix1QkF3QmhDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0hhbW1lckdlc3R1cmVzUGx1Z2luQ29tbW9ufSBmcm9tICcuL2hhbW1lcl9jb21tb24nO1xuaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEhhbW1lckdlc3R1cmVzUGx1Z2luIGV4dGVuZHMgSGFtbWVyR2VzdHVyZXNQbHVnaW5Db21tb24ge1xuICBzdXBwb3J0cyhldmVudE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghc3VwZXIuc3VwcG9ydHMoZXZlbnROYW1lKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKCFpc1ByZXNlbnQod2luZG93WydIYW1tZXInXSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBIYW1tZXIuanMgaXMgbm90IGxvYWRlZCwgY2FuIG5vdCBiaW5kICR7ZXZlbnROYW1lfSBldmVudGApO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYWRkRXZlbnRMaXN0ZW5lcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKSB7XG4gICAgdmFyIHpvbmUgPSB0aGlzLm1hbmFnZXIuZ2V0Wm9uZSgpO1xuICAgIGV2ZW50TmFtZSA9IGV2ZW50TmFtZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgem9uZS5ydW5PdXRzaWRlQW5ndWxhcihmdW5jdGlvbigpIHtcbiAgICAgIC8vIENyZWF0aW5nIHRoZSBtYW5hZ2VyIGJpbmQgZXZlbnRzLCBtdXN0IGJlIGRvbmUgb3V0c2lkZSBvZiBhbmd1bGFyXG4gICAgICB2YXIgbWMgPSBuZXcgSGFtbWVyKGVsZW1lbnQpO1xuICAgICAgbWMuZ2V0KCdwaW5jaCcpLnNldCh7ZW5hYmxlOiB0cnVlfSk7XG4gICAgICBtYy5nZXQoJ3JvdGF0ZScpLnNldCh7ZW5hYmxlOiB0cnVlfSk7XG5cbiAgICAgIG1jLm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oZXZlbnRPYmopIHsgem9uZS5ydW4oZnVuY3Rpb24oKSB7IGhhbmRsZXIoZXZlbnRPYmopOyB9KTsgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==