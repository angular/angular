import {List, ListWrapper, StringMap} from 'angular2/src/facade/collection';
import {bind, Binding, OpaqueToken} from 'angular2/di';

import {Validator} from '../validator';
import {MeasureValues} from '../measure_values';

/**
 * A validator that waits for the sample to have a certain size.
 */
export class SizeValidator extends Validator {
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS(): List<Binding> { return _BINDINGS; }
  // TODO(tbosch): use static values when our transpiler supports them
  static get SAMPLE_SIZE() { return _SAMPLE_SIZE; }

  _sampleSize: number;

  constructor(size) {
    super();
    this._sampleSize = size;
  }

  describe(): StringMap<string, any> { return {'sampleSize': this._sampleSize}; }

  validate(completeSample: List<MeasureValues>): List<MeasureValues> {
    if (completeSample.length >= this._sampleSize) {
      return ListWrapper.slice(completeSample, completeSample.length - this._sampleSize,
                               completeSample.length);
    } else {
      return null;
    }
  }
}

var _SAMPLE_SIZE = new OpaqueToken('SizeValidator.sampleSize');
var _BINDINGS = [
  bind(SizeValidator)
      .toFactory((size) => new SizeValidator(size), [_SAMPLE_SIZE]),
  bind(_SAMPLE_SIZE).toValue(10)
];
