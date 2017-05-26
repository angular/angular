import {join} from 'path';
import {ScriptTarget, ModuleKind} from 'typescript';
import {DIST_BUNDLES} from '../build-config';
import {uglifyJsFile} from './minify-sources';
import {createRollupBundle} from './rollup-helpers';
import {remapSourcemap} from './sourcemap-remap';
import {transpileFile} from './typescript-transpile';

// There are no type definitions available for these imports.
const uglify = require('uglify-js');
const sorcery = require('sorcery');

/** Builds the bundles for the specified package. */
export async function buildPackageBundles(entryFile: string, packageName: string) {
  const moduleName = `ng.${packageName}`;

  // List of paths to the package bundles.
  const fesm2015File = join(DIST_BUNDLES, `${packageName}.js`);
  const fesm2014File = join(DIST_BUNDLES, `${packageName}.es5.js`);
  const umdFile = join(DIST_BUNDLES, `${packageName}.umd.js`);
  const umdMinFile = join(DIST_BUNDLES, `${packageName}.umd.min.js`);

  // Build FESM-2015 bundle file.
  await createRollupBundle({
    moduleName: moduleName,
    entry: entryFile,
    dest: fesm2015File,
    format: 'es',
  });

  await remapSourcemap(fesm2015File);

  // Downlevel FESM-2015 file to ES5.
  transpileFile(fesm2015File, fesm2014File, {
    importHelpers: true,
    target: ScriptTarget.ES5,
    module: ModuleKind.ES2015,
    allowJs: true
  });

  await remapSourcemap(fesm2014File);

  // Create UMD bundle of FESM-2014 output.
  await createRollupBundle({
    moduleName: moduleName,
    entry: fesm2014File,
    dest: umdFile,
    format: 'umd'
  });

  await remapSourcemap(umdFile);

  // Create a minified UMD bundle using UglifyJS
  uglifyJsFile(umdFile, umdMinFile);

  await remapSourcemap(umdMinFile);
}
