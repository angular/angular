'use strict';

const fs = require('fs');
const ts = require('typescript');

function main(argv) {
  if (!argv.length) {
    console.error(`Usage: ${process.argv[0]} ${process.argv[1]}
          [--out <out file>] [<--file <file>|<json string>>...]

Merges multiple portions of tsconfig.json in a way that the output tsconfig.json
is semantically valid.`);
    process.exit(1);
  }

  const tsconfig = {};
  let out = null;

  while (argv.length) {
    const arg = argv.shift();
    if (arg === '--file') {
      const file = argv.shift();
      mergeTsconfig(tsconfig, parse(file, fs.readFileSync(file).toString()));
    } else if (arg === '--out') {
      out = argv.shift();
    } else {
      mergeTsconfig(tsconfig, parse(/* fileName */ '<input argument>', arg));
    }
  }

  normalizeTsconfig(tsconfig);

  if (out) {
    fs.writeFileSync(out, JSON.stringify(tsconfig, null, 2));
  } else {
    console.log(JSON.stringify(tsconfig, null, 2));
  }
}

function mergeTsconfig(merged, next) {
  // File lists are not merged but replaced.
  if ((merged.files || merged.include || merged.exclude) &&
      (next.files || next.include || next.exclude)) {
    delete merged.files;
    delete merged.include;
    delete merged.exclude;
  }
  if (merged.compilerOptions && next.compilerOptions) {
    // Path mappings are not merged but replaced.
    if (merged.compilerOptions.paths && next.compilerOptions.paths) {
      delete merged.compilerOptions.paths;
    }
  }
  deepMerge(merged, next);
}

function normalizeTsconfig(tsconfig) {
  const compilerOptions = tsconfig.compilerOptions;
  if (!compilerOptions.sourceMap && !compilerOptions.inlineSourceMap) {
    // These options require sourceMap or inlineSourceMap to be set.
    delete compilerOptions.inlineSources;
    delete compilerOptions.mapRoot;
    delete compilerOptions.sourceRoot;
  }
}

function deepMerge(x, y) {
  if (Array.isArray(x) && Array.isArray(y)) {
    for (const i of y) {
      if (x.indexOf(i) === -1) {
        x.push(i);
      }
    }
  } else {
    for (const key in x) {
      if (key in y) {
        if (typeof x[key] === 'object' && typeof y[key] === 'object') {
          deepMerge(x[key], y[key]);
        } else {
          x[key] = y[key];
        }
      }
    }

    for (const key in y) {
      if (!(key in x)) {
        x[key] = y[key];
      }
    }
  }
}

function parse(fileName, jsonText) {
  // This parses a JSON-ish file with comments.
  const result = ts.parseConfigFileTextToJson(fileName, jsonText);

  if (result.error) {
    throw new Error(result.error.messageText);
  }

  return result.config;
}

main(process.argv.slice(2));
