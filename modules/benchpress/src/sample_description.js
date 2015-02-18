import { StringMapWrapper, ListWrapper, StringMap } from 'angular2/src/facade/collection';
import { bind, OpaqueToken } from 'angular2/di';
import { Validator } from './validator';
import { Metric } from './metric';
import { Options } from './sample_options';

/**
 * SampleDescription merges all available descriptions about a sample
 */
export class SampleDescription {
  // TODO(tbosch): use static values when our transpiler supports them
  static get BINDINGS() { return _BINDINGS; }

  id:string;
  description:StringMap;
  metrics:StringMap;

  constructor(id, descriptions:List<StringMap>, metrics:StringMap) {
    this.id = id;
    this.metrics = metrics;
    this.description = {};
    ListWrapper.forEach(descriptions, (description) => {
      StringMapWrapper.forEach(description, (value, prop) => this.description[prop] = value );
    });
  }
}

var _BINDINGS = [
  bind(SampleDescription).toFactory(
    (metric, id, forceGc, validator, defaultDesc, userDesc) => new SampleDescription(id,
      [
        {'forceGc': forceGc},
        validator.describe(),
        defaultDesc,
        userDesc
      ],
      metric.describe()),
    [Metric, Options.SAMPLE_ID, Options.FORCE_GC, Validator, Options.DEFAULT_DESCRIPTION, Options.SAMPLE_DESCRIPTION]
  ),
  bind(Options.DEFAULT_DESCRIPTION).toValue({}),
  bind(Options.SAMPLE_DESCRIPTION).toValue({})
];
