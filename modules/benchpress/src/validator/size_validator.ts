/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OpaqueToken} from '@angular/core/src/di';
import {ListWrapper} from '@angular/facade/src/collection';

import {MeasureValues} from '../measure_values';
import {Validator} from '../validator';


/**
 * A validator that waits for the sample to have a certain size.
 */
export class SizeValidator extends Validator {
  // TODO(tbosch): use static values when our transpiler supports them
  static get PROVIDERS(): any[] { return _PROVIDERS; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get SAMPLE_SIZE() { return _SAMPLE_SIZE; }

  /** @internal */
  private _sampleSize: number;

  constructor(size) {
    super();
    this._sampleSize = size;
  }

  describe(): {[key: string]: any} { return {'sampleSize': this._sampleSize}; }

  validate(completeSample: MeasureValues[]): MeasureValues[] {
    if (completeSample.length >= this._sampleSize) {
      return ListWrapper.slice(
          completeSample, completeSample.length - this._sampleSize, completeSample.length);
    } else {
      return null;
    }
  }
}

var _SAMPLE_SIZE = new OpaqueToken('SizeValidator.sampleSize');
var _PROVIDERS = [
  {provide: SizeValidator, useFactory: (size) => new SizeValidator(size), deps: [_SAMPLE_SIZE]},
  {provide: _SAMPLE_SIZE, useValue: 10}
];
