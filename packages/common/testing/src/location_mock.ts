/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy} from '@angular/common';
import {EventEmitter, Injectable} from '@angular/core';


/**
 * A spy for {@link Location} that allows tests to fire simulated location events.
 *
 * @experimental
 */
@Injectable()
export class SpyLocation implements Location {
  urlChanges: string[] = [];
  private _history: LocationState[] = [new LocationState('', '')];
  private _historyIndex: number = 0;
  /** @internal */
  _subject: EventEmitter<any> = new EventEmitter();
  /** @internal */
  _baseHref: string = '';
  /** @internal */
  _platformStrategy: LocationStrategy = null !;

  setInitialPath(url: string) { this._history[this._historyIndex].path = url; }

  setBaseHref(url: string) { this._baseHref = url; }

  path(): string { return this._history[this._historyIndex].path; }

  isCurrentPathEqualTo(path: string, query: string = ''): boolean {
    const givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
    const currPath =
        this.path().endsWith('/') ? this.path().substring(0, this.path().length - 1) : this.path();

    return currPath == givenPath + (query.length > 0 ? ('?' + query) : '');
  }

  simulateUrlPop(pathname: string) { this._subject.emit({'url': pathname, 'pop': true}); }

  simulateHashChange(pathname: string) {
    // Because we don't prevent the native event, the browser will independently update the path
    this.setInitialPath(pathname);
    this.urlChanges.push('hash: ' + pathname);
    this._subject.emit({'url': pathname, 'pop': true, 'type': 'hashchange'});
  }

  prepareExternalUrl(url: string): string {
    if (url.length > 0 && !url.startsWith('/')) {
      url = '/' + url;
    }
    return this._baseHref + url;
  }

  go(path: string, query: string = '') {
    path = this.prepareExternalUrl(path);

    if (this._historyIndex > 0) {
      this._history.splice(this._historyIndex + 1);
    }
    this._history.push(new LocationState(path, query));
    this._historyIndex = this._history.length - 1;

    const locationState = this._history[this._historyIndex - 1];
    if (locationState.path == path && locationState.query == query) {
      return;
    }

    const url = path + (query.length > 0 ? ('?' + query) : '');
    this.urlChanges.push(url);
    this._subject.emit({'url': url, 'pop': false});
  }

  replaceState(path: string, query: string = '') {
    path = this.prepareExternalUrl(path);

    const history = this._history[this._historyIndex];
    if (history.path == path && history.query == query) {
      return;
    }

    history.path = path;
    history.query = query;

    const url = path + (query.length > 0 ? ('?' + query) : '');
    this.urlChanges.push('replace: ' + url);
  }

  forward() {
    if (this._historyIndex < (this._history.length - 1)) {
      this._historyIndex++;
      this._subject.emit({'url': this.path(), 'pop': true});
    }
  }

  back() {
    if (this._historyIndex > 0) {
      this._historyIndex--;
      this._subject.emit({'url': this.path(), 'pop': true});
    }
  }

  subscribe(
      onNext: (value: any) => void, onThrow?: ((error: any) => void)|null,
      onReturn?: (() => void)|null): Object {
    return this._subject.subscribe({next: onNext, error: onThrow, complete: onReturn});
  }

  normalize(url: string): string { return null !; }
}

class LocationState {
  path: string;
  query: string;
  constructor(path: string, query: string) {
    this.path = path;
    this.query = query;
  }
}
