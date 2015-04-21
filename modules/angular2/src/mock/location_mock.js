import {SpyObject, proxy} from 'angular2/test_lib';

import {isBlank, isPresent, IMPLEMENTS} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {Location} from 'angular2/src/router/location';


@proxy
@IMPLEMENTS(Location)
export class DummyLocation extends SpyObject {
  urlChanges:List<string>;
  _path:string;
  _subject:EventEmitter;

  constructor() {
    super();
    this._path = '/';
    this.urlChanges = ListWrapper.create();
    this._subject = new EventEmitter();
  }

  setInitialPath(url:string) {
    this._path = url;
  }

  path():string {
    return this._path;
  }

  simulateUrlPop(pathname:string) {
    ObservableWrapper.callNext(this._subject, {
      'url': pathname
    });
  }

  go(url:string) {
    if (this._path === url) {
      return;
    }
    this._path = url;
    ListWrapper.push(this.urlChanges, url);
  }

  forward() {
    // TODO
  }

  back() {
    // TODO
  }

  subscribe(onNext, onThrow = null, onReturn = null) {
    ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
  }

  noSuchMethod(m){return super.noSuchMethod(m);}
}
