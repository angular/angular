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
 * ```
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcl9lbnRyeXBvaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvYW5ndWxhcl9lbnRyeXBvaW50LnRzIl0sIm5hbWVzIjpbIkFuZ3VsYXJFbnRyeXBvaW50IiwiQW5ndWxhckVudHJ5cG9pbnQuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUFvQiwwQkFBMEIsQ0FBQyxDQUFBO0FBRS9DOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0g7SUFFRUEsMkJBQW1CQSxJQUFhQTtRQUFiQyxTQUFJQSxHQUFKQSxJQUFJQSxDQUFTQTtJQUFHQSxDQUFDQTtJQUZ0Q0Q7UUFBQ0EsWUFBS0EsRUFBRUE7OzBCQUdQQTtJQUFEQSx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlkseUJBQWlCLG9CQUU3QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBNYXJrcyBhIGZ1bmN0aW9uIG9yIG1ldGhvZCBhcyBhbiBBbmd1bGFyIDIgZW50cnlwb2ludC4gT25seSBuZWNlc3NhcnkgaW4gRGFydCBjb2RlLlxuICpcbiAqIFRoZSBvcHRpb25hbCBgbmFtZWAgcGFyYW1ldGVyIHdpbGwgYmUgcmVmbGVjdGVkIGluIGxvZ3Mgd2hlbiB0aGUgZW50cnkgcG9pbnQgaXMgcHJvY2Vzc2VkLlxuICpcbiAqIFNlZSBbdGhlIHdpa2ldW10gZm9yIGRldGFpbGVkIGRvY3VtZW50YXRpb24uXG4gKiBbdGhlIHdpa2ldOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3dpa2kvQW5ndWxhci0yLURhcnQtVHJhbnNmb3JtZXIjZW50cnlfcG9pbnRzXG4gKlxuICogIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQEFuZ3VsYXJFbnRyeXBvaW50KFwibmFtZS1mb3ItZGVidWdcIilcbiAqIHZvaWQgbWFpbigpIHtcbiAqICAgYm9vdHN0cmFwKE15Q29tcG9uZW50KTtcbiAqIH1cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJFbnRyeXBvaW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU/OiBTdHJpbmcpIHt9XG59XG4iXX0=