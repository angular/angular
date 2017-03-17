import * as ts from 'typescript';
import * as path from 'path';
import * as chalk from 'chalk';

/** Compiles a TypeScript project with possible extra options. */
export function compileProject(project: string, options: ts.CompilerOptions) {
  let parsed = parseProjectConfig(project, options);
  let program = ts.createProgram(parsed.fileNames, parsed.options);

  // Report any invalid TypeScript options for the project.
  checkDiagnostics(program.getOptionsDiagnostics());

  let emitResult = program.emit();

  checkDiagnostics(emitResult.diagnostics);
}

/** Parses a TypeScript project configuration. */
function parseProjectConfig(project: string, options: ts.CompilerOptions) {
  let config = ts.readConfigFile(project, ts.sys.readFile).config;
  let basePath = path.dirname(project);

  let host = {
    useCaseSensitiveFileNames: true,
    fileExists: ts.sys.fileExists,
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile
  };

  return ts.parseJsonConfigFileContent(config, host, basePath, options);
}

/** Formats the TypeScript diagnostics into a error string. */
export function formatDiagnostics(diagnostics: ts.Diagnostic[]): string {
  return diagnostics.map(diagnostic => {
    let res = ts.DiagnosticCategory[diagnostic.category];

    if (diagnostic.file) {
      let {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);

      res += ` at ${diagnostic.file.fileName}(${line + 1},${character + 1}):`;
    }
    res += ` ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;

    return res;
  }).join('\n');
}

/** Checks diagnostics and throws errors if present. */
export function checkDiagnostics(diagnostics: ts.Diagnostic[]) {
  if (diagnostics && diagnostics.length && diagnostics[0]) {
    console.error(formatDiagnostics(diagnostics));
    console.error(chalk.red('TypeScript compilation failed. Exiting process.'));
    process.exit(1);
  }
}
