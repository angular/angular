'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
// Make sure not to evaluate this in a non-browser environment!
var BrowserXhr = (function () {
    function BrowserXhr() {
    }
    BrowserXhr.prototype.build = function () { return (new XMLHttpRequest()); };
    BrowserXhr = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], BrowserXhr);
    return BrowserXhr;
})();
exports.BrowserXhr = BrowserXhr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl94aHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvaHR0cC9iYWNrZW5kcy9icm93c2VyX3hoci50cyJdLCJuYW1lcyI6WyJCcm93c2VyWGhyIiwiQnJvd3Nlclhoci5jb25zdHJ1Y3RvciIsIkJyb3dzZXJYaHIuYnVpbGQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUV6QywrREFBK0Q7QUFDL0Q7SUFFRUE7SUFBZUMsQ0FBQ0E7SUFDaEJELDBCQUFLQSxHQUFMQSxjQUFlRSxNQUFNQSxDQUFNQSxDQUFDQSxJQUFJQSxjQUFjQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUh0REY7UUFBQ0EsaUJBQVVBLEVBQUVBOzttQkFJWkE7SUFBREEsaUJBQUNBO0FBQURBLENBQUNBLEFBSkQsSUFJQztBQUhZLGtCQUFVLGFBR3RCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG4vLyBNYWtlIHN1cmUgbm90IHRvIGV2YWx1YXRlIHRoaXMgaW4gYSBub24tYnJvd3NlciBlbnZpcm9ubWVudCFcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCcm93c2VyWGhyIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuICBidWlsZCgpOiBhbnkgeyByZXR1cm4gPGFueT4obmV3IFhNTEh0dHBSZXF1ZXN0KCkpOyB9XG59XG4iXX0=