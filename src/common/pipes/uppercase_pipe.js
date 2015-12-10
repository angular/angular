'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBwZXJjYXNlX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL3VwcGVyY2FzZV9waXBlLnRzIl0sIm5hbWVzIjpbIlVwcGVyQ2FzZVBpcGUiLCJVcHBlckNhc2VQaXBlLmNvbnN0cnVjdG9yIiwiVXBwZXJDYXNlUGlwZS50cmFuc2Zvcm0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUF1QywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xFLHFCQUE0RCxlQUFlLENBQUMsQ0FBQTtBQUM1RSxnREFBMkMsbUNBQW1DLENBQUMsQ0FBQTtBQUUvRTs7Ozs7O0dBTUc7QUFDSDtJQUFBQTtJQVdBQyxDQUFDQTtJQVBDRCxpQ0FBU0EsR0FBVEEsVUFBVUEsS0FBYUEsRUFBRUEsSUFBa0JBO1FBQWxCRSxvQkFBa0JBLEdBQWxCQSxXQUFrQkE7UUFDekNBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxlQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQkEsTUFBTUEsSUFBSUEsOERBQTRCQSxDQUFDQSxhQUFhQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMvREEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7SUFDN0JBLENBQUNBO0lBVkhGO1FBQUNBLFlBQUtBLEVBQUVBO1FBQ1BBLFdBQUlBLENBQUNBLEVBQUNBLElBQUlBLEVBQUVBLFdBQVdBLEVBQUNBLENBQUNBO1FBQ3pCQSxpQkFBVUEsRUFBRUE7O3NCQVNaQTtJQUFEQSxvQkFBQ0E7QUFBREEsQ0FBQ0EsQUFYRCxJQVdDO0FBUlkscUJBQWEsZ0JBUXpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzU3RyaW5nLCBDT05TVCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UGlwZVRyYW5zZm9ybSwgV3JhcHBlZFZhbHVlLCBJbmplY3RhYmxlLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7SW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXhjZXB0aW9uJztcblxuLyoqXG4gKiBJbXBsZW1lbnRzIHVwcGVyY2FzZSB0cmFuc2Zvcm1zIHRvIHRleHQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9sb3dlcnVwcGVyX3BpcGUvbG93ZXJ1cHBlcl9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdMb3dlclVwcGVyUGlwZSd9XG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ3VwcGVyY2FzZSd9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFVwcGVyQ2FzZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBzdHJpbmcsIGFyZ3M6IGFueVtdID0gbnVsbCk6IHN0cmluZyB7XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gICAgaWYgKCFpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKFVwcGVyQ2FzZVBpcGUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlLnRvVXBwZXJDYXNlKCk7XG4gIH1cbn1cbiJdfQ==