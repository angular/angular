import {Injectable} from 'angular2/core';
import {History, Location} from 'angular2/src/facade/browser';
import {UrlChangeListener} from './platform_location';
import {PlatformLocation} from './platform_location';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';

/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 */
@Injectable()
export class BrowserPlatformLocation extends PlatformLocation {
  private _location: Location;
  private _history: History;

  constructor() {
    super();
    this._init();
  }

  // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it
  /** @internal */
  _init() {
    this._location = DOM.getLocation();
    this._history = DOM.getHistory();
  }

  /** @internal */
  get location(): Location { return this._location; }

  getBaseHrefFromDOM(): string { return DOM.getBaseHref(); }

  onPopState(fn: UrlChangeListener): void {
    DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
  }

  onHashChange(fn: UrlChangeListener): void {
    DOM.getGlobalEventTarget('window').addEventListener('hashchange', fn, false);
  }

  get pathname(): string { return this._location.pathname; }
  get search(): string { return this._location.search; }
  get hash(): string { return this._location.hash; }
  set pathname(newPath: string) { this._location.pathname = newPath; }

  pushState(state: any, title: string, url: string): void {
    this._history.pushState(state, title, url);
  }

  replaceState(state: any, title: string, url: string): void {
    this._history.replaceState(state, title, url);
  }

  forward(): void { this._history.forward(); }

  back(): void { this._history.back(); }
}
