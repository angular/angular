/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export {verifyNoBrowserErrors} from './e2e_util';

const yargs = require('yargs');
const nodeUuid = require('node-uuid');
import * as fs from 'fs-extra';

import {SeleniumWebDriverAdapter, Options, JsonFileReporter, Validator, RegressionSlopeValidator, ConsoleReporter, SizeValidator, MultiReporter, MultiMetric, Runner, Provider} from '@angular/benchpress';
import {readCommandLine as readE2eCommandLine, openBrowser} from './e2e_util';

let cmdArgs: {'sample-size': number, 'force-gc': boolean, 'dryrun': boolean, 'bundles': boolean};
let runner: Runner;

export function readCommandLine() {
  cmdArgs = <any>readE2eCommandLine({
    'sample-size': {describe: 'Used for perf: sample size.', default: 20},
    'force-gc': {describe: 'Used for perf: force gc.', default: false, type: 'boolean'},
    'dryrun': {describe: 'If true, only run performance benchmarks once.', default: false},
    'bundles': {describe: 'Whether to use the angular bundles or not.', default: false}
  });
  runner = createBenchpressRunner();
}

export function runBenchmark(config: {
  id: string,
  url: string,
  params: {name: string, value: any}[],
  ignoreBrowserSynchronization?: boolean,
  microMetrics?: {[key: string]: string},
  work?: () => void,
  prepare?: () => void,
}): Promise<any> {
  openBrowser(config);

  var description: {[key: string]: any} = {'bundles': cmdArgs.bundles};
  config.params.forEach((param) => { description[param.name] = param.value; });
  return runner.sample({
    id: config.id,
    execute: config.work,
    prepare: config.prepare,
    microMetrics: config.microMetrics,
    providers: [{provide: Options.SAMPLE_DESCRIPTION, useValue: description}]
  });
}

function createBenchpressRunner(): Runner {
  let runId = nodeUuid.v1();
  if (process.env.GIT_SHA) {
    runId = process.env.GIT_SHA + ' ' + runId;
  }
  const resultsFolder = './dist/benchmark_results';
  fs.ensureDirSync(resultsFolder);
  let providers: Provider[] = [
    SeleniumWebDriverAdapter.PROTRACTOR_PROVIDERS,
    {provide: Options.FORCE_GC, useValue: cmdArgs['force-gc']},
    {provide: Options.DEFAULT_DESCRIPTION, useValue: {'runId': runId}}, JsonFileReporter.PROVIDERS,
    {provide: JsonFileReporter.PATH, useValue: resultsFolder}
  ];
  if (!cmdArgs['dryrun']) {
    providers.push({provide: Validator, useExisting: RegressionSlopeValidator});
    providers.push(
        {provide: RegressionSlopeValidator.SAMPLE_SIZE, useValue: cmdArgs['sample-size']});
    providers.push(MultiReporter.provideWith([ConsoleReporter, JsonFileReporter]));
  } else {
    providers.push({provide: Validator, useExisting: SizeValidator});
    providers.push({provide: SizeValidator.SAMPLE_SIZE, useValue: 1});
    providers.push(MultiReporter.provideWith([]));
    providers.push(MultiMetric.provideWith([]));
  }
  return new Runner(providers);
}
