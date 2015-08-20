import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {Injectable} from 'angular2/di';
import {LocationStrategy} from './location_strategy';
import {EventListener, History, Location} from 'angular2/src/core/facade/browser';

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
    return path.length > 0 ? path.substring(1) : path;
  }

  pushState(state: any, title: string, url: string) {
    this._history.pushState(state, title, '#' + url);
  }

  forward(): void { this._history.forward(); }

  back(): void { this._history.back(); }
}
