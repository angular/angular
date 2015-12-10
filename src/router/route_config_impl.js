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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfY29uZmlnX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX2NvbmZpZ19pbXBsLnRzIl0sIm5hbWVzIjpbIlJvdXRlQ29uZmlnIiwiUm91dGVDb25maWcuY29uc3RydWN0b3IiLCJSb3V0ZSIsIlJvdXRlLmNvbnN0cnVjdG9yIiwiQXV4Um91dGUiLCJBdXhSb3V0ZS5jb25zdHJ1Y3RvciIsIkFzeW5jUm91dGUiLCJBc3luY1JvdXRlLmNvbnN0cnVjdG9yIiwiUmVkaXJlY3QiLCJSZWRpcmVjdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBQXFDLDBCQUEwQixDQUFDLENBQUE7QUFJaEU7Ozs7R0FJRztBQUNIO0lBRUVBLHFCQUFtQkEsT0FBMEJBO1FBQTFCQyxZQUFPQSxHQUFQQSxPQUFPQSxDQUFtQkE7SUFBR0EsQ0FBQ0E7SUFGbkREO1FBQUNBLFlBQUtBLEVBQUVBOztvQkFHUEE7SUFBREEsa0JBQUNBO0FBQURBLENBQUNBLEFBSEQsSUFHQztBQUZZLG1CQUFXLGNBRXZCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0g7SUFXRUUsZUFBWUEsRUFHWEE7WUFIWUMsSUFBSUEsWUFBRUEsU0FBU0EsaUJBQUVBLElBQUlBLFlBQUVBLElBQUlBLFlBQUVBLFlBQVlBO1FBSnREQSxpR0FBaUdBO1FBQ2pHQSxRQUFHQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUNuQkEsV0FBTUEsR0FBYUEsSUFBSUEsQ0FBQ0E7UUFDeEJBLGVBQVVBLEdBQVVBLElBQUlBLENBQUNBO1FBS3ZCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDM0JBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsWUFBWUEsQ0FBQ0E7SUFDbkNBLENBQUNBO0lBcEJIRDtRQUFDQSxZQUFLQSxFQUFFQTs7Y0FxQlBBO0lBQURBLFlBQUNBO0FBQURBLENBQUNBLEFBckJELElBcUJDO0FBcEJZLGFBQUssUUFvQmpCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNIO0lBV0VFLGtCQUFZQSxFQUF1RUE7WUFBdEVDLElBQUlBLFlBQUVBLFNBQVNBLGlCQUFFQSxJQUFJQTtRQVRsQ0EsU0FBSUEsR0FBeUJBLElBQUlBLENBQUNBO1FBSWxDQSxpR0FBaUdBO1FBQ2pHQSxRQUFHQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUNuQkEsV0FBTUEsR0FBYUEsSUFBSUEsQ0FBQ0E7UUFDeEJBLGVBQVVBLEdBQVVBLElBQUlBLENBQUNBO1FBQ3pCQSxpQkFBWUEsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFFNUJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUMzQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbkJBLENBQUNBO0lBZkhEO1FBQUNBLFlBQUtBLEVBQUVBOztpQkFnQlBBO0lBQURBLGVBQUNBO0FBQURBLENBQUNBLEFBaEJELElBZ0JDO0FBZlksZ0JBQVEsV0FlcEIsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ0g7SUFRRUUsb0JBQVlBLEVBR1hBO1lBSFlDLElBQUlBLFlBQUVBLE1BQU1BLGNBQUVBLElBQUlBLFlBQUVBLElBQUlBLFlBQUVBLFlBQVlBO1FBRG5EQSxRQUFHQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUtqQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakJBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3JCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakJBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLFlBQVlBLENBQUNBO0lBQ25DQSxDQUFDQTtJQWpCSEQ7UUFBQ0EsWUFBS0EsRUFBRUE7O21CQWtCUEE7SUFBREEsaUJBQUNBO0FBQURBLENBQUNBLEFBbEJELElBa0JDO0FBakJZLGtCQUFVLGFBaUJ0QixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0g7SUFVRUUsa0JBQVlBLEVBQXFEQTtZQUFwREMsSUFBSUEsWUFBRUEsVUFBVUE7UUFON0JBLFNBQUlBLEdBQVdBLElBQUlBLENBQUNBO1FBQ3BCQSxpR0FBaUdBO1FBQ2pHQSxXQUFNQSxHQUFhQSxJQUFJQSxDQUFDQTtRQUN4QkEsU0FBSUEsR0FBUUEsSUFBSUEsQ0FBQ0E7UUFDakJBLFFBQUdBLEdBQVdBLElBQUlBLENBQUNBO1FBQ25CQSxpQkFBWUEsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFFNUJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxVQUFVQSxDQUFDQTtJQUMvQkEsQ0FBQ0E7SUFiSEQ7UUFBQ0EsWUFBS0EsRUFBRUE7O2lCQWNQQTtJQUFEQSxlQUFDQTtBQUFEQSxDQUFDQSxBQWRELElBY0M7QUFiWSxnQkFBUSxXQWFwQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVCwgVHlwZSwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtSb3V0ZURlZmluaXRpb259IGZyb20gJy4vcm91dGVfZGVmaW5pdGlvbic7XG5leHBvcnQge1JvdXRlRGVmaW5pdGlvbn0gZnJvbSAnLi9yb3V0ZV9kZWZpbml0aW9uJztcblxuLyoqXG4gKiBUaGUgYFJvdXRlQ29uZmlnYCBkZWNvcmF0b3IgZGVmaW5lcyByb3V0ZXMgZm9yIGEgZ2l2ZW4gY29tcG9uZW50LlxuICpcbiAqIEl0IHRha2VzIGFuIGFycmF5IG9mIHtAbGluayBSb3V0ZURlZmluaXRpb259cy5cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBSb3V0ZUNvbmZpZyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb25maWdzOiBSb3V0ZURlZmluaXRpb25bXSkge31cbn1cblxuLyoqXG4gKiBgUm91dGVgIGlzIGEgdHlwZSBvZiB7QGxpbmsgUm91dGVEZWZpbml0aW9ufSB1c2VkIHRvIHJvdXRlIGEgcGF0aCB0byBhIGNvbXBvbmVudC5cbiAqXG4gKiBJdCBoYXMgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogLSBgcGF0aGAgaXMgYSBzdHJpbmcgdGhhdCB1c2VzIHRoZSByb3V0ZSBtYXRjaGVyIERTTC5cbiAqIC0gYGNvbXBvbmVudGAgYSBjb21wb25lbnQgdHlwZS5cbiAqIC0gYG5hbWVgIGlzIGFuIG9wdGlvbmFsIGBDYW1lbENhc2VgIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG5hbWUgb2YgdGhlIHJvdXRlLlxuICogLSBgZGF0YWAgaXMgYW4gb3B0aW9uYWwgcHJvcGVydHkgb2YgYW55IHR5cGUgcmVwcmVzZW50aW5nIGFyYml0cmFyeSByb3V0ZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuXG4gKiByb3V0ZS4gSXQgaXMgaW5qZWN0YWJsZSB2aWEge0BsaW5rIFJvdXRlRGF0YX0uXG4gKiAtIGB1c2VBc0RlZmF1bHRgIGlzIGEgYm9vbGVhbiB2YWx1ZS4gSWYgYHRydWVgLCB0aGUgY2hpbGQgcm91dGUgd2lsbCBiZSBuYXZpZ2F0ZWQgdG8gaWYgbm8gY2hpbGRcbiAqIHJvdXRlIGlzIHNwZWNpZmllZCBkdXJpbmcgdGhlIG5hdmlnYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHtSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAUm91dGVDb25maWcoW1xuICogICB7cGF0aDogJy9ob21lJywgY29tcG9uZW50OiBIb21lQ21wLCBuYW1lOiAnSG9tZUNtcCcgfVxuICogXSlcbiAqIGNsYXNzIE15QXBwIHt9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBSb3V0ZSBpbXBsZW1lbnRzIFJvdXRlRGVmaW5pdGlvbiB7XG4gIGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICBwYXRoOiBzdHJpbmc7XG4gIGNvbXBvbmVudDogVHlwZTtcbiAgbmFtZTogc3RyaW5nO1xuICB1c2VBc0RlZmF1bHQ6IGJvb2xlYW47XG4gIC8vIGFkZGVkIG5leHQgdGhyZWUgcHJvcGVydGllcyB0byB3b3JrIGFyb3VuZCBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQxMDdcbiAgYXV4OiBzdHJpbmcgPSBudWxsO1xuICBsb2FkZXI6IEZ1bmN0aW9uID0gbnVsbDtcbiAgcmVkaXJlY3RUbzogYW55W10gPSBudWxsO1xuICBjb25zdHJ1Y3Rvcih7cGF0aCwgY29tcG9uZW50LCBuYW1lLCBkYXRhLCB1c2VBc0RlZmF1bHR9OiB7XG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGNvbXBvbmVudDogVHlwZSwgbmFtZT86IHN0cmluZywgZGF0YT86IHtba2V5OiBzdHJpbmddOiBhbnl9LCB1c2VBc0RlZmF1bHQ/OiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMuY29tcG9uZW50ID0gY29tcG9uZW50O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLnVzZUFzRGVmYXVsdCA9IHVzZUFzRGVmYXVsdDtcbiAgfVxufVxuXG4vKipcbiAqIGBBdXhSb3V0ZWAgaXMgYSB0eXBlIG9mIHtAbGluayBSb3V0ZURlZmluaXRpb259IHVzZWQgdG8gZGVmaW5lIGFuIGF1eGlsaWFyeSByb3V0ZS5cbiAqXG4gKiBJdCB0YWtlcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAtIGBwYXRoYCBpcyBhIHN0cmluZyB0aGF0IHVzZXMgdGhlIHJvdXRlIG1hdGNoZXIgRFNMLlxuICogLSBgY29tcG9uZW50YCBhIGNvbXBvbmVudCB0eXBlLlxuICogLSBgbmFtZWAgaXMgYW4gb3B0aW9uYWwgYENhbWVsQ2FzZWAgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbmFtZSBvZiB0aGUgcm91dGUuXG4gKiAtIGBkYXRhYCBpcyBhbiBvcHRpb25hbCBwcm9wZXJ0eSBvZiBhbnkgdHlwZSByZXByZXNlbnRpbmcgYXJiaXRyYXJ5IHJvdXRlIG1ldGFkYXRhIGZvciB0aGUgZ2l2ZW5cbiAqIHJvdXRlLiBJdCBpcyBpbmplY3RhYmxlIHZpYSB7QGxpbmsgUm91dGVEYXRhfS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQge1JvdXRlQ29uZmlnLCBBdXhSb3V0ZX0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAUm91dGVDb25maWcoW1xuICogICBuZXcgQXV4Um91dGUoe3BhdGg6ICcvaG9tZScsIGNvbXBvbmVudDogSG9tZUNtcH0pXG4gKiBdKVxuICogY2xhc3MgTXlBcHAge31cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEF1eFJvdXRlIGltcGxlbWVudHMgUm91dGVEZWZpbml0aW9uIHtcbiAgZGF0YToge1trZXk6IHN0cmluZ106IGFueX0gPSBudWxsO1xuICBwYXRoOiBzdHJpbmc7XG4gIGNvbXBvbmVudDogVHlwZTtcbiAgbmFtZTogc3RyaW5nO1xuICAvLyBhZGRlZCBuZXh0IHRocmVlIHByb3BlcnRpZXMgdG8gd29yayBhcm91bmQgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MTA3XG4gIGF1eDogc3RyaW5nID0gbnVsbDtcbiAgbG9hZGVyOiBGdW5jdGlvbiA9IG51bGw7XG4gIHJlZGlyZWN0VG86IGFueVtdID0gbnVsbDtcbiAgdXNlQXNEZWZhdWx0OiBib29sZWFuID0gZmFsc2U7XG4gIGNvbnN0cnVjdG9yKHtwYXRoLCBjb21wb25lbnQsIG5hbWV9OiB7cGF0aDogc3RyaW5nLCBjb21wb25lbnQ6IFR5cGUsIG5hbWU/OiBzdHJpbmd9KSB7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICB0aGlzLmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG59XG5cbi8qKlxuICogYEFzeW5jUm91dGVgIGlzIGEgdHlwZSBvZiB7QGxpbmsgUm91dGVEZWZpbml0aW9ufSB1c2VkIHRvIHJvdXRlIGEgcGF0aCB0byBhbiBhc3luY2hyb25vdXNseVxuICogbG9hZGVkIGNvbXBvbmVudC5cbiAqXG4gKiBJdCBoYXMgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogLSBgcGF0aGAgaXMgYSBzdHJpbmcgdGhhdCB1c2VzIHRoZSByb3V0ZSBtYXRjaGVyIERTTC5cbiAqIC0gYGxvYWRlcmAgaXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBjb21wb25lbnQuXG4gKiAtIGBuYW1lYCBpcyBhbiBvcHRpb25hbCBgQ2FtZWxDYXNlYCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBuYW1lIG9mIHRoZSByb3V0ZS5cbiAqIC0gYGRhdGFgIGlzIGFuIG9wdGlvbmFsIHByb3BlcnR5IG9mIGFueSB0eXBlIHJlcHJlc2VudGluZyBhcmJpdHJhcnkgcm91dGUgbWV0YWRhdGEgZm9yIHRoZSBnaXZlblxuICogcm91dGUuIEl0IGlzIGluamVjdGFibGUgdmlhIHtAbGluayBSb3V0ZURhdGF9LlxuICogLSBgdXNlQXNEZWZhdWx0YCBpcyBhIGJvb2xlYW4gdmFsdWUuIElmIGB0cnVlYCwgdGhlIGNoaWxkIHJvdXRlIHdpbGwgYmUgbmF2aWdhdGVkIHRvIGlmIG5vIGNoaWxkXG4gKiByb3V0ZSBpcyBzcGVjaWZpZWQgZHVyaW5nIHRoZSBuYXZpZ2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7Um91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQFJvdXRlQ29uZmlnKFtcbiAqICAge3BhdGg6ICcvaG9tZScsIGxvYWRlcjogKCkgPT4gUHJvbWlzZS5yZXNvbHZlKE15TG9hZGVkQ21wKSwgbmFtZTogJ015TG9hZGVkQ21wJ31cbiAqIF0pXG4gKiBjbGFzcyBNeUFwcCB7fVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQXN5bmNSb3V0ZSBpbXBsZW1lbnRzIFJvdXRlRGVmaW5pdGlvbiB7XG4gIGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICBwYXRoOiBzdHJpbmc7XG4gIGxvYWRlcjogRnVuY3Rpb247XG4gIG5hbWU6IHN0cmluZztcbiAgdXNlQXNEZWZhdWx0OiBib29sZWFuO1xuICBhdXg6IHN0cmluZyA9IG51bGw7XG4gIGNvbnN0cnVjdG9yKHtwYXRoLCBsb2FkZXIsIG5hbWUsIGRhdGEsIHVzZUFzRGVmYXVsdH06IHtcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgbG9hZGVyOiBGdW5jdGlvbiwgbmFtZT86IHN0cmluZywgZGF0YT86IHtba2V5OiBzdHJpbmddOiBhbnl9LCB1c2VBc0RlZmF1bHQ/OiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMubG9hZGVyID0gbG9hZGVyO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLnVzZUFzRGVmYXVsdCA9IHVzZUFzRGVmYXVsdDtcbiAgfVxufVxuXG4vKipcbiAqIGBSZWRpcmVjdGAgaXMgYSB0eXBlIG9mIHtAbGluayBSb3V0ZURlZmluaXRpb259IHVzZWQgdG8gcm91dGUgYSBwYXRoIHRvIGEgY2Fub25pY2FsIHJvdXRlLlxuICpcbiAqIEl0IGhhcyB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAtIGBwYXRoYCBpcyBhIHN0cmluZyB0aGF0IHVzZXMgdGhlIHJvdXRlIG1hdGNoZXIgRFNMLlxuICogLSBgcmVkaXJlY3RUb2AgaXMgYW4gYXJyYXkgcmVwcmVzZW50aW5nIHRoZSBsaW5rIERTTC5cbiAqXG4gKiBOb3RlIHRoYXQgcmVkaXJlY3RzICoqZG8gbm90KiogYWZmZWN0IGhvdyBsaW5rcyBhcmUgZ2VuZXJhdGVkLiBGb3IgdGhhdCwgc2VlIHRoZSBgdXNlQXNEZWZhdWx0YFxuICogb3B0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7Um91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQFJvdXRlQ29uZmlnKFtcbiAqICAge3BhdGg6ICcvJywgcmVkaXJlY3RUbzogWycvSG9tZSddIH0sXG4gKiAgIHtwYXRoOiAnL2hvbWUnLCBjb21wb25lbnQ6IEhvbWVDbXAsIG5hbWU6ICdIb21lJ31cbiAqIF0pXG4gKiBjbGFzcyBNeUFwcCB7fVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgUmVkaXJlY3QgaW1wbGVtZW50cyBSb3V0ZURlZmluaXRpb24ge1xuICBwYXRoOiBzdHJpbmc7XG4gIHJlZGlyZWN0VG86IGFueVtdO1xuICBuYW1lOiBzdHJpbmcgPSBudWxsO1xuICAvLyBhZGRlZCBuZXh0IHRocmVlIHByb3BlcnRpZXMgdG8gd29yayBhcm91bmQgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MTA3XG4gIGxvYWRlcjogRnVuY3Rpb24gPSBudWxsO1xuICBkYXRhOiBhbnkgPSBudWxsO1xuICBhdXg6IHN0cmluZyA9IG51bGw7XG4gIHVzZUFzRGVmYXVsdDogYm9vbGVhbiA9IGZhbHNlO1xuICBjb25zdHJ1Y3Rvcih7cGF0aCwgcmVkaXJlY3RUb306IHtwYXRoOiBzdHJpbmcsIHJlZGlyZWN0VG86IGFueVtdfSkge1xuICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgdGhpcy5yZWRpcmVjdFRvID0gcmVkaXJlY3RUbztcbiAgfVxufVxuIl19