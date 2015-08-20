import {SpyObject, proxy} from 'angular2/test_lib';

import {IMPLEMENTS} from 'angular2/src/core/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {List, ListWrapper} from 'angular2/src/core/facade/collection';
import {Location} from 'angular2/src/router/location';


@proxy
@IMPLEMENTS(Location)
export class SpyLocation extends SpyObject {
  urlChanges: List<string>;
  _path: string;
  _subject: EventEmitter;
  _baseHref: string;

  constructor() {
    super();
    this._path = '';
    this.urlChanges = [];
    this._subject = new EventEmitter();
    this._baseHref = '';
  }

  setInitialPath(url: string) { this._path = url; }

  setBaseHref(url: string) { this._baseHref = url; }

  path(): string { return this._path; }

  simulateUrlPop(pathname: string) { ObservableWrapper.callNext(this._subject, {'url': pathname}); }

  normalizeAbsolutely(url: string): string { return this._baseHref + url; }

  go(url: string) {
    url = this.normalizeAbsolutely(url);
    if (this._path == url) {
      return;
    }
    this._path = url;
    this.urlChanges.push(url);
  }

  forward() {
    // TODO
  }

  back() {
    // TODO
  }

  subscribe(onNext: (value: any) => void, onThrow: (error: any) => void = null,
            onReturn: () => void = null) {
    ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
  }

  noSuchMethod(m: any) { super.noSuchMethod(m); }
}
