import {readFileSync, writeFileSync} from 'fs';
import path from 'path';
// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import {
  NgtscProgram,
  CompilerOptions,
  createCompilerHost,
  DocEntry,
  EntryCollection,
} from '@angular/compiler-cli';
import ts from 'typescript';

function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');

  const [
    moduleName,
    moduleLabel,
    entryPointExecRootRelativePath,
    srcs,
    outputFilenameExecRootRelativePath,
    serializedPathMapWithExecRootRelativePaths,
    extraEntriesSrcs,
  ] = rawParamLines;

  // The path map is a serialized JSON map of import path to index.ts file.
  // For example, {'@angular/core': 'path/to/some/index.ts'}
  const pathMap = JSON.parse(serializedPathMapWithExecRootRelativePaths) as Record<string, string>;

  // The tsconfig expects the path map in the form of path -> array of actual locations.
  // We also resolve the exec root relative paths to absolute paths to disambiguate.
  const resolvedPathMap: {[key: string]: string[]} = {};
  for (const [importPath, filePath] of Object.entries(pathMap)) {
    resolvedPathMap[importPath] = [path.resolve(filePath)];

    // In addition to the exact import path,
    // also add wildcard mappings for subdirectories.
    const importPathWithWildcard = path.join(importPath, '*');
    resolvedPathMap[importPathWithWildcard] = [
      path.join(path.resolve(path.dirname(filePath)), '*'),
    ];
  }

  const compilerOptions: CompilerOptions = {
    paths: resolvedPathMap,
    rootDir: '.',
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    experimentalDecorators: true,
  };

  const compilerHost = createCompilerHost({options: compilerOptions});
  const program: NgtscProgram = new NgtscProgram(srcs.split(','), compilerOptions, compilerHost);

  const extraEntries: DocEntry[] = (extraEntriesSrcs ?? '')
    .split(',')
    .filter((path) => !!path)
    .reduce((result: DocEntry[], path) => {
      return result.concat(JSON.parse(readFileSync(path, {encoding: 'utf8'})) as DocEntry[]);
    }, []);

  const apiDoc = program.getApiDocumentation(entryPointExecRootRelativePath);
  const extractedEntries = apiDoc.entries;
  const combinedEntries = extractedEntries.concat(extraEntries);

  const normalized = moduleName.replace('@', '').replace(/[\/]/g, '_');

  const output = JSON.stringify({
    moduleLabel: moduleLabel || moduleName,
    moduleName: moduleName,
    normalizedModuleName: normalized,
    entries: combinedEntries,
    symbols: [
      // Symbols referenced, originating from other packages
      ...apiDoc.symbols.entries(),

      // Exported symbols from the current package
      ...apiDoc.entries.map((entry) => [entry.name, moduleName]),
    ],
  } as EntryCollection);

  writeFileSync(outputFilenameExecRootRelativePath, output, {encoding: 'utf8'});
}

main();
