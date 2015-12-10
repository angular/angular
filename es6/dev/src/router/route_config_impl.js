var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST } from 'angular2/src/facade/lang';
/**
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 */
export let RouteConfig = class {
    constructor(configs) {
        this.configs = configs;
    }
};
RouteConfig = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Array])
], RouteConfig);
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
export let Route = class {
    constructor({ path, component, name, data, useAsDefault }) {
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
};
Route = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], Route);
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
export let AuxRoute = class {
    constructor({ path, component, name }) {
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
};
AuxRoute = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], AuxRoute);
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
export let AsyncRoute = class {
    constructor({ path, loader, name, data, useAsDefault }) {
        this.aux = null;
        this.path = path;
        this.loader = loader;
        this.name = name;
        this.data = data;
        this.useAsDefault = useAsDefault;
    }
};
AsyncRoute = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], AsyncRoute);
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
export let Redirect = class {
    constructor({ path, redirectTo }) {
        this.name = null;
        // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
        this.loader = null;
        this.data = null;
        this.aux = null;
        this.useAsDefault = false;
        this.path = path;
        this.redirectTo = redirectTo;
    }
};
Redirect = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], Redirect);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfY29uZmlnX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX2NvbmZpZ19pbXBsLnRzIl0sIm5hbWVzIjpbIlJvdXRlQ29uZmlnIiwiUm91dGVDb25maWcuY29uc3RydWN0b3IiLCJSb3V0ZSIsIlJvdXRlLmNvbnN0cnVjdG9yIiwiQXV4Um91dGUiLCJBdXhSb3V0ZS5jb25zdHJ1Y3RvciIsIkFzeW5jUm91dGUiLCJBc3luY1JvdXRlLmNvbnN0cnVjdG9yIiwiUmVkaXJlY3QiLCJSZWRpcmVjdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxLQUFLLEVBQWtCLE1BQU0sMEJBQTBCO0FBSS9EOzs7O0dBSUc7QUFDSDtJQUVFQSxZQUFtQkEsT0FBMEJBO1FBQTFCQyxZQUFPQSxHQUFQQSxPQUFPQSxDQUFtQkE7SUFBR0EsQ0FBQ0E7QUFDbkRELENBQUNBO0FBSEQ7SUFBQyxLQUFLLEVBQUU7O2dCQUdQO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNIO0lBV0VFLFlBQVlBLEVBQUNBLElBQUlBLEVBQUVBLFNBQVNBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLFlBQVlBLEVBR3JEQTtRQVBEQyxpR0FBaUdBO1FBQ2pHQSxRQUFHQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUNuQkEsV0FBTUEsR0FBYUEsSUFBSUEsQ0FBQ0E7UUFDeEJBLGVBQVVBLEdBQVVBLElBQUlBLENBQUNBO1FBS3ZCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDM0JBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsWUFBWUEsQ0FBQ0E7SUFDbkNBLENBQUNBO0FBQ0hELENBQUNBO0FBckJEO0lBQUMsS0FBSyxFQUFFOztVQXFCUDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0g7SUFXRUUsWUFBWUEsRUFBQ0EsSUFBSUEsRUFBRUEsU0FBU0EsRUFBRUEsSUFBSUEsRUFBaURBO1FBVG5GQyxTQUFJQSxHQUF5QkEsSUFBSUEsQ0FBQ0E7UUFJbENBLGlHQUFpR0E7UUFDakdBLFFBQUdBLEdBQVdBLElBQUlBLENBQUNBO1FBQ25CQSxXQUFNQSxHQUFhQSxJQUFJQSxDQUFDQTtRQUN4QkEsZUFBVUEsR0FBVUEsSUFBSUEsQ0FBQ0E7UUFDekJBLGlCQUFZQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUU1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakJBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBO1FBQzNCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFoQkQ7SUFBQyxLQUFLLEVBQUU7O2FBZ0JQO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSDtJQVFFRSxZQUFZQSxFQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxZQUFZQSxFQUdsREE7UUFKREMsUUFBR0EsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFLakJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUNyQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxZQUFZQSxDQUFDQTtJQUNuQ0EsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFsQkQ7SUFBQyxLQUFLLEVBQUU7O2VBa0JQO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0JHO0FBQ0g7SUFVRUUsWUFBWUEsRUFBQ0EsSUFBSUEsRUFBRUEsVUFBVUEsRUFBb0NBO1FBTmpFQyxTQUFJQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUNwQkEsaUdBQWlHQTtRQUNqR0EsV0FBTUEsR0FBYUEsSUFBSUEsQ0FBQ0E7UUFDeEJBLFNBQUlBLEdBQVFBLElBQUlBLENBQUNBO1FBQ2pCQSxRQUFHQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUNuQkEsaUJBQVlBLEdBQVlBLEtBQUtBLENBQUNBO1FBRTVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsVUFBVUEsQ0FBQ0E7SUFDL0JBLENBQUNBO0FBQ0hELENBQUNBO0FBZEQ7SUFBQyxLQUFLLEVBQUU7O2FBY1A7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1QsIFR5cGUsIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7Um91dGVEZWZpbml0aW9ufSBmcm9tICcuL3JvdXRlX2RlZmluaXRpb24nO1xuZXhwb3J0IHtSb3V0ZURlZmluaXRpb259IGZyb20gJy4vcm91dGVfZGVmaW5pdGlvbic7XG5cbi8qKlxuICogVGhlIGBSb3V0ZUNvbmZpZ2AgZGVjb3JhdG9yIGRlZmluZXMgcm91dGVzIGZvciBhIGdpdmVuIGNvbXBvbmVudC5cbiAqXG4gKiBJdCB0YWtlcyBhbiBhcnJheSBvZiB7QGxpbmsgUm91dGVEZWZpbml0aW9ufXMuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgUm91dGVDb25maWcge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29uZmlnczogUm91dGVEZWZpbml0aW9uW10pIHt9XG59XG5cbi8qKlxuICogYFJvdXRlYCBpcyBhIHR5cGUgb2Yge0BsaW5rIFJvdXRlRGVmaW5pdGlvbn0gdXNlZCB0byByb3V0ZSBhIHBhdGggdG8gYSBjb21wb25lbnQuXG4gKlxuICogSXQgaGFzIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqIC0gYHBhdGhgIGlzIGEgc3RyaW5nIHRoYXQgdXNlcyB0aGUgcm91dGUgbWF0Y2hlciBEU0wuXG4gKiAtIGBjb21wb25lbnRgIGEgY29tcG9uZW50IHR5cGUuXG4gKiAtIGBuYW1lYCBpcyBhbiBvcHRpb25hbCBgQ2FtZWxDYXNlYCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBuYW1lIG9mIHRoZSByb3V0ZS5cbiAqIC0gYGRhdGFgIGlzIGFuIG9wdGlvbmFsIHByb3BlcnR5IG9mIGFueSB0eXBlIHJlcHJlc2VudGluZyBhcmJpdHJhcnkgcm91dGUgbWV0YWRhdGEgZm9yIHRoZSBnaXZlblxuICogcm91dGUuIEl0IGlzIGluamVjdGFibGUgdmlhIHtAbGluayBSb3V0ZURhdGF9LlxuICogLSBgdXNlQXNEZWZhdWx0YCBpcyBhIGJvb2xlYW4gdmFsdWUuIElmIGB0cnVlYCwgdGhlIGNoaWxkIHJvdXRlIHdpbGwgYmUgbmF2aWdhdGVkIHRvIGlmIG5vIGNoaWxkXG4gKiByb3V0ZSBpcyBzcGVjaWZpZWQgZHVyaW5nIHRoZSBuYXZpZ2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7Um91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQFJvdXRlQ29uZmlnKFtcbiAqICAge3BhdGg6ICcvaG9tZScsIGNvbXBvbmVudDogSG9tZUNtcCwgbmFtZTogJ0hvbWVDbXAnIH1cbiAqIF0pXG4gKiBjbGFzcyBNeUFwcCB7fVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgUm91dGUgaW1wbGVtZW50cyBSb3V0ZURlZmluaXRpb24ge1xuICBkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgcGF0aDogc3RyaW5nO1xuICBjb21wb25lbnQ6IFR5cGU7XG4gIG5hbWU6IHN0cmluZztcbiAgdXNlQXNEZWZhdWx0OiBib29sZWFuO1xuICAvLyBhZGRlZCBuZXh0IHRocmVlIHByb3BlcnRpZXMgdG8gd29yayBhcm91bmQgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy80MTA3XG4gIGF1eDogc3RyaW5nID0gbnVsbDtcbiAgbG9hZGVyOiBGdW5jdGlvbiA9IG51bGw7XG4gIHJlZGlyZWN0VG86IGFueVtdID0gbnVsbDtcbiAgY29uc3RydWN0b3Ioe3BhdGgsIGNvbXBvbmVudCwgbmFtZSwgZGF0YSwgdXNlQXNEZWZhdWx0fToge1xuICAgIHBhdGg6IHN0cmluZyxcbiAgICBjb21wb25lbnQ6IFR5cGUsIG5hbWU/OiBzdHJpbmcsIGRhdGE/OiB7W2tleTogc3RyaW5nXTogYW55fSwgdXNlQXNEZWZhdWx0PzogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICB0aGlzLmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy51c2VBc0RlZmF1bHQgPSB1c2VBc0RlZmF1bHQ7XG4gIH1cbn1cblxuLyoqXG4gKiBgQXV4Um91dGVgIGlzIGEgdHlwZSBvZiB7QGxpbmsgUm91dGVEZWZpbml0aW9ufSB1c2VkIHRvIGRlZmluZSBhbiBhdXhpbGlhcnkgcm91dGUuXG4gKlxuICogSXQgdGFrZXMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogLSBgcGF0aGAgaXMgYSBzdHJpbmcgdGhhdCB1c2VzIHRoZSByb3V0ZSBtYXRjaGVyIERTTC5cbiAqIC0gYGNvbXBvbmVudGAgYSBjb21wb25lbnQgdHlwZS5cbiAqIC0gYG5hbWVgIGlzIGFuIG9wdGlvbmFsIGBDYW1lbENhc2VgIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG5hbWUgb2YgdGhlIHJvdXRlLlxuICogLSBgZGF0YWAgaXMgYW4gb3B0aW9uYWwgcHJvcGVydHkgb2YgYW55IHR5cGUgcmVwcmVzZW50aW5nIGFyYml0cmFyeSByb3V0ZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuXG4gKiByb3V0ZS4gSXQgaXMgaW5qZWN0YWJsZSB2aWEge0BsaW5rIFJvdXRlRGF0YX0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHtSb3V0ZUNvbmZpZywgQXV4Um91dGV9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQFJvdXRlQ29uZmlnKFtcbiAqICAgbmV3IEF1eFJvdXRlKHtwYXRoOiAnL2hvbWUnLCBjb21wb25lbnQ6IEhvbWVDbXB9KVxuICogXSlcbiAqIGNsYXNzIE15QXBwIHt9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBBdXhSb3V0ZSBpbXBsZW1lbnRzIFJvdXRlRGVmaW5pdGlvbiB7XG4gIGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gbnVsbDtcbiAgcGF0aDogc3RyaW5nO1xuICBjb21wb25lbnQ6IFR5cGU7XG4gIG5hbWU6IHN0cmluZztcbiAgLy8gYWRkZWQgbmV4dCB0aHJlZSBwcm9wZXJ0aWVzIHRvIHdvcmsgYXJvdW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDEwN1xuICBhdXg6IHN0cmluZyA9IG51bGw7XG4gIGxvYWRlcjogRnVuY3Rpb24gPSBudWxsO1xuICByZWRpcmVjdFRvOiBhbnlbXSA9IG51bGw7XG4gIHVzZUFzRGVmYXVsdDogYm9vbGVhbiA9IGZhbHNlO1xuICBjb25zdHJ1Y3Rvcih7cGF0aCwgY29tcG9uZW50LCBuYW1lfToge3BhdGg6IHN0cmluZywgY29tcG9uZW50OiBUeXBlLCBuYW1lPzogc3RyaW5nfSkge1xuICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxufVxuXG4vKipcbiAqIGBBc3luY1JvdXRlYCBpcyBhIHR5cGUgb2Yge0BsaW5rIFJvdXRlRGVmaW5pdGlvbn0gdXNlZCB0byByb3V0ZSBhIHBhdGggdG8gYW4gYXN5bmNocm9ub3VzbHlcbiAqIGxvYWRlZCBjb21wb25lbnQuXG4gKlxuICogSXQgaGFzIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqIC0gYHBhdGhgIGlzIGEgc3RyaW5nIHRoYXQgdXNlcyB0aGUgcm91dGUgbWF0Y2hlciBEU0wuXG4gKiAtIGBsb2FkZXJgIGlzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgY29tcG9uZW50LlxuICogLSBgbmFtZWAgaXMgYW4gb3B0aW9uYWwgYENhbWVsQ2FzZWAgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbmFtZSBvZiB0aGUgcm91dGUuXG4gKiAtIGBkYXRhYCBpcyBhbiBvcHRpb25hbCBwcm9wZXJ0eSBvZiBhbnkgdHlwZSByZXByZXNlbnRpbmcgYXJiaXRyYXJ5IHJvdXRlIG1ldGFkYXRhIGZvciB0aGUgZ2l2ZW5cbiAqIHJvdXRlLiBJdCBpcyBpbmplY3RhYmxlIHZpYSB7QGxpbmsgUm91dGVEYXRhfS5cbiAqIC0gYHVzZUFzRGVmYXVsdGAgaXMgYSBib29sZWFuIHZhbHVlLiBJZiBgdHJ1ZWAsIHRoZSBjaGlsZCByb3V0ZSB3aWxsIGJlIG5hdmlnYXRlZCB0byBpZiBubyBjaGlsZFxuICogcm91dGUgaXMgc3BlY2lmaWVkIGR1cmluZyB0aGUgbmF2aWdhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQge1JvdXRlQ29uZmlnfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgIHtwYXRoOiAnL2hvbWUnLCBsb2FkZXI6ICgpID0+IFByb21pc2UucmVzb2x2ZShNeUxvYWRlZENtcCksIG5hbWU6ICdNeUxvYWRlZENtcCd9XG4gKiBdKVxuICogY2xhc3MgTXlBcHAge31cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEFzeW5jUm91dGUgaW1wbGVtZW50cyBSb3V0ZURlZmluaXRpb24ge1xuICBkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgcGF0aDogc3RyaW5nO1xuICBsb2FkZXI6IEZ1bmN0aW9uO1xuICBuYW1lOiBzdHJpbmc7XG4gIHVzZUFzRGVmYXVsdDogYm9vbGVhbjtcbiAgYXV4OiBzdHJpbmcgPSBudWxsO1xuICBjb25zdHJ1Y3Rvcih7cGF0aCwgbG9hZGVyLCBuYW1lLCBkYXRhLCB1c2VBc0RlZmF1bHR9OiB7XG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGxvYWRlcjogRnVuY3Rpb24sIG5hbWU/OiBzdHJpbmcsIGRhdGE/OiB7W2tleTogc3RyaW5nXTogYW55fSwgdXNlQXNEZWZhdWx0PzogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICB0aGlzLmxvYWRlciA9IGxvYWRlcjtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy51c2VBc0RlZmF1bHQgPSB1c2VBc0RlZmF1bHQ7XG4gIH1cbn1cblxuLyoqXG4gKiBgUmVkaXJlY3RgIGlzIGEgdHlwZSBvZiB7QGxpbmsgUm91dGVEZWZpbml0aW9ufSB1c2VkIHRvIHJvdXRlIGEgcGF0aCB0byBhIGNhbm9uaWNhbCByb3V0ZS5cbiAqXG4gKiBJdCBoYXMgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogLSBgcGF0aGAgaXMgYSBzdHJpbmcgdGhhdCB1c2VzIHRoZSByb3V0ZSBtYXRjaGVyIERTTC5cbiAqIC0gYHJlZGlyZWN0VG9gIGlzIGFuIGFycmF5IHJlcHJlc2VudGluZyB0aGUgbGluayBEU0wuXG4gKlxuICogTm90ZSB0aGF0IHJlZGlyZWN0cyAqKmRvIG5vdCoqIGFmZmVjdCBob3cgbGlua3MgYXJlIGdlbmVyYXRlZC4gRm9yIHRoYXQsIHNlZSB0aGUgYHVzZUFzRGVmYXVsdGBcbiAqIG9wdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICogYGBgXG4gKiBpbXBvcnQge1JvdXRlQ29uZmlnfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgIHtwYXRoOiAnLycsIHJlZGlyZWN0VG86IFsnL0hvbWUnXSB9LFxuICogICB7cGF0aDogJy9ob21lJywgY29tcG9uZW50OiBIb21lQ21wLCBuYW1lOiAnSG9tZSd9XG4gKiBdKVxuICogY2xhc3MgTXlBcHAge31cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFJlZGlyZWN0IGltcGxlbWVudHMgUm91dGVEZWZpbml0aW9uIHtcbiAgcGF0aDogc3RyaW5nO1xuICByZWRpcmVjdFRvOiBhbnlbXTtcbiAgbmFtZTogc3RyaW5nID0gbnVsbDtcbiAgLy8gYWRkZWQgbmV4dCB0aHJlZSBwcm9wZXJ0aWVzIHRvIHdvcmsgYXJvdW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDEwN1xuICBsb2FkZXI6IEZ1bmN0aW9uID0gbnVsbDtcbiAgZGF0YTogYW55ID0gbnVsbDtcbiAgYXV4OiBzdHJpbmcgPSBudWxsO1xuICB1c2VBc0RlZmF1bHQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgY29uc3RydWN0b3Ioe3BhdGgsIHJlZGlyZWN0VG99OiB7cGF0aDogc3RyaW5nLCByZWRpcmVjdFRvOiBhbnlbXX0pIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMucmVkaXJlY3RUbyA9IHJlZGlyZWN0VG87XG4gIH1cbn1cbiJdfQ==