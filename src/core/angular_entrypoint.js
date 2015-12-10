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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcl9lbnRyeXBvaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvYW5ndWxhcl9lbnRyeXBvaW50LnRzIl0sIm5hbWVzIjpbIkFuZ3VsYXJFbnRyeXBvaW50IiwiQW5ndWxhckVudHJ5cG9pbnQuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUJBQW9CLDBCQUEwQixDQUFDLENBQUE7QUFFL0M7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSDtJQUVFQSwyQkFBbUJBLElBQWFBO1FBQWJDLFNBQUlBLEdBQUpBLElBQUlBLENBQVNBO0lBQUdBLENBQUNBO0lBRnRDRDtRQUFDQSxZQUFLQSxFQUFFQTs7MEJBR1BBO0lBQURBLHdCQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSx5QkFBaUIsb0JBRTdCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIE1hcmtzIGEgZnVuY3Rpb24gb3IgbWV0aG9kIGFzIGFuIEFuZ3VsYXIgMiBlbnRyeXBvaW50LiBPbmx5IG5lY2Vzc2FyeSBpbiBEYXJ0IGNvZGUuXG4gKlxuICogVGhlIG9wdGlvbmFsIGBuYW1lYCBwYXJhbWV0ZXIgd2lsbCBiZSByZWZsZWN0ZWQgaW4gbG9ncyB3aGVuIHRoZSBlbnRyeSBwb2ludCBpcyBwcm9jZXNzZWQuXG4gKlxuICogU2VlIFt0aGUgd2lraV1bXSBmb3IgZGV0YWlsZWQgZG9jdW1lbnRhdGlvbi5cbiAqIFt0aGUgd2lraV06IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvd2lraS9Bbmd1bGFyLTItRGFydC1UcmFuc2Zvcm1lciNlbnRyeV9wb2ludHNcbiAqXG4gKiAjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBAQW5ndWxhckVudHJ5cG9pbnQoXCJuYW1lLWZvci1kZWJ1Z1wiKVxuICogdm9pZCBtYWluKCkge1xuICogICBib290c3RyYXAoTXlDb21wb25lbnQpO1xuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQW5ndWxhckVudHJ5cG9pbnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZT86IFN0cmluZykge31cbn1cbiJdfQ==