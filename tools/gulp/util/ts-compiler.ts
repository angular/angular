import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import * as chalk from 'chalk';

/** Compiles a TypeScript project with possible extra options. */
export function compileProject(project: string, options: ts.CompilerOptions = {}) {
  let parsed = parseProjectConfig(project, options);
  let program = ts.createProgram(parsed.fileNames, parsed.options);
  let baseDir = program.getCurrentDirectory();

  // Report any invalid TypeScript options for the project.
  reportDiagnostics(program.getOptionsDiagnostics(), baseDir);

  let emitResult = program.emit();

  reportDiagnostics(emitResult.diagnostics, baseDir);
}

/** Reads a input file and transpiles it into a new file. */
export function transpileFile(inputPath: string, outputPath: string, options: ts.CompilerOptions) {
  let inputFile = fs.readFileSync(inputPath, 'utf-8');
  let transpiled = ts.transpileModule(inputFile, { compilerOptions: options });

  reportDiagnostics(transpiled.diagnostics);

  fs.writeFileSync(outputPath, transpiled.outputText);

  if (transpiled.sourceMapText) {
    fs.writeFileSync(`${outputPath}.map`, transpiled.sourceMapText);
  }
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
export function formatDiagnostics(diagnostics: ts.Diagnostic[], baseDir: string): string {
  return diagnostics.map(diagnostic => {
    let res = `• ${chalk.red(`TS${diagnostic.code}`)} - `;

    if (diagnostic.file) {
      let {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      let filePath = path.relative(baseDir, diagnostic.file.fileName);

      res += `${filePath}(${line + 1},${character + 1}): `;
    }
    res += `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;

    return res;
  }).join('\n');
}

/** Checks and reports diagnostics if present. */
export function reportDiagnostics(diagnostics: ts.Diagnostic[], baseDir?: string) {
  if (diagnostics && diagnostics.length && diagnostics[0]) {
    console.error(formatDiagnostics(diagnostics, baseDir));
    throw new Error('TypeScript compilation failed.');
  }
}
