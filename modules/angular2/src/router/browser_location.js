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

  onPopState(fn) {
    DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
  }

  getBaseHref() {
    return this._baseHref;
  }

  path() {
    return this._location.pathname;
  }

  pushState(state:any, title:string, url:string) {
    this._history.pushState(state, title, url);
  }

  forward() {
    this._history.forward();
  }

  back() {
    this._history.back();
  }
}
