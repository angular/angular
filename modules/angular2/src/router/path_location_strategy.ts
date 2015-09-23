import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {Injectable} from 'angular2/src/core/di';
import {EventListener, History, Location} from 'angular2/src/core/facade/browser';
import {LocationStrategy, normalizeQueryParams} from './location_strategy';

/**
 * `PathLocationStrategy` is a {@link LocationStrategy} used to configure the
 * {@link Location} service to represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * If you're using `PathLocationStrategy`, you must provide a binding for
 * {@link APP_BASE_HREF} to a string representing the URL prefix that should
 * be preserved when generating and recognizing URLs.
 *
 * For instance, if you provide an `APP_BASE_HREF` of `'/my/app'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * ## Example
 *
 * ```
 * import {Component, View, bind} from 'angular2/angular2';
 * import {
 *   APP_BASE_HREF
 *   ROUTER_DIRECTIVES,
 *   routerBindings,
 *   RouteConfig,
 *   Location,
 *   LocationStrategy,
 *   PathLocationStrategy
 * } from 'angular2/router';
 *
 * @Component({...})
 * @View({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(location: Location) {
 *     location.go('/foo');
 *   }
 * }
 *
 * bootstrap(AppCmp, [
 *   routerBindings(AppCmp),
 *   bind(LocationStrategy).toClass(PathLocationStrategy),
 *   bind(APP_BASE_HREF).toValue('/my/app')
 * ]);
 * ```
 */
@Injectable()
export class PathLocationStrategy extends LocationStrategy {
  private _location: Location;
  private _history: History;
  private _baseHref: string;

  constructor() {
    super();
    this._location = DOM.getLocation();
    this._history = DOM.getHistory();
    this._baseHref = DOM.getBaseHref();
  }

  onPopState(fn: EventListener): void {
    DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
  }

  getBaseHref(): string { return this._baseHref; }

  path(): string { return this._location.pathname + normalizeQueryParams(this._location.search); }

  pushState(state: any, title: string, url: string, queryParams: string) {
    this._history.pushState(state, title, (url + normalizeQueryParams(queryParams)));
  }

  forward(): void { this._history.forward(); }

  back(): void { this._history.back(); }
}
