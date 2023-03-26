/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, StaticProvider} from '@angular/core';

import {Options} from './common_options';
import {Metric} from './metric';
import {MultiMetric} from './metric/multi_metric';
import {PerflogMetric} from './metric/perflog_metric';
import {UserMetric} from './metric/user_metric';
import {Reporter} from './reporter';
import {ConsoleReporter} from './reporter/console_reporter';
import {MultiReporter} from './reporter/multi_reporter';
import {SampleDescription} from './sample_description';
import {Sampler, SampleState} from './sampler';
import {Validator} from './validator';
import {RegressionSlopeValidator} from './validator/regression_slope_validator';
import {SizeValidator} from './validator/size_validator';
import {WebDriverAdapter} from './web_driver_adapter';
import {WebDriverExtension} from './web_driver_extension';
import {ChromeDriverExtension} from './webdriver/chrome_driver_extension';
import {FirefoxDriverExtension} from './webdriver/firefox_driver_extension';
import {IOsDriverExtension} from './webdriver/ios_driver_extension';



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

    const inj = Injector.create({providers: sampleProviders});
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
          const injector = Injector.create({
            providers: [
              sampleProviders, {provide: Options.CAPABILITIES, useValue: capabilities},
              {provide: Options.USER_AGENT, useValue: userAgent},
              {provide: WebDriverAdapter, useValue: adapter}
            ]
          });

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
