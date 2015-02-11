import { Injector, bind } from 'angular2/di';
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { List, ListWrapper } from 'angular2/src/facade/collection';
import { Promise } from 'angular2/src/facade/async';

import { Sampler, SampleState } from './sampler';
import { ConsoleReporter } from './reporter/console_reporter';
import { RegressionSlopeValidator } from './validator/regression_slope_validator';
import { PerflogMetric } from './metric/perflog_metric';
import { ChromeDriverExtension } from './webdriver/chrome_driver_extension';
import { SampleDescription } from './sample_description';

import { Options } from './sample_options';

/**
 * The Runner is the main entry point for executing a sample run.
 * It provides defaults, creates the injector and calls the sampler.
 */
export class Runner {
  _defaultBindings:List;

  constructor(defaultBindings:List = null) {
    if (isBlank(defaultBindings)) {
      defaultBindings = [];
    }
    this._defaultBindings = defaultBindings;
  }

  sample({id, execute, prepare, bindings}):Promise<SampleState> {
    var sampleBindings = [
      _DEFAULT_BINDINGS,
      this._defaultBindings,
      bind(Options.SAMPLE_ID).toValue(id),
      bind(Options.EXECUTE).toValue(execute)
    ];
    if (isPresent(prepare)) {
      ListWrapper.push(sampleBindings, bind(Options.PREPARE).toValue(prepare));
    }
    if (isPresent(bindings)) {
      ListWrapper.push(sampleBindings, bindings);
    }
    return new Injector(sampleBindings).asyncGet(Sampler)
      .then( (sampler) => sampler.sample() );
  }
}

var _DEFAULT_BINDINGS = [
  Sampler.BINDINGS,
  ConsoleReporter.BINDINGS,
  RegressionSlopeValidator.BINDINGS,
  ChromeDriverExtension.BINDINGS,
  PerflogMetric.BINDINGS,
  SampleDescription.BINDINGS
];
