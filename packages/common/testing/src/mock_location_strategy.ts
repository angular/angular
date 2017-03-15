/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationStrategy} from '@angular/common';
import {EventEmitter, Injectable} from '@angular/core';



/**
 * A mock implementation of {@link LocationStrategy} that allows tests to fire simulated
 * location events.
 *
 * @stable
 */
@Injectable()
export class MockLocationStrategy extends LocationStrategy {
  internalBaseHref: string = '/';
  internalPath: string = '/';
  internalTitle: string = '';
  urlChanges: string[] = [];
  /** @internal */
  _subject: EventEmitter<any> = new EventEmitter();
  constructor() { super(); }

  simulatePopState(url: string): void {
    this.internalPath = url;
    this._subject.emit(new _MockPopStateEvent(this.path()));
  }

  path(includeHash: boolean = false): string { return this.internalPath; }

  prepareExternalUrl(internal: string): string {
    if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
      return this.internalBaseHref + internal.substring(1);
    }
    return this.internalBaseHref + internal;
  }

  pushState(ctx: any, title: string, path: string, query: string): void {
    this.internalTitle = title;

    const url = path + (query.length > 0 ? ('?' + query) : '');
    this.internalPath = url;

    const externalUrl = this.prepareExternalUrl(url);
    this.urlChanges.push(externalUrl);
  }

  replaceState(ctx: any, title: string, path: string, query: string): void {
    this.internalTitle = title;

    const url = path + (query.length > 0 ? ('?' + query) : '');
    this.internalPath = url;

    const externalUrl = this.prepareExternalUrl(url);
    this.urlChanges.push('replace: ' + externalUrl);
  }

  onPopState(fn: (value: any) => void): void { this._subject.subscribe({next: fn}); }

  getBaseHref(): string { return this.internalBaseHref; }

  back(): void {
    if (this.urlChanges.length > 0) {
      this.urlChanges.pop();
      const nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
      this.simulatePopState(nextUrl);
    }
  }

  forward(): void { throw 'not implemented'; }
}

class _MockPopStateEvent {
  pop: boolean = true;
  type: string = 'popstate';
  constructor(public newUrl: string) {}
}
