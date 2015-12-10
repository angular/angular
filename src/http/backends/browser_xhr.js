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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl94aHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvaHR0cC9iYWNrZW5kcy9icm93c2VyX3hoci50cyJdLCJuYW1lcyI6WyJCcm93c2VyWGhyIiwiQnJvd3Nlclhoci5jb25zdHJ1Y3RvciIsIkJyb3dzZXJYaHIuYnVpbGQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUJBQXlCLGVBQWUsQ0FBQyxDQUFBO0FBRXpDLCtEQUErRDtBQUMvRDtJQUVFQTtJQUFlQyxDQUFDQTtJQUNoQkQsMEJBQUtBLEdBQUxBLGNBQWVFLE1BQU1BLENBQU1BLENBQUNBLElBQUlBLGNBQWNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBSHRERjtRQUFDQSxpQkFBVUEsRUFBRUE7O21CQUlaQTtJQUFEQSxpQkFBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxJQUlDO0FBSFksa0JBQVUsYUFHdEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbi8vIE1ha2Ugc3VyZSBub3QgdG8gZXZhbHVhdGUgdGhpcyBpbiBhIG5vbi1icm93c2VyIGVudmlyb25tZW50IVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJYaHIge1xuICBjb25zdHJ1Y3RvcigpIHt9XG4gIGJ1aWxkKCk6IGFueSB7IHJldHVybiA8YW55PihuZXcgWE1MSHR0cFJlcXVlc3QoKSk7IH1cbn1cbiJdfQ==