import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';

function _abstract() {
  return new BaseException('This method is abstract');
}

/**
 * `LocationStrategy` is responsible for representing and reading route state
 * from the the browser's URL. Angular provides two strategies:
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
export class LocationStrategy {
  path(): string { throw _abstract(); }
  pushState(state: any, title: string, url: string, queryParams: string): void {
    throw _abstract();
  }
  forward(): void { throw _abstract(); }
  back(): void { throw _abstract(); }
  onPopState(fn: (_: any) => any): void { throw _abstract(); }
  getBaseHref(): string { throw _abstract(); }
}

export function normalizeQueryParams(params: string): string {
  return params.length > 0 ? ('?' + params) : '';
}
