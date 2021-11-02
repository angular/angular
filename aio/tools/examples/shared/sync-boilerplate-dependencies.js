#!/usr/bin/env node

/**
 * Usage:
 * ```sh
 * node sync-boilerplate-dependencies
 * ```
 *
 * Updates the dependency versions of the top-level `package.json` files in each sub-folder of
 * `./boilerplate/` to match the ones in `./package.json`.
 */
const fs = require('fs');
const path = require('path');


const BOILERPLATE_DIR = `${__dirname}/boilerplate`;
const SHARED_PACKAGE_JSON_PATH = `${__dirname}/package.json`;

const sharedPkgJson = loadJsonFile(SHARED_PACKAGE_JSON_PATH);
const boilerplatePkgJsonPaths = collectPackageJsonFiles(BOILERPLATE_DIR);

boilerplatePkgJsonPaths.forEach(syncDependencies);

// Helpers
function collectPackageJsonFiles(dirPath) {
  return fs.readdirSync(dirPath)
      .map(childName => `${dirPath}/${childName}`)
      .filter(childPath => fs.statSync(childPath).isDirectory())
      .map(subDirPath => `${subDirPath}/package.json`)
      .filter(pkgJsonPath => fs.existsSync(pkgJsonPath));
}

function loadJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function syncDependencies(boilerplatePkgJsonPath) {
  console.log(`Syncing '${path.relative(__dirname, boilerplatePkgJsonPath)}'...`);

  const boilerplatePkgJson = loadJsonFile(boilerplatePkgJsonPath);

  ['dependencies', 'devDependencies', 'peerDependencies']
    .filter(depsProp => boilerplatePkgJson.hasOwnProperty(depsProp))
    .forEach(depsProp => {
      const srcDeps = sharedPkgJson[depsProp];
      const dstDeps = boilerplatePkgJson[depsProp];

      for (const dep of Object.keys(dstDeps)) {
        if (!srcDeps.hasOwnProperty(dep)) {
          throw new Error(
              `Unable to update dependency '${dep}' in '${boilerplatePkgJsonPath} > ${depsProp}'. ` +
              `The dependency is missing from '${SHARED_PACKAGE_JSON_PATH}'.`);
        }

        dstDeps[dep] = srcDeps[dep];
      }
    });

  fs.writeFileSync(boilerplatePkgJsonPath, `${JSON.stringify(boilerplatePkgJson, null, 2)}\n`);
}
