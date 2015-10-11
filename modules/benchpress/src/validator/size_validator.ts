import {ListWrapper} from 'angular2/src/core/facade/collection';
import {bind, provide, Provider, OpaqueToken} from 'angular2/src/core/di';

import {Validator} from '../validator';
import {MeasureValues} from '../measure_values';

/**
 * A validator that waits for the sample to have a certain size.
 */
export class SizeValidator extends Validator {
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS(): Provider[] { return _PROVIDERS; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get SAMPLE_SIZE() { return _SAMPLE_SIZE; }

  _sampleSize: number;

  constructor(size) {
    super();
    this._sampleSize = size;
  }

  describe(): {[key: string]: any} { return {'sampleSize': this._sampleSize}; }

  validate(completeSample: MeasureValues[]): MeasureValues[] {
    if (completeSample.length >= this._sampleSize) {
      return ListWrapper.slice(completeSample, completeSample.length - this._sampleSize,
                               completeSample.length);
    } else {
      return null;
    }
  }
}

var _SAMPLE_SIZE = new OpaqueToken('SizeValidator.sampleSize');
var _PROVIDERS = [
  bind(SizeValidator)
      .toFactory((size) => new SizeValidator(size), [_SAMPLE_SIZE]),
  provide(_SAMPLE_SIZE, {asValue: 10})
];
