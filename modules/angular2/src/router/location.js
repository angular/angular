import {global} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';

export class Location {
  _location;
  _subject:EventEmitter;
  _history;
  constructor() {
    this._subject = new EventEmitter();
    this._location = global.location;
    this._history = global.history;
    global.addEventListener('popstate', (_) => this._onPopState(_), false);
  }

  _onPopState(_) {
    ObservableWrapper.callNext(this._subject, {
      'url': this._location.pathname
    });
  }

  path() {
    return this._location.pathname;
  }

  go(url:string) {
    this._history.pushState(null, null, url);
  }

  forward() {
    this._history.forward();
  }

  back() {
    this._history.back()
  }

  subscribe(onNext, onThrow = null, onReturn = null) {
    ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
  }
}
