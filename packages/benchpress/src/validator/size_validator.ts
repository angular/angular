/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Inject, Injectable, InjectionToken} from '@angular/core';

import {MeasureValues} from '../measure_values';
import {Validator} from '../validator';

/**
 * A validator that waits for the sample to have a certain size.
 */
@Injectable()
export class SizeValidator extends Validator {
  static SAMPLE_SIZE = new InjectionToken('SizeValidator.sampleSize');
  static PROVIDERS = [
    {provide: SizeValidator, deps: [SizeValidator.SAMPLE_SIZE]},
    {provide: SizeValidator.SAMPLE_SIZE, useValue: 10},
  ];

  constructor(@Inject(SizeValidator.SAMPLE_SIZE) private _sampleSize: number) {
    super();
  }

  override describe(): {[key: string]: any} {
    return {'sampleSize': this._sampleSize};
  }

  override validate(completeSample: MeasureValues[]): MeasureValues[] | null {
    if (completeSample.length >= this._sampleSize) {
      return completeSample.slice(completeSample.length - this._sampleSize, completeSample.length);
    } else {
      return null;
    }
  }
}
