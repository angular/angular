#!/usr/bin/env node
'use strict';
// A lightweight tsc wrapper that is used to bootstrap tsc-wrapped.
// It only supports the --proejct flag. Other flags are ignored.
// Usage: bootstrap --project path/to/tsconfig.json
// The main difference between this script and tsc is that this script does not
// know about symlinks. This is crucial for bazel to function properly.
// The compiled version of this script should be checked in to the repository.
// Compile with: $(npm bin)/tsc --typeRoots [] path/to/bootstrap.ts
var path = require('path');
var ts = require('typescript');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2));
function main() {
    var project = argv.project;
    if (!project) {
        throw new Error('No "--project" flag specified.');
    }
    if (ts.sys.directoryExists(project)) {
        project = path.join(project, 'tsconfig.json');
    }
    var _a = ts.readConfigFile(project, ts.sys.readFile), config = _a.config, error = _a.error;
    if (error) {
        throwIfError([error]);
    }
    var _b = ts.parseJsonConfigFileContent(config, {
        useCaseSensitiveFileNames: true,
        fileExists: ts.sys.fileExists,
        readDirectory: ts.sys.readDirectory
    }, path.dirname(project), {}, project), options = _b.options, fileNames = _b.fileNames, errors = _b.errors;
    throwIfError(errors);
    var host = createCompilerHost(options);
    var program = ts.createProgram(fileNames, options, host);
    throwIfError(program.getOptionsDiagnostics()
        .concat(program.getGlobalDiagnostics())
        .concat(ts.getPreEmitDiagnostics(program)));
    var emitResult = program.emit();
    throwIfError(emitResult.diagnostics);
    process.exit(0);
}
function createCompilerHost(options) {
    var ret = ts.createCompilerHost(options);
    // Disable symlink resolution. Otherwise rootDir -> outDir mapping will not function properly
    // under bazel-generated directories.
    ret.realpath = function (path) { return path; };
    return ret;
}
function throwIfError(diagnostics) {
    if (diagnostics.length) {
        throw new Error(diagnostics.map(formatDiagnostic).join('\n'));
    }
}
function formatDiagnostic(diagnostic) {
    var res = ts.DiagnosticCategory[diagnostic.category];
    if (diagnostic.file) {
        res += ' at ' + diagnostic.file.fileName + ':';
        var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
        res += (line + 1) + ':' + (character + 1) + ':';
    }
    res += ' ' + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    return res;
}
main();
