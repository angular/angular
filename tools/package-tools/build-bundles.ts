import {join} from 'path';
import {ScriptTarget, ModuleKind, NewLineKind} from 'typescript';
import {uglifyJsFile} from './minify-sources';
import {createRollupBundle} from './rollup-helpers';
import {remapSourcemap} from './sourcemap-remap';
import {transpileFile} from './typescript-transpile';
import {buildConfig} from './build-config';

/** Directory where all bundles will be created in. */
const bundlesDir = join(buildConfig.outputDir, 'bundles');

/** Builds the bundles for the specified package. */
export async function buildPackageBundles(entryFile: string, packageName: string) {
  const moduleName = `ng.${packageName}`;

  // List of paths to the package bundles.
  const fesm2015File = join(bundlesDir, `${packageName}.js`);
  const fesm2014File = join(bundlesDir, `${packageName}.es5.js`);
  const umdFile = join(bundlesDir, `${packageName}.umd.js`);
  const umdMinFile = join(bundlesDir, `${packageName}.umd.min.js`);

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
    allowJs: true,
    newLine: NewLineKind.LineFeed
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
