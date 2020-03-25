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
import {isAbsolute, relative, resolve} from 'path';
import * as ts from 'typescript';
import * as yargs from 'yargs';
import chalk from 'chalk';

import {Analyzer, ReferenceChain} from './analyzer';
import {compareGoldens, convertReferenceChainToGolden, Golden} from './golden';
import {convertPathToForwardSlash} from './file_system';
import {loadTestConfig, CircularDependenciesTestConfig} from './config';

if (require.main === module) {
  const {_: command, config: configArg, warnings} =
      yargs.help()
          .strict()
          .command('check', 'Checks if the circular dependencies have changed.')
          .command('approve', 'Approves the current circular dependencies.')
          .demandCommand()
          .option(
              'config',
              {type: 'string', demandOption: true, description: 'Path to the configuration file.'})
          .option('warnings', {type: 'boolean', description: 'Prints all warnings.'})
          .argv;
  const configPath = isAbsolute(configArg) ? configArg : resolve(configArg);
  const config = loadTestConfig(configPath);
  const isApprove = command.includes('approve');
  process.exit(main(isApprove, config, warnings));
}

/**
 * Runs the ts-circular-dependencies tool.
 * @param approve Whether the detected circular dependencies should be approved.
 * @param config Configuration for the current circular dependencies test.
 * @param printWarnings Whether warnings should be printed out.
 * @returns Status code.
 */
export function main(
    approve: boolean, config: CircularDependenciesTestConfig, printWarnings: boolean): number {
  const {baseDir, goldenFile, glob, resolveModule, approveCommand} = config;
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

  const warningsCount = analyzer.unresolvedFiles.size + analyzer.unresolvedModules.size;

  // By default, warnings for unresolved files or modules are not printed. This is because
  // it's common that third-party modules are not resolved/visited. Also generated files
  // from the View Engine compiler (i.e. factories, summaries) cannot be resolved.
  if (printWarnings && warningsCount !== 0) {
    console.info(chalk.yellow('⚠  The following imports could not be resolved:'));
    analyzer.unresolvedModules.forEach(specifier => console.info(`  • ${specifier}`));
    analyzer.unresolvedFiles.forEach((value, key) => {
      console.info(`  • ${getRelativePath(baseDir, key)}`);
      value.forEach(specifier => console.info(`      ${specifier}`));
    });
  } else {
    console.info(chalk.yellow(`⚠  ${warningsCount} imports could not be resolved.`));
    console.info(chalk.yellow(`   Please rerun with "--warnings" to inspect unresolved imports.`));
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
    if (approveCommand) {
      console.info(chalk.yellow(`   Please approve the new golden with: ${approveCommand}`));
    } else {
      console.info(chalk.yellow(
          `   Please update the golden. The following command can be ` +
          `run: yarn ts-circular-deps approve ${getRelativePath(process.cwd(), goldenFile)}.`));
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
