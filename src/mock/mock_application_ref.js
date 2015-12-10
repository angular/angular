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
var application_ref_1 = require('angular2/src/core/application_ref');
var di_1 = require('angular2/src/core/di');
var MockApplicationRef = (function (_super) {
    __extends(MockApplicationRef, _super);
    function MockApplicationRef() {
        _super.apply(this, arguments);
    }
    MockApplicationRef.prototype.registerBootstrapListener = function (listener) { };
    MockApplicationRef.prototype.registerDisposeListener = function (dispose) { };
    MockApplicationRef.prototype.bootstrap = function (componentType, bindings) {
        return null;
    };
    Object.defineProperty(MockApplicationRef.prototype, "injector", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(MockApplicationRef.prototype, "zone", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    ;
    MockApplicationRef.prototype.dispose = function () { };
    MockApplicationRef.prototype.tick = function () { };
    Object.defineProperty(MockApplicationRef.prototype, "componentTypes", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    ;
    MockApplicationRef = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockApplicationRef);
    return MockApplicationRef;
})(application_ref_1.ApplicationRef);
exports.MockApplicationRef = MockApplicationRef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hcHBsaWNhdGlvbl9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvbW9jay9tb2NrX2FwcGxpY2F0aW9uX3JlZi50cyJdLCJuYW1lcyI6WyJNb2NrQXBwbGljYXRpb25SZWYiLCJNb2NrQXBwbGljYXRpb25SZWYuY29uc3RydWN0b3IiLCJNb2NrQXBwbGljYXRpb25SZWYucmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lciIsIk1vY2tBcHBsaWNhdGlvblJlZi5yZWdpc3RlckRpc3Bvc2VMaXN0ZW5lciIsIk1vY2tBcHBsaWNhdGlvblJlZi5ib290c3RyYXAiLCJNb2NrQXBwbGljYXRpb25SZWYuaW5qZWN0b3IiLCJNb2NrQXBwbGljYXRpb25SZWYuem9uZSIsIk1vY2tBcHBsaWNhdGlvblJlZi5kaXNwb3NlIiwiTW9ja0FwcGxpY2F0aW9uUmVmLnRpY2siLCJNb2NrQXBwbGljYXRpb25SZWYuY29tcG9uZW50VHlwZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZ0NBQTZCLG1DQUFtQyxDQUFDLENBQUE7QUFDakUsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFPaEQ7SUFDd0NBLHNDQUFjQTtJQUR0REE7UUFDd0NDLDhCQUFjQTtJQWtCdERBLENBQUNBO0lBakJDRCxzREFBeUJBLEdBQXpCQSxVQUEwQkEsUUFBcUNBLElBQVNFLENBQUNBO0lBRXpFRixvREFBdUJBLEdBQXZCQSxVQUF3QkEsT0FBbUJBLElBQVNHLENBQUNBO0lBRXJESCxzQ0FBU0EsR0FBVEEsVUFBVUEsYUFBbUJBLEVBQUVBLFFBQXlDQTtRQUN0RUksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFREosc0JBQUlBLHdDQUFRQTthQUFaQSxjQUEyQkssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBTDs7SUFFekNBLHNCQUFJQSxvQ0FBSUE7YUFBUkEsY0FBcUJNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQU47O0lBRW5DQSxvQ0FBT0EsR0FBUEEsY0FBaUJPLENBQUNBO0lBRWxCUCxpQ0FBSUEsR0FBSkEsY0FBY1EsQ0FBQ0E7SUFFZlIsc0JBQUlBLDhDQUFjQTthQUFsQkEsY0FBK0JTLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQVQ7O0lBbEIvQ0E7UUFBQ0EsZUFBVUEsRUFBRUE7OzJCQW1CWkE7SUFBREEseUJBQUNBO0FBQURBLENBQUNBLEFBbkJELEVBQ3dDLGdDQUFjLEVBa0JyRDtBQWxCWSwwQkFBa0IscUJBa0I5QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcHBsaWNhdGlvblJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtDb21wb25lbnRSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9keW5hbWljX2NvbXBvbmVudF9sb2FkZXInO1xuaW1wb3J0IHtQcm92aWRlciwgSW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7Tmdab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtQcm9taXNlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tBcHBsaWNhdGlvblJlZiBleHRlbmRzIEFwcGxpY2F0aW9uUmVmIHtcbiAgcmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lcihsaXN0ZW5lcjogKHJlZjogQ29tcG9uZW50UmVmKSA9PiB2b2lkKTogdm9pZCB7fVxuXG4gIHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkIHt9XG5cbiAgYm9vdHN0cmFwKGNvbXBvbmVudFR5cGU6IFR5cGUsIGJpbmRpbmdzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxDb21wb25lbnRSZWY+IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiBudWxsOyB9O1xuXG4gIGdldCB6b25lKCk6IE5nWm9uZSB7IHJldHVybiBudWxsOyB9O1xuXG4gIGRpc3Bvc2UoKTogdm9pZCB7fVxuXG4gIHRpY2soKTogdm9pZCB7fVxuXG4gIGdldCBjb21wb25lbnRUeXBlcygpOiBUeXBlW10geyByZXR1cm4gbnVsbDsgfTtcbn1cbiJdfQ==