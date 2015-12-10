var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Json, CONST } from 'angular2/src/facade/lang';
import { Injectable, Pipe } from 'angular2/core';
/**
 * Transforms any input value using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example core/pipes/ts/json_pipe/json_pipe_example.ts region='JsonPipe'}
 */
export let JsonPipe = class {
    transform(value, args = null) { return Json.stringify(value); }
};
JsonPipe = __decorate([
    CONST(),
    Pipe({ name: 'json', pure: false }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], JsonPipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9qc29uX3BpcGUudHMiXSwibmFtZXMiOlsiSnNvblBpcGUiLCJKc29uUGlwZS50cmFuc2Zvcm0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQXFCLElBQUksRUFBRSxLQUFLLEVBQUMsTUFBTSwwQkFBMEI7T0FDakUsRUFBQyxVQUFVLEVBQStCLElBQUksRUFBQyxNQUFNLGVBQWU7QUFFM0U7Ozs7O0dBS0c7QUFDSDtJQUlFQSxTQUFTQSxDQUFDQSxLQUFVQSxFQUFFQSxJQUFJQSxHQUFVQSxJQUFJQSxJQUFZQyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNyRkQsQ0FBQ0E7QUFMRDtJQUFDLEtBQUssRUFBRTtJQUNQLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDO0lBQ2pDLFVBQVUsRUFBRTs7YUFHWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnQsIEpzb24sIENPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG4vKipcbiAqIFRyYW5zZm9ybXMgYW55IGlucHV0IHZhbHVlIHVzaW5nIGBKU09OLnN0cmluZ2lmeWAuIFVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9qc29uX3BpcGUvanNvbl9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdKc29uUGlwZSd9XG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ2pzb24nLCBwdXJlOiBmYWxzZX0pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvblBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdID0gbnVsbCk6IHN0cmluZyB7IHJldHVybiBKc29uLnN0cmluZ2lmeSh2YWx1ZSk7IH1cbn1cbiJdfQ==