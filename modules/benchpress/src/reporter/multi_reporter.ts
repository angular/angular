import {bind, Binding, Injector, OpaqueToken} from 'angular2/di';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';

import {MeasureValues} from '../measure_values';
import {Reporter} from '../reporter';

export class MultiReporter extends Reporter {
  static createBindings(childTokens: any[]): Binding[] {
    return [
      bind(_CHILDREN)
          .toFactory(
              (injector: Injector) => ListWrapper.map(childTokens, (token) => injector.get(token)),
              [Injector]),
      bind(MultiReporter).toFactory(children => new MultiReporter(children), [_CHILDREN])
    ];
  }

  _reporters: Reporter[];

  constructor(reporters) {
    super();
    this._reporters = reporters;
  }

  reportMeasureValues(values: MeasureValues): Promise<any[]> {
    return PromiseWrapper.all(
        ListWrapper.map(this._reporters, (reporter) => reporter.reportMeasureValues(values)));
  }

  reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]): Promise<any[]> {
    return PromiseWrapper.all(ListWrapper.map(
        this._reporters, (reporter) => reporter.reportSample(completeSample, validSample)));
  }
}

var _CHILDREN = new OpaqueToken('MultiReporter.children');
