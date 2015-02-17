import {
  Promise, PromiseWrapper
} from 'angular2/src/facade/async';
import {
  ABSTRACT, BaseException
} from 'angular2/src/facade/lang';

/**
 * A reporter reports measure values and the valid sample.
 */
@ABSTRACT()
export class Reporter {
  reportMeasureValues(index:number, values:any):Promise {
    throw new BaseException('NYI');
  }

  reportSample(completeSample:List, validSample:List):Promise {
    throw new BaseException('NYI');
  }
}
