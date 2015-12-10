'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var core_1 = require('angular2/core');
var ng_control_1 = require('./ng_control');
var lang_1 = require('angular2/src/facade/lang');
var NgControlStatus = (function () {
    function NgControlStatus(cd) {
        this._cd = cd;
    }
    Object.defineProperty(NgControlStatus.prototype, "ngClassUntouched", {
        get: function () {
            return lang_1.isPresent(this._cd.control) ? this._cd.control.untouched : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlStatus.prototype, "ngClassTouched", {
        get: function () {
            return lang_1.isPresent(this._cd.control) ? this._cd.control.touched : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlStatus.prototype, "ngClassPristine", {
        get: function () {
            return lang_1.isPresent(this._cd.control) ? this._cd.control.pristine : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlStatus.prototype, "ngClassDirty", {
        get: function () {
            return lang_1.isPresent(this._cd.control) ? this._cd.control.dirty : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlStatus.prototype, "ngClassValid", {
        get: function () {
            return lang_1.isPresent(this._cd.control) ? this._cd.control.valid : false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgControlStatus.prototype, "ngClassInvalid", {
        get: function () {
            return lang_1.isPresent(this._cd.control) ? !this._cd.control.valid : false;
        },
        enumerable: true,
        configurable: true
    });
    NgControlStatus = __decorate([
        core_1.Directive({
            selector: '[ng-control],[ng-model],[ng-form-control]',
            host: {
                '[class.ng-untouched]': 'ngClassUntouched',
                '[class.ng-touched]': 'ngClassTouched',
                '[class.ng-pristine]': 'ngClassPristine',
                '[class.ng-dirty]': 'ngClassDirty',
                '[class.ng-valid]': 'ngClassValid',
                '[class.ng-invalid]': 'ngClassInvalid'
            }
        }),
        __param(0, core_1.Self()), 
        __metadata('design:paramtypes', [ng_control_1.NgControl])
    ], NgControlStatus);
    return NgControlStatus;
})();
exports.NgControlStatus = NgControlStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9zdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfY29udHJvbF9zdGF0dXMudHMiXSwibmFtZXMiOlsiTmdDb250cm9sU3RhdHVzIiwiTmdDb250cm9sU3RhdHVzLmNvbnN0cnVjdG9yIiwiTmdDb250cm9sU3RhdHVzLm5nQ2xhc3NVbnRvdWNoZWQiLCJOZ0NvbnRyb2xTdGF0dXMubmdDbGFzc1RvdWNoZWQiLCJOZ0NvbnRyb2xTdGF0dXMubmdDbGFzc1ByaXN0aW5lIiwiTmdDb250cm9sU3RhdHVzLm5nQ2xhc3NEaXJ0eSIsIk5nQ29udHJvbFN0YXR1cy5uZ0NsYXNzVmFsaWQiLCJOZ0NvbnRyb2xTdGF0dXMubmdDbGFzc0ludmFsaWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFCQUE4QixlQUFlLENBQUMsQ0FBQTtBQUM5QywyQkFBd0IsY0FBYyxDQUFDLENBQUE7QUFDdkMscUJBQWlDLDBCQUEwQixDQUFDLENBQUE7QUFFNUQ7SUFjRUEseUJBQW9CQSxFQUFhQTtRQUFJQyxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUVyREQsc0JBQUlBLDZDQUFnQkE7YUFBcEJBO1lBQ0VFLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMxRUEsQ0FBQ0E7OztPQUFBRjtJQUNEQSxzQkFBSUEsMkNBQWNBO2FBQWxCQTtZQUNFRyxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDeEVBLENBQUNBOzs7T0FBQUg7SUFDREEsc0JBQUlBLDRDQUFlQTthQUFuQkE7WUFDRUksTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ3pFQSxDQUFDQTs7O09BQUFKO0lBQ0RBLHNCQUFJQSx5Q0FBWUE7YUFBaEJBO1lBQ0VLLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN0RUEsQ0FBQ0E7OztPQUFBTDtJQUNEQSxzQkFBSUEseUNBQVlBO2FBQWhCQTtZQUNFTSxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDdEVBLENBQUNBOzs7T0FBQU47SUFDREEsc0JBQUlBLDJDQUFjQTthQUFsQkE7WUFDRU8sTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ3ZFQSxDQUFDQTs7O09BQUFQO0lBakNIQTtRQUFDQSxnQkFBU0EsQ0FBQ0E7WUFDVEEsUUFBUUEsRUFBRUEsMkNBQTJDQTtZQUNyREEsSUFBSUEsRUFBRUE7Z0JBQ0pBLHNCQUFzQkEsRUFBRUEsa0JBQWtCQTtnQkFDMUNBLG9CQUFvQkEsRUFBRUEsZ0JBQWdCQTtnQkFDdENBLHFCQUFxQkEsRUFBRUEsaUJBQWlCQTtnQkFDeENBLGtCQUFrQkEsRUFBRUEsY0FBY0E7Z0JBQ2xDQSxrQkFBa0JBLEVBQUVBLGNBQWNBO2dCQUNsQ0Esb0JBQW9CQSxFQUFFQSxnQkFBZ0JBO2FBQ3ZDQTtTQUNGQSxDQUFDQTtRQUlZQSxXQUFDQSxXQUFJQSxFQUFFQSxDQUFBQTs7d0JBb0JwQkE7SUFBREEsc0JBQUNBO0FBQURBLENBQUNBLEFBbENELElBa0NDO0FBdkJZLHVCQUFlLGtCQXVCM0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBTZWxmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZy1jb250cm9sXSxbbmctbW9kZWxdLFtuZy1mb3JtLWNvbnRyb2xdJyxcbiAgaG9zdDoge1xuICAgICdbY2xhc3MubmctdW50b3VjaGVkXSc6ICduZ0NsYXNzVW50b3VjaGVkJyxcbiAgICAnW2NsYXNzLm5nLXRvdWNoZWRdJzogJ25nQ2xhc3NUb3VjaGVkJyxcbiAgICAnW2NsYXNzLm5nLXByaXN0aW5lXSc6ICduZ0NsYXNzUHJpc3RpbmUnLFxuICAgICdbY2xhc3MubmctZGlydHldJzogJ25nQ2xhc3NEaXJ0eScsXG4gICAgJ1tjbGFzcy5uZy12YWxpZF0nOiAnbmdDbGFzc1ZhbGlkJyxcbiAgICAnW2NsYXNzLm5nLWludmFsaWRdJzogJ25nQ2xhc3NJbnZhbGlkJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIE5nQ29udHJvbFN0YXR1cyB7XG4gIHByaXZhdGUgX2NkOiBOZ0NvbnRyb2w7XG5cbiAgY29uc3RydWN0b3IoQFNlbGYoKSBjZDogTmdDb250cm9sKSB7IHRoaXMuX2NkID0gY2Q7IH1cblxuICBnZXQgbmdDbGFzc1VudG91Y2hlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2NkLmNvbnRyb2wpID8gdGhpcy5fY2QuY29udHJvbC51bnRvdWNoZWQgOiBmYWxzZTtcbiAgfVxuICBnZXQgbmdDbGFzc1RvdWNoZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9jZC5jb250cm9sKSA/IHRoaXMuX2NkLmNvbnRyb2wudG91Y2hlZCA6IGZhbHNlO1xuICB9XG4gIGdldCBuZ0NsYXNzUHJpc3RpbmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9jZC5jb250cm9sKSA/IHRoaXMuX2NkLmNvbnRyb2wucHJpc3RpbmUgOiBmYWxzZTtcbiAgfVxuICBnZXQgbmdDbGFzc0RpcnR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fY2QuY29udHJvbCkgPyB0aGlzLl9jZC5jb250cm9sLmRpcnR5IDogZmFsc2U7XG4gIH1cbiAgZ2V0IG5nQ2xhc3NWYWxpZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2NkLmNvbnRyb2wpID8gdGhpcy5fY2QuY29udHJvbC52YWxpZCA6IGZhbHNlO1xuICB9XG4gIGdldCBuZ0NsYXNzSW52YWxpZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2NkLmNvbnRyb2wpID8gIXRoaXMuX2NkLmNvbnRyb2wudmFsaWQgOiBmYWxzZTtcbiAgfVxufVxuIl19