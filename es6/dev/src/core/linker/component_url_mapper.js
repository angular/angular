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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3VybF9tYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X3VybF9tYXBwZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50VXJsTWFwcGVyIiwiQ29tcG9uZW50VXJsTWFwcGVyLmdldFVybCIsIlJ1bnRpbWVDb21wb25lbnRVcmxNYXBwZXIiLCJSdW50aW1lQ29tcG9uZW50VXJsTWFwcGVyLmNvbnN0cnVjdG9yIiwiUnVudGltZUNvbXBvbmVudFVybE1hcHBlci5zZXRDb21wb25lbnRVcmwiLCJSdW50aW1lQ29tcG9uZW50VXJsTWFwcGVyLmdldFVybCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFPLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUNqRCxFQUFDLEdBQUcsRUFBYSxNQUFNLGdDQUFnQztPQUN2RCxFQUFDLFNBQVMsRUFBQyxNQUFNLHlDQUF5QztBQUVqRTs7Ozs7O0dBTUc7QUFDSDtJQUVFQTs7Ozs7T0FLR0E7SUFDSEEsTUFBTUEsQ0FBQ0EsU0FBZUE7UUFDcEJDLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLG1CQUFtQkEsRUFBRUEsR0FBR0EsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDakZBLENBQUNBO0FBQ0hELENBQUNBO0FBWEQ7SUFBQyxVQUFVLEVBQUU7O3VCQVdaO0FBRUQsK0NBQStDLGtCQUFrQjtJQUkvREU7UUFBZ0JDLE9BQU9BLENBQUNBO1FBSHhCQSxnQkFBZ0JBO1FBQ2hCQSxtQkFBY0EsR0FBR0EsSUFBSUEsR0FBR0EsRUFBZ0JBLENBQUNBO0lBRWhCQSxDQUFDQTtJQUUxQkQsZUFBZUEsQ0FBQ0EsU0FBZUEsRUFBRUEsR0FBV0EsSUFBSUUsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFMUZGLE1BQU1BLENBQUNBLFNBQWVBO1FBQ3BCRyxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUM3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7UUFDL0JBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO0lBQ2pDQSxDQUFDQTtBQUNISCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGUsIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TWFwLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5cbi8qKlxuICogUmVzb2x2ZSBhIGBUeXBlYCBmcm9tIGEge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfSBpbnRvIGEgVVJMLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHRoZSBhcHBsaWNhdGlvbiBkZXZlbG9wZXIgdG8gY3JlYXRlIGN1c3RvbSBiZWhhdmlvci5cbiAqXG4gKiBTZWUge0BsaW5rIENvbXBpbGVyfVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50VXJsTWFwcGVyIHtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJhc2UgVVJMIHRvIHRoZSBjb21wb25lbnQgc291cmNlIGZpbGUuXG4gICAqIFRoZSByZXR1cm5lZCBVUkwgY291bGQgYmU6XG4gICAqIC0gYW4gYWJzb2x1dGUgVVJMLFxuICAgKiAtIGEgcGF0aCByZWxhdGl2ZSB0byB0aGUgYXBwbGljYXRpb25cbiAgICovXG4gIGdldFVybChjb21wb25lbnQ6IFR5cGUpOiBzdHJpbmcge1xuICAgIHJldHVybiByZWZsZWN0b3IuaXNSZWZsZWN0aW9uRW5hYmxlZCgpID8gcmVmbGVjdG9yLmltcG9ydFVyaShjb21wb25lbnQpIDogJy4vJztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUnVudGltZUNvbXBvbmVudFVybE1hcHBlciBleHRlbmRzIENvbXBvbmVudFVybE1hcHBlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbXBvbmVudFVybHMgPSBuZXcgTWFwPFR5cGUsIHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoKTsgfVxuXG4gIHNldENvbXBvbmVudFVybChjb21wb25lbnQ6IFR5cGUsIHVybDogc3RyaW5nKSB7IHRoaXMuX2NvbXBvbmVudFVybHMuc2V0KGNvbXBvbmVudCwgdXJsKTsgfVxuXG4gIGdldFVybChjb21wb25lbnQ6IFR5cGUpOiBzdHJpbmcge1xuICAgIHZhciB1cmwgPSB0aGlzLl9jb21wb25lbnRVcmxzLmdldChjb21wb25lbnQpO1xuICAgIGlmIChpc1ByZXNlbnQodXJsKSkgcmV0dXJuIHVybDtcbiAgICByZXR1cm4gc3VwZXIuZ2V0VXJsKGNvbXBvbmVudCk7XG4gIH1cbn1cbiJdfQ==