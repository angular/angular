import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';
import {Location} from 'angular2/src/router/location';

export class SpyLocation implements Location {
  urlChanges: string[] = [];
  /** @internal */
  _path: string = '';
  /** @internal */
  _query: string = '';
  /** @internal */
  _subject: EventEmitter<any> = new EventEmitter();
  /** @internal */
  _baseHref: string = '';

  setInitialPath(url: string) { this._path = url; }

  setBaseHref(url: string) { this._baseHref = url; }

  path(): string { return this._path; }

  simulateUrlPop(pathname: string) { ObservableWrapper.callNext(this._subject, {'url': pathname}); }

  prepareExternalUrl(url: string): string {
    if (url.length > 0 && !url.startsWith('/')) {
      url = '/' + url;
    }
    return this._baseHref + url;
  }

  go(path: string, query: string = '') {
    path = this.prepareExternalUrl(path);
    if (this._path == path && this._query == query) {
      return;
    }
    this._path = path;
    this._query = query;

    var url = path + (query.length > 0 ? ('?' + query) : '');
    this.urlChanges.push(url);
  }

  forward() {
    // TODO
  }

  back() {
    // TODO
  }

  subscribe(onNext: (value: any) => void, onThrow: (error: any) => void = null,
            onReturn: () => void = null): Object {
    return ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
  }

  // TODO: remove these once Location is an interface, and can be implemented cleanly
  platformStrategy: any = null;
  normalize(url: string): string { return null; }
}
