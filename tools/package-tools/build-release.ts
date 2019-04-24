import {appendFileSync, existsSync, readFileSync, writeFileSync} from 'fs';
import {mkdirpSync} from 'fs-extra';
import {join} from 'path';
import {buildConfig} from './build-config';
import {BuildPackage} from './build-package';
import {copyFiles} from './copy-files';
import {createEntryPointPackageJson} from './entry-point-package-json';
import {inlinePackageMetadataFiles} from './metadata-inlining';
import {createMetadataReexportFile} from './metadata-reexport';
import {insertPackageJsonVersionStamp} from './package-version-stamp';
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
  const importAsName = `@angular/${name}`;

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

  // This must happen before replacing the version placeholders because the schematics
  // could use the version placeholders for setting up specific dependencies within `ng-add`.
  if (buildPackage.hasSchematics) {
    copyFiles(join(packageOut, 'schematics'), '**/*', join(releasePath, 'schematics'));
  }

  replaceVersionPlaceholders(releasePath);
  insertPackageJsonVersionStamp(join(releasePath, 'package.json'));

  createTypingsReexportFile(releasePath, './typings/index', name);
  createMetadataReexportFile(releasePath, './typings/index', name, importAsName);

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
        name,
        importAsName);
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
    const importAsName = `@angular/${name}/${entryPointName}`;

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
    createMetadataReexportFile(entryPointDir, `./typings/index`, 'index', importAsName);

    // Finally, create both a d.ts and metadata file for this entry-point in the root of
    // the package that re-exports from the entry-point's directory.
    createTypingsReexportFile(releasePath, `./${entryPointName}/index`, entryPointName);
    createMetadataReexportFile(releasePath, `./${entryPointName}/index`, entryPointName,
        importAsName);
  });
}

/** Copies the stylesheets for secondary entry-points that generate one to the release output. */
function copySecondaryEntryPointStylesheets(buildPackage: BuildPackage, releasePath: string) {
  buildPackage.secondaryEntryPoints.forEach(entryPointName => {
    const entryPointDir = join(buildPackage.outputDir, entryPointName);

    copyPartialToRootAndUpdateImports(buildPackage, entryPointName, releasePath);
    copyFiles(entryPointDir, `${entryPointName}-prebuilt.css`, releasePath);
  });
}

/** List of released package names under `src`. */
const packageDirs: string[] = [
  'cdk',
  'material',
  'material-experimental',
  'cdk-experimental',
];

/**
 * Copies the partial for the given secondary entry point to the root of the release directory and
 * updates all imports from packages and secondary entry points in this repo to ones that will work
 * relative when the partial is imported from `node_modules`.
 */
function copyPartialToRootAndUpdateImports(
    buildPackage: BuildPackage, entryPointName: string, releasePath: string) {
  // Check if there is a partial with the same name as the secondary entry point and read it in.
  const sassPartialName = `_${entryPointName}.scss`;
  const sassPartialPath = join(buildPackage.outputDir, entryPointName, sassPartialName);
  if (!existsSync(sassPartialPath)) {
    return;
  }
  let sassPartialData = readFileSync(sassPartialPath).toString('utf8');

  // Iterate over the packages published from this repo and update any Sass imports from each one.
  for (let packageName of packageDirs) {
    let importPattern: string;

    if (packageName === buildPackage.name) {
      // If importing from another entry point under the same package, the import path will start
      // with `../`.
      importPattern = String.raw`\.\.\/`;
    } else {
      // If importing from another package in this repo, the import path will start with
      // `../../${packageDir}/`.
      importPattern = String.raw`\.\.\/\.\.\/${packageName}\/`;
    }
    if (packageName === 'material') {
      // If importing from the material package, the rest of the path can be anything (it doesn't
      // necessarily have to be a secondary entry point, since @angular/material bundles all of its
      // sass into `@angular/material/theming` before releasing. We just need to make sure the rest
      // of the path doesn't start with `.` to prevent accidentally matching on an import that's
      // going up another level (e.g. `../../cdk`).
      importPattern += String.raw`[^.].*`;
    } else {
      // If importing from any other package, we know the import must be from one of the secondary
      // entry points and that the partial must have the same name as the entry point
      // (e.g. ../../cdk/a11y/a11y).
      importPattern += String.raw`([^\/]+)\/\1`;
    }

    // Construct a regex for the full import statement now that we have the import path.
    const importRegex = new RegExp(String.raw`^@import '${importPattern}';$`, 'gm');

    if (packageName === 'material') {
      // If we're importing from `@angular/material`, update the first import to the combined bundle
      // and just remove the rest. (This is because `@angular/material` combines all of its Sass
      // partials into a single bundle rather than having 1 per secondary entry point.
      let updated = false;
      sassPartialData = sassPartialData.replace(importRegex, (match) => {
        const result = updated ? '' : `@import '../material/theming';`;
        updated = true;
        console.log(`Rewriting Sass import \`${match}\` to \`${result}\``);
        return result;
      });
    } else {
      // If we're importing from any other package, update the import to point to the partial that
      // was copied over to the root of the release directory.
      sassPartialData = sassPartialData.replace(importRegex, (match, importedEntryPointName) => {
        const result = `@import '../${packageName}/${importedEntryPointName}';`;
        console.log(`Rewriting Sass import \`${match}\` to \`${result}\``);
        return result;
      });
    }
  }

  // Write the file with modified imports to the root of the release directory.
  writeFileSync(join(releasePath, sassPartialName), sassPartialData);
}
