/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */
import {ConsoleReporter, JsonFileReporter, MultiMetric, MultiReporter, Options, RegressionSlopeValidator, Runner, SeleniumWebDriverAdapter, SizeValidator, StaticProvider, Validator} from '@angular/benchpress';
import * as fs from 'fs-extra';
import {browser} from 'protractor';
import * as webdriver from 'selenium-webdriver';

const nodeUuid = require('node-uuid');

declare var expect: any;

// Note: openBrowser, runBenchmark, and verifyNoBrowserErrors must be exported
// from the same file to match the Google-internal API.

// Note: Keep the `modules/benchmarks/README.md` file in sync with the supported options.
const globalOptions = {
  sampleSize: process.env.PERF_SAMPLE_SIZE || 20,
  forceGc: process.env.PERF_FORCE_GC === 'true',
  dryRun: process.env.PERF_DRYRUN === 'true',
};

const runner = createBenchpressRunner();

export function runBenchmark(config: {
  id: string,
  url: string,
  params: {name: string, value: any}[],
  ignoreBrowserSynchronization?: boolean,
  microMetrics?: {[key: string]: string},
  work?: () => void,
  prepare?: () => void,
  setup?: () => void
}): Promise<any> {
  openBrowser(config);
  if (config.setup) {
    config.setup();
  }
  const description: {[key: string]: any} = {};
  config.params.forEach((param) => description[param.name] = param.value);
  return runner.sample({
    id: config.id,
    execute: config.work,
    prepare: config.prepare,
    microMetrics: config.microMetrics,
    providers: [{provide: Options.SAMPLE_DESCRIPTION, useValue: {}}]
  });
}

function createBenchpressRunner(): Runner {
  let runId = nodeUuid.v1();
  if (process.env.GIT_SHA) {
    runId = process.env.GIT_SHA + ' ' + runId;
  }
  const resultsFolder = './dist/benchmark_results';
  fs.ensureDirSync(resultsFolder);
  const providers: StaticProvider[] = [
    SeleniumWebDriverAdapter.PROTRACTOR_PROVIDERS,
    {provide: Options.FORCE_GC, useValue: globalOptions.forceGc},
    {provide: Options.DEFAULT_DESCRIPTION, useValue: {'runId': runId}}, JsonFileReporter.PROVIDERS,
    {provide: JsonFileReporter.PATH, useValue: resultsFolder}
  ];
  if (!globalOptions.dryRun) {
    providers.push({provide: Validator, useExisting: RegressionSlopeValidator});
    providers.push(
        {provide: RegressionSlopeValidator.SAMPLE_SIZE, useValue: globalOptions.sampleSize});
    providers.push(MultiReporter.provideWith([ConsoleReporter, JsonFileReporter]));
  } else {
    providers.push({provide: Validator, useExisting: SizeValidator});
    providers.push({provide: SizeValidator.SAMPLE_SIZE, useValue: 1});
    providers.push(MultiReporter.provideWith([]));
    providers.push(MultiMetric.provideWith([]));
  }
  return new Runner(providers);
}

export function openBrowser(config: {
  url: string,
  params?: {name: string, value: any}[],
  ignoreBrowserSynchronization?: boolean
}) {
  if (config.ignoreBrowserSynchronization) {
    browser.ignoreSynchronization = true;
  }
  const urlParams: string[] = [];
  if (config.params) {
    config.params.forEach((param) => urlParams.push(param.name + '=' + param.value));
  }
  const url = encodeURI(config.url + '?' + urlParams.join('&'));
  browser.get(url);
  if (config.ignoreBrowserSynchronization) {
    browser.sleep(2000);
  }
}

/**
 * @experimental This API will be moved to Protractor.
 */
export function verifyNoBrowserErrors() {
  // TODO(tbosch): Bug in ChromeDriver: Need to execute at least one command
  // so that the browser logs can be read out!
  browser.executeScript('1+1');
  browser.manage().logs().get('browser').then(function(browserLog: any) {
    const filteredLog = browserLog.filter(function(logEntry: any) {
      if (logEntry.level.value >= webdriver.logging.Level.INFO.value) {
        console.log('>> ' + logEntry.message);
      }
      return logEntry.level.value > webdriver.logging.Level.WARNING.value;
    });
    expect(filteredLog).toEqual([]);
  });
}
