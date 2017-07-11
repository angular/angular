/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  Output,
  Input,
  EventEmitter
} from '@angular/core';

import {Direction, Directionality} from './directionality';

/**
 * Directive to listen for changes of direction of part of the DOM.
 *
 * Would provide itself in case a component looks for the Directionality service
 */
@Directive({
  selector: '[dir]',
  providers: [{provide: Directionality, useExisting: Dir}],
  host: {'[dir]': 'dir'},
  exportAs: 'dir',
})
export class Dir implements Directionality {
  /** Layout direction of the element. */
  _dir: Direction = 'ltr';

  /** Whether the `value` has been set to its initial value. */
  private _isInitialized: boolean = false;

  /** Event emitted when the direction changes. */
  @Output('dirChange') change = new EventEmitter<void>();

  /** @docs-private */
  @Input('dir')
  get dir(): Direction {
    return this._dir;
  }

  set dir(v: Direction) {
    let old = this._dir;
    this._dir = v;
    if (old !== this._dir && this._isInitialized) {
      this.change.emit();
    }
  }

  /** Current layout direction of the element. */
  get value(): Direction { return this.dir; }

  /** Initialize once default value has been set. */
  ngAfterContentInit() {
    this._isInitialized = true;
  }
}

