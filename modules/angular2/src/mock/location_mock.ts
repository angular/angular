import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {Location} from 'angular2/src/router/location';

export class SpyLocation implements Location {
  urlChanges: string[] = [];
  _path: string = '';
  _subject: EventEmitter = new EventEmitter();
  _baseHref: string = '';

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

  // TODO: remove these once Location is an interface, and can be implemented cleanly
  platformStrategy: any = null;
  normalize(url: string): string { return null; }
}
