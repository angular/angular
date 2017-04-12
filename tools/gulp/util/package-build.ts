import {join, basename, dirname} from 'path';
import {DIST_BUNDLES, DIST_ROOT, SOURCE_ROOT, PROJECT_ROOT, LICENSE_BANNER} from '../constants';
import {createRollupBundle} from './rollup-helper';
import {inlineMetadataResources} from './inline-resources';
import {transpileFile} from './ts-compiler';
import {ScriptTarget, ModuleKind} from 'typescript';
import {sync as glob} from 'glob';
import {
  writeFileSync, copySync, mkdirpSync, readFileSync
} from 'fs-extra';

// There are no type definitions available for these imports.
const uglify = require('uglify-js');

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
  copyFiles(DIST_BUNDLES, `${packageName}.umd?(.min).js`, join(releasePath, 'bundles'));
  copyFiles(DIST_BUNDLES, `${packageName}?(.es5).js`, join(releasePath, '@angular'));
  copyFiles(PROJECT_ROOT, 'LICENSE', releasePath);
  copyFiles(SOURCE_ROOT, 'README', releasePath);
  copyFiles(sourcePath, 'package.json', releasePath);

  createTypingFile(releasePath, packageName);
  createMetadataFile(releasePath, packageName);
}

/** Builds a module entry-point. If no entry name is specified it builds the whole library. */
export async function buildModuleEntry(entryFile: string, entryName = 'material') {
  let moduleName = entryName ? `ng.material.${entryName}` : 'ng.material';

  // List of paths for the specified entrypoint.
  let fesm2015File = join(DIST_BUNDLES, `${entryName}.js`);
  let fesm2014File = join(DIST_BUNDLES, `${entryName}.es5.js`);
  let umdFile = join(DIST_BUNDLES, `${entryName}.umd.js`);
  let umdMinFile = join(DIST_BUNDLES, `${entryName}.umd.min.js`);

  // Build FESM-2015 bundle file.
  await createRollupBundle({
    moduleName: moduleName,
    entry: entryFile,
    dest: fesm2015File,
    format: 'es',
  });

  // Downlevel FESM-2015 file to ES5.
  transpileFile(fesm2015File, fesm2014File, {
    target: ScriptTarget.ES5,
    module: ModuleKind.ES2015,
    allowJs: true
  });

  // Create UMD bundle of FESM-2014 output.
  await createRollupBundle({
    moduleName: moduleName,
    entry: fesm2014File,
    dest: umdFile,
    format: 'umd'
  });

  // Output a minified version of the UMD bundle
  writeFileSync(umdMinFile, uglify.minify(umdFile, { preserveComments: 'license' }).code);
}

function copyFiles(fromPath: string, fileGlob: string, outDir: string) {
  glob(fileGlob, {cwd: fromPath}).forEach(filePath => {
    let fileDestPath = join(outDir, filePath);
    mkdirpSync(dirname(fileDestPath));
    copySync(join(fromPath, filePath), fileDestPath);
  });
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
