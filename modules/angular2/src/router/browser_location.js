import {DOM} from 'angular2/src/dom/dom_adapter';

export class BrowserLocation {
  _location;
  _history;
  _baseHref:string;

  constructor() {
    this._location = DOM.getLocation();
    this._history = DOM.getHistory();
    this._baseHref = DOM.getBaseHref();
  }

  onPopState(fn: Function): void {
    DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
  }

  getBaseHref(): string {
    return this._baseHref;
  }

  path(): string {
    return this._location.pathname;
  }

  pushState(state:any, title:string, url:string) {
    this._history.pushState(state, title, url);
  }

  forward(): void {
    this._history.forward();
  }

  back(): void {
    this._history.back();
  }
}
