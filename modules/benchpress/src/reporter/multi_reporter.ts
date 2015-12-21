import {provide, Provider, Injector, OpaqueToken} from 'angular2/src/core/di';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

import {MeasureValues} from '../measure_values';
import {Reporter} from '../reporter';

export class MultiReporter extends Reporter {
  static createProviders(childTokens: any[]): Provider[] {
    return [
      provide(_CHILDREN,
              {
                useFactory: (injector: Injector) => childTokens.map(token => injector.get(token)),
                deps: [Injector]
              }),
      provide(MultiReporter,
              {useFactory: children => new MultiReporter(children), deps: [_CHILDREN]})
    ];
  }

  _reporters: Reporter[];

  constructor(reporters) {
    super();
    this._reporters = reporters;
  }

  reportMeasureValues(values: MeasureValues): Promise<any[]> {
    return PromiseWrapper.all(
        this._reporters.map(reporter => reporter.reportMeasureValues(values)));
  }

  reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]): Promise<any[]> {
    return PromiseWrapper.all(
        this._reporters.map(reporter => reporter.reportSample(completeSample, validSample)));
  }
}

var _CHILDREN = new OpaqueToken('MultiReporter.children');
