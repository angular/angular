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
export abstract class LocationStrategy {
  abstract path(): string;
  abstract pushState(state: any, title: string, url: string, queryParams: string): void;
  abstract forward(): void;
  abstract back(): void;
  abstract onPopState(fn: (_: any) => any): void;
  abstract getBaseHref(): string;
}

export function normalizeQueryParams(params: string): string {
  return (params.length > 0 && params.substring(0, 1) != '?') ? ('?' + params) : params;
}
