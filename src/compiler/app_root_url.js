'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
/**
 * Specifies app root url for the application.
 *
 * Used by the {@link Compiler} when resolving HTML and CSS template URLs.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
var AppRootUrl = (function () {
    function AppRootUrl(value) {
        this.value = value;
    }
    AppRootUrl = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [String])
    ], AppRootUrl);
    return AppRootUrl;
})();
exports.AppRootUrl = AppRootUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwX3Jvb3RfdXJsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2FwcF9yb290X3VybC50cyJdLCJuYW1lcyI6WyJBcHBSb290VXJsIiwiQXBwUm9vdFVybC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFHaEQ7Ozs7Ozs7O0dBUUc7QUFDSDtJQUVFQSxvQkFBbUJBLEtBQWFBO1FBQWJDLFVBQUtBLEdBQUxBLEtBQUtBLENBQVFBO0lBQUdBLENBQUNBO0lBRnRDRDtRQUFDQSxlQUFVQSxFQUFFQTs7bUJBR1pBO0lBQURBLGlCQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSxrQkFBVSxhQUV0QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge2lzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogU3BlY2lmaWVzIGFwcCByb290IHVybCBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIFVzZWQgYnkgdGhlIHtAbGluayBDb21waWxlcn0gd2hlbiByZXNvbHZpbmcgSFRNTCBhbmQgQ1NTIHRlbXBsYXRlIFVSTHMuXG4gKlxuICogVGhpcyBpbnRlcmZhY2UgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGFwcGxpY2F0aW9uIGRldmVsb3BlciB0byBjcmVhdGUgY3VzdG9tIGJlaGF2aW9yLlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcGlsZXJ9XG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBcHBSb290VXJsIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBzdHJpbmcpIHt9XG59XG4iXX0=