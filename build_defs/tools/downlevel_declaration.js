'use strict';

const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const ts = require('typescript');

const downlevelDeclaration =
    require('@angular/tsc-wrapped/src/dts_downleveler').downlevelDeclaration;

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

    const inContent = fs.readFileSync(input).toString();
    const outContent = downlevelDeclaration(input, inContent, ts.ScriptTarget.ES2015);

    fs.writeFileSync(output, outContent);
  }
}

main(process.argv.slice(2));
