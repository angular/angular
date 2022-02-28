/**
 * Script that goes through each source file that will be included in the
 * release output and checks if any module imports are not part of the
 * specified package externals Starlark file.
 *
 * This script is used to validate Bazel rollup globals. We use a genrule to
 * convert the Starlark external list into a JSON file which then can
 * be passed to this script to ensure that the list is up-to-date.
 */

import chalk from 'chalk';
import {readFileSync} from 'fs';
import minimatch from 'minimatch';
import {join, relative} from 'path';
import ts from 'typescript';

const projectRoot = join(__dirname, '../');
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error(chalk.red('No externals file has been specified.'));
  process.exit(1);
}

const packageExternals = JSON.parse(readFileSync(args[0], 'utf8')) as string[];
const configFile = ts.readJsonConfigFile(join(projectRoot, 'tsconfig.json'), ts.sys.readFile);
const parsedConfig = ts.parseJsonSourceFileConfigFileContent(configFile, ts.sys, projectRoot);
const filesToCheckGlob = [
  'src/**/!(*.spec).ts',
  '!src/+(e2e-app|universal-app|dev-app)/**/*.ts',
  '!src/**/schematics/**/*.ts',
  '!src/**/tests/**/*.ts',
  '!src/components-examples/private/localize-types.d.ts',
];

const failures = new Map<string, string[]>();

parsedConfig.fileNames.forEach(fileName => {
  const relativeFileName = relative(projectRoot, fileName);
  if (!filesToCheckGlob.every(g => minimatch(relativeFileName, g))) {
    return;
  }

  const sourceFile = ts.createSourceFile(
    fileName,
    readFileSync(fileName, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );

  const visitNode = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      // Parse out the module name. The first and last characters are the quote marks.
      const module = node.moduleSpecifier.getText().slice(1, -1);
      const isExternal = !module.startsWith('.') && !module.startsWith('/');

      // Check whether the module is external and whether it's in our rollup globals.
      if (isExternal && !packageExternals.includes(module)) {
        failures.set(fileName, (failures.get(fileName) || []).concat(module));
      }
    }

    ts.forEachChild(node, visitNode);
  };

  ts.forEachChild(sourceFile, visitNode);
});

if (failures.size) {
  console.error(chalk.red('  ✘   Package externals are not up-to-date.'));
  console.error();
  failures.forEach((missingExternals, fileName) => {
    console.error(chalk.yellow(`  ⮑   ${fileName}:`));
    missingExternals.forEach(g => console.error(`      - ${g}`));
  });
  process.exit(1);
} else {
  console.info(chalk.green('  ✓   Package externals are up-to-date.'));
}
