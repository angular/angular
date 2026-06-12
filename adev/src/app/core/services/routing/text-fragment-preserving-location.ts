/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {inject, Injectable} from '@angular/core';
import {currentTextFragmentUrl, WINDOW} from '@angular/docs';

@Injectable()
export class TextFragmentPreservingLocation extends Location {
  private readonly window = inject(WINDOW, {optional: true});
  // `Location._notifyUrlChangeListeners` is not available through the public
  // @angular/common typings consumed by ADev, so this subclass mirrors registered
  // listeners for the text-fragment preservation path, where it updates
  // `history.state` without delegating to `Location.replaceState`.
  private readonly urlChangeListeners: ((url: string, state: unknown) => void)[] = [];
  private readonly textFragmentUrl = currentTextFragmentUrl(this.window);
  private preserveTextFragment = this.textFragmentUrl !== undefined;

  override onUrlChange(fn: (url: string, state: unknown) => void): VoidFunction {
    const removeUrlChangeListener = super.onUrlChange(fn);

    this.urlChangeListeners.push(fn);

    return () => {
      removeUrlChangeListener();
      const fnIndex = this.urlChangeListeners.indexOf(fn);

      if (fnIndex !== -1) {
        this.urlChangeListeners.splice(fnIndex, 1);
      }
    };
  }

  override replaceState(path: string, query: string = '', state: unknown = null): void {
    if (
      this.preserveTextFragment &&
      this.textFragmentUrl !== undefined &&
      this.isCurrentPathEqualTo(path, query)
    ) {
      this.preserveTextFragment = false;
      this.window?.history.replaceState(state, '');
      this.notifyUrlChangeListeners(
        this.prepareExternalUrl(path + Location.normalizeQueryParams(query)),
        state,
      );
      return;
    }

    this.preserveTextFragment = false;
    super.replaceState(path, query, state);
  }

  private notifyUrlChangeListeners(url: string, state: unknown): void {
    this.urlChangeListeners.forEach((fn) => fn(url, state));
  }
}
