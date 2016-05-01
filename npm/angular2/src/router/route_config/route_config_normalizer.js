'use strict';"use strict";
var route_config_decorator_1 = require('./route_config_decorator');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * Given a JS Object that represents a route config, returns a corresponding Route, AsyncRoute,
 * AuxRoute or Redirect object.
 *
 * Also wraps an AsyncRoute's loader function to add the loaded component's route config to the
 * `RouteRegistry`.
 */
function normalizeRouteConfig(config, registry) {
    if (config instanceof route_config_decorator_1.AsyncRoute) {
        var wrappedLoader = wrapLoaderToReconfigureRegistry(config.loader, registry);
        return new route_config_decorator_1.AsyncRoute({
            path: config.path,
            loader: wrappedLoader,
            name: config.name,
            data: config.data,
            useAsDefault: config.useAsDefault
        });
    }
    if (config instanceof route_config_decorator_1.Route || config instanceof route_config_decorator_1.Redirect || config instanceof route_config_decorator_1.AuxRoute) {
        return config;
    }
    if ((+!!config.component) + (+!!config.redirectTo) + (+!!config.loader) != 1) {
        throw new exceptions_1.BaseException("Route config should contain exactly one \"component\", \"loader\", or \"redirectTo\" property.");
    }
    if (config.as && config.name) {
        throw new exceptions_1.BaseException("Route config should contain exactly one \"as\" or \"name\" property.");
    }
    if (config.as) {
        config.name = config.as;
    }
    if (config.loader) {
        var wrappedLoader = wrapLoaderToReconfigureRegistry(config.loader, registry);
        return new route_config_decorator_1.AsyncRoute({
            path: config.path,
            loader: wrappedLoader,
            name: config.name,
            data: config.data,
            useAsDefault: config.useAsDefault
        });
    }
    if (config.aux) {
        return new route_config_decorator_1.AuxRoute({ path: config.aux, component: config.component, name: config.name });
    }
    if (config.component) {
        if (typeof config.component == 'object') {
            var componentDefinitionObject = config.component;
            if (componentDefinitionObject.type == 'constructor') {
                return new route_config_decorator_1.Route({
                    path: config.path,
                    component: componentDefinitionObject.constructor,
                    name: config.name,
                    data: config.data,
                    useAsDefault: config.useAsDefault
                });
            }
            else if (componentDefinitionObject.type == 'loader') {
                return new route_config_decorator_1.AsyncRoute({
                    path: config.path,
                    loader: componentDefinitionObject.loader,
                    name: config.name,
                    data: config.data,
                    useAsDefault: config.useAsDefault
                });
            }
            else {
                throw new exceptions_1.BaseException("Invalid component type \"" + componentDefinitionObject.type + "\". Valid types are \"constructor\" and \"loader\".");
            }
        }
        return new route_config_decorator_1.Route(config);
    }
    if (config.redirectTo) {
        return new route_config_decorator_1.Redirect({ path: config.path, redirectTo: config.redirectTo });
    }
    return config;
}
exports.normalizeRouteConfig = normalizeRouteConfig;
function wrapLoaderToReconfigureRegistry(loader, registry) {
    return function () {
        return loader().then(function (componentType) {
            registry.configFromComponent(componentType);
            return componentType;
        });
    };
}
function assertComponentExists(component, path) {
    if (!lang_1.isType(component)) {
        throw new exceptions_1.BaseException("Component for route \"" + path + "\" is not defined, or is not a class.");
    }
}
exports.assertComponentExists = assertComponentExists;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfY29uZmlnX25vcm1hbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX2NvbmZpZy9yb3V0ZV9jb25maWdfbm9ybWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUNBQXFFLDBCQUEwQixDQUFDLENBQUE7QUFFaEcscUJBQTJCLDBCQUEwQixDQUFDLENBQUE7QUFDdEQsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFJL0U7Ozs7OztHQU1HO0FBQ0gsOEJBQXFDLE1BQXVCLEVBQ3ZCLFFBQXVCO0lBQzFELEVBQUUsQ0FBQyxDQUFDLE1BQU0sWUFBWSxtQ0FBVSxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLGFBQWEsR0FBRywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzdFLE1BQU0sQ0FBQyxJQUFJLG1DQUFVLENBQUM7WUFDcEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLE1BQU0sRUFBRSxhQUFhO1lBQ3JCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO1NBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLFlBQVksOEJBQUssSUFBSSxNQUFNLFlBQVksaUNBQVEsSUFBSSxNQUFNLFlBQVksaUNBQVEsQ0FBQyxDQUFDLENBQUM7UUFDeEYsTUFBTSxDQUFrQixNQUFNLENBQUM7SUFDakMsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUs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QUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxJQUFJLGlDQUFRLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBQyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQTdFZSw0QkFBb0IsdUJBNkVuQyxDQUFBO0FBR0QseUNBQXlDLE1BQWdCLEVBQUUsUUFBdUI7SUFFaEYsTUFBTSxDQUFDO1FBQ0wsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLGFBQWE7WUFDakMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsK0JBQXNDLFNBQWUsRUFBRSxJQUFZO0lBQ2pFLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLElBQUksMEJBQWEsQ0FBQywyQkFBd0IsSUFBSSwwQ0FBc0MsQ0FBQyxDQUFDO0lBQzlGLENBQUM7QUFDSCxDQUFDO0FBSmUsNkJBQXFCLHdCQUlwQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBc3luY1JvdXRlLCBBdXhSb3V0ZSwgUm91dGUsIFJlZGlyZWN0LCBSb3V0ZURlZmluaXRpb259IGZyb20gJy4vcm91dGVfY29uZmlnX2RlY29yYXRvcic7XG5pbXBvcnQge0NvbXBvbmVudERlZmluaXRpb259IGZyb20gJy4uL3JvdXRlX2RlZmluaXRpb24nO1xuaW1wb3J0IHtpc1R5cGUsIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1JvdXRlUmVnaXN0cnl9IGZyb20gJy4uL3JvdXRlX3JlZ2lzdHJ5JztcblxuXG4vKipcbiAqIEdpdmVuIGEgSlMgT2JqZWN0IHRoYXQgcmVwcmVzZW50cyBhIHJvdXRlIGNvbmZpZywgcmV0dXJucyBhIGNvcnJlc3BvbmRpbmcgUm91dGUsIEFzeW5jUm91dGUsXG4gKiBBdXhSb3V0ZSBvciBSZWRpcmVjdCBvYmplY3QuXG4gKlxuICogQWxzbyB3cmFwcyBhbiBBc3luY1JvdXRlJ3MgbG9hZGVyIGZ1bmN0aW9uIHRvIGFkZCB0aGUgbG9hZGVkIGNvbXBvbmVudCdzIHJvdXRlIGNvbmZpZyB0byB0aGVcbiAqIGBSb3V0ZVJlZ2lzdHJ5YC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVJvdXRlQ29uZmlnKGNvbmZpZzogUm91dGVEZWZpbml0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5KTogUm91dGVEZWZpbml0aW9uIHtcbiAgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEFzeW5jUm91dGUpIHtcbiAgICB2YXIgd3JhcHBlZExvYWRlciA9IHdyYXBMb2FkZXJUb1JlY29uZmlndXJlUmVnaXN0cnkoY29uZmlnLmxvYWRlciwgcmVnaXN0cnkpO1xuICAgIHJldHVybiBuZXcgQXN5bmNSb3V0ZSh7XG4gICAgICBwYXRoOiBjb25maWcucGF0aCxcbiAgICAgIGxvYWRlcjogd3JhcHBlZExvYWRlcixcbiAgICAgIG5hbWU6IGNvbmZpZy5uYW1lLFxuICAgICAgZGF0YTogY29uZmlnLmRhdGEsXG4gICAgICB1c2VBc0RlZmF1bHQ6IGNvbmZpZy51c2VBc0RlZmF1bHRcbiAgICB9KTtcbiAgfVxuICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUgfHwgY29uZmlnIGluc3RhbmNlb2YgUmVkaXJlY3QgfHwgY29uZmlnIGluc3RhbmNlb2YgQXV4Um91dGUpIHtcbiAgICByZXR1cm4gPFJvdXRlRGVmaW5pdGlvbj5jb25maWc7XG4gIH1cblxuICBpZiAoKCshIWNvbmZpZy5jb21wb25lbnQpICsgKCshIWNvbmZpZy5yZWRpcmVjdFRvKSArICgrISFjb25maWcubG9hZGVyKSAhPSAxKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgIGBSb3V0ZSBjb25maWcgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSBvbmUgXCJjb21wb25lbnRcIiwgXCJsb2FkZXJcIiwgb3IgXCJyZWRpcmVjdFRvXCIgcHJvcGVydHkuYCk7XG4gIH1cbiAgaWYgKGNvbmZpZy5hcyAmJiBjb25maWcubmFtZSkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBSb3V0ZSBjb25maWcgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSBvbmUgXCJhc1wiIG9yIFwibmFtZVwiIHByb3BlcnR5LmApO1xuICB9XG4gIGlmIChjb25maWcuYXMpIHtcbiAgICBjb25maWcubmFtZSA9IGNvbmZpZy5hcztcbiAgfVxuICBpZiAoY29uZmlnLmxvYWRlcikge1xuICAgIHZhciB3cmFwcGVkTG9hZGVyID0gd3JhcExvYWRlclRvUmVjb25maWd1cmVSZWdpc3RyeShjb25maWcubG9hZGVyLCByZWdpc3RyeSk7XG4gICAgcmV0dXJuIG5ldyBBc3luY1JvdXRlKHtcbiAgICAgIHBhdGg6IGNvbmZpZy5wYXRoLFxuICAgICAgbG9hZGVyOiB3cmFwcGVkTG9hZGVyLFxuICAgICAgbmFtZTogY29uZmlnLm5hbWUsXG4gICAgICBkYXRhOiBjb25maWcuZGF0YSxcbiAgICAgIHVzZUFzRGVmYXVsdDogY29uZmlnLnVzZUFzRGVmYXVsdFxuICAgIH0pO1xuICB9XG4gIGlmIChjb25maWcuYXV4KSB7XG4gICAgcmV0dXJuIG5ldyBBdXhSb3V0ZSh7cGF0aDogY29uZmlnLmF1eCwgY29tcG9uZW50OjxUeXBlPmNvbmZpZy5jb21wb25lbnQsIG5hbWU6IGNvbmZpZy5uYW1lfSk7XG4gIH1cbiAgaWYgKGNvbmZpZy5jb21wb25lbnQpIHtcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5jb21wb25lbnQgPT0gJ29iamVjdCcpIHtcbiAgICAgIGxldCBjb21wb25lbnREZWZpbml0aW9uT2JqZWN0ID0gPENvbXBvbmVudERlZmluaXRpb24+Y29uZmlnLmNvbXBvbmVudDtcbiAgICAgIGlmIChjb21wb25lbnREZWZpbml0aW9uT2JqZWN0LnR5cGUgPT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICByZXR1cm4gbmV3IFJvdXRlKHtcbiAgICAgICAgICBwYXRoOiBjb25maWcucGF0aCxcbiAgICAgICAgICBjb21wb25lbnQ6PFR5cGU+Y29tcG9uZW50RGVmaW5pdGlvbk9iamVjdC5jb25zdHJ1Y3RvcixcbiAgICAgICAgICBuYW1lOiBjb25maWcubmFtZSxcbiAgICAgICAgICBkYXRhOiBjb25maWcuZGF0YSxcbiAgICAgICAgICB1c2VBc0RlZmF1bHQ6IGNvbmZpZy51c2VBc0RlZmF1bHRcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudERlZmluaXRpb25PYmplY3QudHlwZSA9PSAnbG9hZGVyJykge1xuICAgICAgICByZXR1cm4gbmV3IEFzeW5jUm91dGUoe1xuICAgICAgICAgIHBhdGg6IGNvbmZpZy5wYXRoLFxuICAgICAgICAgIGxvYWRlcjogY29tcG9uZW50RGVmaW5pdGlvbk9iamVjdC5sb2FkZXIsXG4gICAgICAgICAgbmFtZTogY29uZmlnLm5hbWUsXG4gICAgICAgICAgZGF0YTogY29uZmlnLmRhdGEsXG4gICAgICAgICAgdXNlQXNEZWZhdWx0OiBjb25maWcudXNlQXNEZWZhdWx0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgSW52YWxpZCBjb21wb25lbnQgdHlwZSBcIiR7Y29tcG9uZW50RGVmaW5pdGlvbk9iamVjdC50eXBlfVwiLiBWYWxpZCB0eXBlcyBhcmUgXCJjb25zdHJ1Y3RvclwiIGFuZCBcImxvYWRlclwiLmApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFJvdXRlKDx7XG4gICAgICBwYXRoOiBzdHJpbmc7XG4gICAgICBjb21wb25lbnQ6IFR5cGU7XG4gICAgICBuYW1lPzogc3RyaW5nO1xuICAgICAgZGF0YT86IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgICAgdXNlQXNEZWZhdWx0PzogYm9vbGVhbjtcbiAgICB9PmNvbmZpZyk7XG4gIH1cblxuICBpZiAoY29uZmlnLnJlZGlyZWN0VG8pIHtcbiAgICByZXR1cm4gbmV3IFJlZGlyZWN0KHtwYXRoOiBjb25maWcucGF0aCwgcmVkaXJlY3RUbzogY29uZmlnLnJlZGlyZWN0VG99KTtcbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59XG5cblxuZnVuY3Rpb24gd3JhcExvYWRlclRvUmVjb25maWd1cmVSZWdpc3RyeShsb2FkZXI6IEZ1bmN0aW9uLCByZWdpc3RyeTogUm91dGVSZWdpc3RyeSk6ICgpID0+XG4gICAgUHJvbWlzZTxUeXBlPiB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgcmV0dXJuIGxvYWRlcigpLnRoZW4oKGNvbXBvbmVudFR5cGUpID0+IHtcbiAgICAgIHJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQoY29tcG9uZW50VHlwZSk7XG4gICAgICByZXR1cm4gY29tcG9uZW50VHlwZTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydENvbXBvbmVudEV4aXN0cyhjb21wb25lbnQ6IFR5cGUsIHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBpZiAoIWlzVHlwZShjb21wb25lbnQpKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENvbXBvbmVudCBmb3Igcm91dGUgXCIke3BhdGh9XCIgaXMgbm90IGRlZmluZWQsIG9yIGlzIG5vdCBhIGNsYXNzLmApO1xuICB9XG59XG4iXX0=