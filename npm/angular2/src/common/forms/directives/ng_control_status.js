'use strict';"use strict";
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
var core_1 = require('angular2/core');
var ng_control_1 = require('./ng_control');
var lang_1 = require('angular2/src/facade/lang');
/**
 * Directive automatically applied to Angular forms that sets CSS classes
 * based on control status (valid/invalid/dirty/etc).
 */
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
            selector: '[ngControl],[ngModel],[ngFormControl]',
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
}());
exports.NgControlStatus = NgControlStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9zdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfY29udHJvbF9zdGF0dXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUE4QixlQUFlLENBQUMsQ0FBQTtBQUM5QywyQkFBd0IsY0FBYyxDQUFDLENBQUE7QUFDdkMscUJBQWlDLDBCQUEwQixDQUFDLENBQUE7QUFFNUQ7OztHQUdHO0FBWUg7SUFHRSx5QkFBb0IsRUFBYTtRQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQUMsQ0FBQztJQUVyRCxzQkFBSSw2Q0FBZ0I7YUFBcEI7WUFDRSxNQUFNLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDMUUsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSwyQ0FBYzthQUFsQjtZQUNFLE1BQU0sQ0FBQyxnQkFBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUN4RSxDQUFDOzs7T0FBQTtJQUNELHNCQUFJLDRDQUFlO2FBQW5CO1lBQ0UsTUFBTSxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3pFLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUkseUNBQVk7YUFBaEI7WUFDRSxNQUFNLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDdEUsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSx5Q0FBWTthQUFoQjtZQUNFLE1BQU0sQ0FBQyxnQkFBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUN0RSxDQUFDOzs7T0FBQTtJQUNELHNCQUFJLDJDQUFjO2FBQWxCO1lBQ0UsTUFBTSxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDdkUsQ0FBQzs7O09BQUE7SUFqQ0g7UUFBQyxnQkFBUyxDQUFDO1lBQ1QsUUFBUSxFQUFFLHVDQUF1QztZQUNqRCxJQUFJLEVBQUU7Z0JBQ0osc0JBQXNCLEVBQUUsa0JBQWtCO2dCQUMxQyxvQkFBb0IsRUFBRSxnQkFBZ0I7Z0JBQ3RDLHFCQUFxQixFQUFFLGlCQUFpQjtnQkFDeEMsa0JBQWtCLEVBQUUsY0FBYztnQkFDbEMsa0JBQWtCLEVBQUUsY0FBYztnQkFDbEMsb0JBQW9CLEVBQUUsZ0JBQWdCO2FBQ3ZDO1NBQ0YsQ0FBQzttQkFJYSxXQUFJLEVBQUU7O3VCQUpuQjtJQXdCRixzQkFBQztBQUFELENBQUMsQUF2QkQsSUF1QkM7QUF2QlksdUJBQWUsa0JBdUIzQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIFNlbGZ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtOZ0NvbnRyb2x9IGZyb20gJy4vbmdfY29udHJvbCc7XG5pbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBEaXJlY3RpdmUgYXV0b21hdGljYWxseSBhcHBsaWVkIHRvIEFuZ3VsYXIgZm9ybXMgdGhhdCBzZXRzIENTUyBjbGFzc2VzXG4gKiBiYXNlZCBvbiBjb250cm9sIHN0YXR1cyAodmFsaWQvaW52YWxpZC9kaXJ0eS9ldGMpLlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbbmdDb250cm9sXSxbbmdNb2RlbF0sW25nRm9ybUNvbnRyb2xdJyxcbiAgaG9zdDoge1xuICAgICdbY2xhc3MubmctdW50b3VjaGVkXSc6ICduZ0NsYXNzVW50b3VjaGVkJyxcbiAgICAnW2NsYXNzLm5nLXRvdWNoZWRdJzogJ25nQ2xhc3NUb3VjaGVkJyxcbiAgICAnW2NsYXNzLm5nLXByaXN0aW5lXSc6ICduZ0NsYXNzUHJpc3RpbmUnLFxuICAgICdbY2xhc3MubmctZGlydHldJzogJ25nQ2xhc3NEaXJ0eScsXG4gICAgJ1tjbGFzcy5uZy12YWxpZF0nOiAnbmdDbGFzc1ZhbGlkJyxcbiAgICAnW2NsYXNzLm5nLWludmFsaWRdJzogJ25nQ2xhc3NJbnZhbGlkJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIE5nQ29udHJvbFN0YXR1cyB7XG4gIHByaXZhdGUgX2NkOiBOZ0NvbnRyb2w7XG5cbiAgY29uc3RydWN0b3IoQFNlbGYoKSBjZDogTmdDb250cm9sKSB7IHRoaXMuX2NkID0gY2Q7IH1cblxuICBnZXQgbmdDbGFzc1VudG91Y2hlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2NkLmNvbnRyb2wpID8gdGhpcy5fY2QuY29udHJvbC51bnRvdWNoZWQgOiBmYWxzZTtcbiAgfVxuICBnZXQgbmdDbGFzc1RvdWNoZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9jZC5jb250cm9sKSA/IHRoaXMuX2NkLmNvbnRyb2wudG91Y2hlZCA6IGZhbHNlO1xuICB9XG4gIGdldCBuZ0NsYXNzUHJpc3RpbmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9jZC5jb250cm9sKSA/IHRoaXMuX2NkLmNvbnRyb2wucHJpc3RpbmUgOiBmYWxzZTtcbiAgfVxuICBnZXQgbmdDbGFzc0RpcnR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fY2QuY29udHJvbCkgPyB0aGlzLl9jZC5jb250cm9sLmRpcnR5IDogZmFsc2U7XG4gIH1cbiAgZ2V0IG5nQ2xhc3NWYWxpZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2NkLmNvbnRyb2wpID8gdGhpcy5fY2QuY29udHJvbC52YWxpZCA6IGZhbHNlO1xuICB9XG4gIGdldCBuZ0NsYXNzSW52YWxpZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2NkLmNvbnRyb2wpID8gIXRoaXMuX2NkLmNvbnRyb2wudmFsaWQgOiBmYWxzZTtcbiAgfVxufVxuIl19