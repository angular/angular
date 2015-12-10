'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3VybF9tYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X3VybF9tYXBwZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50VXJsTWFwcGVyIiwiQ29tcG9uZW50VXJsTWFwcGVyLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50VXJsTWFwcGVyLmdldFVybCIsIlJ1bnRpbWVDb21wb25lbnRVcmxNYXBwZXIiLCJSdW50aW1lQ29tcG9uZW50VXJsTWFwcGVyLmNvbnN0cnVjdG9yIiwiUnVudGltZUNvbXBvbmVudFVybE1hcHBlci5zZXRDb21wb25lbnRVcmwiLCJSdW50aW1lQ29tcG9uZW50VXJsTWFwcGVyLmdldFVybCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBOEIsMEJBQTBCLENBQUMsQ0FBQTtBQUN6RCwyQkFBOEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRCwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUVsRTs7Ozs7O0dBTUc7QUFDSDtJQUFBQTtJQVdBQyxDQUFDQTtJQVRDRDs7Ozs7T0FLR0E7SUFDSEEsbUNBQU1BLEdBQU5BLFVBQU9BLFNBQWVBO1FBQ3BCRSxNQUFNQSxDQUFDQSxzQkFBU0EsQ0FBQ0EsbUJBQW1CQSxFQUFFQSxHQUFHQSxzQkFBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDakZBLENBQUNBO0lBVkhGO1FBQUNBLGVBQVVBLEVBQUVBOzsyQkFXWkE7SUFBREEseUJBQUNBO0FBQURBLENBQUNBLEFBWEQsSUFXQztBQVZZLDBCQUFrQixxQkFVOUIsQ0FBQTtBQUVEO0lBQStDRyw2Q0FBa0JBO0lBSS9EQTtRQUFnQkMsaUJBQU9BLENBQUNBO1FBSHhCQSxnQkFBZ0JBO1FBQ2hCQSxtQkFBY0EsR0FBR0EsSUFBSUEsZ0JBQUdBLEVBQWdCQSxDQUFDQTtJQUVoQkEsQ0FBQ0E7SUFFMUJELG1EQUFlQSxHQUFmQSxVQUFnQkEsU0FBZUEsRUFBRUEsR0FBV0EsSUFBSUUsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFMUZGLDBDQUFNQSxHQUFOQSxVQUFPQSxTQUFlQTtRQUNwQkcsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtRQUMvQkEsTUFBTUEsQ0FBQ0EsZ0JBQUtBLENBQUNBLE1BQU1BLFlBQUNBLFNBQVNBLENBQUNBLENBQUNBO0lBQ2pDQSxDQUFDQTtJQUNISCxnQ0FBQ0E7QUFBREEsQ0FBQ0EsQUFiRCxFQUErQyxrQkFBa0IsRUFhaEU7QUFiWSxpQ0FBeUIsNEJBYXJDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZSwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtNYXAsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcblxuLyoqXG4gKiBSZXNvbHZlIGEgYFR5cGVgIGZyb20gYSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9IGludG8gYSBVUkwuXG4gKlxuICogVGhpcyBpbnRlcmZhY2UgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGFwcGxpY2F0aW9uIGRldmVsb3BlciB0byBjcmVhdGUgY3VzdG9tIGJlaGF2aW9yLlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcGlsZXJ9XG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb21wb25lbnRVcmxNYXBwZXIge1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYmFzZSBVUkwgdG8gdGhlIGNvbXBvbmVudCBzb3VyY2UgZmlsZS5cbiAgICogVGhlIHJldHVybmVkIFVSTCBjb3VsZCBiZTpcbiAgICogLSBhbiBhYnNvbHV0ZSBVUkwsXG4gICAqIC0gYSBwYXRoIHJlbGF0aXZlIHRvIHRoZSBhcHBsaWNhdGlvblxuICAgKi9cbiAgZ2V0VXJsKGNvbXBvbmVudDogVHlwZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHJlZmxlY3Rvci5pc1JlZmxlY3Rpb25FbmFibGVkKCkgPyByZWZsZWN0b3IuaW1wb3J0VXJpKGNvbXBvbmVudCkgOiAnLi8nO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSdW50aW1lQ29tcG9uZW50VXJsTWFwcGVyIGV4dGVuZHMgQ29tcG9uZW50VXJsTWFwcGVyIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tcG9uZW50VXJscyA9IG5ldyBNYXA8VHlwZSwgc3RyaW5nPigpO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcigpOyB9XG5cbiAgc2V0Q29tcG9uZW50VXJsKGNvbXBvbmVudDogVHlwZSwgdXJsOiBzdHJpbmcpIHsgdGhpcy5fY29tcG9uZW50VXJscy5zZXQoY29tcG9uZW50LCB1cmwpOyB9XG5cbiAgZ2V0VXJsKGNvbXBvbmVudDogVHlwZSk6IHN0cmluZyB7XG4gICAgdmFyIHVybCA9IHRoaXMuX2NvbXBvbmVudFVybHMuZ2V0KGNvbXBvbmVudCk7XG4gICAgaWYgKGlzUHJlc2VudCh1cmwpKSByZXR1cm4gdXJsO1xuICAgIHJldHVybiBzdXBlci5nZXRVcmwoY29tcG9uZW50KTtcbiAgfVxufVxuIl19