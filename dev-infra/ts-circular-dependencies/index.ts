/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, readFileSync, writeFileSync} from 'fs';
import {sync as globSync} from 'glob';
import {isAbsolute, relative, resolve} from 'path';
import * as ts from 'typescript';
import * as yargs from 'yargs';

import {error, green, info, red, yellow} from '../utils/console';

import {Analyzer, ReferenceChain} from './analyzer';
import {CircularDependenciesTestConfig, loadTestConfig} from './config';
import {convertPathToForwardSlash} from './file_system';
import {compareGoldens, convertReferenceChainToGolden, Golden} from './golden';


export function tsCircularDependenciesBuilder(localYargs: yargs.Argv) {
  return localYargs.help()
      .strict()
      .demandCommand()
      .option(
          'config',
          {type: 'string', demandOption: true, description: 'Path to the configuration file.'})
      .option('warnings', {type: 'boolean', description: 'Prints all warnings.'})
      .command(
          'check', 'Checks if the circular dependencies have changed.', args => args,
          argv => {
            const {config: configArg, warnings} = argv;
            const configPath = isAbsolute(configArg) ? configArg : resolve(configArg);
            const config = loadTestConfig(configPath);
            process.exit(main(false, config, !!warnings));
          })
      .command('approve', 'Approves the current circular dependencies.', args => args, argv => {
        const {config: configArg, warnings} = argv;
        const configPath = isAbsolute(configArg) ? configArg : resolve(configArg);
        const config = loadTestConfig(configPath);
        process.exit(main(true, config, !!warnings));
      });
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

  globSync(glob, {absolute: true, ignore: ['**/node_modules/**']}).forEach(filePath => {
    const sourceFile = analyzer.getSourceFile(filePath);
    cycles.push(...analyzer.findCycles(sourceFile, checkedNodes));
  });

  const actual = convertReferenceChainToGolden(cycles, baseDir);

  info(green(`   Current number of cycles: ${yellow(cycles.length.toString())}`));

  if (approve) {
    writeFileSync(goldenFile, JSON.stringify(actual, null, 2));
    info(green('✅  Updated golden file.'));
    return 0;
  } else if (!existsSync(goldenFile)) {
    error(red(`❌  Could not find golden file: ${goldenFile}`));
    return 1;
  }

  const warningsCount = analyzer.unresolvedFiles.size + analyzer.unresolvedModules.size;

  // By default, warnings for unresolved files or modules are not printed. This is because
  // it's common that third-party modules are not resolved/visited. Also generated files
  // from the View Engine compiler (i.e. factories, summaries) cannot be resolved.
  if (printWarnings && warningsCount !== 0) {
    info(yellow('⚠  The following imports could not be resolved:'));
    Array.from(analyzer.unresolvedModules).sort().forEach(specifier => info(`  • ${specifier}`));
    analyzer.unresolvedFiles.forEach((value, key) => {
      info(`  • ${getRelativePath(baseDir, key)}`);
      value.sort().forEach(specifier => info(`      ${specifier}`));
    });
  } else {
    info(yellow(`⚠  ${warningsCount} imports could not be resolved.`));
    info(yellow(`   Please rerun with "--warnings" to inspect unresolved imports.`));
  }

  const expected = JSON.parse(readFileSync(goldenFile, 'utf8')) as Golden;
  const {fixedCircularDeps, newCircularDeps} = compareGoldens(actual, expected);
  const isMatching = fixedCircularDeps.length === 0 && newCircularDeps.length === 0;

  if (isMatching) {
    info(green('✅  Golden matches current circular dependencies.'));
    return 0;
  }

  error(red('❌  Golden does not match current circular dependencies.'));
  if (newCircularDeps.length !== 0) {
    error(yellow(`   New circular dependencies which are not allowed:`));
    newCircularDeps.forEach(c => error(`     • ${convertReferenceChainToString(c)}`));
    error();
  }
  if (fixedCircularDeps.length !== 0) {
    error(yellow(`   Fixed circular dependencies that need to be removed from the golden:`));
    fixedCircularDeps.forEach(c => error(`     • ${convertReferenceChainToString(c)}`));
    info(yellow(`\n   Total: ${newCircularDeps.length} new cycle(s), ${
        fixedCircularDeps.length} fixed cycle(s). \n`));
    if (approveCommand) {
      info(yellow(`   Please approve the new golden with: ${approveCommand}`));
    } else {
      info(yellow(
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
