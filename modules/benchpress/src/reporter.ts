import {bind, provide, Provider} from 'angular2/src/core/di';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {MeasureValues} from './measure_values';

/**
 * A reporter reports measure values and the valid sample.
 */
export abstract class Reporter {
  static bindTo(delegateToken): Provider[] {
    return [bind(Reporter).toFactory((delegate) => delegate, [delegateToken])];
  }

  reportMeasureValues(values: MeasureValues): Promise<any> { throw new BaseException('NYI'); }

  reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]): Promise<any> {
    throw new BaseException('NYI');
  }
}
