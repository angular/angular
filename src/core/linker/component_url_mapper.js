'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var reflection_1 = require('angular2/src/core/reflection/reflection');
/**
 * Resolve a `Type` from a {@link ComponentMetadata} into a URL.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
var ComponentUrlMapper = (function () {
    function ComponentUrlMapper() {
    }
    /**
     * Returns the base URL to the component source file.
     * The returned URL could be:
     * - an absolute URL,
     * - a path relative to the application
     */
    ComponentUrlMapper.prototype.getUrl = function (component) {
        return reflection_1.reflector.isReflectionEnabled() ? reflection_1.reflector.importUri(component) : './';
    };
    ComponentUrlMapper = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ComponentUrlMapper);
    return ComponentUrlMapper;
})();
exports.ComponentUrlMapper = ComponentUrlMapper;
var RuntimeComponentUrlMapper = (function (_super) {
    __extends(RuntimeComponentUrlMapper, _super);
    function RuntimeComponentUrlMapper() {
        _super.call(this);
        /** @internal */
        this._componentUrls = new collection_1.Map();
    }
    RuntimeComponentUrlMapper.prototype.setComponentUrl = function (component, url) { this._componentUrls.set(component, url); };
    RuntimeComponentUrlMapper.prototype.getUrl = function (component) {
        var url = this._componentUrls.get(component);
        if (lang_1.isPresent(url))
            return url;
        return _super.prototype.getUrl.call(this, component);
    };
    return RuntimeComponentUrlMapper;
})(ComponentUrlMapper);
exports.RuntimeComponentUrlMapper = RuntimeComponentUrlMapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3VybF9tYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X3VybF9tYXBwZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50VXJsTWFwcGVyIiwiQ29tcG9uZW50VXJsTWFwcGVyLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50VXJsTWFwcGVyLmdldFVybCIsIlJ1bnRpbWVDb21wb25lbnRVcmxNYXBwZXIiLCJSdW50aW1lQ29tcG9uZW50VXJsTWFwcGVyLmNvbnN0cnVjdG9yIiwiUnVudGltZUNvbXBvbmVudFVybE1hcHBlci5zZXRDb21wb25lbnRVcmwiLCJSdW50aW1lQ29tcG9uZW50VXJsTWFwcGVyLmdldFVybCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHFCQUE4QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3pELDJCQUE4QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9ELDJCQUF3Qix5Q0FBeUMsQ0FBQyxDQUFBO0FBRWxFOzs7Ozs7R0FNRztBQUNIO0lBQUFBO0lBV0FDLENBQUNBO0lBVENEOzs7OztPQUtHQTtJQUNIQSxtQ0FBTUEsR0FBTkEsVUFBT0EsU0FBZUE7UUFDcEJFLE1BQU1BLENBQUNBLHNCQUFTQSxDQUFDQSxtQkFBbUJBLEVBQUVBLEdBQUdBLHNCQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNqRkEsQ0FBQ0E7SUFWSEY7UUFBQ0EsZUFBVUEsRUFBRUE7OzJCQVdaQTtJQUFEQSx5QkFBQ0E7QUFBREEsQ0FBQ0EsQUFYRCxJQVdDO0FBVlksMEJBQWtCLHFCQVU5QixDQUFBO0FBRUQ7SUFBK0NHLDZDQUFrQkE7SUFJL0RBO1FBQWdCQyxpQkFBT0EsQ0FBQ0E7UUFIeEJBLGdCQUFnQkE7UUFDaEJBLG1CQUFjQSxHQUFHQSxJQUFJQSxnQkFBR0EsRUFBZ0JBLENBQUNBO0lBRWhCQSxDQUFDQTtJQUUxQkQsbURBQWVBLEdBQWZBLFVBQWdCQSxTQUFlQSxFQUFFQSxHQUFXQSxJQUFJRSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUUxRkYsMENBQU1BLEdBQU5BLFVBQU9BLFNBQWVBO1FBQ3BCRyxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUM3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO1FBQy9CQSxNQUFNQSxDQUFDQSxnQkFBS0EsQ0FBQ0EsTUFBTUEsWUFBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7SUFDakNBLENBQUNBO0lBQ0hILGdDQUFDQTtBQUFEQSxDQUFDQSxBQWJELEVBQStDLGtCQUFrQixFQWFoRTtBQWJZLGlDQUF5Qiw0QkFhckMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge01hcCwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuXG4vKipcbiAqIFJlc29sdmUgYSBgVHlwZWAgZnJvbSBhIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0gaW50byBhIFVSTC5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBjYW4gYmUgb3ZlcnJpZGRlbiBieSB0aGUgYXBwbGljYXRpb24gZGV2ZWxvcGVyIHRvIGNyZWF0ZSBjdXN0b20gYmVoYXZpb3IuXG4gKlxuICogU2VlIHtAbGluayBDb21waWxlcn1cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbXBvbmVudFVybE1hcHBlciB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiYXNlIFVSTCB0byB0aGUgY29tcG9uZW50IHNvdXJjZSBmaWxlLlxuICAgKiBUaGUgcmV0dXJuZWQgVVJMIGNvdWxkIGJlOlxuICAgKiAtIGFuIGFic29sdXRlIFVSTCxcbiAgICogLSBhIHBhdGggcmVsYXRpdmUgdG8gdGhlIGFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRVcmwoY29tcG9uZW50OiBUeXBlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcmVmbGVjdG9yLmlzUmVmbGVjdGlvbkVuYWJsZWQoKSA/IHJlZmxlY3Rvci5pbXBvcnRVcmkoY29tcG9uZW50KSA6ICcuLyc7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVDb21wb25lbnRVcmxNYXBwZXIgZXh0ZW5kcyBDb21wb25lbnRVcmxNYXBwZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRVcmxzID0gbmV3IE1hcDxUeXBlLCBzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKCk7IH1cblxuICBzZXRDb21wb25lbnRVcmwoY29tcG9uZW50OiBUeXBlLCB1cmw6IHN0cmluZykgeyB0aGlzLl9jb21wb25lbnRVcmxzLnNldChjb21wb25lbnQsIHVybCk7IH1cblxuICBnZXRVcmwoY29tcG9uZW50OiBUeXBlKTogc3RyaW5nIHtcbiAgICB2YXIgdXJsID0gdGhpcy5fY29tcG9uZW50VXJscy5nZXQoY29tcG9uZW50KTtcbiAgICBpZiAoaXNQcmVzZW50KHVybCkpIHJldHVybiB1cmw7XG4gICAgcmV0dXJuIHN1cGVyLmdldFVybChjb21wb25lbnQpO1xuICB9XG59XG4iXX0=