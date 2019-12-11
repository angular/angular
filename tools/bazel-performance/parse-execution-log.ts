"use strict";

const readline = require('readline');
const tty = require('tty');
const fs = require('fs');
const commandLineArgs = require("command-line-args");

interface SpawnExec {
  commandArgs: string[];
  environmentVariables: {};
  platform: Array<{
    name: string;
    value: string;
  }>;
  inputs: Array<{
    path: string;
    digest: {
      hash: string;
      sizeBytes: number;
      hashFunctionName: string;
    }
  }>;
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

type ScriptOptions = {
  log_file: string;
}


const options: ScriptOptions = commandLineArgs([{name: "log_file", type: String}]);

if (!options.log_file) {
  console.error('ERROR: Log file must be provided.')
  process.exit(1);
}

async function run() {
  const spawnExecs: SpawnExec[] = [];
  let spawnExecText = '';

  var lineReader = readline.createInterface({
    input: fs.createReadStream(options.log_file),
  });

  lineReader.on('line', (line: string) => {
    if (line.includes('}{')) {
      spawnExecText += line.split('}{')[0] + '}';
      spawnExecs.push(JSON.parse(spawnExecText));
      spawnExecText = '{' + line.split('}{')[1];
      return
    }
    spawnExecText += line;
  });

  lineReader.on('close', () => {
    try {
      spawnExecs.push(JSON.parse(spawnExecText));
    } catch (err) {}
    processSpawnExecs(spawnExecs);
  });
}

function processSpawnExecs(spawnExecs: SpawnExec[]) {
  let cachable = 0;
  let remotable = 0;
  let remoteCacheHit = 0;
  const mnemonicByRunnerMap = new Map<string, Map<string, number>>();
  spawnExecs.forEach(spawn => {
    let mnemonicMap = mnemonicByRunnerMap.get(spawn.runner) || new Map<string, number>();
    mnemonicMap.set(spawn.mnemonic, ((mnemonicMap.get(spawn.mnemonic) || 0) + 1));
    mnemonicByRunnerMap.set(spawn.runner, mnemonicMap);
    cachable += spawn.cacheable ? 1 : 0;
    remotable += spawn.remotable ? 1 : 0;
    remoteCacheHit += spawn.remoteCacheHit ? 1 : 0;
  });

  console.log(`     \x1b[1m${spawnExecs.length}\x1b[0m total actions`)
  console.log();
  console.log(`\x1b[1mAction Count:\x1b[0m`);
  console.log(`  Cachable: \x1b[1m${cachable}\x1b[0m (${(cachable/spawnExecs.length*100).toFixed(3)}%)`)
  console.log(`  Remotable: \x1b[1m${remotable}\x1b[0m (${(remotable/spawnExecs.length*100).toFixed(3)}%)`)
  console.log(`  Cache Hits: \x1b[1m${remoteCacheHit}\x1b[0m (${(remoteCacheHit/spawnExecs.length*100).toFixed(3)}%)`)
  console.log();
  console.log(`\x1b[1mRunner Count:\x1b[0m`)
  mnemonicByRunnerMap.forEach((mnemonicMap, runner) => {
    let count = 0;
    mnemonicMap.forEach((mnemonicCount, _) => {
      count += mnemonicCount;
    })
    console.log(`  ${runner}: ${count}`)
  });
  console.log();
  console.log(`\x1b[1mMnemonic Count by Runner:\x1b[0m`)
  mnemonicByRunnerMap.forEach((mnemonicMap, runner) => {
    console.log(`  ${runner}:`)
    mnemonicMap.forEach((count, mnemonic) => {
      console.log(`    ${mnemonic}: ${count}`)
    })
  })
}

run();
