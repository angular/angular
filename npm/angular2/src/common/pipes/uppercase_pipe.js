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
    UpperCasePipe.prototype.transform = function (value) {
        if (lang_1.isBlank(value))
            return value;
        if (!lang_1.isString(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(UpperCasePipe, value);
        }
        return value.toUpperCase();
    };
    UpperCasePipe = __decorate([
        core_1.Pipe({ name: 'uppercase' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], UpperCasePipe);
    return UpperCasePipe;
}());
exports.UpperCasePipe = UpperCasePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBwZXJjYXNlX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL3VwcGVyY2FzZV9waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxxQkFBZ0MsMEJBQTBCLENBQUMsQ0FBQTtBQUMzRCxxQkFBNEQsZUFBZSxDQUFDLENBQUE7QUFDNUUsZ0RBQTJDLG1DQUFtQyxDQUFDLENBQUE7QUFFL0U7Ozs7OztHQU1HO0FBR0g7SUFBQTtJQVFBLENBQUM7SUFQQyxpQ0FBUyxHQUFULFVBQVUsS0FBYTtRQUNyQixFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixNQUFNLElBQUksOERBQTRCLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFUSDtRQUFDLFdBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsQ0FBQztRQUN6QixpQkFBVSxFQUFFOztxQkFBQTtJQVNiLG9CQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7QUFSWSxxQkFBYSxnQkFRekIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNTdHJpbmcsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1BpcGVUcmFuc2Zvcm0sIFdyYXBwZWRWYWx1ZSwgSW5qZWN0YWJsZSwgUGlwZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0ludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb259IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbic7XG5cbi8qKlxuICogSW1wbGVtZW50cyB1cHBlcmNhc2UgdHJhbnNmb3JtcyB0byB0ZXh0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvbG93ZXJ1cHBlcl9waXBlL2xvd2VydXBwZXJfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nTG93ZXJVcHBlclBpcGUnfVxuICovXG5AUGlwZSh7bmFtZTogJ3VwcGVyY2FzZSd9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFVwcGVyQ2FzZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChpc0JsYW5rKHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgIGlmICghaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihVcHBlckNhc2VQaXBlLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZS50b1VwcGVyQ2FzZSgpO1xuICB9XG59XG4iXX0=