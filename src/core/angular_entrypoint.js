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
/**
 * Marks a function or method as an Angular 2 entrypoint. Only necessary in Dart code.
 *
 * The optional `name` parameter will be reflected in logs when the entry point is processed.
 *
 * See [the wiki][] for detailed documentation.
 * [the wiki]: https://github.com/angular/angular/wiki/Angular-2-Dart-Transformer#entry_points
 *
 * ## Example
 *
 * ```
 * @AngularEntrypoint("name-for-debug")
 * void main() {
 *   bootstrap(MyComponent);
 * }
 */
var AngularEntrypoint = (function () {
    function AngularEntrypoint(name) {
        this.name = name;
    }
    AngularEntrypoint = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String])
    ], AngularEntrypoint);
    return AngularEntrypoint;
})();
exports.AngularEntrypoint = AngularEntrypoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcl9lbnRyeXBvaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvYW5ndWxhcl9lbnRyeXBvaW50LnRzIl0sIm5hbWVzIjpbIkFuZ3VsYXJFbnRyeXBvaW50IiwiQW5ndWxhckVudHJ5cG9pbnQuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUJBQW9CLDBCQUEwQixDQUFDLENBQUE7QUFFL0M7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0g7SUFFRUEsMkJBQW1CQSxJQUFhQTtRQUFiQyxTQUFJQSxHQUFKQSxJQUFJQSxDQUFTQTtJQUFHQSxDQUFDQTtJQUZ0Q0Q7UUFBQ0EsWUFBS0EsRUFBRUE7OzBCQUdQQTtJQUFEQSx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlkseUJBQWlCLG9CQUU3QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBNYXJrcyBhIGZ1bmN0aW9uIG9yIG1ldGhvZCBhcyBhbiBBbmd1bGFyIDIgZW50cnlwb2ludC4gT25seSBuZWNlc3NhcnkgaW4gRGFydCBjb2RlLlxuICpcbiAqIFRoZSBvcHRpb25hbCBgbmFtZWAgcGFyYW1ldGVyIHdpbGwgYmUgcmVmbGVjdGVkIGluIGxvZ3Mgd2hlbiB0aGUgZW50cnkgcG9pbnQgaXMgcHJvY2Vzc2VkLlxuICpcbiAqIFNlZSBbdGhlIHdpa2ldW10gZm9yIGRldGFpbGVkIGRvY3VtZW50YXRpb24uXG4gKiBbdGhlIHdpa2ldOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3dpa2kvQW5ndWxhci0yLURhcnQtVHJhbnNmb3JtZXIjZW50cnlfcG9pbnRzXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQEFuZ3VsYXJFbnRyeXBvaW50KFwibmFtZS1mb3ItZGVidWdcIilcbiAqIHZvaWQgbWFpbigpIHtcbiAqICAgYm9vdHN0cmFwKE15Q29tcG9uZW50KTtcbiAqIH1cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBBbmd1bGFyRW50cnlwb2ludCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lPzogU3RyaW5nKSB7fVxufVxuIl19