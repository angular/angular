'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9zdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfY29udHJvbF9zdGF0dXMudHMiXSwibmFtZXMiOlsiTmdDb250cm9sU3RhdHVzIiwiTmdDb250cm9sU3RhdHVzLmNvbnN0cnVjdG9yIiwiTmdDb250cm9sU3RhdHVzLm5nQ2xhc3NVbnRvdWNoZWQiLCJOZ0NvbnRyb2xTdGF0dXMubmdDbGFzc1RvdWNoZWQiLCJOZ0NvbnRyb2xTdGF0dXMubmdDbGFzc1ByaXN0aW5lIiwiTmdDb250cm9sU3RhdHVzLm5nQ2xhc3NEaXJ0eSIsIk5nQ29udHJvbFN0YXR1cy5uZ0NsYXNzVmFsaWQiLCJOZ0NvbnRyb2xTdGF0dXMubmdDbGFzc0ludmFsaWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBQThCLGVBQWUsQ0FBQyxDQUFBO0FBQzlDLDJCQUF3QixjQUFjLENBQUMsQ0FBQTtBQUN2QyxxQkFBaUMsMEJBQTBCLENBQUMsQ0FBQTtBQUU1RDtJQWNFQSx5QkFBb0JBLEVBQWFBO1FBQUlDLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBO0lBQUNBLENBQUNBO0lBRXJERCxzQkFBSUEsNkNBQWdCQTthQUFwQkE7WUFDRUUsTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLFNBQVNBLEdBQUdBLEtBQUtBLENBQUNBO1FBQzFFQSxDQUFDQTs7O09BQUFGO0lBQ0RBLHNCQUFJQSwyQ0FBY0E7YUFBbEJBO1lBQ0VHLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN4RUEsQ0FBQ0E7OztPQUFBSDtJQUNEQSxzQkFBSUEsNENBQWVBO2FBQW5CQTtZQUNFSSxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDekVBLENBQUNBOzs7T0FBQUo7SUFDREEsc0JBQUlBLHlDQUFZQTthQUFoQkE7WUFDRUssTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ3RFQSxDQUFDQTs7O09BQUFMO0lBQ0RBLHNCQUFJQSx5Q0FBWUE7YUFBaEJBO1lBQ0VNLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN0RUEsQ0FBQ0E7OztPQUFBTjtJQUNEQSxzQkFBSUEsMkNBQWNBO2FBQWxCQTtZQUNFTyxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDdkVBLENBQUNBOzs7T0FBQVA7SUFqQ0hBO1FBQUNBLGdCQUFTQSxDQUFDQTtZQUNUQSxRQUFRQSxFQUFFQSwyQ0FBMkNBO1lBQ3JEQSxJQUFJQSxFQUFFQTtnQkFDSkEsc0JBQXNCQSxFQUFFQSxrQkFBa0JBO2dCQUMxQ0Esb0JBQW9CQSxFQUFFQSxnQkFBZ0JBO2dCQUN0Q0EscUJBQXFCQSxFQUFFQSxpQkFBaUJBO2dCQUN4Q0Esa0JBQWtCQSxFQUFFQSxjQUFjQTtnQkFDbENBLGtCQUFrQkEsRUFBRUEsY0FBY0E7Z0JBQ2xDQSxvQkFBb0JBLEVBQUVBLGdCQUFnQkE7YUFDdkNBO1NBQ0ZBLENBQUNBO1FBSVlBLFdBQUNBLFdBQUlBLEVBQUVBLENBQUFBOzt3QkFvQnBCQTtJQUFEQSxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFsQ0QsSUFrQ0M7QUF2QlksdUJBQWUsa0JBdUIzQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIFNlbGZ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtOZ0NvbnRyb2x9IGZyb20gJy4vbmdfY29udHJvbCc7XG5pbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nLWNvbnRyb2xdLFtuZy1tb2RlbF0sW25nLWZvcm0tY29udHJvbF0nLFxuICBob3N0OiB7XG4gICAgJ1tjbGFzcy5uZy11bnRvdWNoZWRdJzogJ25nQ2xhc3NVbnRvdWNoZWQnLFxuICAgICdbY2xhc3MubmctdG91Y2hlZF0nOiAnbmdDbGFzc1RvdWNoZWQnLFxuICAgICdbY2xhc3MubmctcHJpc3RpbmVdJzogJ25nQ2xhc3NQcmlzdGluZScsXG4gICAgJ1tjbGFzcy5uZy1kaXJ0eV0nOiAnbmdDbGFzc0RpcnR5JyxcbiAgICAnW2NsYXNzLm5nLXZhbGlkXSc6ICduZ0NsYXNzVmFsaWQnLFxuICAgICdbY2xhc3MubmctaW52YWxpZF0nOiAnbmdDbGFzc0ludmFsaWQnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgTmdDb250cm9sU3RhdHVzIHtcbiAgcHJpdmF0ZSBfY2Q6IE5nQ29udHJvbDtcblxuICBjb25zdHJ1Y3RvcihAU2VsZigpIGNkOiBOZ0NvbnRyb2wpIHsgdGhpcy5fY2QgPSBjZDsgfVxuXG4gIGdldCBuZ0NsYXNzVW50b3VjaGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fY2QuY29udHJvbCkgPyB0aGlzLl9jZC5jb250cm9sLnVudG91Y2hlZCA6IGZhbHNlO1xuICB9XG4gIGdldCBuZ0NsYXNzVG91Y2hlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2NkLmNvbnRyb2wpID8gdGhpcy5fY2QuY29udHJvbC50b3VjaGVkIDogZmFsc2U7XG4gIH1cbiAgZ2V0IG5nQ2xhc3NQcmlzdGluZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2NkLmNvbnRyb2wpID8gdGhpcy5fY2QuY29udHJvbC5wcmlzdGluZSA6IGZhbHNlO1xuICB9XG4gIGdldCBuZ0NsYXNzRGlydHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9jZC5jb250cm9sKSA/IHRoaXMuX2NkLmNvbnRyb2wuZGlydHkgOiBmYWxzZTtcbiAgfVxuICBnZXQgbmdDbGFzc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fY2QuY29udHJvbCkgPyB0aGlzLl9jZC5jb250cm9sLnZhbGlkIDogZmFsc2U7XG4gIH1cbiAgZ2V0IG5nQ2xhc3NJbnZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fY2QuY29udHJvbCkgPyAhdGhpcy5fY2QuY29udHJvbC52YWxpZCA6IGZhbHNlO1xuICB9XG59XG4iXX0=