import {bind, Binding, Injector, OpaqueToken} from 'angular2/di';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

import {MeasureValues} from '../measure_values';
import {Reporter} from '../reporter';

export class MultiReporter extends Reporter {
  static createBindings(childTokens: List<any>): List<Binding> {
    return [
      bind(_CHILDREN)
          .toAsyncFactory((injector) => PromiseWrapper.all(
                              ListWrapper.map(childTokens, (token) => injector.asyncGet(token))),
                          [Injector]),
      bind(MultiReporter).toFactory((children) => new MultiReporter(children), [_CHILDREN])
    ];
  }

  _reporters: List<Reporter>;

  constructor(reporters) {
    super();
    this._reporters = reporters;
  }

  reportMeasureValues(values: MeasureValues): Promise<List<any>> {
    return PromiseWrapper.all(
        ListWrapper.map(this._reporters, (reporter) => reporter.reportMeasureValues(values)));
  }

  reportSample(completeSample: List<MeasureValues>,
               validSample: List<MeasureValues>): Promise<List<any>> {
    return PromiseWrapper.all(ListWrapper.map(
        this._reporters, (reporter) => reporter.reportSample(completeSample, validSample)));
  }
}

var _CHILDREN = new OpaqueToken('MultiReporter.children');
