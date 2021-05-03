/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy, PlatformLocation} from '@angular/common';
import {EventEmitter, Injectable} from '@angular/core';
import {SubscriptionLike} from 'rxjs';

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
  _baseHref: string = '';
  /** @internal */
  _platformStrategy: LocationStrategy = null!;
  /** @internal */
  _platformLocation: PlatformLocation = null!;
  /** @internal */
  _urlChangeListeners: ((url: string, state: unknown) => void)[] = [];
  /** @internal */
  _urlChangeSubscription?: SubscriptionLike;

  setInitialPath(url: string) {
    this._history[this._historyIndex].path = url;
  }

  setBaseHref(url: string) {
    this._baseHref = url;
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

  go(path: string, query: string = '', state: any = null) {
    path = this.prepareExternalUrl(path);

    if (this._historyIndex > 0) {
      this._history.splice(this._historyIndex + 1);
    }
    this._history.push(new LocationState(path, query, state));
    this._historyIndex = this._history.length - 1;

    const locationState = this._history[this._historyIndex - 1];
    if (locationState.path == path && locationState.query == query) {
      return;
    }

    const url = path + (query.length > 0 ? ('?' + query) : '');
    this.urlChanges.push(url);
    this._subject.emit({'url': url, 'pop': false});
  }

  replaceState(path: string, query: string = '', state: any = null) {
    path = this.prepareExternalUrl(path);

    const history = this._history[this._historyIndex];
    if (history.path == path && history.query == query) {
      return;
    }

    history.path = path;
    history.query = query;
    history.state = state;

    const url = path + (query.length > 0 ? ('?' + query) : '');
    this.urlChanges.push('replace: ' + url);
  }

  forward() {
    if (this._historyIndex < (this._history.length - 1)) {
      this._historyIndex++;
      this._subject.emit({'url': this.path(), 'state': this.getState(), 'pop': true});
    }
  }

  back() {
    if (this._historyIndex > 0) {
      this._historyIndex--;
      this._subject.emit({'url': this.path(), 'state': this.getState(), 'pop': true});
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

  onUrlChange(fn: (url: string, state: unknown) => void) {
    this._urlChangeListeners.push(fn);

    if (!this._urlChangeSubscription) {
      this._urlChangeSubscription = this.subscribe(v => {
        this._notifyUrlChangeListeners(v.url, v.state);
      });
    }
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
}

class LocationState {
  constructor(public path: string, public query: string, public state: any) {}
}
