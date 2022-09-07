const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const chalk = require('chalk');

/** -------------------------------------------------------------------------------------------- */
/** -------------------------------------- ERROR HANDLING -------------------------------------- */
/** -------------------------------------------------------------------------------------------- */

/** Stores all errors that are caught during execution. */
const errors = [];

/** Throws an error explaining that the given export node must be explicit. */
function throwExplicitExportError(path, content, node) {
  const invalidExport = content
    .substring(node.jsDoc ? node.jsDoc[0].end : node.pos, node.end)
    .trim();
  errors.push(
    chalk.red(
      `ERROR ${errors.length + 1}:` +
        `\n  File: ${path}` +
        `\n  Line: "${invalidExport}"` +
        `\n  Re-exports must be explicit. For example:` +
        `\n    [x] export * from './foo';` +
        `\n    [✓] export {MatFoo} from './foo';`,
    ),
  );
}

/** Throws an error explaining that the name(s) of given export node must contain "legacy". */
function throwLegacyNamingError(path, node) {
  const invalidSymbol = node.exportClause.elements
    .map(n => n.name.escapedText)
    .filter(n => !n.includes('legacy'))
    .map(n => `    * ${n}`)
    .join('\n');
  errors.push(
    chalk.red(
      `ERROR ${errors.length + 1}:` +
        `\n  File: ${path}` +
        `\n  The following exported symbols do not contain 'legacy':` +
        `\n${invalidSymbol}`,
    ),
  );
}

/** -------------------------------------------------------------------------------------------- */
/** --------------------------------------- BEGIN SCRIPT --------------------------------------- */
/** -------------------------------------------------------------------------------------------- */

/** An array of the file paths of all public-api.ts files for legacy components. */
const paths = fs
  .readdirSync(path.join(path.dirname(__dirname), 'src/material'))
  .filter(dir => dir.startsWith('legacy-'))
  .filter(dir => dir !== 'legacy-prebuilt-themes' && dir !== 'legacy-core')
  .flatMap(dir => {
    const base = path.join(path.dirname(__dirname), 'src/material', dir);
    return [path.join(base, 'public-api.ts'), path.join(base, 'testing/public-api.ts')];
  });

for (let i = 0; i < paths.length; i++) {
  const content = fs.readFileSync(paths[i], 'utf8');
  ts.createSourceFile(paths[i], content, ts.ScriptTarget.Latest).forEachChild(child => {
    // todo: consider enforcing this for all public-api.ts files.
    if (!ts.isExportDeclaration(child)) {
      return;
    }

    // Do not allow wildcard forwarding of exports.
    // E.g. `export * from './foo';` vs `export {Foo} from './foo';`.
    if (!child.exportClause) {
      throwExplicitExportError(paths[i], content, child);
      return;
    }

    // Ensure all exports from public-api.ts files nested
    // under src/legacy-* directory contain the word "legacy".
    for (let j = 0; j < child.exportClause.elements.length; j++) {
      if (!child.exportClause.elements[j].name.escapedText.toLowerCase().includes('legacy')) {
        throwLegacyNamingError(paths[i], child);
        return;
      }
    }
  });
}

/** -------------------------------------------------------------------------------------------- */
/** ------------------------------------- ERROR REPORTING -------------------------------------- */
/** -------------------------------------------------------------------------------------------- */

if (errors.length) {
  const separator = chalk.red('\n-----------------------------------------------------\n');
  console.log(
    chalk.red(`\nPublic APIs check failed with ${errors.length} error(s)`),
    separator,
    errors.join(`${separator}`),
    separator,
  );
  process.exitCode = 1;
} else {
  console.log(chalk.green('✓ All public-api format checks passed!'));
}
