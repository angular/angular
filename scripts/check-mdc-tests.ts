import {readdirSync, readFileSync} from 'fs';
import {join, basename} from 'path';
import {sync as glob} from 'glob';
import * as chalk from 'chalk';
import * as ts from 'typescript';
import {config} from './check-mdc-tests-config';

const srcDirectory = join(__dirname, '../src');
const materialDirectories = readdirSync(join(srcDirectory, 'material'));
let hasFailed = false;

// Goes through all the unit tests and flags the ones that don't exist in the MDC components.
readdirSync(join(srcDirectory, 'material-experimental'), {withFileTypes: true})
  .reduce((matches, entity) => {
    // Go through all the `material-experimental` directories and match them to ones in `material`.
    if (entity.isDirectory()) {
      const materialName = entity.name.replace(/^mdc-/, '');

      if (materialDirectories.indexOf(materialName) > -1) {
        matches.set(materialName, entity.name);
      }
    }

    return matches;
  }, new Map<string, string>())
  .forEach((mdcPackage, materialPackage) => {
    if (config.skippedPackages.includes(mdcPackage)) {
      return;
    }

    const mdcTestFiles = getUnitTestFiles(`material-experimental/${mdcPackage}`);
    const skippedTests = config.skippedTests[mdcPackage] || [];

    // MDC entry points that don't have test files may not have been implemented yet.
    if (mdcTestFiles.length > 0) {
      // Filter out files that don't exist in the MDC package, allowing
      // us to ignore some files which may not need to be ported to MDC.
      const materialTestFiles = getUnitTestFiles(`material/${materialPackage}`).filter(path => {
        const fileName = basename(path);
        return mdcTestFiles.some(file => basename(file) === fileName);
      });
      const materialTests = getTestNames(materialTestFiles);
      const mdcTests = getTestNames(mdcTestFiles);
      const missingTests = materialTests
          .filter(test => !mdcTests.includes(test) && !skippedTests.includes(test));

      if (missingTests.length > 0) {
        const errorMessage = `\nTests from \`${materialPackage}\` missing in \`${mdcPackage}\`:`;
        console.log(chalk.redBright(errorMessage));
        console.log(missingTests.join('\n'));
        hasFailed = true;
      }
    }
  });

if (hasFailed) {
  console.log(chalk.redBright(
    '\nDetected one or more MDC packages that have not implemented all tests from their ' +
    'non-MDC counterpart.\nEither implement the missing tests or add them to the ' +
    '`skippedTests` array inside `scripts/check-mdc-tests-config.ts`\n'
    ));
  process.exit(1);
} else {
  console.log(chalk.green('All MDC tests have been implemented.'));
  process.exit(0);
}

/**
 * Gets all the names of all unit test files inside a
 * package name, excluding `testing` packages and e2e tests.
 */
function getUnitTestFiles(name: string): string[] {
  return glob('{,!(testing)/**/}!(*.e2e).spec.ts', {
    absolute: true,
    cwd: join(srcDirectory, name)
  });
}

/** Gets the name of all unit tests within a set of files. */
function getTestNames(files: string[]): string[] {
  const testNames: string[] = [];

  files.forEach(file => {
    const content = readFileSync(file, 'utf-8');
    const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.ES2015);

    sourceFile.forEachChild(function walk(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
          node.expression.text === 'it') {
        // Note that this is a little naive since it'll take the literal text of the test
        // name expression which could include things like string concatenation. It's fine
        // for the limited use cases of the script.
        testNames.push(node.arguments[0].getText(sourceFile)
          // Replace the quotes around the test name.
          .replace(/^['`]|['`]$/g, '')
          // Strip newlines followed by indentation.
          .replace(/\n\s+/g, ' ')
          // Strip escape characters.
          .replace(/\\/g, '')
          // Collapse concatenated strings.
          .replace(/['`]\s+\+\s+['`]/g, ''));
      } else {
        node.forEachChild(walk);
      }
    });
  });

  return testNames;
}
