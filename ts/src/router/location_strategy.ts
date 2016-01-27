import {CONST_EXPR} from 'angular2/src/facade/lang';
import {OpaqueToken} from 'angular2/core';

/**
 * `LocationStrategy` is responsible for representing and reading route state
 * from the browser's URL. Angular provides two strategies:
 * {@link HashLocationStrategy} (default) and {@link PathLocationStrategy}.
 *
 * This is used under the hood of the {@link Location} service.
 *
 * Applications should use the {@link Router} or {@link Location} services to
 * interact with application route state.
 *
 * For instance, {@link HashLocationStrategy} produces URLs like
 * `http://example.com#/foo`, and {@link PathLocationStrategy} produces
 * `http://example.com/foo` as an equivalent URL.
 *
 * See these two classes for more.
 */
export abstract class LocationStrategy {
  abstract path(): string;
  abstract prepareExternalUrl(internal: string): string;
  abstract pushState(state: any, title: string, url: string, queryParams: string): void;
  abstract replaceState(state: any, title: string, url: string, queryParams: string): void;
  abstract forward(): void;
  abstract back(): void;
  abstract onPopState(fn: (_: any) => any): void;
  abstract getBaseHref(): string;
}


/**
 * The `APP_BASE_HREF` token represents the base href to be used with the
 * {@link PathLocationStrategy}.
 *
 * If you're using {@link PathLocationStrategy}, you must provide a provider to a string
 * representing the URL prefix that should be preserved when generating and recognizing
 * URLs.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [
 *   ROUTER_PROVIDERS,
 *   PathLocationStrategy,
 *   provide(APP_BASE_HREF, {useValue: '/my/app'})
 * ]);
 * ```
 */
export const APP_BASE_HREF: OpaqueToken = CONST_EXPR(new OpaqueToken('appBaseHref'));

export function normalizeQueryParams(params: string): string {
  return (params.length > 0 && params.substring(0, 1) != '?') ? ('?' + params) : params;
}

export function joinWithSlash(start: string, end: string): string {
  if (start.length == 0) {
    return end;
  }
  if (end.length == 0) {
    return start;
  }
  var slashes = 0;
  if (start.endsWith('/')) {
    slashes++;
  }
  if (end.startsWith('/')) {
    slashes++;
  }
  if (slashes == 2) {
    return start + end.substring(1);
  }
  if (slashes == 1) {
    return start + end;
  }
  return start + '/' + end;
}
