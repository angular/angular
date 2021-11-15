/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Output, Input, EventEmitter, AfterContentInit, OnDestroy} from '@angular/core';

import {Direction, Directionality, _resolveDirectionality} from './directionality';

/**
 * Directive to listen for changes of direction of part of the DOM.
 *
 * Provides itself as Directionality such that descendant directives only need to ever inject
 * Directionality to get the closest direction.
 */
@Directive({
  selector: '[dir]',
  providers: [{provide: Directionality, useExisting: Dir}],
  host: {'[attr.dir]': '_rawDir'},
  exportAs: 'dir',
})
export class Dir implements Directionality, AfterContentInit, OnDestroy {
  /** Normalized direction that accounts for invalid/unsupported values. */
  private _dir: Direction = 'ltr';

  /** Whether the `value` has been set to its initial value. */
  private _isInitialized: boolean = false;

  /** Direction as passed in by the consumer. */
  _rawDir: string;

  /** Event emitted when the direction changes. */
  @Output('dirChange') readonly change = new EventEmitter<Direction>();

  /** @docs-private */
  @Input()
  get dir(): Direction {
    return this._dir;
  }
  set dir(value: Direction | 'auto') {
    const previousValue = this._dir;

    // Note: `_resolveDirectionality` resolves the language based on the browser's language,
    // whereas the browser does it based on the content of the element. Since doing so based
    // on the content can be expensive, for now we're doing the simpler matching.
    this._dir = _resolveDirectionality(value);
    this._rawDir = value;

    if (previousValue !== this._dir && this._isInitialized) {
      this.change.emit(this._dir);
    }
  }

  /** Current layout direction of the element. */
  get value(): Direction {
    return this.dir;
  }

  /** Initialize once default value has been set. */
  ngAfterContentInit() {
    this._isInitialized = true;
  }

  ngOnDestroy() {
    this.change.complete();
  }
}
