var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { isPresent } from 'angular2/src/facade/lang';
import { Map } from 'angular2/src/facade/collection';
import { reflector } from 'angular2/src/core/reflection/reflection';
/**
 * Resolve a `Type` from a {@link ComponentMetadata} into a URL.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export let ComponentUrlMapper = class {
    /**
     * Returns the base URL to the component source file.
     * The returned URL could be:
     * - an absolute URL,
     * - a path relative to the application
     */
    getUrl(component) {
        return reflector.isReflectionEnabled() ? reflector.importUri(component) : './';
    }
};
ComponentUrlMapper = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], ComponentUrlMapper);
export class RuntimeComponentUrlMapper extends ComponentUrlMapper {
    constructor() {
        super();
        /** @internal */
        this._componentUrls = new Map();
    }
    setComponentUrl(component, url) { this._componentUrls.set(component, url); }
    getUrl(component) {
        var url = this._componentUrls.get(component);
        if (isPresent(url))
            return url;
        return super.getUrl(component);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3VybF9tYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X3VybF9tYXBwZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50VXJsTWFwcGVyIiwiQ29tcG9uZW50VXJsTWFwcGVyLmdldFVybCIsIlJ1bnRpbWVDb21wb25lbnRVcmxNYXBwZXIiLCJSdW50aW1lQ29tcG9uZW50VXJsTWFwcGVyLmNvbnN0cnVjdG9yIiwiUnVudGltZUNvbXBvbmVudFVybE1hcHBlci5zZXRDb21wb25lbnRVcmwiLCJSdW50aW1lQ29tcG9uZW50VXJsTWFwcGVyLmdldFVybCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBTyxTQUFTLEVBQUMsTUFBTSwwQkFBMEI7T0FDakQsRUFBQyxHQUFHLEVBQWEsTUFBTSxnQ0FBZ0M7T0FDdkQsRUFBQyxTQUFTLEVBQUMsTUFBTSx5Q0FBeUM7QUFFakU7Ozs7OztHQU1HO0FBQ0g7SUFFRUE7Ozs7O09BS0dBO0lBQ0hBLE1BQU1BLENBQUNBLFNBQWVBO1FBQ3BCQyxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxtQkFBbUJBLEVBQUVBLEdBQUdBLFNBQVNBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ2pGQSxDQUFDQTtBQUNIRCxDQUFDQTtBQVhEO0lBQUMsVUFBVSxFQUFFOzt1QkFXWjtBQUVELCtDQUErQyxrQkFBa0I7SUFJL0RFO1FBQWdCQyxPQUFPQSxDQUFDQTtRQUh4QkEsZ0JBQWdCQTtRQUNoQkEsbUJBQWNBLEdBQUdBLElBQUlBLEdBQUdBLEVBQWdCQSxDQUFDQTtJQUVoQkEsQ0FBQ0E7SUFFMUJELGVBQWVBLENBQUNBLFNBQWVBLEVBQUVBLEdBQVdBLElBQUlFLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTFGRixNQUFNQSxDQUFDQSxTQUFlQTtRQUNwQkcsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO1FBQy9CQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtJQUNqQ0EsQ0FBQ0E7QUFDSEgsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge01hcCwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuXG4vKipcbiAqIFJlc29sdmUgYSBgVHlwZWAgZnJvbSBhIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0gaW50byBhIFVSTC5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBjYW4gYmUgb3ZlcnJpZGRlbiBieSB0aGUgYXBwbGljYXRpb24gZGV2ZWxvcGVyIHRvIGNyZWF0ZSBjdXN0b20gYmVoYXZpb3IuXG4gKlxuICogU2VlIHtAbGluayBDb21waWxlcn1cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbXBvbmVudFVybE1hcHBlciB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiYXNlIFVSTCB0byB0aGUgY29tcG9uZW50IHNvdXJjZSBmaWxlLlxuICAgKiBUaGUgcmV0dXJuZWQgVVJMIGNvdWxkIGJlOlxuICAgKiAtIGFuIGFic29sdXRlIFVSTCxcbiAgICogLSBhIHBhdGggcmVsYXRpdmUgdG8gdGhlIGFwcGxpY2F0aW9uXG4gICAqL1xuICBnZXRVcmwoY29tcG9uZW50OiBUeXBlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcmVmbGVjdG9yLmlzUmVmbGVjdGlvbkVuYWJsZWQoKSA/IHJlZmxlY3Rvci5pbXBvcnRVcmkoY29tcG9uZW50KSA6ICcuLyc7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVDb21wb25lbnRVcmxNYXBwZXIgZXh0ZW5kcyBDb21wb25lbnRVcmxNYXBwZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRVcmxzID0gbmV3IE1hcDxUeXBlLCBzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKCk7IH1cblxuICBzZXRDb21wb25lbnRVcmwoY29tcG9uZW50OiBUeXBlLCB1cmw6IHN0cmluZykgeyB0aGlzLl9jb21wb25lbnRVcmxzLnNldChjb21wb25lbnQsIHVybCk7IH1cblxuICBnZXRVcmwoY29tcG9uZW50OiBUeXBlKTogc3RyaW5nIHtcbiAgICB2YXIgdXJsID0gdGhpcy5fY29tcG9uZW50VXJscy5nZXQoY29tcG9uZW50KTtcbiAgICBpZiAoaXNQcmVzZW50KHVybCkpIHJldHVybiB1cmw7XG4gICAgcmV0dXJuIHN1cGVyLmdldFVybChjb21wb25lbnQpO1xuICB9XG59XG4iXX0=