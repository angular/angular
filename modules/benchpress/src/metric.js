import { bind } from 'angular2/di';
import {
  Promise, PromiseWrapper
} from 'angular2/src/facade/async';
import {
  ABSTRACT, BaseException
} from 'angular2/src/facade/lang';
import { StringMap } from 'angular2/src/facade/collection';

/**
 * A metric is measures values
 */
@ABSTRACT()
export class Metric {
  static bindTo(delegateToken) {
    return [
      bind(Metric).toFactory(
        (delegate) => delegate, [delegateToken]
      )
    ];
  }

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
  endMeasure(restart:boolean):Promise<StringMap> {
    throw new BaseException('NYI');
  }

  /**
   * Describes the metrics provided by this metric implementation.
   * (e.g. units, ...)
   */
  describe():StringMap {
    throw new BaseException('NYI');
  }
}
