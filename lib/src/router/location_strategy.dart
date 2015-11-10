/**
 * `LocationStrategy` is responsible for representing and reading route state
 * from the the browser's URL. Angular provides two strategies:
 * [HashLocationStrategy] (default) and [PathLocationStrategy].
 *
 * This is used under the hood of the [Location] service.
 *
 * Applications should use the [Router] or [Location] services to
 * interact with application route state.
 *
 * For instance, [HashLocationStrategy] produces URLs like
 * `http://example.com#/foo`, and [PathLocationStrategy] produces
 * `http://example.com/foo` as an equivalent URL.
 *
 * See these two classes for more.
 */
library angular2.src.router.location_strategy;

abstract class LocationStrategy {
  String path();
  String prepareExternalUrl(String internal);
  void pushState(dynamic state, String title, String url, String queryParams);
  void forward();
  void back();
  void onPopState(dynamic /* (_: any) => any */ fn);
  String getBaseHref();
}

String normalizeQueryParams(String params) {
  return (params.length > 0 && params.substring(0, 1) != "?")
      ? ("?" + params)
      : params;
}
