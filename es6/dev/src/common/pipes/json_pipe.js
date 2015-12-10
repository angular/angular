var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9qc29uX3BpcGUudHMiXSwibmFtZXMiOlsiSnNvblBpcGUiLCJKc29uUGlwZS50cmFuc2Zvcm0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBcUIsSUFBSSxFQUFFLEtBQUssRUFBQyxNQUFNLDBCQUEwQjtPQUNqRSxFQUFDLFVBQVUsRUFBK0IsSUFBSSxFQUFDLE1BQU0sZUFBZTtBQUUzRTs7Ozs7R0FLRztBQUNIO0lBSUVBLFNBQVNBLENBQUNBLEtBQVVBLEVBQUVBLElBQUlBLEdBQVVBLElBQUlBLElBQVlDLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ3JGRCxDQUFDQTtBQUxEO0lBQUMsS0FBSyxFQUFFO0lBQ1AsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7SUFDakMsVUFBVSxFQUFFOzthQUdaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudCwgSnNvbiwgQ09OU1R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0luamVjdGFibGUsIFBpcGVUcmFuc2Zvcm0sIFdyYXBwZWRWYWx1ZSwgUGlwZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhbnkgaW5wdXQgdmFsdWUgdXNpbmcgYEpTT04uc3RyaW5naWZ5YC4gVXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL2pzb25fcGlwZS9qc29uX3BpcGVfZXhhbXBsZS50cyByZWdpb249J0pzb25QaXBlJ31cbiAqL1xuQENPTlNUKClcbkBQaXBlKHtuYW1lOiAnanNvbicsIHB1cmU6IGZhbHNlfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29uUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgYXJnczogYW55W10gPSBudWxsKTogc3RyaW5nIHsgcmV0dXJuIEpzb24uc3RyaW5naWZ5KHZhbHVlKTsgfVxufVxuIl19