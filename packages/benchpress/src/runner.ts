/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, StaticProvider} from '@angular/core';

import {Options} from './common_options.js';
import {Metric} from './metric.js';
import {MultiMetric} from './metric/multi_metric.js';
import {PerflogMetric} from './metric/perflog_metric.js';
import {UserMetric} from './metric/user_metric.js';
import {Reporter} from './reporter.js';
import {ConsoleReporter} from './reporter/console_reporter.js';
import {MultiReporter} from './reporter/multi_reporter.js';
import {SampleDescription} from './sample_description.js';
import {Sampler, SampleState} from './sampler.js';
import {Validator} from './validator.js';
import {RegressionSlopeValidator} from './validator/regression_slope_validator.js';
import {SizeValidator} from './validator/size_validator.js';
import {WebDriverAdapter} from './web_driver_adapter.js';
import {WebDriverExtension} from './web_driver_extension.js';
import {ChromeDriverExtension} from './webdriver/chrome_driver_extension.js';
import {FirefoxDriverExtension} from './webdriver/firefox_driver_extension.js';
import {IOsDriverExtension} from './webdriver/ios_driver_extension.js';



/**
 * The Runner is the main entry point for executing a sample run.
 * It provides defaults, creates the injector and calls the sampler.
 */
export class Runner {
  constructor(private _defaultProviders: StaticProvider[] = []) {}

  sample({id, execute, prepare, microMetrics, providers, userMetrics}: {
    id: string,
    execute?: Function,
    prepare?: Function,
    microMetrics?: {[key: string]: string},
    providers?: StaticProvider[],
    userMetrics?: {[key: string]: string}
  }): Promise<SampleState> {
    const sampleProviders: StaticProvider[] = [
      _DEFAULT_PROVIDERS, this._defaultProviders, {provide: Options.SAMPLE_ID, useValue: id},
      {provide: Options.EXECUTE, useValue: execute}
    ];
    if (prepare != null) {
      sampleProviders.push({provide: Options.PREPARE, useValue: prepare});
    }
    if (microMetrics != null) {
      sampleProviders.push({provide: Options.MICRO_METRICS, useValue: microMetrics});
    }
    if (userMetrics != null) {
      sampleProviders.push({provide: Options.USER_METRICS, useValue: userMetrics});
    }
    if (providers != null) {
      sampleProviders.push(providers);
    }

    const inj = Injector.create(sampleProviders);
    const adapter: WebDriverAdapter = inj.get(WebDriverAdapter);

    return Promise
        .all([adapter.capabilities(), adapter.executeScript('return window.navigator.userAgent;')])
        .then((args) => {
          const capabilities = args[0];
          const userAgent = args[1];

          // This might still create instances twice. We are creating a new injector with all the
          // providers.
          // Only WebDriverAdapter is reused.
          // TODO(vsavkin): consider changing it when toAsyncFactory is added back or when child
          // injectors are handled better.
          const injector = Injector.create([
            sampleProviders, {provide: Options.CAPABILITIES, useValue: capabilities},
            {provide: Options.USER_AGENT, useValue: userAgent},
            {provide: WebDriverAdapter, useValue: adapter}
          ]);

          // TODO: With TypeScript 2.5 injector.get does not infer correctly the
          // return type. Remove 'any' and investigate the issue.
          const sampler = injector.get(Sampler) as any;
          return sampler.sample();
        });
  }
}

const _DEFAULT_PROVIDERS = [
  Options.DEFAULT_PROVIDERS,
  Sampler.PROVIDERS,
  ConsoleReporter.PROVIDERS,
  RegressionSlopeValidator.PROVIDERS,
  SizeValidator.PROVIDERS,
  ChromeDriverExtension.PROVIDERS,
  FirefoxDriverExtension.PROVIDERS,
  IOsDriverExtension.PROVIDERS,
  PerflogMetric.PROVIDERS,
  UserMetric.PROVIDERS,
  SampleDescription.PROVIDERS,
  MultiReporter.provideWith([ConsoleReporter]),
  MultiMetric.provideWith([PerflogMetric, UserMetric]),
  {provide: Reporter, useExisting: MultiReporter},
  {provide: Validator, useExisting: RegressionSlopeValidator},
  WebDriverExtension.provideFirstSupported(
      [ChromeDriverExtension, FirefoxDriverExtension, IOsDriverExtension]),
  {provide: Metric, useExisting: MultiMetric},
];
