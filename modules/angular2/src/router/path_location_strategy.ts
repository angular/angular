import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {Injectable} from 'angular2/di';
import {EventListener, History, Location} from 'angular2/src/core/facade/browser';
import {LocationStrategy} from './location_strategy';

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

  path(): string { return this._location.pathname; }

  pushState(state: any, title: string, url: string) { this._history.pushState(state, title, url); }

  forward(): void { this._history.forward(); }

  back(): void { this._history.back(); }
}
