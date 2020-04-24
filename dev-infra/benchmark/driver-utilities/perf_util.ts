/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export {verifyNoBrowserErrors} from './e2e_util';

const nodeUuid = require('node-uuid');
import * as fs from 'fs-extra';

import {SeleniumWebDriverAdapter, Options, JsonFileReporter, Validator, RegressionSlopeValidator, ConsoleReporter, SizeValidator, MultiReporter, MultiMetric, Runner, StaticProvider} from '@angular/benchpress';
import {openBrowser} from './e2e_util';

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
