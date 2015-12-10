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
 * Transforms text to lowercase.
 *
 * ### Example
 *
 * {@example core/pipes/ts/lowerupper_pipe/lowerupper_pipe_example.ts region='LowerUpperPipe'}
 */
var LowerCasePipe = (function () {
    function LowerCasePipe() {
    }
    LowerCasePipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        if (lang_1.isBlank(value))
            return value;
        if (!lang_1.isString(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(LowerCasePipe, value);
        }
        return value.toLowerCase();
    };
    LowerCasePipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'lowercase' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], LowerCasePipe);
    return LowerCasePipe;
})();
exports.LowerCasePipe = LowerCasePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG93ZXJjYXNlX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL2xvd2VyY2FzZV9waXBlLnRzIl0sIm5hbWVzIjpbIkxvd2VyQ2FzZVBpcGUiLCJMb3dlckNhc2VQaXBlLmNvbnN0cnVjdG9yIiwiTG93ZXJDYXNlUGlwZS50cmFuc2Zvcm0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUF1QywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xFLHFCQUE0RCxlQUFlLENBQUMsQ0FBQTtBQUM1RSxnREFBMkMsbUNBQW1DLENBQUMsQ0FBQTtBQUUvRTs7Ozs7O0dBTUc7QUFDSDtJQUFBQTtJQVdBQyxDQUFDQTtJQVBDRCxpQ0FBU0EsR0FBVEEsVUFBVUEsS0FBYUEsRUFBRUEsSUFBa0JBO1FBQWxCRSxvQkFBa0JBLEdBQWxCQSxXQUFrQkE7UUFDekNBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxlQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQkEsTUFBTUEsSUFBSUEsOERBQTRCQSxDQUFDQSxhQUFhQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMvREEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7SUFDN0JBLENBQUNBO0lBVkhGO1FBQUNBLFlBQUtBLEVBQUVBO1FBQ1BBLFdBQUlBLENBQUNBLEVBQUNBLElBQUlBLEVBQUVBLFdBQVdBLEVBQUNBLENBQUNBO1FBQ3pCQSxpQkFBVUEsRUFBRUE7O3NCQVNaQTtJQUFEQSxvQkFBQ0E7QUFBREEsQ0FBQ0EsQUFYRCxJQVdDO0FBUlkscUJBQWEsZ0JBUXpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzU3RyaW5nLCBDT05TVCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgUGlwZVRyYW5zZm9ybSwgV3JhcHBlZFZhbHVlLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7SW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXhjZXB0aW9uJztcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRleHQgdG8gbG93ZXJjYXNlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvbG93ZXJ1cHBlcl9waXBlL2xvd2VydXBwZXJfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nTG93ZXJVcHBlclBpcGUnfVxuICovXG5AQ09OU1QoKVxuQFBpcGUoe25hbWU6ICdsb3dlcmNhc2UnfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBMb3dlckNhc2VQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nLCBhcmdzOiBhbnlbXSA9IG51bGwpOiBzdHJpbmcge1xuICAgIGlmIChpc0JsYW5rKHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgIGlmICghaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihMb3dlckNhc2VQaXBlLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICB9XG59XG4iXX0=