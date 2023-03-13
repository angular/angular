/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy} from '@angular/common';
import {EventEmitter, Injectable} from '@angular/core';
import {SubscriptionLike} from 'rxjs';

import {normalizeQueryParams} from '../../src/location/util';

/**
 * A spy for {@link Location} that allows tests to fire simulated location events.
 *
 * @publicApi
 */
@Injectable()
export class SpyLocation implements Location {
  urlChanges: string[] = [];
  private _history: LocationState[] = [new LocationState('', '', null)];
  private _historyIndex: number = 0;
  /** @internal */
  _subject: EventEmitter<any> = new EventEmitter();
  /** @internal */
  _basePath: string = '';
  /** @internal */
  _locationStrategy: LocationStrategy = null!;
  /** @internal */
  _urlChangeListeners: ((url: string, state: unknown) => void)[] = [];
  /** @internal */
  _urlChangeSubscription: SubscriptionLike|null = null;

  /** @nodoc */
  ngOnDestroy(): void {
    this._urlChangeSubscription?.unsubscribe();
    this._urlChangeListeners = [];
  }

  setInitialPath(url: string) {
    this._history[this._historyIndex].path = url;
  }

  setBaseHref(url: string) {
    this._basePath = url;
  }

  path(): string {
    return this._history[this._historyIndex].path;
  }

  getState(): unknown {
    return this._history[this._historyIndex].state;
  }

  isCurrentPathEqualTo(path: string, query: string = ''): boolean {
    const givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
    const currPath =
        this.path().endsWith('/') ? this.path().substring(0, this.path().length - 1) : this.path();

    return currPath == givenPath + (query.length > 0 ? ('?' + query) : '');
  }

  simulateUrlPop(pathname: string) {
    this._subject.emit({'url': pathname, 'pop': true, 'type': 'popstate'});
  }

  simulateHashChange(pathname: string) {
    const path = this.prepareExternalUrl(pathname);
    this.pushHistory(path, '', null);

    this.urlChanges.push('hash: ' + pathname);
    // the browser will automatically fire popstate event before each `hashchange` event, so we need
    // to simulate it.
    this._subject.emit({'url': pathname, 'pop': true, 'type': 'popstate'});
    this._subject.emit({'url': pathname, 'pop': true, 'type': 'hashchange'});
  }

  prepareExternalUrl(url: string): string {
    if (url.length > 0 && !url.startsWith('/')) {
      url = '/' + url;
    }
    return this._basePath + url;
  }

  go(path: string, query: string = '', state: any = null) {
    path = this.prepareExternalUrl(path);

    this.pushHistory(path, query, state);

    const locationState = this._history[this._historyIndex - 1];
    if (locationState.path == path && locationState.query == query) {
      return;
    }

    const url = path + (query.length > 0 ? ('?' + query) : '');
    this.urlChanges.push(url);
    this._notifyUrlChangeListeners(path + normalizeQueryParams(query), state);
  }

  replaceState(path: string, query: string = '', state: any = null) {
    path = this.prepareExternalUrl(path);

    const history = this._history[this._historyIndex];

    history.state = state;

    if (history.path == path && history.query == query) {
      return;
    }

    history.path = path;
    history.query = query;

    const url = path + (query.length > 0 ? ('?' + query) : '');
    this.urlChanges.push('replace: ' + url);
    this._notifyUrlChangeListeners(path + normalizeQueryParams(query), state);
  }

  forward() {
    if (this._historyIndex < (this._history.length - 1)) {
      this._historyIndex++;
      this._subject.emit(
          {'url': this.path(), 'state': this.getState(), 'pop': true, 'type': 'popstate'});
    }
  }

  back() {
    if (this._historyIndex > 0) {
      this._historyIndex--;
      this._subject.emit(
          {'url': this.path(), 'state': this.getState(), 'pop': true, 'type': 'popstate'});
    }
  }

  historyGo(relativePosition: number = 0): void {
    const nextPageIndex = this._historyIndex + relativePosition;
    if (nextPageIndex >= 0 && nextPageIndex < this._history.length) {
      this._historyIndex = nextPageIndex;
      this._subject.emit(
          {'url': this.path(), 'state': this.getState(), 'pop': true, 'type': 'popstate'});
    }
  }

  onUrlChange(fn: (url: string, state: unknown) => void): VoidFunction {
    this._urlChangeListeners.push(fn);

    if (!this._urlChangeSubscription) {
      this._urlChangeSubscription = this.subscribe(v => {
        this._notifyUrlChangeListeners(v.url, v.state);
      });
    }

    return () => {
      const fnIndex = this._urlChangeListeners.indexOf(fn);
      this._urlChangeListeners.splice(fnIndex, 1);

      if (this._urlChangeListeners.length === 0) {
        this._urlChangeSubscription?.unsubscribe();
        this._urlChangeSubscription = null;
      }
    };
  }

  /** @internal */
  _notifyUrlChangeListeners(url: string = '', state: unknown) {
    this._urlChangeListeners.forEach(fn => fn(url, state));
  }

  subscribe(
      onNext: (value: any) => void, onThrow?: ((error: any) => void)|null,
      onReturn?: (() => void)|null): SubscriptionLike {
    return this._subject.subscribe({next: onNext, error: onThrow, complete: onReturn});
  }

  normalize(url: string): string {
    return null!;
  }

  private pushHistory(path: string, query: string, state: any) {
    if (this._historyIndex > 0) {
      this._history.splice(this._historyIndex + 1);
    }
    this._history.push(new LocationState(path, query, state));
    this._historyIndex = this._history.length - 1;
  }
}

class LocationState {
  constructor(public path: string, public query: string, public state: any) {}
}
