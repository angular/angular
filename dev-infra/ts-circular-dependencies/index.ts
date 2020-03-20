#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, readFileSync, writeFileSync} from 'fs';
import {sync as globSync} from 'glob';
import {join, relative, resolve} from 'path';
import * as ts from 'typescript';
import * as yargs from 'yargs';
import chalk from 'chalk';

import {Analyzer, ReferenceChain} from './analyzer';
import {compareGoldens, convertReferenceChainToGolden, Golden} from './golden';
import {convertPathToForwardSlash} from './file_system';

import {getRepoBaseDir} from '../utils/config';

const projectDir = getRepoBaseDir();
const packagesDir = join(projectDir, 'packages/');
// The default glob does not capture deprecated packages such as http, or the webworker platform.
const defaultGlob =
    join(packagesDir, '!(http|platform-webworker|platform-webworker-dynamic)/**/*.ts');

if (require.main === module) {
  const {_: command, goldenFile, glob, baseDir, warnings} =
      yargs.help()
          .version(false)
          .strict()
          .command('check <golden-file>', 'Checks if the circular dependencies have changed.')
          .command('approve <golden-file>', 'Approves the current circular dependencies.')
          .demandCommand()
          .option(
              'approve',
              {type: 'boolean', description: 'Approves the current circular dependencies.'})
          .option('warnings', {type: 'boolean', description: 'Prints all warnings.'})
          .option('base-dir', {
            type: 'string',
            description: 'Base directory used for shortening paths in the golden file.',
            default: projectDir,
            defaultDescription: 'Project directory'
          })
          .option('glob', {
            type: 'string',
            description: 'Glob that matches source files which should be checked.',
            default: defaultGlob,
            defaultDescription: 'All release packages'
          })
          .argv;
  const isApprove = command.includes('approve');
  process.exit(main(baseDir, isApprove, goldenFile, glob, warnings));
}

/**
 * Runs the ts-circular-dependencies tool.
 * @param baseDir Base directory which is used to build up relative file paths in goldens.
 * @param approve Whether the detected circular dependencies should be approved.
 * @param goldenFile Path to the golden file.
 * @param glob Glob that is used to collect all source files which should be checked/approved.
 * @param printWarnings Whether warnings should be printed. Warnings for unresolved modules/files
 *     are not printed by default.
 * @returns Status code.
 */
export function main(
    baseDir: string, approve: boolean, goldenFile: string, glob: string,
    printWarnings: boolean): number {
  const analyzer = new Analyzer(resolveModule);
  const cycles: ReferenceChain[] = [];
  const checkedNodes = new WeakSet<ts.SourceFile>();

  globSync(glob, {absolute: true}).forEach(filePath => {
    const sourceFile = analyzer.getSourceFile(filePath);
    cycles.push(...analyzer.findCycles(sourceFile, checkedNodes));
  });

  const actual = convertReferenceChainToGolden(cycles, baseDir);

  console.info(
      chalk.green(`   Current number of cycles: ${chalk.yellow(cycles.length.toString())}`));

  if (approve) {
    writeFileSync(goldenFile, JSON.stringify(actual, null, 2));
    console.info(chalk.green('✅  Updated golden file.'));
    return 0;
  } else if (!existsSync(goldenFile)) {
    console.error(chalk.red(`❌  Could not find golden file: ${goldenFile}`));
    return 1;
  }

  // By default, warnings for unresolved files or modules are not printed. This is because
  // it's common that third-party modules are not resolved/visited. Also generated files
  // from the View Engine compiler (i.e. factories, summaries) cannot be resolved.
  if (printWarnings &&
      (analyzer.unresolvedFiles.size !== 0 || analyzer.unresolvedModules.size !== 0)) {
    console.info(chalk.yellow('The following imports could not be resolved:'));
    analyzer.unresolvedModules.forEach(specifier => console.info(`  • ${specifier}`));
    analyzer.unresolvedFiles.forEach((value, key) => {
      console.info(`  • ${getRelativePath(baseDir, key)}`);
      value.forEach(specifier => console.info(`      ${specifier}`));
    });
  }

  const expected: Golden = JSON.parse(readFileSync(goldenFile, 'utf8'));
  const {fixedCircularDeps, newCircularDeps} = compareGoldens(actual, expected);
  const isMatching = fixedCircularDeps.length === 0 && newCircularDeps.length === 0;

  if (isMatching) {
    console.info(chalk.green('✅  Golden matches current circular dependencies.'));
    return 0;
  }

  console.error(chalk.red('❌  Golden does not match current circular dependencies.'));
  if (newCircularDeps.length !== 0) {
    console.error(chalk.yellow(`   New circular dependencies which are not allowed:`));
    newCircularDeps.forEach(c => console.error(`     • ${convertReferenceChainToString(c)}`));
  }
  if (fixedCircularDeps.length !== 0) {
    console.error(
        chalk.yellow(`   Fixed circular dependencies that need to be removed from the golden:`));
    fixedCircularDeps.forEach(c => console.error(`     • ${convertReferenceChainToString(c)}`));
    console.info();
    // Print the command for updating the golden. Note that we hard-code the script name for
    // approving default packages golden in `goldens/`. We cannot infer the script name passed to
    // Yarn automatically since script are launched in a child process where `argv0` is different.
    if (resolve(goldenFile) === resolve(projectDir, 'goldens/packages-circular-deps.json')) {
      console.info(
          chalk.yellow(`   Please approve the new golden with: yarn ts-circular-deps:approve`));
    } else {
      console.info(chalk.yellow(
          `   Please update the golden. The following command can be ` +
          `run: yarn ts-circular-deps approve ${getRelativePath(baseDir, goldenFile)}.`));
    }
  }
  return 1;
}

/** Gets the specified path relative to the base directory. */
function getRelativePath(baseDir: string, path: string) {
  return convertPathToForwardSlash(relative(baseDir, path));
}

/** Converts the given reference chain to its string representation. */
function convertReferenceChainToString(chain: ReferenceChain<string>) {
  return chain.join(' → ');
}

/**
 * Custom module resolver that maps specifiers starting with `@angular/` to the
 * local packages folder.
 */
function resolveModule(specifier: string) {
  if (specifier.startsWith('@angular/')) {
    return packagesDir + specifier.substr('@angular/'.length);
  }
  return null;
}
