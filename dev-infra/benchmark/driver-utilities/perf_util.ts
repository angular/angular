/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {mkdirSync} from 'fs';

export {verifyNoBrowserErrors} from './e2e_util';

const nodeUuid = require('node-uuid');

import {SeleniumWebDriverAdapter, Options, JsonFileReporter, Validator, RegressionSlopeValidator, ConsoleReporter, SizeValidator, MultiReporter, MultiMetric, Runner, StaticProvider} from '@angular/benchpress';
import {openBrowser} from './e2e_util';

// Note: Keep the `modules/benchmarks/README.md` file in sync with the supported options.
const globalOptions = {
  sampleSize: process.env.PERF_SAMPLE_SIZE || 20,
  forceGc: process.env.PERF_FORCE_GC === 'true',
  dryRun: process.env.PERF_DRYRUN === 'true',
};

const runner = createBenchpressRunner();

export async function runBenchmark({
  id,
  url = '',
  params = [],
  ignoreBrowserSynchronization = true,
  microMetrics,
  work,
  prepare,
  setup,
}: {
  id: string,
  url?: string,
  params?: {name: string, value: any}[],
  ignoreBrowserSynchronization?: boolean,
  microMetrics?: {[key: string]: string},
  work?: (() => void)|(() => Promise<unknown>),
  prepare?: (() => void)|(() => Promise<unknown>),
  setup?: (() => void)|(() => Promise<unknown>),
}): Promise<any> {
  openBrowser({url, params, ignoreBrowserSynchronization});
  if (setup) {
    await setup();
  }
  return runner.sample({
    id,
    execute: work,
    prepare,
    microMetrics,
    providers: [{provide: Options.SAMPLE_DESCRIPTION, useValue: {}}]
  });
}

function createBenchpressRunner(): Runner {
  let runId = nodeUuid.v1();
  if (process.env.GIT_SHA) {
    runId = process.env.GIT_SHA + ' ' + runId;
  }
  const resultsFolder = './dist/benchmark_results';
  mkdirSync(resultsFolder, {
    recursive: true,
  });
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
