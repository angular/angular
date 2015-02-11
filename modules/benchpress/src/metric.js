import {
  Promise, PromiseWrapper
} from 'angular2/src/facade/async';
import {
  ABSTRACT, BaseException
} from 'angular2/src/facade/lang';

/**
 * A metric is measures values
 */
@ABSTRACT()
export class Metric {
  /**
   * Starts measuring
   */
  beginMeasure():Promise {
    throw new BaseException('NYI');
  }

  /**
   * Ends measuring and reports the data
   * since the begin call.
   * @param restart: Whether to restart right after this.
   */
  endMeasure(restart:boolean):Promise<any> {
    throw new BaseException('NYI');
  }

  /**
   * Describes the metrics provided by this metric implementation.
   * (e.g. units, ...)
   */
  describe():any {
    throw new BaseException('NYI');
  }
}
