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
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
/**
 * Implements uppercase transforms to text.
 *
 * ### Example
 *
 * {@example core/pipes/ts/lowerupper_pipe/lowerupper_pipe_example.ts region='LowerUpperPipe'}
 */
var UpperCasePipe = (function () {
    function UpperCasePipe() {
    }
    UpperCasePipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        if (lang_1.isBlank(value))
            return value;
        if (!lang_1.isString(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(UpperCasePipe, value);
        }
        return value.toUpperCase();
    };
    UpperCasePipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'uppercase' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], UpperCasePipe);
    return UpperCasePipe;
})();
exports.UpperCasePipe = UpperCasePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBwZXJjYXNlX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL3VwcGVyY2FzZV9waXBlLnRzIl0sIm5hbWVzIjpbIlVwcGVyQ2FzZVBpcGUiLCJVcHBlckNhc2VQaXBlLmNvbnN0cnVjdG9yIiwiVXBwZXJDYXNlUGlwZS50cmFuc2Zvcm0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUJBQXVDLDBCQUEwQixDQUFDLENBQUE7QUFDbEUscUJBQTRELGVBQWUsQ0FBQyxDQUFBO0FBQzVFLGdEQUEyQyxtQ0FBbUMsQ0FBQyxDQUFBO0FBRS9FOzs7Ozs7R0FNRztBQUNIO0lBQUFBO0lBV0FDLENBQUNBO0lBUENELGlDQUFTQSxHQUFUQSxVQUFVQSxLQUFhQSxFQUFFQSxJQUFrQkE7UUFBbEJFLG9CQUFrQkEsR0FBbEJBLFdBQWtCQTtRQUN6Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGVBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JCQSxNQUFNQSxJQUFJQSw4REFBNEJBLENBQUNBLGFBQWFBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQy9EQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtJQUM3QkEsQ0FBQ0E7SUFWSEY7UUFBQ0EsWUFBS0EsRUFBRUE7UUFDUEEsV0FBSUEsQ0FBQ0EsRUFBQ0EsSUFBSUEsRUFBRUEsV0FBV0EsRUFBQ0EsQ0FBQ0E7UUFDekJBLGlCQUFVQSxFQUFFQTs7c0JBU1pBO0lBQURBLG9CQUFDQTtBQUFEQSxDQUFDQSxBQVhELElBV0M7QUFSWSxxQkFBYSxnQkFRekIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNTdHJpbmcsIENPTlNULCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIEluamVjdGFibGUsIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG4vKipcbiAqIEltcGxlbWVudHMgdXBwZXJjYXNlIHRyYW5zZm9ybXMgdG8gdGV4dC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL2xvd2VydXBwZXJfcGlwZS9sb3dlcnVwcGVyX3BpcGVfZXhhbXBsZS50cyByZWdpb249J0xvd2VyVXBwZXJQaXBlJ31cbiAqL1xuQENPTlNUKClcbkBQaXBlKHtuYW1lOiAndXBwZXJjYXNlJ30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVXBwZXJDYXNlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZywgYXJnczogYW55W10gPSBudWxsKTogc3RyaW5nIHtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoIWlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oVXBwZXJDYXNlUGlwZSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUudG9VcHBlckNhc2UoKTtcbiAgfVxufVxuIl19