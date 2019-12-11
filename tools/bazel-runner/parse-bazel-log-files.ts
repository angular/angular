/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable:no-console
import {createReadStream} from 'fs';
import {createInterface} from 'readline';


// A execution spawned by bazel.
interface SpawnExec {
  commandArgs: string[];
  environmentVariables: {};
  platform: Array < {
    name: string;
    value: string;
  }
  > ;
  inputs: Array < {
    path: string;
    digest: {hash: string; sizeBytes: number; hashFunctionName: string;}
  }
  > ;
  listedOutputs: string[];
  remotable: Boolean;
  cacheable: Boolean;
  timeoutMillis: number;
  progressMessage: string;
  mnemonic: string;
  actualOutputs: string[];
  runner: string;
  remoteCacheHit: boolean;
  status: string;
  exitCode: number;
}


/**
 * Parse the execution log line by line, as it is often too large to load the entire
 * json file at once in node.
 */
async function parseExecutionLog(logFile: string):
    Promise<SpawnExec[]> {
      return new Promise((resolve, reject) => {
        const spawnExecs: SpawnExec[] = [];
        let spawnExecString = '';

        const lineReader = createInterface({
          input: createReadStream(logFile),
        });

        lineReader.on('line', (line: string) => {
          if (line.includes('}{')) {
            spawnExecString += line.split('}{')[0] + '}';
            spawnExecs.push(JSON.parse(spawnExecString));
            spawnExecString = '{' + line.split('}{')[1];
            return;
          }
          spawnExecString += line;
        });

        lineReader.on('close', () => {
          try {
            spawnExecs.push(JSON.parse(spawnExecString));
          } catch (err) {
          }
          resolve(spawnExecs);
        });
      });
    }

/**
 * Parse the explain log line by line, in case it becomes too large to load the entire
 * file at once in node.
 */
async function parseExplainLog(logFile: string):
    Promise<string[]> {
      return new Promise((resolve, reject) => {
        const explainLines: string[] = [];

        const lineReader = createInterface({
          input: createReadStream(logFile),
        });

        lineReader.on('line', (line: string) => {
          if (line.startsWith('Executing action')) {
            explainLines.push(line);
          }
        });

        lineReader.on('close', () => { resolve(explainLines); });
      });
    }

/**
 * Process the parsed logs to print diagnostic information about the bazel run.
 */
function processParsedLogs(spawnExecs: SpawnExec[], explainLogs: string[]) {
  let cachable = 0;
  let remotable = 0;
  let remoteCacheHit = 0;
  const explainOnlyLogs = explainLogs.length - spawnExecs.length;
  const mnemonicByRunnerMap = new Map<string, Map<string, number>>();
  spawnExecs.forEach(spawn => {
    let mnemonicMap = mnemonicByRunnerMap.get(spawn.runner) || new Map<string, number>();
    mnemonicMap.set(spawn.mnemonic, ((mnemonicMap.get(spawn.mnemonic) || 0) + 1));
    mnemonicByRunnerMap.set(spawn.runner, mnemonicMap);
    cachable += spawn.cacheable ? 1 : 0;
    remotable += spawn.remotable ? 1 : 0;
    remoteCacheHit += spawn.remoteCacheHit ? 1 : 0;
  });

  console.log(`     \x1b[1m${spawnExecs.length}\x1b[0m total actions logged to execution log`);
  console.log(`     \x1b[1m${explainLogs.length}\x1b[0m total actions logged to explain log`);
  console.log();
  console.log();
  console.log(
      `${(explainOnlyLogs/explainLogs.length*100).toFixed(3)}% of actions only appear in explain log`);
  console.log();
  console.log();
  if (!spawnExecs.length) {
    console.log('No details available as no actions were found in the execution log');
    return;
  }
  console.log(`┌────────────────────────────────────┐`);
  console.log(`│ Details from execution log actions │`);
  console.log(`└────────────────────────────────────┘`);
  console.log(`\x1b[1mAction Count:\x1b[0m`);
  console.log(
      `  Cachable: \x1b[1m${cachable}\x1b[0m (${(cachable/spawnExecs.length*100).toFixed(3)}%)`);
  console.log(
      `  Remotable: \x1b[1m${remotable}\x1b[0m (${(remotable/spawnExecs.length*100).toFixed(3)}%)`);
  console.log(
      `  Cache Hits: \x1b[1m${remoteCacheHit}\x1b[0m (${(remoteCacheHit/spawnExecs.length*100).toFixed(3)}%)`);
  console.log();
  console.log(`\x1b[1mRunner Count:\x1b[0m`);
  mnemonicByRunnerMap.forEach((mnemonicMap, runner) => {
    let count = 0;
    mnemonicMap.forEach((mnemonicCount, _) => count += mnemonicCount);
    console.log(`  ${runner}: ${count}`);
  });
  console.log();
  console.log(`\x1b[1mMnemonic Count by Runner:\x1b[0m`);
  mnemonicByRunnerMap.forEach((mnemonicMap, runner) => {
    console.log(`  ${runner}:`);
    mnemonicMap.forEach((count, mnemonic) => console.log(`    ${mnemonic}: ${count}`));
  });
}

/** Parse the provided log files, and print out diagnostic information. */
export async function parseLogFiles(executionLogFile: string, explainLogFile: string) {
  const spawnExecs = await parseExecutionLog(executionLogFile);
  const explainLogs = await parseExplainLog(explainLogFile);

  processParsedLogs(spawnExecs, explainLogs);
}
