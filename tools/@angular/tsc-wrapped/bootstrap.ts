#!/usr/bin/env node
///<reference path="../../../node_modules/@types/node/index.d.ts"/>
'use strict';

// A lightweight tsc wrapper that is used to bootstrap tsc-wrapped.
// It only supports the --proejct flag. Other flags are ignored.
// Usage: bootstrap --project path/to/tsconfig.json

// The main difference between this script and tsc is that this script does not
// know about symlinks. This is crucial for bazel to function properly.

// The compiled version of this script should be checked in to the repository.
// Compile with: $(npm bin)/tsc --typeRoots [] path/to/bootstrap.ts

import * as path from 'path';
import * as ts from 'typescript';

const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

function main() {
  let project = argv.project;
  if (!project) {
    throw new Error('No "--project" flag specified.');
  }
  if (ts.sys.directoryExists(project)) {
    project = path.join(project, 'tsconfig.json');
  }

  const {config, error} = ts.readConfigFile(project, ts.sys.readFile);
  if (error) {
    throwIfError([error]);
  }

  const {options, fileNames, errors} = ts.parseJsonConfigFileContent(
      config, {
        useCaseSensitiveFileNames: true,
        fileExists: ts.sys.fileExists,
        readDirectory: ts.sys.readDirectory
      },
      path.dirname(project), {}, project);
  throwIfError(errors);

  const host = createCompilerHost(options);
  const program = ts.createProgram(fileNames, options, host);
  throwIfError(program.getOptionsDiagnostics()
                   .concat(program.getGlobalDiagnostics())
                   .concat(ts.getPreEmitDiagnostics(program)));

  const emitResult = program.emit();
  throwIfError(emitResult.diagnostics);

  process.exit(0);
}

function createCompilerHost(options: ts.CompilerOptions): ts.CompilerHost {
  const ret = ts.createCompilerHost(options);
  // Disable symlink resolution. Otherwise rootDir -> outDir mapping will not function properly
  // under bazel-generated directories.
  ret.realpath = path => path;
  return ret;
}

function throwIfError(diagnostics: ts.Diagnostic[]) {
  if (diagnostics.length) {
    throw new Error(diagnostics.map(formatDiagnostic).join('\n'));
  }
}

function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  let res = ts.DiagnosticCategory[diagnostic.category];
  if (diagnostic.file) {
    res += ' at ' + diagnostic.file.fileName + ':';
    const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    res += (line + 1) + ':' + (character + 1) + ':';
  }
  res += ' ' + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  return res;
}

main();
