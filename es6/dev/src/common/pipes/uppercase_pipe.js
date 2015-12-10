var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isString, CONST, isBlank } from 'angular2/src/facade/lang';
import { Injectable, Pipe } from 'angular2/core';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
/**
 * Implements uppercase transforms to text.
 *
 * ### Example
 *
 * {@example core/pipes/ts/lowerupper_pipe/lowerupper_pipe_example.ts region='LowerUpperPipe'}
 */
export let UpperCasePipe = class {
    transform(value, args = null) {
        if (isBlank(value))
            return value;
        if (!isString(value)) {
            throw new InvalidPipeArgumentException(UpperCasePipe, value);
        }
        return value.toUpperCase();
    }
};
UpperCasePipe = __decorate([
    CONST(),
    Pipe({ name: 'uppercase' }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], UpperCasePipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBwZXJjYXNlX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL3VwcGVyY2FzZV9waXBlLnRzIl0sIm5hbWVzIjpbIlVwcGVyQ2FzZVBpcGUiLCJVcHBlckNhc2VQaXBlLnRyYW5zZm9ybSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtPQUMxRCxFQUE4QixVQUFVLEVBQUUsSUFBSSxFQUFDLE1BQU0sZUFBZTtPQUNwRSxFQUFDLDRCQUE0QixFQUFDLE1BQU0sbUNBQW1DO0FBRTlFOzs7Ozs7R0FNRztBQUNIO0lBSUVBLFNBQVNBLENBQUNBLEtBQWFBLEVBQUVBLElBQUlBLEdBQVVBLElBQUlBO1FBQ3pDQyxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLE1BQU1BLElBQUlBLDRCQUE0QkEsQ0FBQ0EsYUFBYUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDL0RBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO0lBQzdCQSxDQUFDQTtBQUNIRCxDQUFDQTtBQVhEO0lBQUMsS0FBSyxFQUFFO0lBQ1AsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQyxDQUFDO0lBQ3pCLFVBQVUsRUFBRTs7a0JBU1o7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNTdHJpbmcsIENPTlNULCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIEluamVjdGFibGUsIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG4vKipcbiAqIEltcGxlbWVudHMgdXBwZXJjYXNlIHRyYW5zZm9ybXMgdG8gdGV4dC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL2xvd2VydXBwZXJfcGlwZS9sb3dlcnVwcGVyX3BpcGVfZXhhbXBsZS50cyByZWdpb249J0xvd2VyVXBwZXJQaXBlJ31cbiAqL1xuQENPTlNUKClcbkBQaXBlKHtuYW1lOiAndXBwZXJjYXNlJ30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVXBwZXJDYXNlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZywgYXJnczogYW55W10gPSBudWxsKTogc3RyaW5nIHtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoIWlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oVXBwZXJDYXNlUGlwZSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUudG9VcHBlckNhc2UoKTtcbiAgfVxufVxuIl19