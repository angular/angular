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
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 */
var RouteConfig = (function () {
    function RouteConfig(configs) {
        this.configs = configs;
    }
    RouteConfig = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Array])
    ], RouteConfig);
    return RouteConfig;
})();
exports.RouteConfig = RouteConfig;
/**
 * `Route` is a type of {@link RouteDefinition} used to route a path to a component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `component` a component type.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via {@link RouteData}.
 * - `useAsDefault` is a boolean value. If `true`, the child route will be navigated to if no child
 * route is specified during the navigation.
 *
 * ### Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/home', component: HomeCmp, name: 'HomeCmp' }
 * ])
 * class MyApp {}
 * ```
 */
var Route = (function () {
    function Route(_a) {
        var path = _a.path, component = _a.component, name = _a.name, data = _a.data, useAsDefault = _a.useAsDefault;
        // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
        this.aux = null;
        this.loader = null;
        this.redirectTo = null;
        this.path = path;
        this.component = component;
        this.name = name;
        this.data = data;
        this.useAsDefault = useAsDefault;
    }
    Route = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], Route);
    return Route;
})();
exports.Route = Route;
/**
 * `AuxRoute` is a type of {@link RouteDefinition} used to define an auxiliary route.
 *
 * It takes an object with the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `component` a component type.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via {@link RouteData}.
 *
 * ### Example
 * ```
 * import {RouteConfig, AuxRoute} from 'angular2/router';
 *
 * @RouteConfig([
 *   new AuxRoute({path: '/home', component: HomeCmp})
 * ])
 * class MyApp {}
 * ```
 */
var AuxRoute = (function () {
    function AuxRoute(_a) {
        var path = _a.path, component = _a.component, name = _a.name;
        this.data = null;
        // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
        this.aux = null;
        this.loader = null;
        this.redirectTo = null;
        this.useAsDefault = false;
        this.path = path;
        this.component = component;
        this.name = name;
    }
    AuxRoute = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], AuxRoute);
    return AuxRoute;
})();
exports.AuxRoute = AuxRoute;
/**
 * `AsyncRoute` is a type of {@link RouteDefinition} used to route a path to an asynchronously
 * loaded component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `loader` is a function that returns a promise that resolves to a component.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via {@link RouteData}.
 * - `useAsDefault` is a boolean value. If `true`, the child route will be navigated to if no child
 * route is specified during the navigation.
 *
 * ### Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/home', loader: () => Promise.resolve(MyLoadedCmp), name: 'MyLoadedCmp'}
 * ])
 * class MyApp {}
 * ```
 */
var AsyncRoute = (function () {
    function AsyncRoute(_a) {
        var path = _a.path, loader = _a.loader, name = _a.name, data = _a.data, useAsDefault = _a.useAsDefault;
        this.aux = null;
        this.path = path;
        this.loader = loader;
        this.name = name;
        this.data = data;
        this.useAsDefault = useAsDefault;
    }
    AsyncRoute = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], AsyncRoute);
    return AsyncRoute;
})();
exports.AsyncRoute = AsyncRoute;
/**
 * `Redirect` is a type of {@link RouteDefinition} used to route a path to a canonical route.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `redirectTo` is an array representing the link DSL.
 *
 * Note that redirects **do not** affect how links are generated. For that, see the `useAsDefault`
 * option.
 *
 * ### Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/', redirectTo: ['/Home'] },
 *   {path: '/home', component: HomeCmp, name: 'Home'}
 * ])
 * class MyApp {}
 * ```
 */
var Redirect = (function () {
    function Redirect(_a) {
        var path = _a.path, redirectTo = _a.redirectTo;
        this.name = null;
        // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
        this.loader = null;
        this.data = null;
        this.aux = null;
        this.useAsDefault = false;
        this.path = path;
        this.redirectTo = redirectTo;
    }
    Redirect = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], Redirect);
    return Redirect;
})();
exports.Redirect = Redirect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfY29uZmlnX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX2NvbmZpZ19pbXBsLnRzIl0sIm5hbWVzIjpbIlJvdXRlQ29uZmlnIiwiUm91dGVDb25maWcuY29uc3RydWN0b3IiLCJSb3V0ZSIsIlJvdXRlLmNvbnN0cnVjdG9yIiwiQXV4Um91dGUiLCJBdXhSb3V0ZS5jb25zdHJ1Y3RvciIsIkFzeW5jUm91dGUiLCJBc3luY1JvdXRlLmNvbnN0cnVjdG9yIiwiUmVkaXJlY3QiLCJSZWRpcmVjdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQkFBcUMsMEJBQTBCLENBQUMsQ0FBQTtBQUloRTs7OztHQUlHO0FBQ0g7SUFFRUEscUJBQW1CQSxPQUEwQkE7UUFBMUJDLFlBQU9BLEdBQVBBLE9BQU9BLENBQW1CQTtJQUFHQSxDQUFDQTtJQUZuREQ7UUFBQ0EsWUFBS0EsRUFBRUE7O29CQUdQQTtJQUFEQSxrQkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlksbUJBQVcsY0FFdkIsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFDSDtJQVdFRSxlQUFZQSxFQUdYQTtZQUhZQyxJQUFJQSxZQUFFQSxTQUFTQSxpQkFBRUEsSUFBSUEsWUFBRUEsSUFBSUEsWUFBRUEsWUFBWUE7UUFKdERBLGlHQUFpR0E7UUFDakdBLFFBQUdBLEdBQVdBLElBQUlBLENBQUNBO1FBQ25CQSxXQUFNQSxHQUFhQSxJQUFJQSxDQUFDQTtRQUN4QkEsZUFBVUEsR0FBVUEsSUFBSUEsQ0FBQ0E7UUFLdkJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUMzQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxZQUFZQSxDQUFDQTtJQUNuQ0EsQ0FBQ0E7SUFwQkhEO1FBQUNBLFlBQUtBLEVBQUVBOztjQXFCUEE7SUFBREEsWUFBQ0E7QUFBREEsQ0FBQ0EsQUFyQkQsSUFxQkM7QUFwQlksYUFBSyxRQW9CakIsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0g7SUFXRUUsa0JBQVlBLEVBQXVFQTtZQUF0RUMsSUFBSUEsWUFBRUEsU0FBU0EsaUJBQUVBLElBQUlBO1FBVGxDQSxTQUFJQSxHQUF5QkEsSUFBSUEsQ0FBQ0E7UUFJbENBLGlHQUFpR0E7UUFDakdBLFFBQUdBLEdBQVdBLElBQUlBLENBQUNBO1FBQ25CQSxXQUFNQSxHQUFhQSxJQUFJQSxDQUFDQTtRQUN4QkEsZUFBVUEsR0FBVUEsSUFBSUEsQ0FBQ0E7UUFDekJBLGlCQUFZQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUU1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakJBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBO1FBQzNCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7SUFmSEQ7UUFBQ0EsWUFBS0EsRUFBRUE7O2lCQWdCUEE7SUFBREEsZUFBQ0E7QUFBREEsQ0FBQ0EsQUFoQkQsSUFnQkM7QUFmWSxnQkFBUSxXQWVwQixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSDtJQVFFRSxvQkFBWUEsRUFHWEE7WUFIWUMsSUFBSUEsWUFBRUEsTUFBTUEsY0FBRUEsSUFBSUEsWUFBRUEsSUFBSUEsWUFBRUEsWUFBWUE7UUFEbkRBLFFBQUdBLEdBQVdBLElBQUlBLENBQUNBO1FBS2pCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsWUFBWUEsQ0FBQ0E7SUFDbkNBLENBQUNBO0lBakJIRDtRQUFDQSxZQUFLQSxFQUFFQTs7bUJBa0JQQTtJQUFEQSxpQkFBQ0E7QUFBREEsQ0FBQ0EsQUFsQkQsSUFrQkM7QUFqQlksa0JBQVUsYUFpQnRCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFDSDtJQVVFRSxrQkFBWUEsRUFBcURBO1lBQXBEQyxJQUFJQSxZQUFFQSxVQUFVQTtRQU43QkEsU0FBSUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDcEJBLGlHQUFpR0E7UUFDakdBLFdBQU1BLEdBQWFBLElBQUlBLENBQUNBO1FBQ3hCQSxTQUFJQSxHQUFRQSxJQUFJQSxDQUFDQTtRQUNqQkEsUUFBR0EsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLGlCQUFZQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUU1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakJBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBO0lBQy9CQSxDQUFDQTtJQWJIRDtRQUFDQSxZQUFLQSxFQUFFQTs7aUJBY1BBO0lBQURBLGVBQUNBO0FBQURBLENBQUNBLEFBZEQsSUFjQztBQWJZLGdCQUFRLFdBYXBCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNULCBUeXBlLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1JvdXRlRGVmaW5pdGlvbn0gZnJvbSAnLi9yb3V0ZV9kZWZpbml0aW9uJztcbmV4cG9ydCB7Um91dGVEZWZpbml0aW9ufSBmcm9tICcuL3JvdXRlX2RlZmluaXRpb24nO1xuXG4vKipcbiAqIFRoZSBgUm91dGVDb25maWdgIGRlY29yYXRvciBkZWZpbmVzIHJvdXRlcyBmb3IgYSBnaXZlbiBjb21wb25lbnQuXG4gKlxuICogSXQgdGFrZXMgYW4gYXJyYXkgb2Yge0BsaW5rIFJvdXRlRGVmaW5pdGlvbn1zLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFJvdXRlQ29uZmlnIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbmZpZ3M6IFJvdXRlRGVmaW5pdGlvbltdKSB7fVxufVxuXG4vKipcbiAqIGBSb3V0ZWAgaXMgYSB0eXBlIG9mIHtAbGluayBSb3V0ZURlZmluaXRpb259IHVzZWQgdG8gcm91dGUgYSBwYXRoIHRvIGEgY29tcG9uZW50LlxuICpcbiAqIEl0IGhhcyB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAtIGBwYXRoYCBpcyBhIHN0cmluZyB0aGF0IHVzZXMgdGhlIHJvdXRlIG1hdGNoZXIgRFNMLlxuICogLSBgY29tcG9uZW50YCBhIGNvbXBvbmVudCB0eXBlLlxuICogLSBgbmFtZWAgaXMgYW4gb3B0aW9uYWwgYENhbWVsQ2FzZWAgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbmFtZSBvZiB0aGUgcm91dGUuXG4gKiAtIGBkYXRhYCBpcyBhbiBvcHRpb25hbCBwcm9wZXJ0eSBvZiBhbnkgdHlwZSByZXByZXNlbnRpbmcgYXJiaXRyYXJ5IHJvdXRlIG1ldGFkYXRhIGZvciB0aGUgZ2l2ZW5cbiAqIHJvdXRlLiBJdCBpcyBpbmplY3RhYmxlIHZpYSB7QGxpbmsgUm91dGVEYXRhfS5cbiAqIC0gYHVzZUFzRGVmYXVsdGAgaXMgYSBib29sZWFuIHZhbHVlLiBJZiBgdHJ1ZWAsIHRoZSBjaGlsZCByb3V0ZSB3aWxsIGJlIG5hdmlnYXRlZCB0byBpZiBubyBjaGlsZFxuICogcm91dGUgaXMgc3BlY2lmaWVkIGR1cmluZyB0aGUgbmF2aWdhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQge1JvdXRlQ29uZmlnfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgIHtwYXRoOiAnL2hvbWUnLCBjb21wb25lbnQ6IEhvbWVDbXAsIG5hbWU6ICdIb21lQ21wJyB9XG4gKiBdKVxuICogY2xhc3MgTXlBcHAge31cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFJvdXRlIGltcGxlbWVudHMgUm91dGVEZWZpbml0aW9uIHtcbiAgZGF0YToge1trZXk6IHN0cmluZ106IGFueX07XG4gIHBhdGg6IHN0cmluZztcbiAgY29tcG9uZW50OiBUeXBlO1xuICBuYW1lOiBzdHJpbmc7XG4gIHVzZUFzRGVmYXVsdDogYm9vbGVhbjtcbiAgLy8gYWRkZWQgbmV4dCB0aHJlZSBwcm9wZXJ0aWVzIHRvIHdvcmsgYXJvdW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDEwN1xuICBhdXg6IHN0cmluZyA9IG51bGw7XG4gIGxvYWRlcjogRnVuY3Rpb24gPSBudWxsO1xuICByZWRpcmVjdFRvOiBhbnlbXSA9IG51bGw7XG4gIGNvbnN0cnVjdG9yKHtwYXRoLCBjb21wb25lbnQsIG5hbWUsIGRhdGEsIHVzZUFzRGVmYXVsdH06IHtcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY29tcG9uZW50OiBUeXBlLCBuYW1lPzogc3RyaW5nLCBkYXRhPzoge1trZXk6IHN0cmluZ106IGFueX0sIHVzZUFzRGVmYXVsdD86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMudXNlQXNEZWZhdWx0ID0gdXNlQXNEZWZhdWx0O1xuICB9XG59XG5cbi8qKlxuICogYEF1eFJvdXRlYCBpcyBhIHR5cGUgb2Yge0BsaW5rIFJvdXRlRGVmaW5pdGlvbn0gdXNlZCB0byBkZWZpbmUgYW4gYXV4aWxpYXJ5IHJvdXRlLlxuICpcbiAqIEl0IHRha2VzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqIC0gYHBhdGhgIGlzIGEgc3RyaW5nIHRoYXQgdXNlcyB0aGUgcm91dGUgbWF0Y2hlciBEU0wuXG4gKiAtIGBjb21wb25lbnRgIGEgY29tcG9uZW50IHR5cGUuXG4gKiAtIGBuYW1lYCBpcyBhbiBvcHRpb25hbCBgQ2FtZWxDYXNlYCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBuYW1lIG9mIHRoZSByb3V0ZS5cbiAqIC0gYGRhdGFgIGlzIGFuIG9wdGlvbmFsIHByb3BlcnR5IG9mIGFueSB0eXBlIHJlcHJlc2VudGluZyBhcmJpdHJhcnkgcm91dGUgbWV0YWRhdGEgZm9yIHRoZSBnaXZlblxuICogcm91dGUuIEl0IGlzIGluamVjdGFibGUgdmlhIHtAbGluayBSb3V0ZURhdGF9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7Um91dGVDb25maWcsIEF1eFJvdXRlfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgIG5ldyBBdXhSb3V0ZSh7cGF0aDogJy9ob21lJywgY29tcG9uZW50OiBIb21lQ21wfSlcbiAqIF0pXG4gKiBjbGFzcyBNeUFwcCB7fVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQXV4Um91dGUgaW1wbGVtZW50cyBSb3V0ZURlZmluaXRpb24ge1xuICBkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fSA9IG51bGw7XG4gIHBhdGg6IHN0cmluZztcbiAgY29tcG9uZW50OiBUeXBlO1xuICBuYW1lOiBzdHJpbmc7XG4gIC8vIGFkZGVkIG5leHQgdGhyZWUgcHJvcGVydGllcyB0byB3b3JrIGFyb3VuZCBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQxMDdcbiAgYXV4OiBzdHJpbmcgPSBudWxsO1xuICBsb2FkZXI6IEZ1bmN0aW9uID0gbnVsbDtcbiAgcmVkaXJlY3RUbzogYW55W10gPSBudWxsO1xuICB1c2VBc0RlZmF1bHQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgY29uc3RydWN0b3Ioe3BhdGgsIGNvbXBvbmVudCwgbmFtZX06IHtwYXRoOiBzdHJpbmcsIGNvbXBvbmVudDogVHlwZSwgbmFtZT86IHN0cmluZ30pIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMuY29tcG9uZW50ID0gY29tcG9uZW50O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cbn1cblxuLyoqXG4gKiBgQXN5bmNSb3V0ZWAgaXMgYSB0eXBlIG9mIHtAbGluayBSb3V0ZURlZmluaXRpb259IHVzZWQgdG8gcm91dGUgYSBwYXRoIHRvIGFuIGFzeW5jaHJvbm91c2x5XG4gKiBsb2FkZWQgY29tcG9uZW50LlxuICpcbiAqIEl0IGhhcyB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAtIGBwYXRoYCBpcyBhIHN0cmluZyB0aGF0IHVzZXMgdGhlIHJvdXRlIG1hdGNoZXIgRFNMLlxuICogLSBgbG9hZGVyYCBpcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIGNvbXBvbmVudC5cbiAqIC0gYG5hbWVgIGlzIGFuIG9wdGlvbmFsIGBDYW1lbENhc2VgIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG5hbWUgb2YgdGhlIHJvdXRlLlxuICogLSBgZGF0YWAgaXMgYW4gb3B0aW9uYWwgcHJvcGVydHkgb2YgYW55IHR5cGUgcmVwcmVzZW50aW5nIGFyYml0cmFyeSByb3V0ZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuXG4gKiByb3V0ZS4gSXQgaXMgaW5qZWN0YWJsZSB2aWEge0BsaW5rIFJvdXRlRGF0YX0uXG4gKiAtIGB1c2VBc0RlZmF1bHRgIGlzIGEgYm9vbGVhbiB2YWx1ZS4gSWYgYHRydWVgLCB0aGUgY2hpbGQgcm91dGUgd2lsbCBiZSBuYXZpZ2F0ZWQgdG8gaWYgbm8gY2hpbGRcbiAqIHJvdXRlIGlzIHNwZWNpZmllZCBkdXJpbmcgdGhlIG5hdmlnYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHtSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAUm91dGVDb25maWcoW1xuICogICB7cGF0aDogJy9ob21lJywgbG9hZGVyOiAoKSA9PiBQcm9taXNlLnJlc29sdmUoTXlMb2FkZWRDbXApLCBuYW1lOiAnTXlMb2FkZWRDbXAnfVxuICogXSlcbiAqIGNsYXNzIE15QXBwIHt9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBBc3luY1JvdXRlIGltcGxlbWVudHMgUm91dGVEZWZpbml0aW9uIHtcbiAgZGF0YToge1trZXk6IHN0cmluZ106IGFueX07XG4gIHBhdGg6IHN0cmluZztcbiAgbG9hZGVyOiBGdW5jdGlvbjtcbiAgbmFtZTogc3RyaW5nO1xuICB1c2VBc0RlZmF1bHQ6IGJvb2xlYW47XG4gIGF1eDogc3RyaW5nID0gbnVsbDtcbiAgY29uc3RydWN0b3Ioe3BhdGgsIGxvYWRlciwgbmFtZSwgZGF0YSwgdXNlQXNEZWZhdWx0fToge1xuICAgIHBhdGg6IHN0cmluZyxcbiAgICBsb2FkZXI6IEZ1bmN0aW9uLCBuYW1lPzogc3RyaW5nLCBkYXRhPzoge1trZXk6IHN0cmluZ106IGFueX0sIHVzZUFzRGVmYXVsdD86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgdGhpcy5sb2FkZXIgPSBsb2FkZXI7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMudXNlQXNEZWZhdWx0ID0gdXNlQXNEZWZhdWx0O1xuICB9XG59XG5cbi8qKlxuICogYFJlZGlyZWN0YCBpcyBhIHR5cGUgb2Yge0BsaW5rIFJvdXRlRGVmaW5pdGlvbn0gdXNlZCB0byByb3V0ZSBhIHBhdGggdG8gYSBjYW5vbmljYWwgcm91dGUuXG4gKlxuICogSXQgaGFzIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqIC0gYHBhdGhgIGlzIGEgc3RyaW5nIHRoYXQgdXNlcyB0aGUgcm91dGUgbWF0Y2hlciBEU0wuXG4gKiAtIGByZWRpcmVjdFRvYCBpcyBhbiBhcnJheSByZXByZXNlbnRpbmcgdGhlIGxpbmsgRFNMLlxuICpcbiAqIE5vdGUgdGhhdCByZWRpcmVjdHMgKipkbyBub3QqKiBhZmZlY3QgaG93IGxpbmtzIGFyZSBnZW5lcmF0ZWQuIEZvciB0aGF0LCBzZWUgdGhlIGB1c2VBc0RlZmF1bHRgXG4gKiBvcHRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHtSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAUm91dGVDb25maWcoW1xuICogICB7cGF0aDogJy8nLCByZWRpcmVjdFRvOiBbJy9Ib21lJ10gfSxcbiAqICAge3BhdGg6ICcvaG9tZScsIGNvbXBvbmVudDogSG9tZUNtcCwgbmFtZTogJ0hvbWUnfVxuICogXSlcbiAqIGNsYXNzIE15QXBwIHt9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBSZWRpcmVjdCBpbXBsZW1lbnRzIFJvdXRlRGVmaW5pdGlvbiB7XG4gIHBhdGg6IHN0cmluZztcbiAgcmVkaXJlY3RUbzogYW55W107XG4gIG5hbWU6IHN0cmluZyA9IG51bGw7XG4gIC8vIGFkZGVkIG5leHQgdGhyZWUgcHJvcGVydGllcyB0byB3b3JrIGFyb3VuZCBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQxMDdcbiAgbG9hZGVyOiBGdW5jdGlvbiA9IG51bGw7XG4gIGRhdGE6IGFueSA9IG51bGw7XG4gIGF1eDogc3RyaW5nID0gbnVsbDtcbiAgdXNlQXNEZWZhdWx0OiBib29sZWFuID0gZmFsc2U7XG4gIGNvbnN0cnVjdG9yKHtwYXRoLCByZWRpcmVjdFRvfToge3BhdGg6IHN0cmluZywgcmVkaXJlY3RUbzogYW55W119KSB7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICB0aGlzLnJlZGlyZWN0VG8gPSByZWRpcmVjdFRvO1xuICB9XG59XG4iXX0=