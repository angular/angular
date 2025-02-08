/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LocationStrategy} from '@angular/common';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

/**
 * A mock implementation of {@link LocationStrategy} that allows tests to fire simulated
 * location events.
 *
 * @publicApi
 */
@Injectable()
export class MockLocationStrategy extends LocationStrategy {
  internalBaseHref: string = '/';
  internalPath: string = '/';
  internalTitle: string = '';
  urlChanges: string[] = [];
  /** @internal */
  _subject = new Subject<_MockPopStateEvent>();
  private stateChanges: any[] = [];
  constructor() {
    super();
  }

  simulatePopState(url: string): void {
    this.internalPath = url;
    this._subject.next(new _MockPopStateEvent(this.path()));
  }

  override path(includeHash: boolean = false): string {
    return this.internalPath;
  }

  override prepareExternalUrl(internal: string): string {
    if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
      return this.internalBaseHref + internal.substring(1);
    }
    return this.internalBaseHref + internal;
  }

  override pushState(ctx: any, title: string, path: string, query: string): void {
    // Add state change to changes array
    this.stateChanges.push(ctx);

    this.internalTitle = title;

    const url = path + (query.length > 0 ? '?' + query : '');
    this.internalPath = url;

    const externalUrl = this.prepareExternalUrl(url);
    this.urlChanges.push(externalUrl);
  }

  override replaceState(ctx: any, title: string, path: string, query: string): void {
    // Reset the last index of stateChanges to the ctx (state) object
    this.stateChanges[(this.stateChanges.length || 1) - 1] = ctx;

    this.internalTitle = title;

    const url = path + (query.length > 0 ? '?' + query : '');
    this.internalPath = url;

    const externalUrl = this.prepareExternalUrl(url);
    this.urlChanges.push('replace: ' + externalUrl);
  }

  override onPopState(fn: (value: any) => void): void {
    this._subject.subscribe({next: fn});
  }

  override getBaseHref(): string {
    return this.internalBaseHref;
  }

  override back(): void {
    if (this.urlChanges.length > 0) {
      this.urlChanges.pop();
      this.stateChanges.pop();
      const nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
      this.simulatePopState(nextUrl);
    }
  }

  override forward(): void {
    throw 'not implemented';
  }

  override getState(): unknown {
    return this.stateChanges[(this.stateChanges.length || 1) - 1];
  }
}

class _MockPopStateEvent {
  pop: boolean = true;
  type: string = 'popstate';
  constructor(public newUrl: string) {}
}
