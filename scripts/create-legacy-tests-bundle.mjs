#!/usr/bin/env node

import {createLinkerEsbuildPlugin} from '@angular/build-tooling/shared-scripts/angular-linker/esbuild-plugin.mjs';
import child_process from 'child_process';
import esbuild from 'esbuild';
import fs from 'fs';
import glob from 'glob';
import module from 'module';
import {dirname, join, relative} from 'path';
import sass from 'sass';
import url from 'url';
import tsNode from 'ts-node';

const containingDir = dirname(url.fileURLToPath(import.meta.url));
const projectDir = join(containingDir, '../');
const packagesDir = join(projectDir, 'src/');
const legacyTsconfigPath = join(projectDir, 'src/tsconfig-legacy.json');

// Some tooling utilities might be written in TS and we do not want to rewrite them
// in JavaScript just for this legacy script. We can use ts-node for such scripts.
tsNode.register({project: join(containingDir, 'tsconfig.json')});

const require = module.createRequire(import.meta.url);
const sassImporterUtil = require('../tools/sass/local-sass-importer.ts');

const distDir = join(projectDir, 'dist/');
const nodeModulesDir = join(projectDir, 'node_modules/');
const outFile = join(distDir, 'legacy-test-bundle.spec.js');
const ngcBinFile = join(nodeModulesDir, '@angular/compiler-cli/bundles/src/bin/ngc.js');
const legacyOutputDir = join(distDir, 'legacy-test-out');

/** Sass importer used for resolving `@angular/<..>` imports. */
const localPackageSassImporter = sassImporterUtil.createLocalAngularPackageImporter(packagesDir);

/**
 * This script builds the whole library in `angular/components` together with its
 * spec files into a single IIFE bundle.
 *
 * The bundle can then be used in the legacy Saucelabs or Browserstack tests. Bundling
 * helps with running the Angular linker on framework packages, and also avoids unnecessary
 * complexity with maintaining module resolution at runtime through e.g. SystemJS.
 */
async function main() {
  // Wait for all Sass compilations to finish.
  await compileSassFiles();

  // Build the project with Ngtsc so that external resources are inlined.
  await compileProjectWithNgtsc();

  const specEntryPointFile = await createEntryPointSpecFile();
  const esbuildLinkerPlugin = await createLinkerEsbuildPlugin(/fesm2020/, false);
  const esbuildResolvePlugin = await createResolveEsbuildPlugin();

  const result = await esbuild.build({
    bundle: true,
    sourceRoot: projectDir,
    platform: 'browser',
    format: 'iife',
    outfile: outFile,
    plugins: [esbuildResolvePlugin, esbuildLinkerPlugin],
    stdin: {contents: specEntryPointFile, resolveDir: projectDir},
  });

  if (result.errors.length) {
    throw Error('Could not build legacy test bundle. See errors above.');
  }
}

/**
 * Compiles all non-partial Sass files in the project and writes them next
 * to their source files. The files are written into the source root as
 * this simplifies the resolution within the standalone Angular compiler.
 *
 * Given that the legacy tests should only run on CI, it is acceptable to
 * write to the checked-in source tree. The files remain untracked unless
 * explicitly added.
 */
async function compileSassFiles() {
  const sassFiles = glob.sync('src/**/!(_*|theme).scss', {cwd: projectDir, absolute: true});
  const sassTasks = [];

  for (const file of sassFiles) {
    const outRelativePath = relative(projectDir, file).replace(/\.scss$/, '.css');
    const outPath = join(projectDir, outRelativePath);
    const task = renderSassFileAsync(file).then(async content => {
      console.info('Compiled, now writing:', outRelativePath);
      await fs.promises.mkdir(dirname(outPath), {recursive: true});
      await fs.promises.writeFile(outPath, content);
    });

    sassTasks.push(task);
  }

  // Wait for all Sass compilations to finish.
  await Promise.all(sassTasks);
}

/**
 * Compiles the project using the Angular compiler in order to produce JS output of
 * the packages and tests. This step is important in order to full-compile all
 * exported components of the library (inlining external stylesheets or templates).
 */
async function compileProjectWithNgtsc() {
  // Build the project with Ngtsc so that external resources are inlined.
  const ngcProcess = child_process.spawnSync(
    'node',
    [ngcBinFile, '--project', legacyTsconfigPath],
    {shell: true, stdio: 'inherit'},
  );

  if (ngcProcess.error || ngcProcess.status !== 0) {
    throw Error('Unable to compile tests and library. See error above.');
  }
}

/**
 * Queries for all spec files in the built output and creates a single
 * ESM entry-point file which imports all the spec files.
 *
 * This spec file can then be used as entry-point for ESBuild in order
 * to bundle all specs in an IIFE file.
 */
async function createEntryPointSpecFile() {
  const testFiles = glob.sync('**/*.spec.js', {absolute: true, cwd: legacyOutputDir});

  let specEntryPointFile = `import './test/angular-test-init-spec.ts';`;
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

/** Helper function to render a Sass file asynchronously using promises. */
async function renderSassFileAsync(inputFile) {
  return sass
    .compileAsync(inputFile, {
      loadPaths: [nodeModulesDir, projectDir],
      importers: [localPackageSassImporter],
    })
    .then(result => result.css);
}

/**
 * Creates an ESBuild plugin which maps `@angular/<..>` module names to their
 * locally-built output (for the packages which are built as part of this repo).
 */
async function createResolveEsbuildPlugin() {
  return {
    name: 'ng-resolve-esbuild',
    setup: build => {
      build.onResolve({filter: /@angular\//}, async args => {
        const pkgName = args.path.slice('@angular/'.length);
        let resolvedPath = join(legacyOutputDir, pkgName);
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

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
