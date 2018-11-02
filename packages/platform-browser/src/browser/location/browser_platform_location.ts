/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationChangeListener, PlatformLocation} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

import {getDOM} from '../../dom/dom_adapter';
import {DOCUMENT} from '../../dom/dom_tokens';

import {supportsState} from './history';



/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 */
@Injectable()
export class BrowserPlatformLocation extends PlatformLocation {
  // TODO(issue/24571): remove '!'.
  public readonly location !: Location;
  // TODO(issue/24571): remove '!'.
  private _history !: History;

  constructor(@Inject(DOCUMENT) private _doc: any) {
    super();
    this._init();
  }

  // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it
  /** @internal */
  _init() {
    (this as{location: Location}).location = getDOM().getLocation();
    this._history = getDOM().getHistory();
  }

  getBaseHrefFromDOM(): string { return getDOM().getBaseHref(this._doc) !; }

  onPopState(fn: LocationChangeListener): void {
    getDOM().getGlobalEventTarget(this._doc, 'window').addEventListener('popstate', fn, false);
  }

  onHashChange(fn: LocationChangeListener): void {
    getDOM().getGlobalEventTarget(this._doc, 'window').addEventListener('hashchange', fn, false);
  }

  get pathname(): string { return this.location.pathname; }
  get search(): string { return this.location.search; }
  get hash(): string { return this.location.hash; }
  set pathname(newPath: string) { this.location.pathname = newPath; }

  pushState(state: any, title: string, url: string): void {
    if (supportsState()) {
      this._history.pushState(state, title, url);
    } else {
      this.location.hash = url;
    }
  }

  replaceState(state: any, title: string, url: string): void {
    if (supportsState()) {
      this._history.replaceState(state, title, url);
    } else {
      this.location.hash = url;
    }
  }

  forward(): void { this._history.forward(); }

  back(): void { this._history.back(); }
}
