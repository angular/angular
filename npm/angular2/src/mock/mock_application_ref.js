'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
/**
 * A no-op implementation of {@link ApplicationRef}, useful for testing.
 */
var MockApplicationRef = (function (_super) {
    __extends(MockApplicationRef, _super);
    function MockApplicationRef() {
        _super.apply(this, arguments);
    }
    MockApplicationRef.prototype.registerBootstrapListener = function (listener) { };
    MockApplicationRef.prototype.registerDisposeListener = function (dispose) { };
    MockApplicationRef.prototype.bootstrap = function (componentFactory) { return null; };
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
    MockApplicationRef.prototype.run = function (callback) { return null; };
    MockApplicationRef.prototype.waitForAsyncInitializers = function () { return null; };
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
}(application_ref_1.ApplicationRef));
exports.MockApplicationRef = MockApplicationRef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hcHBsaWNhdGlvbl9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvbW9jay9tb2NrX2FwcGxpY2F0aW9uX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxnQ0FBNkIsbUNBQW1DLENBQUMsQ0FBQTtBQUNqRSxtQkFBbUMsc0JBQXNCLENBQUMsQ0FBQTtBQUsxRDs7R0FFRztBQUVIO0lBQXdDLHNDQUFjO0lBQXREO1FBQXdDLDhCQUFjO0lBb0J0RCxDQUFDO0lBbkJDLHNEQUF5QixHQUF6QixVQUEwQixRQUEwQyxJQUFTLENBQUM7SUFFOUUsb0RBQXVCLEdBQXZCLFVBQXdCLE9BQW1CLElBQVMsQ0FBQztJQUVyRCxzQ0FBUyxHQUFULFVBQWEsZ0JBQXFDLElBQXFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRXJGLHNCQUFJLHdDQUFRO2FBQVosY0FBMkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7OztPQUFBOztJQUV6QyxzQkFBSSxvQ0FBSTthQUFSLGNBQXFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUFFbkMsZ0NBQUcsR0FBSCxVQUFJLFFBQWtCLElBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFN0MscURBQXdCLEdBQXhCLGNBQTJDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRXpELG9DQUFPLEdBQVAsY0FBaUIsQ0FBQztJQUVsQixpQ0FBSSxHQUFKLGNBQWMsQ0FBQztJQUVmLHNCQUFJLDhDQUFjO2FBQWxCLGNBQStCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTs7SUFwQi9DO1FBQUMsZUFBVSxFQUFFOzswQkFBQTtJQXFCYix5QkFBQztBQUFELENBQUMsQUFwQkQsQ0FBd0MsZ0NBQWMsR0FvQnJEO0FBcEJZLDBCQUFrQixxQkFvQjlCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FwcGxpY2F0aW9uUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtDb21wb25lbnRSZWYsIENvbXBvbmVudEZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeSc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcblxuLyoqXG4gKiBBIG5vLW9wIGltcGxlbWVudGF0aW9uIG9mIHtAbGluayBBcHBsaWNhdGlvblJlZn0sIHVzZWZ1bCBmb3IgdGVzdGluZy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tBcHBsaWNhdGlvblJlZiBleHRlbmRzIEFwcGxpY2F0aW9uUmVmIHtcbiAgcmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lcihsaXN0ZW5lcjogKHJlZjogQ29tcG9uZW50UmVmPGFueT4pID0+IHZvaWQpOiB2b2lkIHt9XG5cbiAgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQge31cblxuICBib290c3RyYXA8Qz4oY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxDPik6IENvbXBvbmVudFJlZjxDPiB7IHJldHVybiBudWxsOyB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIG51bGw7IH07XG5cbiAgZ2V0IHpvbmUoKTogTmdab25lIHsgcmV0dXJuIG51bGw7IH07XG5cbiAgcnVuKGNhbGxiYWNrOiBGdW5jdGlvbik6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgd2FpdEZvckFzeW5jSW5pdGlhbGl6ZXJzKCk6IFByb21pc2U8YW55PiB7IHJldHVybiBudWxsOyB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHt9XG5cbiAgdGljaygpOiB2b2lkIHt9XG5cbiAgZ2V0IGNvbXBvbmVudFR5cGVzKCk6IFR5cGVbXSB7IHJldHVybiBudWxsOyB9O1xufVxuIl19