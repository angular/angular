import {bind, Binding} from 'angular2/core';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {ABSTRACT, BaseException} from 'angular2/src/core/facade/lang';
import {MeasureValues} from './measure_values';

/**
 * A reporter reports measure values and the valid sample.
 */
@ABSTRACT()
export class Reporter {
  static bindTo(delegateToken): Binding[] {
    return [bind(Reporter).toFactory((delegate) => delegate, [delegateToken])];
  }

  reportMeasureValues(values: MeasureValues): Promise<any> { throw new BaseException('NYI'); }

  reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]): Promise<any> {
    throw new BaseException('NYI');
  }
}
