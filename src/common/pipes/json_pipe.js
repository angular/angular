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
/**
 * Transforms any input value using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example core/pipes/ts/json_pipe/json_pipe_example.ts region='JsonPipe'}
 */
var JsonPipe = (function () {
    function JsonPipe() {
    }
    JsonPipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        return lang_1.Json.stringify(value);
    };
    JsonPipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'json', pure: false }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], JsonPipe);
    return JsonPipe;
})();
exports.JsonPipe = JsonPipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9qc29uX3BpcGUudHMiXSwibmFtZXMiOlsiSnNvblBpcGUiLCJKc29uUGlwZS5jb25zdHJ1Y3RvciIsIkpzb25QaXBlLnRyYW5zZm9ybSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQkFBOEMsMEJBQTBCLENBQUMsQ0FBQTtBQUN6RSxxQkFBNEQsZUFBZSxDQUFDLENBQUE7QUFFNUU7Ozs7O0dBS0c7QUFDSDtJQUFBQTtJQUtBQyxDQUFDQTtJQURDRCw0QkFBU0EsR0FBVEEsVUFBVUEsS0FBVUEsRUFBRUEsSUFBa0JBO1FBQWxCRSxvQkFBa0JBLEdBQWxCQSxXQUFrQkE7UUFBWUEsTUFBTUEsQ0FBQ0EsV0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFKckZGO1FBQUNBLFlBQUtBLEVBQUVBO1FBQ1BBLFdBQUlBLENBQUNBLEVBQUNBLElBQUlBLEVBQUVBLE1BQU1BLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLEVBQUNBLENBQUNBO1FBQ2pDQSxpQkFBVUEsRUFBRUE7O2lCQUdaQTtJQUFEQSxlQUFDQTtBQUFEQSxDQUFDQSxBQUxELElBS0M7QUFGWSxnQkFBUSxXQUVwQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnQsIEpzb24sIENPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgYW55IGlucHV0IHZhbHVlIHVzaW5nIGBKU09OLnN0cmluZ2lmeWAuIFVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9qc29uX3BpcGUvanNvbl9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdKc29uUGlwZSd9XG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ2pzb24nLCBwdXJlOiBmYWxzZX0pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvblBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdID0gbnVsbCk6IHN0cmluZyB7IHJldHVybiBKc29uLnN0cmluZ2lmeSh2YWx1ZSk7IH1cbn1cbiJdfQ==