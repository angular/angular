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
import { Directive, Self } from 'angular2/core';
import { NgControl } from './ng_control';
import { isPresent } from 'angular2/src/facade/lang';
/**
 * Directive automatically applied to Angular forms that sets CSS classes
 * based on control status (valid/invalid/dirty/etc).
 */
export let NgControlStatus = class NgControlStatus {
    constructor(cd) {
        this._cd = cd;
    }
    get ngClassUntouched() {
        return isPresent(this._cd.control) ? this._cd.control.untouched : false;
    }
    get ngClassTouched() {
        return isPresent(this._cd.control) ? this._cd.control.touched : false;
    }
    get ngClassPristine() {
        return isPresent(this._cd.control) ? this._cd.control.pristine : false;
    }
    get ngClassDirty() {
        return isPresent(this._cd.control) ? this._cd.control.dirty : false;
    }
    get ngClassValid() {
        return isPresent(this._cd.control) ? this._cd.control.valid : false;
    }
    get ngClassInvalid() {
        return isPresent(this._cd.control) ? !this._cd.control.valid : false;
    }
};
NgControlStatus = __decorate([
    Directive({
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
    __param(0, Self()), 
    __metadata('design:paramtypes', [NgControl])
], NgControlStatus);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udHJvbF9zdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvbmdfY29udHJvbF9zdGF0dXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZTtPQUN0QyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWM7T0FDL0IsRUFBVSxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7QUFFM0Q7OztHQUdHO0FBWUg7SUFHRSxZQUFvQixFQUFhO1FBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFBQyxDQUFDO0lBRXJELElBQUksZ0JBQWdCO1FBQ2xCLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQzFFLENBQUM7SUFDRCxJQUFJLGNBQWM7UUFDaEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDeEUsQ0FBQztJQUNELElBQUksZUFBZTtRQUNqQixNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUN6RSxDQUFDO0lBQ0QsSUFBSSxZQUFZO1FBQ2QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdEUsQ0FBQztJQUNELElBQUksWUFBWTtRQUNkLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3RFLENBQUM7SUFDRCxJQUFJLGNBQWM7UUFDaEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2RSxDQUFDO0FBQ0gsQ0FBQztBQWxDRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSx1Q0FBdUM7UUFDakQsSUFBSSxFQUFFO1lBQ0osc0JBQXNCLEVBQUUsa0JBQWtCO1lBQzFDLG9CQUFvQixFQUFFLGdCQUFnQjtZQUN0QyxxQkFBcUIsRUFBRSxpQkFBaUI7WUFDeEMsa0JBQWtCLEVBQUUsY0FBYztZQUNsQyxrQkFBa0IsRUFBRSxjQUFjO1lBQ2xDLG9CQUFvQixFQUFFLGdCQUFnQjtTQUN2QztLQUNGLENBQUM7ZUFJYSxJQUFJLEVBQUU7O21CQUpuQjtBQXdCRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBTZWxmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TmdDb250cm9sfSBmcm9tICcuL25nX2NvbnRyb2wnO1xuaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogRGlyZWN0aXZlIGF1dG9tYXRpY2FsbHkgYXBwbGllZCB0byBBbmd1bGFyIGZvcm1zIHRoYXQgc2V0cyBDU1MgY2xhc3Nlc1xuICogYmFzZWQgb24gY29udHJvbCBzdGF0dXMgKHZhbGlkL2ludmFsaWQvZGlydHkvZXRjKS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25nQ29udHJvbF0sW25nTW9kZWxdLFtuZ0Zvcm1Db250cm9sXScsXG4gIGhvc3Q6IHtcbiAgICAnW2NsYXNzLm5nLXVudG91Y2hlZF0nOiAnbmdDbGFzc1VudG91Y2hlZCcsXG4gICAgJ1tjbGFzcy5uZy10b3VjaGVkXSc6ICduZ0NsYXNzVG91Y2hlZCcsXG4gICAgJ1tjbGFzcy5uZy1wcmlzdGluZV0nOiAnbmdDbGFzc1ByaXN0aW5lJyxcbiAgICAnW2NsYXNzLm5nLWRpcnR5XSc6ICduZ0NsYXNzRGlydHknLFxuICAgICdbY2xhc3MubmctdmFsaWRdJzogJ25nQ2xhc3NWYWxpZCcsXG4gICAgJ1tjbGFzcy5uZy1pbnZhbGlkXSc6ICduZ0NsYXNzSW52YWxpZCdcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBOZ0NvbnRyb2xTdGF0dXMge1xuICBwcml2YXRlIF9jZDogTmdDb250cm9sO1xuXG4gIGNvbnN0cnVjdG9yKEBTZWxmKCkgY2Q6IE5nQ29udHJvbCkgeyB0aGlzLl9jZCA9IGNkOyB9XG5cbiAgZ2V0IG5nQ2xhc3NVbnRvdWNoZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9jZC5jb250cm9sKSA/IHRoaXMuX2NkLmNvbnRyb2wudW50b3VjaGVkIDogZmFsc2U7XG4gIH1cbiAgZ2V0IG5nQ2xhc3NUb3VjaGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fY2QuY29udHJvbCkgPyB0aGlzLl9jZC5jb250cm9sLnRvdWNoZWQgOiBmYWxzZTtcbiAgfVxuICBnZXQgbmdDbGFzc1ByaXN0aW5lKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fY2QuY29udHJvbCkgPyB0aGlzLl9jZC5jb250cm9sLnByaXN0aW5lIDogZmFsc2U7XG4gIH1cbiAgZ2V0IG5nQ2xhc3NEaXJ0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2NkLmNvbnRyb2wpID8gdGhpcy5fY2QuY29udHJvbC5kaXJ0eSA6IGZhbHNlO1xuICB9XG4gIGdldCBuZ0NsYXNzVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9jZC5jb250cm9sKSA/IHRoaXMuX2NkLmNvbnRyb2wudmFsaWQgOiBmYWxzZTtcbiAgfVxuICBnZXQgbmdDbGFzc0ludmFsaWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9jZC5jb250cm9sKSA/ICF0aGlzLl9jZC5jb250cm9sLnZhbGlkIDogZmFsc2U7XG4gIH1cbn1cbiJdfQ==