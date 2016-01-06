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
import { Query, Directive, Renderer, forwardRef, Provider, ElementRef, QueryList } from 'angular2/core';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { CONST_EXPR } from 'angular2/src/facade/lang';
const SELECT_VALUE_ACCESSOR = CONST_EXPR(new Provider(NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => SelectControlValueAccessor), multi: true }));
/**
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * ### Example
 *
 * ```
 * <select ngControl="city">
 *   <option *ngFor="#c of cities" [value]="c"></option>
 * </select>
 * ```
 */
export let NgSelectOption = class {
};
NgSelectOption = __decorate([
    Directive({ selector: 'option' }), 
    __metadata('design:paramtypes', [])
], NgSelectOption);
/**
 * The accessor for writing a value and listening to changes on a select element.
 */
export let SelectControlValueAccessor = class {
    constructor(_renderer, _elementRef, query) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.onChange = (_) => { };
        this.onTouched = () => { };
        this._updateValueWhenListOfOptionsChanges(query);
    }
    writeValue(value) {
        this.value = value;
        this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', value);
    }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
    _updateValueWhenListOfOptionsChanges(query) {
        ObservableWrapper.subscribe(query.changes, (_) => this.writeValue(this.value));
    }
};
SelectControlValueAccessor = __decorate([
    Directive({
        selector: 'select[ngControl],select[ngFormControl],select[ngModel]',
        host: { '(input)': 'onChange($event.target.value)', '(blur)': 'onTouched()' },
        bindings: [SELECT_VALUE_ACCESSOR]
    }),
    __param(2, Query(NgSelectOption, { descendants: true })), 
    __metadata('design:paramtypes', [Renderer, ElementRef, QueryList])
], SelectControlValueAccessor);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvc2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IudHMiXSwibmFtZXMiOlsiTmdTZWxlY3RPcHRpb24iLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3NvciIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3Iud3JpdGVWYWx1ZSIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25DaGFuZ2UiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5yZWdpc3Rlck9uVG91Y2hlZCIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yLl91cGRhdGVWYWx1ZVdoZW5MaXN0T2ZPcHRpb25zQ2hhbmdlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFDTCxLQUFLLEVBQ0wsU0FBUyxFQUNULFFBQVEsRUFFUixVQUFVLEVBQ1YsUUFBUSxFQUNSLFVBQVUsRUFDVixTQUFTLEVBQ1YsTUFBTSxlQUFlO09BRWYsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDJCQUEyQjtPQUNwRCxFQUFDLGlCQUFpQixFQUF1QixNQUFNLDBCQUEwQjtPQUN6RSxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtBQUVuRCxNQUFNLHFCQUFxQixHQUFHLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FDakQsaUJBQWlCLEVBQUUsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLE1BQU0sMEJBQTBCLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBRWxHOzs7Ozs7Ozs7O0dBVUc7QUFDSDtBQUVBQSxDQUFDQTtBQUZEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDOzttQkFFL0I7QUFFRDs7R0FFRztBQUNIO0lBVUVDLFlBQW9CQSxTQUFtQkEsRUFBVUEsV0FBdUJBLEVBQ2hCQSxLQUFnQ0E7UUFEcEVDLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBQVVBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFZQTtRQUh4RUEsYUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsT0FBTUEsQ0FBQ0EsQ0FBQ0E7UUFDckJBLGNBQVNBLEdBQUdBLFFBQU9BLENBQUNBLENBQUNBO1FBSW5CQSxJQUFJQSxDQUFDQSxvQ0FBb0NBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQ25EQSxDQUFDQTtJQUVERCxVQUFVQSxDQUFDQSxLQUFVQTtRQUNuQkUsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDbkJBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsRUFBRUEsT0FBT0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDcEZBLENBQUNBO0lBRURGLGdCQUFnQkEsQ0FBQ0EsRUFBYUEsSUFBVUcsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0RILGlCQUFpQkEsQ0FBQ0EsRUFBYUEsSUFBVUksSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdkRKLG9DQUFvQ0EsQ0FBQ0EsS0FBZ0NBO1FBQzNFSyxpQkFBaUJBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO0lBQ2pGQSxDQUFDQTtBQUNITCxDQUFDQTtBQTFCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSx5REFBeUQ7UUFDbkUsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLCtCQUErQixFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUM7UUFDM0UsUUFBUSxFQUFFLENBQUMscUJBQXFCLENBQUM7S0FDbEMsQ0FBQztJQU9ZLFdBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFBOzsrQkFleEQ7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFF1ZXJ5LFxuICBEaXJlY3RpdmUsXG4gIFJlbmRlcmVyLFxuICBTZWxmLFxuICBmb3J3YXJkUmVmLFxuICBQcm92aWRlcixcbiAgRWxlbWVudFJlZixcbiAgUXVlcnlMaXN0XG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBmcm9tICcuL2NvbnRyb2xfdmFsdWVfYWNjZXNzb3InO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5jb25zdCBTRUxFQ1RfVkFMVUVfQUNDRVNTT1IgPSBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihcbiAgICBOR19WQUxVRV9BQ0NFU1NPUiwge3VzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IFNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yKSwgbXVsdGk6IHRydWV9KSk7XG5cbi8qKlxuICogTWFya3MgYDxvcHRpb24+YCBhcyBkeW5hbWljLCBzbyBBbmd1bGFyIGNhbiBiZSBub3RpZmllZCB3aGVuIG9wdGlvbnMgY2hhbmdlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiA8c2VsZWN0IG5nQ29udHJvbD1cImNpdHlcIj5cbiAqICAgPG9wdGlvbiAqbmdGb3I9XCIjYyBvZiBjaXRpZXNcIiBbdmFsdWVdPVwiY1wiPjwvb3B0aW9uPlxuICogPC9zZWxlY3Q+XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdvcHRpb24nfSlcbmV4cG9ydCBjbGFzcyBOZ1NlbGVjdE9wdGlvbiB7XG59XG5cbi8qKlxuICogVGhlIGFjY2Vzc29yIGZvciB3cml0aW5nIGEgdmFsdWUgYW5kIGxpc3RlbmluZyB0byBjaGFuZ2VzIG9uIGEgc2VsZWN0IGVsZW1lbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ3NlbGVjdFtuZ0NvbnRyb2xdLHNlbGVjdFtuZ0Zvcm1Db250cm9sXSxzZWxlY3RbbmdNb2RlbF0nLFxuICBob3N0OiB7JyhpbnB1dCknOiAnb25DaGFuZ2UoJGV2ZW50LnRhcmdldC52YWx1ZSknLCAnKGJsdXIpJzogJ29uVG91Y2hlZCgpJ30sXG4gIGJpbmRpbmdzOiBbU0VMRUNUX1ZBTFVFX0FDQ0VTU09SXVxufSlcbmV4cG9ydCBjbGFzcyBTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3NvciBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcbiAgdmFsdWU6IHN0cmluZztcbiAgb25DaGFuZ2UgPSAoXykgPT4ge307XG4gIG9uVG91Y2hlZCA9ICgpID0+IHt9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlciwgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgQFF1ZXJ5KE5nU2VsZWN0T3B0aW9uLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBxdWVyeTogUXVlcnlMaXN0PE5nU2VsZWN0T3B0aW9uPikge1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlV2hlbkxpc3RPZk9wdGlvbnNDaGFuZ2VzKHF1ZXJ5KTtcbiAgfVxuXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRFbGVtZW50UHJvcGVydHkodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAndmFsdWUnLCB2YWx1ZSk7XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAoKSA9PiBhbnkpOiB2b2lkIHsgdGhpcy5vbkNoYW5nZSA9IGZuOyB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiBhbnkpOiB2b2lkIHsgdGhpcy5vblRvdWNoZWQgPSBmbjsgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVZhbHVlV2hlbkxpc3RPZk9wdGlvbnNDaGFuZ2VzKHF1ZXJ5OiBRdWVyeUxpc3Q8TmdTZWxlY3RPcHRpb24+KSB7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHF1ZXJ5LmNoYW5nZXMsIChfKSA9PiB0aGlzLndyaXRlVmFsdWUodGhpcy52YWx1ZSkpO1xuICB9XG59XG4iXX0=