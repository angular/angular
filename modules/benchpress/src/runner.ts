import {Injector, bind, Binding} from 'angular2/di';
import {isPresent, isBlank} from 'angular2/src/core/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';

import {Sampler, SampleState} from './sampler';
import {ConsoleReporter} from './reporter/console_reporter';
import {MultiReporter} from './reporter/multi_reporter';
import {RegressionSlopeValidator} from './validator/regression_slope_validator';
import {SizeValidator} from './validator/size_validator';
import {Validator} from './validator';
import {PerflogMetric} from './metric/perflog_metric';
import {MultiMetric} from './metric/multi_metric';
import {ChromeDriverExtension} from './webdriver/chrome_driver_extension';
import {FirefoxDriverExtension} from './webdriver/firefox_driver_extension';
import {IOsDriverExtension} from './webdriver/ios_driver_extension';
import {WebDriverExtension} from './web_driver_extension';
import {SampleDescription} from './sample_description';
import {WebDriverAdapter} from './web_driver_adapter';
import {Reporter} from './reporter';
import {Metric} from './metric';
import {Options} from './common_options';

/**
 * The Runner is the main entry point for executing a sample run.
 * It provides defaults, creates the injector and calls the sampler.
 */
export class Runner {
  private _defaultBindings: Binding[];
  constructor(defaultBindings: Binding[] = null) {
    if (isBlank(defaultBindings)) {
      defaultBindings = [];
    }
    this._defaultBindings = defaultBindings;
  }

  sample({id, execute, prepare, microMetrics, bindings}): Promise<SampleState> {
    var sampleBindings = [
      _DEFAULT_BINDINGS,
      this._defaultBindings,
      bind(Options.SAMPLE_ID).toValue(id),
      bind(Options.EXECUTE).toValue(execute)
    ];
    if (isPresent(prepare)) {
      sampleBindings.push(bind(Options.PREPARE).toValue(prepare));
    }
    if (isPresent(microMetrics)) {
      sampleBindings.push(bind(Options.MICRO_METRICS).toValue(microMetrics));
    }
    if (isPresent(bindings)) {
      sampleBindings.push(bindings);
    }

    var inj = Injector.resolveAndCreate(sampleBindings);
    var adapter = inj.get(WebDriverAdapter);

    return PromiseWrapper
        .all([adapter.capabilities(), adapter.executeScript('return window.navigator.userAgent;')])
        .then((args) => {
          var capabilities = args[0];
          var userAgent = args[1];

          // This might still create instances twice. We are creating a new injector with all the
          // bindings.
          // Only WebDriverAdapter is reused.
          // TODO vsavkin consider changing it when toAsyncFactory is added back or when child
          // injectors are handled better.
          var injector = Injector.resolveAndCreate([
            sampleBindings,
            bind(Options.CAPABILITIES).toValue(capabilities),
            bind(Options.USER_AGENT).toValue(userAgent),
            bind(WebDriverAdapter).toValue(adapter)
          ]);

          var sampler = injector.get(Sampler);
          return sampler.sample();
        });
  }
}

var _DEFAULT_BINDINGS = [
  Options.DEFAULT_BINDINGS,
  Sampler.BINDINGS,
  ConsoleReporter.BINDINGS,
  RegressionSlopeValidator.BINDINGS,
  SizeValidator.BINDINGS,
  ChromeDriverExtension.BINDINGS,
  FirefoxDriverExtension.BINDINGS,
  IOsDriverExtension.BINDINGS,
  PerflogMetric.BINDINGS,
  SampleDescription.BINDINGS,
  MultiReporter.createBindings([ConsoleReporter]),
  MultiMetric.createBindings([PerflogMetric]),

  Reporter.bindTo(MultiReporter),
  Validator.bindTo(RegressionSlopeValidator),
  WebDriverExtension.bindTo([ChromeDriverExtension, FirefoxDriverExtension, IOsDriverExtension]),
  Metric.bindTo(MultiMetric),
];
