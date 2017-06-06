var __make_dart_analyzer_happy = null;
/**
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 * @ts2dart_const
 */
export class RouteConfig {
    constructor(configs) {
        this.configs = configs;
    }
}
/* @ts2dart_const */
export class AbstractRoute {
    constructor({ name, useAsDefault, path, regex, serializer, data }) {
        this.name = name;
        this.useAsDefault = useAsDefault;
        this.path = path;
        this.regex = regex;
        this.serializer = serializer;
        this.data = data;
    }
}
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
 * import {RouteConfig, Route} from 'angular2/router';
 *
 * @RouteConfig([
 *   new Route({path: '/home', component: HomeCmp, name: 'HomeCmp' })
 * ])
 * class MyApp {}
 * ```
 * @ts2dart_const
 */
export class Route extends AbstractRoute {
    constructor({ name, useAsDefault, path, regex, serializer, data, component }) {
        super({
            name: name,
            useAsDefault: useAsDefault,
            path: path,
            regex: regex,
            serializer: serializer,
            data: data
        });
        this.aux = null;
        this.component = component;
    }
}
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
 * @ts2dart_const
 */
export class AuxRoute extends AbstractRoute {
    constructor({ name, useAsDefault, path, regex, serializer, data, component }) {
        super({
            name: name,
            useAsDefault: useAsDefault,
            path: path,
            regex: regex,
            serializer: serializer,
            data: data
        });
        this.component = component;
    }
}
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
 * import {RouteConfig, AsyncRoute} from 'angular2/router';
 *
 * @RouteConfig([
 *   new AsyncRoute({path: '/home', loader: () => Promise.resolve(MyLoadedCmp), name:
 * 'MyLoadedCmp'})
 * ])
 * class MyApp {}
 * ```
 * @ts2dart_const
 */
export class AsyncRoute extends AbstractRoute {
    constructor({ name, useAsDefault, path, regex, serializer, data, loader }) {
        super({
            name: name,
            useAsDefault: useAsDefault,
            path: path,
            regex: regex,
            serializer: serializer,
            data: data
        });
        this.aux = null;
        this.loader = loader;
    }
}
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
 * import {RouteConfig, Route, Redirect} from 'angular2/router';
 *
 * @RouteConfig([
 *   new Redirect({path: '/', redirectTo: ['/Home'] }),
 *   new Route({path: '/home', component: HomeCmp, name: 'Home'})
 * ])
 * class MyApp {}
 * ```
 * @ts2dart_const
 */
export class Redirect extends AbstractRoute {
    constructor({ name, useAsDefault, path, regex, serializer, data, redirectTo }) {
        super({
            name: name,
            useAsDefault: useAsDefault,
            path: path,
            regex: regex,
            serializer: serializer,
            data: data
        });
        this.redirectTo = redirectTo;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfY29uZmlnX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX2NvbmZpZy9yb3V0ZV9jb25maWdfaW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxJQUFJLDBCQUEwQixHQUFpQixJQUFJLENBQUM7QUFFcEQ7Ozs7O0dBS0c7QUFDSDtJQUNFLFlBQW1CLE9BQTBCO1FBQTFCLFlBQU8sR0FBUCxPQUFPLENBQW1CO0lBQUcsQ0FBQztBQUNuRCxDQUFDO0FBRUQsb0JBQW9CO0FBQ3BCO0lBUUUsWUFBWSxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFrQjtRQUM5RSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ0gsMkJBQTJCLGFBQWE7SUFJdEMsWUFBWSxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBa0I7UUFDekYsTUFBTTtZQUNKLElBQUksRUFBRSxJQUFJO1lBQ1YsWUFBWSxFQUFFLFlBQVk7WUFDMUIsSUFBSSxFQUFFLElBQUk7WUFDVixLQUFLLEVBQUUsS0FBSztZQUNaLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLElBQUksRUFBRSxJQUFJO1NBQ1gsQ0FBQyxDQUFDO1FBVkwsUUFBRyxHQUFXLElBQUksQ0FBQztRQVdqQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUM3QixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW9CRztBQUNILDhCQUE4QixhQUFhO0lBR3pDLFlBQVksRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQWtCO1FBQ3pGLE1BQU07WUFDSixJQUFJLEVBQUUsSUFBSTtZQUNWLFlBQVksRUFBRSxZQUFZO1lBQzFCLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLEtBQUs7WUFDWixVQUFVLEVBQUUsVUFBVTtZQUN0QixJQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzdCLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUNILGdDQUFnQyxhQUFhO0lBSTNDLFlBQVksRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQWtCO1FBQ3RGLE1BQU07WUFDSixJQUFJLEVBQUUsSUFBSTtZQUNWLFlBQVksRUFBRSxZQUFZO1lBQzFCLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLEtBQUs7WUFDWixVQUFVLEVBQUUsVUFBVTtZQUN0QixJQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQztRQVZMLFFBQUcsR0FBVyxJQUFJLENBQUM7UUFXakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0gsOEJBQThCLGFBQWE7SUFHekMsWUFBWSxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBa0I7UUFDMUYsTUFBTTtZQUNKLElBQUksRUFBRSxJQUFJO1lBQ1YsWUFBWSxFQUFFLFlBQVk7WUFDMUIsSUFBSSxFQUFFLElBQUk7WUFDVixLQUFLLEVBQUUsS0FBSztZQUNaLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLElBQUksRUFBRSxJQUFJO1NBQ1gsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDL0IsQ0FBQztBQUNILENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VHlwZSwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtSb3V0ZURlZmluaXRpb259IGZyb20gJy4uL3JvdXRlX2RlZmluaXRpb24nO1xuaW1wb3J0IHtSZWdleFNlcmlhbGl6ZXJ9IGZyb20gJy4uL3J1bGVzL3JvdXRlX3BhdGhzL3JlZ2V4X3JvdXRlX3BhdGgnO1xuXG5leHBvcnQge1JvdXRlRGVmaW5pdGlvbn0gZnJvbSAnLi4vcm91dGVfZGVmaW5pdGlvbic7XG5cbnZhciBfX21ha2VfZGFydF9hbmFseXplcl9oYXBweTogUHJvbWlzZTxhbnk+ID0gbnVsbDtcblxuLyoqXG4gKiBUaGUgYFJvdXRlQ29uZmlnYCBkZWNvcmF0b3IgZGVmaW5lcyByb3V0ZXMgZm9yIGEgZ2l2ZW4gY29tcG9uZW50LlxuICpcbiAqIEl0IHRha2VzIGFuIGFycmF5IG9mIHtAbGluayBSb3V0ZURlZmluaXRpb259cy5cbiAqIEB0czJkYXJ0X2NvbnN0XG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZUNvbmZpZyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb25maWdzOiBSb3V0ZURlZmluaXRpb25bXSkge31cbn1cblxuLyogQHRzMmRhcnRfY29uc3QgKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBYnN0cmFjdFJvdXRlIGltcGxlbWVudHMgUm91dGVEZWZpbml0aW9uIHtcbiAgbmFtZTogc3RyaW5nO1xuICB1c2VBc0RlZmF1bHQ6IGJvb2xlYW47XG4gIHBhdGg6IHN0cmluZztcbiAgcmVnZXg6IHN0cmluZztcbiAgc2VyaWFsaXplcjogUmVnZXhTZXJpYWxpemVyO1xuICBkYXRhOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICBjb25zdHJ1Y3Rvcih7bmFtZSwgdXNlQXNEZWZhdWx0LCBwYXRoLCByZWdleCwgc2VyaWFsaXplciwgZGF0YX06IFJvdXRlRGVmaW5pdGlvbikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy51c2VBc0RlZmF1bHQgPSB1c2VBc0RlZmF1bHQ7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICB0aGlzLnJlZ2V4ID0gcmVnZXg7XG4gICAgdGhpcy5zZXJpYWxpemVyID0gc2VyaWFsaXplcjtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG59XG5cbi8qKlxuICogYFJvdXRlYCBpcyBhIHR5cGUgb2Yge0BsaW5rIFJvdXRlRGVmaW5pdGlvbn0gdXNlZCB0byByb3V0ZSBhIHBhdGggdG8gYSBjb21wb25lbnQuXG4gKlxuICogSXQgaGFzIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqIC0gYHBhdGhgIGlzIGEgc3RyaW5nIHRoYXQgdXNlcyB0aGUgcm91dGUgbWF0Y2hlciBEU0wuXG4gKiAtIGBjb21wb25lbnRgIGEgY29tcG9uZW50IHR5cGUuXG4gKiAtIGBuYW1lYCBpcyBhbiBvcHRpb25hbCBgQ2FtZWxDYXNlYCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBuYW1lIG9mIHRoZSByb3V0ZS5cbiAqIC0gYGRhdGFgIGlzIGFuIG9wdGlvbmFsIHByb3BlcnR5IG9mIGFueSB0eXBlIHJlcHJlc2VudGluZyBhcmJpdHJhcnkgcm91dGUgbWV0YWRhdGEgZm9yIHRoZSBnaXZlblxuICogcm91dGUuIEl0IGlzIGluamVjdGFibGUgdmlhIHtAbGluayBSb3V0ZURhdGF9LlxuICogLSBgdXNlQXNEZWZhdWx0YCBpcyBhIGJvb2xlYW4gdmFsdWUuIElmIGB0cnVlYCwgdGhlIGNoaWxkIHJvdXRlIHdpbGwgYmUgbmF2aWdhdGVkIHRvIGlmIG5vIGNoaWxkXG4gKiByb3V0ZSBpcyBzcGVjaWZpZWQgZHVyaW5nIHRoZSBuYXZpZ2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKiBgYGBcbiAqIGltcG9ydCB7Um91dGVDb25maWcsIFJvdXRlfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgIG5ldyBSb3V0ZSh7cGF0aDogJy9ob21lJywgY29tcG9uZW50OiBIb21lQ21wLCBuYW1lOiAnSG9tZUNtcCcgfSlcbiAqIF0pXG4gKiBjbGFzcyBNeUFwcCB7fVxuICogYGBgXG4gKiBAdHMyZGFydF9jb25zdFxuICovXG5leHBvcnQgY2xhc3MgUm91dGUgZXh0ZW5kcyBBYnN0cmFjdFJvdXRlIHtcbiAgY29tcG9uZW50OiBhbnk7XG4gIGF1eDogc3RyaW5nID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcih7bmFtZSwgdXNlQXNEZWZhdWx0LCBwYXRoLCByZWdleCwgc2VyaWFsaXplciwgZGF0YSwgY29tcG9uZW50fTogUm91dGVEZWZpbml0aW9uKSB7XG4gICAgc3VwZXIoe1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIHVzZUFzRGVmYXVsdDogdXNlQXNEZWZhdWx0LFxuICAgICAgcGF0aDogcGF0aCxcbiAgICAgIHJlZ2V4OiByZWdleCxcbiAgICAgIHNlcmlhbGl6ZXI6IHNlcmlhbGl6ZXIsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSk7XG4gICAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gIH1cbn1cblxuLyoqXG4gKiBgQXV4Um91dGVgIGlzIGEgdHlwZSBvZiB7QGxpbmsgUm91dGVEZWZpbml0aW9ufSB1c2VkIHRvIGRlZmluZSBhbiBhdXhpbGlhcnkgcm91dGUuXG4gKlxuICogSXQgdGFrZXMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogLSBgcGF0aGAgaXMgYSBzdHJpbmcgdGhhdCB1c2VzIHRoZSByb3V0ZSBtYXRjaGVyIERTTC5cbiAqIC0gYGNvbXBvbmVudGAgYSBjb21wb25lbnQgdHlwZS5cbiAqIC0gYG5hbWVgIGlzIGFuIG9wdGlvbmFsIGBDYW1lbENhc2VgIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG5hbWUgb2YgdGhlIHJvdXRlLlxuICogLSBgZGF0YWAgaXMgYW4gb3B0aW9uYWwgcHJvcGVydHkgb2YgYW55IHR5cGUgcmVwcmVzZW50aW5nIGFyYml0cmFyeSByb3V0ZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuXG4gKiByb3V0ZS4gSXQgaXMgaW5qZWN0YWJsZSB2aWEge0BsaW5rIFJvdXRlRGF0YX0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHtSb3V0ZUNvbmZpZywgQXV4Um91dGV9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQFJvdXRlQ29uZmlnKFtcbiAqICAgbmV3IEF1eFJvdXRlKHtwYXRoOiAnL2hvbWUnLCBjb21wb25lbnQ6IEhvbWVDbXB9KVxuICogXSlcbiAqIGNsYXNzIE15QXBwIHt9XG4gKiBgYGBcbiAqIEB0czJkYXJ0X2NvbnN0XG4gKi9cbmV4cG9ydCBjbGFzcyBBdXhSb3V0ZSBleHRlbmRzIEFic3RyYWN0Um91dGUge1xuICBjb21wb25lbnQ6IGFueTtcblxuICBjb25zdHJ1Y3Rvcih7bmFtZSwgdXNlQXNEZWZhdWx0LCBwYXRoLCByZWdleCwgc2VyaWFsaXplciwgZGF0YSwgY29tcG9uZW50fTogUm91dGVEZWZpbml0aW9uKSB7XG4gICAgc3VwZXIoe1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIHVzZUFzRGVmYXVsdDogdXNlQXNEZWZhdWx0LFxuICAgICAgcGF0aDogcGF0aCxcbiAgICAgIHJlZ2V4OiByZWdleCxcbiAgICAgIHNlcmlhbGl6ZXI6IHNlcmlhbGl6ZXIsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSk7XG4gICAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gIH1cbn1cblxuLyoqXG4gKiBgQXN5bmNSb3V0ZWAgaXMgYSB0eXBlIG9mIHtAbGluayBSb3V0ZURlZmluaXRpb259IHVzZWQgdG8gcm91dGUgYSBwYXRoIHRvIGFuIGFzeW5jaHJvbm91c2x5XG4gKiBsb2FkZWQgY29tcG9uZW50LlxuICpcbiAqIEl0IGhhcyB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAtIGBwYXRoYCBpcyBhIHN0cmluZyB0aGF0IHVzZXMgdGhlIHJvdXRlIG1hdGNoZXIgRFNMLlxuICogLSBgbG9hZGVyYCBpcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIGNvbXBvbmVudC5cbiAqIC0gYG5hbWVgIGlzIGFuIG9wdGlvbmFsIGBDYW1lbENhc2VgIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG5hbWUgb2YgdGhlIHJvdXRlLlxuICogLSBgZGF0YWAgaXMgYW4gb3B0aW9uYWwgcHJvcGVydHkgb2YgYW55IHR5cGUgcmVwcmVzZW50aW5nIGFyYml0cmFyeSByb3V0ZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuXG4gKiByb3V0ZS4gSXQgaXMgaW5qZWN0YWJsZSB2aWEge0BsaW5rIFJvdXRlRGF0YX0uXG4gKiAtIGB1c2VBc0RlZmF1bHRgIGlzIGEgYm9vbGVhbiB2YWx1ZS4gSWYgYHRydWVgLCB0aGUgY2hpbGQgcm91dGUgd2lsbCBiZSBuYXZpZ2F0ZWQgdG8gaWYgbm8gY2hpbGRcbiAqIHJvdXRlIGlzIHNwZWNpZmllZCBkdXJpbmcgdGhlIG5hdmlnYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHtSb3V0ZUNvbmZpZywgQXN5bmNSb3V0ZX0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAUm91dGVDb25maWcoW1xuICogICBuZXcgQXN5bmNSb3V0ZSh7cGF0aDogJy9ob21lJywgbG9hZGVyOiAoKSA9PiBQcm9taXNlLnJlc29sdmUoTXlMb2FkZWRDbXApLCBuYW1lOlxuICogJ015TG9hZGVkQ21wJ30pXG4gKiBdKVxuICogY2xhc3MgTXlBcHAge31cbiAqIGBgYFxuICogQHRzMmRhcnRfY29uc3RcbiAqL1xuZXhwb3J0IGNsYXNzIEFzeW5jUm91dGUgZXh0ZW5kcyBBYnN0cmFjdFJvdXRlIHtcbiAgbG9hZGVyOiAoKSA9PiBQcm9taXNlPFR5cGU+O1xuICBhdXg6IHN0cmluZyA9IG51bGw7XG5cbiAgY29uc3RydWN0b3Ioe25hbWUsIHVzZUFzRGVmYXVsdCwgcGF0aCwgcmVnZXgsIHNlcmlhbGl6ZXIsIGRhdGEsIGxvYWRlcn06IFJvdXRlRGVmaW5pdGlvbikge1xuICAgIHN1cGVyKHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICB1c2VBc0RlZmF1bHQ6IHVzZUFzRGVmYXVsdCxcbiAgICAgIHBhdGg6IHBhdGgsXG4gICAgICByZWdleDogcmVnZXgsXG4gICAgICBzZXJpYWxpemVyOiBzZXJpYWxpemVyLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pO1xuICAgIHRoaXMubG9hZGVyID0gbG9hZGVyO1xuICB9XG59XG5cbi8qKlxuICogYFJlZGlyZWN0YCBpcyBhIHR5cGUgb2Yge0BsaW5rIFJvdXRlRGVmaW5pdGlvbn0gdXNlZCB0byByb3V0ZSBhIHBhdGggdG8gYSBjYW5vbmljYWwgcm91dGUuXG4gKlxuICogSXQgaGFzIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqIC0gYHBhdGhgIGlzIGEgc3RyaW5nIHRoYXQgdXNlcyB0aGUgcm91dGUgbWF0Y2hlciBEU0wuXG4gKiAtIGByZWRpcmVjdFRvYCBpcyBhbiBhcnJheSByZXByZXNlbnRpbmcgdGhlIGxpbmsgRFNMLlxuICpcbiAqIE5vdGUgdGhhdCByZWRpcmVjdHMgKipkbyBub3QqKiBhZmZlY3QgaG93IGxpbmtzIGFyZSBnZW5lcmF0ZWQuIEZvciB0aGF0LCBzZWUgdGhlIGB1c2VBc0RlZmF1bHRgXG4gKiBvcHRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIGBgYFxuICogaW1wb3J0IHtSb3V0ZUNvbmZpZywgUm91dGUsIFJlZGlyZWN0fSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgIG5ldyBSZWRpcmVjdCh7cGF0aDogJy8nLCByZWRpcmVjdFRvOiBbJy9Ib21lJ10gfSksXG4gKiAgIG5ldyBSb3V0ZSh7cGF0aDogJy9ob21lJywgY29tcG9uZW50OiBIb21lQ21wLCBuYW1lOiAnSG9tZSd9KVxuICogXSlcbiAqIGNsYXNzIE15QXBwIHt9XG4gKiBgYGBcbiAqIEB0czJkYXJ0X2NvbnN0XG4gKi9cbmV4cG9ydCBjbGFzcyBSZWRpcmVjdCBleHRlbmRzIEFic3RyYWN0Um91dGUge1xuICByZWRpcmVjdFRvOiBhbnlbXTtcblxuICBjb25zdHJ1Y3Rvcih7bmFtZSwgdXNlQXNEZWZhdWx0LCBwYXRoLCByZWdleCwgc2VyaWFsaXplciwgZGF0YSwgcmVkaXJlY3RUb306IFJvdXRlRGVmaW5pdGlvbikge1xuICAgIHN1cGVyKHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICB1c2VBc0RlZmF1bHQ6IHVzZUFzRGVmYXVsdCxcbiAgICAgIHBhdGg6IHBhdGgsXG4gICAgICByZWdleDogcmVnZXgsXG4gICAgICBzZXJpYWxpemVyOiBzZXJpYWxpemVyLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pO1xuICAgIHRoaXMucmVkaXJlY3RUbyA9IHJlZGlyZWN0VG87XG4gIH1cbn1cbiJdfQ==