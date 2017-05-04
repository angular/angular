import {join, basename, dirname} from 'path';
import {createRollupBundle} from './rollup-helper';
import {inlineMetadataResources} from './inline-resources';
import {transpileFile} from './ts-compiler';
import {ScriptTarget, ModuleKind} from 'typescript';
import {sync as glob} from 'glob';
import {writeFileSync, readFileSync} from 'fs-extra';
import {
  DIST_BUNDLES, DIST_ROOT, SOURCE_ROOT, PROJECT_ROOT, LICENSE_BANNER, MATERIAL_VERSION
} from '../constants';
import {addPureAnnotations} from './annotate-pure';
import {copyFiles} from './copy-files';

// There are no type definitions available for these imports.
const uglify = require('uglify-js');
const sorcery = require('sorcery');

/**
 * Copies different output files into a folder structure that follows the `angular/angular`
 * release folder structure. The output will also contain a README and the according package.json
 * file. Additionally the package will be Closure Compiler and AOT compatible.
 */
export function composeRelease(packageName: string) {
  // To avoid refactoring of the project the package material will map to the source path `lib/`.
  let sourcePath = join(SOURCE_ROOT, packageName === 'material' ? 'lib' : packageName);
  let packagePath = join(DIST_ROOT, 'packages', packageName);
  let releasePath = join(DIST_ROOT, 'releases', packageName);

  inlinePackageMetadataFiles(packagePath);

  copyFiles(packagePath, '**/*.+(d.ts|metadata.json)', join(releasePath, 'typings'));
  copyFiles(DIST_BUNDLES, `${packageName}.umd?(.min).js?(.map)`, join(releasePath, 'bundles'));
  copyFiles(DIST_BUNDLES, `${packageName}?(.es5).js?(.map)`, join(releasePath, '@angular'));
  copyFiles(PROJECT_ROOT, 'LICENSE', releasePath);
  copyFiles(SOURCE_ROOT, 'README.md', releasePath);
  copyFiles(sourcePath, 'package.json', releasePath);

  updatePackageVersion(releasePath);
  createTypingFile(releasePath, packageName);
  createMetadataFile(releasePath, packageName);
  addPureAnnotationCommentsToEs5Bundle(releasePath, packageName);
}

/** Builds the bundles for the specified package. */
export async function buildPackageBundles(entryFile: string, packageName: string) {
  let moduleName = `ng.material.${packageName}`;

  // List of paths to the package bundles.
  let fesm2015File = join(DIST_BUNDLES, `${packageName}.js`);
  let fesm2014File = join(DIST_BUNDLES, `${packageName}.es5.js`);
  let umdFile = join(DIST_BUNDLES, `${packageName}.umd.js`);
  let umdMinFile = join(DIST_BUNDLES, `${packageName}.umd.min.js`);

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

  uglifyFile(umdFile, umdMinFile);

  await remapSourcemap(umdMinFile);
}

/**
 * Finds the original sourcemap of the file and maps it to the current file.
 * This is useful when multiple transformation happen (e.g TSC -> Rollup -> Uglify)
 **/
async function remapSourcemap(sourceFile: string) {
  // Once sorcery loaded the chain of sourcemaps, the new sourcemap will be written asynchronously.
  return (await sorcery.load(sourceFile)).write();
}

/** Minifies a JavaScript file using UglifyJS2. Also writes sourcemaps to the output. */
function uglifyFile(inputPath: string, outputPath: string) {
  let sourcemapOut = `${outputPath}.map`;
  let result = uglify.minify(inputPath, {
    preserveComments: 'license',
    outSourceMap: sourcemapOut
  });

  writeFileSync(outputPath, result.code);
  writeFileSync(sourcemapOut, result.map);
}

/** Updates the `package.json` file of the specified package. Replaces the version placeholder. */
function updatePackageVersion(packageDir: string) {
  let packagePath = join(packageDir, 'package.json');
  let packageConfig = require(packagePath);

  // Replace the `0.0.0-PLACEHOLDER` version name with the version of the root package.json file.
  packageConfig.version = packageConfig.version.replace('0.0.0-PLACEHOLDER', MATERIAL_VERSION);

  writeFileSync(packagePath, JSON.stringify(packageConfig, null, 2));
}

/** Create a typing file that links to the bundled definitions of NGC. */
function createTypingFile(outputDir: string, entryName: string) {
  writeFileSync(join(outputDir, `${entryName}.d.ts`),
    LICENSE_BANNER + '\nexport * from "./typings/index";'
  );
}

/** Creates a metadata file that re-exports the metadata bundle inside of the typings. */
function createMetadataFile(packageDir: string, packageName: string) {
  const metadataReExport =
      `{"__symbolic":"module","version":3,"metadata":{},"exports":[{"from":"./typings/index"}]}`;
  writeFileSync(join(packageDir, `${packageName}.metadata.json`), metadataReExport, 'utf-8');
}

/** Inlines HTML and CSS resources into `metadata.json` files. */
function inlinePackageMetadataFiles(packagePath: string) {
  // Create a map of fileName -> fullFilePath. This is needed because the templateUrl and
  // styleUrls for each component use just the filename because, in the source, the component
  // and the resources live in the same directory.
  const componentResources = new Map<string, string>();

  glob(join(packagePath, '**/*.+(html|css)')).forEach(resourcePath => {
    componentResources.set(basename(resourcePath), resourcePath);
  });

  // Find all metadata files. For each one, parse the JSON content, inline the resources, and
  // reserialize and rewrite back to the original location.
  glob(join(packagePath, '**/*.metadata.json')).forEach(path => {
    let metadata = JSON.parse(readFileSync(path, 'utf-8'));
    inlineMetadataResources(metadata, componentResources);
    writeFileSync(path , JSON.stringify(metadata), 'utf-8');
  });
}

/** Adds Uglify "@__PURE__" decorations to the generated ES5 bundle. */
function addPureAnnotationCommentsToEs5Bundle(outputDir: string, entryName: string) {
  const es5BundlePath = join(outputDir, '@angular', `${entryName}.es5.js`);
  const originalContent = readFileSync(es5BundlePath, 'utf-8');
  const annotatedContent = addPureAnnotations(originalContent);

  writeFileSync(es5BundlePath, annotatedContent, 'utf-8');
}
