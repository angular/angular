/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This is a private API for the ngtools toolkit.
 *
 * This API should be stable for NG 2. It can be removed in NG 4..., but should be replaced by
 * something else.
 */
import {AotCompilerHost, StaticReflector, StaticSymbol} from '@angular/compiler';
import {NgModule} from '@angular/core';

// We cannot depend directly to @angular/router.
type Route = any;
const ROUTER_MODULE_PATH = '@angular/router';
const ROUTER_ROUTES_SYMBOL_NAME = 'ROUTES';


// LazyRoute information between the extractors.
export interface LazyRoute {
  routeDef: RouteDef;
  absoluteFilePath: string;
}
export type LazyRouteMap = {
  [route: string]: LazyRoute
};

// A route definition. Normally the short form 'path/to/module#ModuleClassName' is used by
// the user, and this is a helper class to extract information from it.
export class RouteDef {
  private constructor(public readonly path: string, public readonly className: string|null = null) {
  }

  toString() {
    return (this.className === null || this.className == 'default') ?
        this.path :
        `${this.path}#${this.className}`;
  }

  static fromString(entry: string): RouteDef {
    const split = entry.split('#');
    return new RouteDef(split[0], split[1] || null);
  }
}


/**
 *
 * @returns {LazyRouteMap}
 * @private
 */
export function listLazyRoutesOfModule(
    entryModule: string, host: AotCompilerHost, reflector: StaticReflector): LazyRouteMap {
  const entryRouteDef = RouteDef.fromString(entryModule);
  const containingFile = _resolveModule(entryRouteDef.path, entryRouteDef.path, host);
  const modulePath = `./${containingFile.replace(/^(.*)\//, '')}`;
  const className = entryRouteDef.className !;

  // List loadChildren of this single module.
  const appStaticSymbol = reflector.findDeclaration(modulePath, className, containingFile);
  const ROUTES = reflector.findDeclaration(ROUTER_MODULE_PATH, ROUTER_ROUTES_SYMBOL_NAME);
  const lazyRoutes: LazyRoute[] =
      _extractLazyRoutesFromStaticModule(appStaticSymbol, reflector, host, ROUTES);

  const allLazyRoutes = lazyRoutes.reduce(
      function includeLazyRouteAndSubRoutes(allRoutes: LazyRouteMap, lazyRoute: LazyRoute):
          LazyRouteMap {
            const route: string = lazyRoute.routeDef.toString();
            _assertRoute(allRoutes, lazyRoute);
            allRoutes[route] = lazyRoute;

            // StaticReflector does not support discovering annotations like `NgModule` on default
            // exports
            // Which means: if a default export NgModule was lazy-loaded, we can discover it, but,
            //  we cannot parse its routes to see if they have loadChildren or not.
            if (!lazyRoute.routeDef.className) {
              return allRoutes;
            }

            const lazyModuleSymbol = reflector.findDeclaration(
                lazyRoute.absoluteFilePath, lazyRoute.routeDef.className || 'default');

            const subRoutes =
                _extractLazyRoutesFromStaticModule(lazyModuleSymbol, reflector, host, ROUTES);

            return subRoutes.reduce(includeLazyRouteAndSubRoutes, allRoutes);
          },
      {});

  return allLazyRoutes;
}


/**
 * Try to resolve a module, and returns its absolute path.
 * @private
 */
function _resolveModule(modulePath: string, containingFile: string, host: AotCompilerHost) {
  const result = host.moduleNameToFileName(modulePath, containingFile);
  if (!result) {
    throw new Error(`Could not resolve "${modulePath}" from "${containingFile}".`);
  }
  return result;
}


/**
 * Throw an exception if a route is in a route map, but does not point to the same module.
 * @private
 */
function _assertRoute(map: LazyRouteMap, route: LazyRoute) {
  const r = route.routeDef.toString();
  if (map[r] && map[r].absoluteFilePath != route.absoluteFilePath) {
    throw new Error(
        `Duplicated path in loadChildren detected: "${r}" is used in 2 loadChildren, ` +
        `but they point to different modules "(${map[r].absoluteFilePath} and ` +
        `"${route.absoluteFilePath}"). Webpack cannot distinguish on context and would fail to ` +
        'load the proper one.');
  }
}


/**
 * Extract all the LazyRoutes from a module. This extracts all `loadChildren` keys from this
 * module and all statically referred modules.
 * @private
 */
function _extractLazyRoutesFromStaticModule(
    staticSymbol: StaticSymbol, reflector: StaticReflector, host: AotCompilerHost,
    ROUTES: StaticSymbol): LazyRoute[] {
  const moduleMetadata = _getNgModuleMetadata(staticSymbol, reflector);
  const allRoutes: any =
      (moduleMetadata.imports || [])
          .filter(i => 'providers' in i)
          .reduce((mem: Route[], m: any) => {
            return mem.concat(_collectRoutes(m.providers || [], reflector, ROUTES));
          }, _collectRoutes(moduleMetadata.providers || [], reflector, ROUTES));

  const lazyRoutes: LazyRoute[] =
      _collectLoadChildren(allRoutes).reduce((acc: LazyRoute[], route: string) => {
        const routeDef = RouteDef.fromString(route);
        const absoluteFilePath = _resolveModule(routeDef.path, staticSymbol.filePath, host);
        acc.push({routeDef, absoluteFilePath});
        return acc;
      }, []);

  const importedSymbols =
      ((moduleMetadata.imports || []) as any[])
          .filter(i => i instanceof StaticSymbol || i.ngModule instanceof StaticSymbol)
          .map(i => {
            if (i instanceof StaticSymbol) return i;
            return i.ngModule;
          }) as StaticSymbol[];

  return importedSymbols
      .reduce(
          (acc: LazyRoute[], i: StaticSymbol) => {
            return acc.concat(_extractLazyRoutesFromStaticModule(i, reflector, host, ROUTES));
          },
          [])
      .concat(lazyRoutes);
}


/**
 * Get the NgModule Metadata of a symbol.
 * @private
 */
function _getNgModuleMetadata(staticSymbol: StaticSymbol, reflector: StaticReflector): NgModule {
  const ngModules = reflector.annotations(staticSymbol).filter((s: any) => s instanceof NgModule);
  if (ngModules.length === 0) {
    throw new Error(`${staticSymbol.name} is not an NgModule`);
  }
  return ngModules[0];
}


/**
 * Return the routes from the provider list.
 * @private
 */
function _collectRoutes(
    providers: any[], reflector: StaticReflector, ROUTES: StaticSymbol): Route[] {
  return providers.reduce((routeList: Route[], p: any) => {
    if (p.provide === ROUTES) {
      return routeList.concat(p.useValue);
    } else if (Array.isArray(p)) {
      return routeList.concat(_collectRoutes(p, reflector, ROUTES));
    } else {
      return routeList;
    }
  }, []);
}


/**
 * Return the loadChildren values of a list of Route.
 * @private
 */
function _collectLoadChildren(routes: Route[]): string[] {
  return routes.reduce((m, r) => {
    if (r.loadChildren && typeof r.loadChildren === 'string') {
      return m.concat(r.loadChildren);
    } else if (Array.isArray(r)) {
      return m.concat(_collectLoadChildren(r));
    } else if (r.children) {
      return m.concat(_collectLoadChildren(r.children));
    } else {
      return m;
    }
  }, []);
}
