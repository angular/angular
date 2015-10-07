import {StringMapWrapper} from 'angular2/src/core/facade/collection';
import {bind, Binding, OpaqueToken} from 'angular2/src/core/di';
import {Validator} from './validator';
import {Metric} from './metric';
import {Options} from './common_options';

/**
 * SampleDescription merges all available descriptions about a sample
 */
export class SampleDescription {
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS(): Binding[] { return _BINDINGS; }
  description: {[key: string]: any};

  constructor(public id: string, descriptions: Array<{[key: string]: any}>,
              public metrics: {[key: string]: any}) {
    this.description = {};
    descriptions.forEach(description => {
      StringMapWrapper.forEach(description, (value, prop) => this.description[prop] = value);
    });
  }

  toJson() { return {'id': this.id, 'description': this.description, 'metrics': this.metrics}; }
}

var _BINDINGS = [
  bind(SampleDescription)
      .toFactory((metric, id, forceGc, userAgent, validator, defaultDesc, userDesc) =>
                     new SampleDescription(id,
                                           [
                                             {'forceGc': forceGc, 'userAgent': userAgent},
                                             validator.describe(),
                                             defaultDesc,
                                             userDesc
                                           ],
                                           metric.describe()),
                 [
                   Metric,
                   Options.SAMPLE_ID,
                   Options.FORCE_GC,
                   Options.USER_AGENT,
                   Validator,
                   Options.DEFAULT_DESCRIPTION,
                   Options.SAMPLE_DESCRIPTION
                 ])
];
