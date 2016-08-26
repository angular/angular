'use strict';

const fs = require('fs');
const minimist = require('minimist');
const path = require('path');

function main(argv) {
  const args = minimist(argv);
  const rootDir = path.resolve(args.rootDir);
  const outDir = path.resolve(args.outDir);

  for (const fileName of args._) {
    const input = path.resolve(fileName);
    if (input.substr(0, rootDir.length) !== rootDir) {
      throw new Error(`${input} not in ${rootDir}`);
    }
    const output = path.join(outDir, input.substr(rootDir.length));
    // Simply let error propagate and crash the process
    fs.createReadStream(input).pipe(fs.createWriteStream(output));
  }
}

main(process.argv.slice(2));
