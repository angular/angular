#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import esbuild from 'esbuild';
import fs from 'fs';
import glob from 'fast-glob';
import {dirname, join, isAbsolute, relative} from 'path';
import url from 'url';
import ts from 'typescript';

const containingDir = dirname(url.fileURLToPath(import.meta.url));
const projectDir = join(containingDir, '../../');

const distDir = join(projectDir, 'dist/');
const packagesDir = join(projectDir, 'packages/');

const legacyTsconfigPath = join(packagesDir, 'tsconfig-legacy-saucelabs.json');
const legacyOutputDir = join(distDir, 'legacy-test-out');

const outFile = join(distDir, 'legacy-test-bundle.spec.js');
const jitTransformOutFile = join(distDir, 'legacy-test-jit-transform-bundle.mjs');

/**
 * This script builds the whole library in `angular/angular` together with its
 * spec files into a single IIFE bundle.
 *
 * The bundle can then be used in the legacy Saucelabs or Browserstack tests. Bundling
 * helps with avoiding unnecessary complexity with maintaining module resolution at
 * runtime through e.g. SystemJS, and it increases test stability by serving significantly
 * less files through the remote browser service tunnels.
 */
async function main() {
  await transpileJitTransformTransform();
  await compileProjectWithTsc();

  const specEntryPointFile = await createEntryPointSpecFile();
  const esbuildResolvePlugin = await createResolveEsbuildPlugin();

  const result = await esbuild.build({
    bundle: true,
    keepNames: true,
    treeShaking: false,
    sourceRoot: projectDir,
    platform: 'browser',
    target: 'es2015',
    format: 'iife',
    outfile: outFile,
    sourcemap: true,
    plugins: [esbuildResolvePlugin],
    // There are places in the framework where e.g. `window.URL` is leveraged if available,
    // but with a fallback to the NodeJS `url` module. ESBuild should not error/attempt to
    // resolve such as the imports for these will not execute in the browser.
    external: [`${legacyOutputDir}/platform-server/*`, 'url'],
    stdin: {contents: specEntryPointFile, resolveDir: projectDir},
  });

  if (result.errors.length) {
    throw Error('Could not build legacy test bundle. See errors above.');
  }
}

/**
 * Finds spec files that should be built, bundled and tested as
 * part of the legacy Saucelabs test job.
 */
async function findSpecFiles() {
  const baseDirPattern = glob.convertPathToPattern(legacyOutputDir);
  const ignore = [
    '/_testing_init/**',
    '/**/e2e_test/**',
    '/**/*node_only_spec.js',
    '/benchpress/**',
    '/compiler-cli/**',
    '/compiler-cli/src/ngtsc/**',
    '/compiler-cli/test/compliance/**',
    '/compiler-cli/test/ngtsc/**',
    '/compiler/test/aot/**',
    '/compiler/test/render3/**',
    '/core/test/bundling/**',
    '/core/schematics/test/**',
    '/core/test/render3/ivy/**',
    '/core/test/render3/jit/**',
    '/core/test/render3/perf/**',
    '/elements/schematics/**',
    '/examples/**/e2e_test/*',
    '/language-service/**',
    '/platform-server/**',
    '/localize/**/test/**',
    '/localize/schematics/**',
    '/router/**/test/**',
    '/zone.js/**/test/**',
    '/platform-browser/testing/e2e_util.js',
  ].map((partial) => baseDirPattern + partial);

  return glob.sync('**/*_spec.js', {absolute: true, cwd: legacyOutputDir, ignore});
}

/**
 * Queries for all spec files in the built output and creates a single
 * ESM entry-point file which imports all the spec files.
 *
 * This spec file can then be used as entry-point for ESBuild in order
 * to bundle all specs in an IIFE file.
 */
async function createEntryPointSpecFile() {
  const testFiles = await findSpecFiles();

  let specEntryPointFile = `import './tools/legacy-saucelabs/test-init.ts';`;
  let i = 0;
  const testNamespaces = [];

  for (const file of testFiles) {
    const relativePath = relative(projectDir, file);
    const specifier = `./${relativePath.replace(/\\/g, '/')}`;
    const testNamespace = `__${i++}`;

    testNamespaces.push(testNamespace);
    specEntryPointFile += `import * as ${testNamespace} from '${specifier}';\n`;
  }

  for (const namespaceId of testNamespaces) {
    // We generate a side-effect invocation that references the test import. This
    // is necessary to trick `ESBuild` in preserving the imports. Unfortunately the
    // test files would be dead-code eliminated otherwise because the specs are part
    // of folders with `package.json` files setting the `"sideEffects: false"` field.
    specEntryPointFile += `new Function('x', 'return x')(${namespaceId});\n`;
  }

  return specEntryPointFile;
}

/**
 * Creates an ESBuild plugin which maps `@angular/<..>` module names to their
 * locally-built output (for the packages which are built as part of this repo).
 */
async function createResolveEsbuildPlugin() {
  const resolveMappings = new Map([
    [/@angular\//, `${legacyOutputDir}/`],
    [/^angular-in-memory-web-api$/, join(legacyOutputDir, 'misc/angular-in-memory-web-api')],
    [/^zone.js\//, `${legacyOutputDir}/zone.js/`],
  ]);

  return {
    name: 'ng-resolve-esbuild',
    setup: (build) => {
      build.onResolve({filter: /(@angular\/|angular-in-memory-web-api|zone.js)/}, async (args) => {
        const matchedPattern =
            Array.from(resolveMappings.keys()).find((pattern) => args.path.match(pattern));

        if (matchedPattern === undefined) {
          return undefined;
        }

        let resolvedPath = args.path.replace(matchedPattern, resolveMappings.get(matchedPattern));
        let stats = await statGraceful(resolvedPath);

        // If the resolved path points to a directory, resolve the contained `index.js` file
        if (stats && stats.isDirectory()) {
          resolvedPath = join(resolvedPath, 'index.js');
          stats = await statGraceful(resolvedPath);
        }
        // If the resolved path does not exist, check with an explicit JS extension.
        else if (stats === null) {
          resolvedPath += '.js';
          stats = await statGraceful(resolvedPath);
        }

        return stats !== null ? {path: resolvedPath} : undefined;
      });
    },
  };
}

/**
 * Creates an ESM bundle for the JIT transform. The JIT transform can then
 * be used later when we compile the sources and tests.
 *
 * Note: This layer of indirection needs to exist as we cannot load TS directly
 * from an ES module. Running ESBuild first allows us to also transpile the TS fast.
 */
async function transpileJitTransformTransform() {
  const result = await esbuild.build({
    bundle: true,
    sourceRoot: projectDir,
    platform: 'node',
    target: 'es2020',
    format: 'esm',
    outfile: jitTransformOutFile,
    external: ['typescript'],
    sourcemap: true,
    entryPoints: [join(containingDir, 'jit_transform_bundle_main.ts')],
  });

  if (result.errors.length) {
    throw Error('Could not build JIT transform bundle. See errors above.');
  }
}

/**
 * Compiles the project using the TypeScript compiler in order to produce
 * JS output of the packages and tests.
 */
async function compileProjectWithTsc() {
  const {angularJitApplicationTransform} = await import(url.pathToFileURL(jitTransformOutFile));
  const config = parseTsconfigFile(legacyTsconfigPath, dirname(legacyTsconfigPath));
  const program = ts.createProgram(config.fileNames, config.options);

  const result = program.emit(undefined, undefined, undefined, undefined, {
    // We need the JIT transform to make ES2015 JIT work and signal inputs.
    // More details on the ES2015 forwardRef issue: https://github.com/angular/angular/pull/37382.
    before: [angularJitApplicationTransform(program, /* isCore */ true)],
  });

  const diagnostics = [
    ...result.diagnostics,
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
  ];

  if (diagnostics.length) {
    console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => program.getCurrentDirectory(),
      getNewLine: () => '\n',
    }));

    throw new Error('Compilation failed. See errors above.');
  }

  console.info('Built packages and specs using TypeScript.');
  console.info('The constructor parameters have been downleveled.');
}

function parseTsconfigFile(tsconfigPath, basePath) {
  const {config} = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const parseConfigHost = {
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    fileExists: ts.sys.fileExists,
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile,
  };

  // Throw if incorrect arguments are passed to this function. Passing relative base paths
  // results in root directories not being resolved and in later type checking runtime errors.
  // More details can be found here: https://github.com/microsoft/TypeScript/issues/37731.
  if (!isAbsolute(basePath)) {
    throw Error('Unexpected relative base path has been specified.');
  }

  return ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, {});
}

/**
 * Retrieves the `fs.Stats` results for the given path gracefully.
 * If the file does not exist, returns `null`.
 */
async function statGraceful(path) {
  try {
    return await fs.promises.stat(path);
  } catch {
    return null;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
