/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {EventEmitter, Injectable, OnDestroy} from '@angular/core';

@Injectable()
export class DevAppDirectionality implements Directionality, OnDestroy {
  readonly change = new EventEmitter<Direction>();

  get value(): Direction {
    return this._value;
  }
  set value(value: Direction) {
    this._value = value;
    this.change.next(value);
  }
  private _value: Direction = 'ltr';

  ngOnDestroy() {
    this.change.complete();
  }
}
