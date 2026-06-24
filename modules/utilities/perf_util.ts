/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {randomUUID} from 'node:crypto';
export {verifyNoBrowserErrors} from './e2e_util';

// @ts-ignore
import type * as benchpress from '@angular/benchpress';
import {openBrowser} from './e2e_util';

// Note: Keep the `modules/benchmarks/README.md` file in sync with the supported options.
const globalOptions = {
  sampleSize: process.env.PERF_SAMPLE_SIZE || 20,
  forceGc: process.env.PERF_FORCE_GC === 'true',
  dryRun: process.env.PERF_DRYRUN === 'true',
};

type BenchpressSetup = {
  runner: benchpress.Runner;
  module: typeof benchpress;
};

let _cachedBenchpressSetup: Promise<BenchpressSetup> | null = null;

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
  id: string;
  url?: string;
  params?: {name: string; value: any}[];
  ignoreBrowserSynchronization?: boolean;
  microMetrics?: {[key: string]: string};
  work?: (() => void) | (() => Promise<unknown>);
  prepare?: (() => void) | (() => Promise<unknown>);
  setup?: (() => void) | (() => Promise<unknown>);
}): Promise<any> {
  if (_cachedBenchpressSetup === null) {
    _cachedBenchpressSetup = _prepareBenchpressSetup();
  }

  // Wait for the benchpress setup to complete initialization.
  // The benchpress setup is loaded asynchronously due to it relying on ESM.
  // TODO: This can be removed when benchmark tests/e2e tests can run with ESM.
  const {module, runner} = await _cachedBenchpressSetup;

  openBrowser({url, params, ignoreBrowserSynchronization});
  if (setup) {
    await setup();
  }
  return runner.sample({
    id,
    execute: work,
    prepare,
    microMetrics,
    providers: [{provide: module.Options.SAMPLE_DESCRIPTION, useValue: {}}],
  });
}

async function _prepareBenchpressSetup(): Promise<BenchpressSetup> {
  const module = await loadBenchpressModule();
  const {
    SeleniumWebDriverAdapter,
    Options,
    JsonFileReporter,
    RegressionSlopeValidator,
    Validator,
    MultiReporter,
    ConsoleReporter,
    SizeValidator,
    MultiMetric,
    Runner,
  } = module;

  let runId = randomUUID();
  if (process.env.GIT_SHA) {
    runId = process.env.GIT_SHA + ' ' + runId;
  }

  const testOutputDirectory = process.env.TEST_UNDECLARED_OUTPUTS_DIR;

  if (testOutputDirectory === undefined) {
    throw new Error(
      'Unexpected execution outside of a Bazel test. ' +
        'Missing `TEST_UNDECLARED_OUTPUTS_DIR` environment variable.',
    );
  }

  const providers: benchpress.StaticProvider[] = [
    SeleniumWebDriverAdapter.PROTRACTOR_PROVIDERS,
    {provide: Options.FORCE_GC, useValue: globalOptions.forceGc},
    {provide: Options.DEFAULT_DESCRIPTION, useValue: {'runId': runId}},
    JsonFileReporter.PROVIDERS,
    {provide: JsonFileReporter.PATH, useValue: testOutputDirectory},
  ];
  if (!globalOptions.dryRun) {
    providers.push({provide: Validator, useExisting: RegressionSlopeValidator});
    providers.push({
      provide: RegressionSlopeValidator.SAMPLE_SIZE,
      useValue: globalOptions.sampleSize,
    });
    providers.push(MultiReporter.provideWith([ConsoleReporter, JsonFileReporter]));
  } else {
    providers.push({provide: Validator, useExisting: SizeValidator});
    providers.push({provide: SizeValidator.SAMPLE_SIZE, useValue: 1});
    providers.push(MultiReporter.provideWith([]));
    providers.push(MultiMetric.provideWith([]));
  }

  return {
    runner: new Runner(providers),
    module,
  };
}

/** Loads the benchpress module through a CJS/ESM interop. */
async function loadBenchpressModule(): Promise<typeof benchpress> {
  return await new Function(`return import('@angular/benchpress');`)();
}
