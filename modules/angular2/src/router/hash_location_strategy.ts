import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {Injectable} from 'angular2/angular2';
import {LocationStrategy, normalizeQueryParams} from './location_strategy';
import {EventListener, History, Location} from 'angular2/src/core/facade/browser';

/**
 * `HashLocationStrategy` is a {@link LocationStrategy} used to configure the
 * {@link Location} service to represent its state in the
 * [hash fragment](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax)
 * of the browser's URL.
 *
 * For instance, if you call `location.go('/foo')`, the browser's URL will become
 * `example.com#/foo`.
 *
 * ## Example
 *
 * ```
 * import {Component, View} from 'angular2/angular2';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig,
 *   Location
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(location: Location) {
 *     location.go('/foo');
 *   }
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
@Injectable()
export class HashLocationStrategy extends LocationStrategy {
  private _location: Location;
  private _history: History;

  constructor() {
    super();
    this._location = DOM.getLocation();
    this._history = DOM.getHistory();
  }

  onPopState(fn: EventListener): void {
    DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
  }

  getBaseHref(): string { return ''; }

  path(): string {
    // the hash value is always prefixed with a `#`
    // and if it is empty then it will stay empty
    var path = this._location.hash;

    // Dart will complain if a call to substring is
    // executed with a position value that extends the
    // length of string.
    return (path.length > 0 ? path.substring(1) : path) +
           normalizeQueryParams(this._location.search);
  }

  pushState(state: any, title: string, path: string, queryParams: string) {
    var url = path + normalizeQueryParams(queryParams);
    if (url.length == 0) {
      url = this._location.pathname;
    } else {
      url = '#' + url;
    }
    this._history.pushState(state, title, url);
  }

  forward(): void { this._history.forward(); }

  back(): void { this._history.back(); }
}
