import {join} from 'path';
import {ScriptTarget, ModuleKind, NewLineKind} from 'typescript';
import {uglifyJsFile} from './minify-sources';
import {createRollupBundle} from './rollup-helpers';
import {remapSourcemap} from './sourcemap-remap';
import {transpileFile} from './typescript-transpile';
import {buildConfig} from './build-config';

/** Directory where all bundles will be created in. */
const bundlesDir = join(buildConfig.outputDir, 'bundles');

/** Builds bundles for the primary entry-point w/ given entry file, e.g. @angular/cdk */
export async function buildPrimaryEntryPointBundles(entryFile: string, packageName: string) {
  return createBundlesForEntryPoint({
    entryFile,
    moduleName: `ng.${packageName}`,
    fesm2015Dest: join(bundlesDir, `${packageName}.js`),
    fesm2014Dest: join(bundlesDir, `${packageName}.es5.js`),
    umdDest: join(bundlesDir, `${packageName}.umd.js`),
    umdMinDest: join(bundlesDir, `${packageName}.umd.min.js`),
  });
}

/** Builds bundles for a single secondary entry-point w/ given entry file, e.g. @angular/cdk/a11y */
export async function buildSecondaryEntryPointBundles(entryFile: string, packageName: string,
                                                      entryPointName: string) {
  return createBundlesForEntryPoint({
    entryFile,
    moduleName: `ng.${packageName}.${entryPointName}`,
    fesm2015Dest: join(bundlesDir, `${packageName}`, `${entryPointName}.js`),
    fesm2014Dest: join(bundlesDir, `${packageName}`, `${entryPointName}.es5.js`),
    umdDest: join(bundlesDir, `${packageName}-${entryPointName}.umd.js`),
    umdMinDest: join(bundlesDir, `${packageName}-${entryPointName}.umd.min.js`),
  });
}

/**
 * Creates the ES5, ES2015, and UMD bundles for the specified entry-point.
 * @param config Configuration that specifies the entry-point, module name, and output
 *     bundle paths.
 */
async function createBundlesForEntryPoint(config: BundlesConfig) {
  // Build FESM-2015 bundle file.
  await createRollupBundle({
    moduleName: config.moduleName,
    entry: config.entryFile,
    dest: config.fesm2015Dest,
    format: 'es',
  });

  await remapSourcemap(config.fesm2015Dest);

  // Downlevel FESM-2015 file to ES5.
  transpileFile(config.fesm2015Dest, config.fesm2014Dest, {
    importHelpers: true,
    target: ScriptTarget.ES5,
    module: ModuleKind.ES2015,
    allowJs: true,
    newLine: NewLineKind.LineFeed
  });

  await remapSourcemap(config.fesm2014Dest);

  // Create UMD bundle of FESM-2014 output.
  await createRollupBundle({
    moduleName: config.moduleName,
    entry: config.fesm2014Dest,
    dest: config.umdDest,
    format: 'umd'
  });

  await remapSourcemap(config.umdDest);

  // Create a minified UMD bundle using UglifyJS
  uglifyJsFile(config.umdDest, config.umdMinDest);

  await remapSourcemap(config.umdMinDest);
}


/** Configuration for creating library bundles. */
interface BundlesConfig {
  entryFile: string;
  moduleName: string;
  fesm2015Dest: string;
  fesm2014Dest: string;
  umdDest: string;
  umdMinDest: string;
}
