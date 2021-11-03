/**
 * Test that collects all partially built NPM packages and links their Angular
 * declarations to the corresponding definitions.
 */

import {createEs2015LinkerPlugin} from '@angular/compiler-cli/linker/babel';
import {NodeJSFileSystem, ConsoleLogger, LogLevel} from '@angular/compiler-cli';
import {getNpmPackagesFromRunfiles} from '../npm-packages-from-runfiles.mjs';
import fs from 'fs';
import path from 'path';
import babel from '@babel/core';
import glob from 'glob';
import chalk from 'chalk';

/** File system used by the Angular linker plugin. */
const fileSystem = new NodeJSFileSystem();
/** Logger used by the Angular linker plugin. */
const logger = new ConsoleLogger(LogLevel.info);
/** List of NPM packages available in the Bazel runfiles. */
const npmPackages = getNpmPackagesFromRunfiles();
/** Whether any package could not be linked successfully. */
let failedPackages = false;

// Iterate through all determined NPM packages and ensure that entry point
// files can be processed successfully by the Angular linker.
for (const pkg of npmPackages) {
  const {failures, passedFiles} = testPackage(pkg);

  console.info(chalk.cyan(`------- Package: @angular/${pkg.name} -------`));
  console.info(`Passed files: ${passedFiles.length}`);
  console.info(`Failed files: ${failures.length}`);

  if (failures.length > 0) {
    failures.forEach(({debugFileName, error}) => {
      console.error(` •  ${chalk.yellow(debugFileName)}: ${error}`);
    });
    failedPackages = true;
  }

  console.info('-------------------------------------');
  console.info();
}

if (failedPackages) {
  console.error(chalk.red(`✘ Not all packages could be linked successfully. See errors above.`));
  // If there are failures, exit the process with a non-zero exit code. Bazel
  // uses exit code `3` to indicate non-fatal test failures.
  process.exitCode = 3;
} else {
  console.info(chalk.green('✓ All packages have been successfully linked.'));
}

/**
 * Tests the specified package against the Angular linker plugin.
 * @param pkg Package being tested.
 * @returns An object containing linker failures and passed files.
 */
function testPackage(pkg) {
  const entryPointFesmFiles = glob.sync(`+(fesm2015|fesm2020)/**/*.mjs`, {cwd: pkg.pkgPath});
  const passedFiles = [];
  const failures = [];

  // Iterate through each entry point and confirm that all partial declarations can be linked
  // to their corresponding Angular definitions without errors.
  for (const fesmFileName of entryPointFesmFiles) {
    const diskFilePath = path.join(pkg.pkgPath, fesmFileName);
    const debugFileName = path.join(pkg.name, fesmFileName);
    const fileContent = fs.readFileSync(diskFilePath, 'utf8');
    const linkerPlugin = createEs2015LinkerPlugin({fileSystem, logger});

    // Babel throws errors if the transformation fails. We catch these so that we
    // can print incompatible entry points with their errors at the end.
    try {
      const {ast} = babel.transformSync(fileContent, {
        ast: true,
        filename: diskFilePath,
        filenameRelative: debugFileName,
        plugins: [linkerPlugin],
      });

      // Naively check if there are any Angular declarations left that haven't been linked.
      babel.traverse(ast, {
        Identifier: astPath => {
          if (astPath.node.name.startsWith('ɵɵngDeclare')) {
            throw astPath.buildCodeFrameError(
              'Found Angular declaration that has not been linked.',
              Error,
            );
          }
        },
      });

      passedFiles.push(debugFileName);
    } catch (error) {
      failures.push({debugFileName, error});
    }
  }

  return {passedFiles, failures};
}
