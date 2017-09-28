import {appendFileSync} from 'fs';
import {mkdirpSync} from 'fs-extra';
import {join} from 'path';
import {buildConfig} from './build-config';
import {BuildPackage} from './build-package';
import {copyFiles} from './copy-files';
import {createEntryPointPackageJson} from './entry-point-package-json';
import {inlinePackageMetadataFiles} from './metadata-inlining';
import {createMetadataReexportFile} from './metadata-reexport';
import {createTypingsReexportFile} from './typings-reexport';
import {replaceVersionPlaceholders} from './version-placeholders';

const {packagesDir, outputDir, projectDir} = buildConfig;

/** Directory where all bundles will be created in. */
const bundlesDir = join(outputDir, 'bundles');

/**
 * Copies different output files into a folder structure that follows the `angular/angular`
 * release folder structure. The output will also contain a README and the according package.json
 * file. Additionally the package will be Closure Compiler and AOT compatible.
 */
export function composeRelease(buildPackage: BuildPackage) {
  const {name, sourceDir} = buildPackage;
  const packageOut = buildPackage.outputDir;
  const releasePath = join(outputDir, 'releases', name);

  inlinePackageMetadataFiles(packageOut);

  // Copy all d.ts and metadata files to the `typings/` directory
  copyFiles(packageOut, '**/*.+(d.ts|metadata.json)', join(releasePath, 'typings'));

  // Copy UMD bundles.
  copyFiles(bundlesDir, `${name}?(-*).umd?(.min).js?(.map)`, join(releasePath, 'bundles'));

  // Copy ES5 bundles.
  copyFiles(bundlesDir, `${name}.es5.js?(.map)`, join(releasePath, 'esm5'));
  copyFiles(join(bundlesDir, name), `*.es5.js?(.map)`, join(releasePath, 'esm5'));

  // Copy ES2015 bundles
  copyFiles(bundlesDir, `${name}.js?(.map)`, join(releasePath, 'esm2015'));
  copyFiles(join(bundlesDir, name), `!(*.es5|*.umd).js?(.map)`, join(releasePath, 'esm2015'));

  // Copy any additional files that belong in the package.
  copyFiles(projectDir, 'LICENSE', releasePath);
  copyFiles(packagesDir, 'README.md', releasePath);
  copyFiles(sourceDir, 'package.json', releasePath);

  replaceVersionPlaceholders(releasePath);
  createTypingsReexportFile(releasePath, './typings/index', name);
  createMetadataReexportFile(releasePath, './typings/index', name);

  if (buildPackage.secondaryEntryPoints.length) {
    createFilesForSecondaryEntryPoint(buildPackage, releasePath);
  }

  if (buildPackage.copySecondaryEntryPointStylesToRoot) {
    copySecondaryEntryPointStylesheets(buildPackage, releasePath);
  }

  if (buildPackage.exportsSecondaryEntryPointsAtRoot) {
    // Add re-exports to the root d.ts file to prevent errors of the form
    // "@angular/material/material has no exported member 'MATERIAL_SANITY_CHECKS."
    const es2015Exports = buildPackage.secondaryEntryPoints
        .map(p => `export * from './${p}';`).join('\n');
    appendFileSync(join(releasePath, `${name}.d.ts`), es2015Exports, 'utf-8');

    // When re-exporting secondary entry-points, we need to manually create a metadata file that
    // re-exports everything.
    createMetadataReexportFile(
        releasePath,
        buildPackage.secondaryEntryPoints.concat(['typings/index']).map(p => `./${p}`),
        name);
  }
}

/** Creates files necessary for a secondary entry-point. */
function createFilesForSecondaryEntryPoint(buildPackage: BuildPackage, releasePath: string) {
  const {name} = buildPackage;
  const packageOut = buildPackage.outputDir;

  buildPackage.secondaryEntryPoints.forEach(entryPointName => {
    // Create a directory in the root of the package for this entry point that contains
    // * A package.json that lists the different bundle locations
    // * An index.d.ts file that re-exports the index.d.ts from the typings/ directory
    // * A metadata.json re-export for this entry-point's metadata.
    const entryPointDir = join(releasePath, entryPointName);

    mkdirpSync(entryPointDir);
    createEntryPointPackageJson(entryPointDir, name, entryPointName);

    // Copy typings and metadata from tsc output location into the entry-point.
    copyFiles(
        join(packageOut, entryPointName),
        '**/*.+(d.ts|metadata.json)',
        join(entryPointDir, 'typings'));

    // Create a typings and a metadata re-export within the entry-point to point to the
    // typings we just copied.
    createTypingsReexportFile(entryPointDir, `./typings/index`, 'index');
    createMetadataReexportFile(entryPointDir, `./typings/index`, 'index');

    // Finally, create both a d.ts and metadata file for this entry-point in the root of
    // the package that re-exports from the entry-point's directory.
    createTypingsReexportFile(releasePath, `./${entryPointName}/index`, entryPointName);
    createMetadataReexportFile(releasePath, `./${entryPointName}/index`, entryPointName);
  });
}

/** Copies the stylesheets for secondary entry-points that generate one to the release output. */
function copySecondaryEntryPointStylesheets(buildPackage: BuildPackage, releasePath: string) {
  buildPackage.secondaryEntryPoints.forEach(entryPointName => {
    const entryPointDir = join(buildPackage.outputDir, entryPointName);

    copyFiles(entryPointDir, `_${entryPointName}.scss`, releasePath);
    copyFiles(entryPointDir, `${entryPointName}-prebuilt.css`, releasePath);
  });
}
