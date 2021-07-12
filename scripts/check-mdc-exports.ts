import {join} from 'path';
import {readdirSync, existsSync} from 'fs';
import * as ts from 'typescript';
import * as chalk from 'chalk';
import {config} from './check-mdc-exports-config';

// Script which ensures that a particular MDC package exports all of the same symbols as its
// non-MDC counterparts. Only looks at symbol names, not their signatures. Exceptions
// can be configured through the `check-mdc-exports-config.ts` file.

let hasFailed = false;

readdirSync(join(__dirname, '../src/material'), {withFileTypes: true})
  .filter(entity => entity.isDirectory())
  .map(entity => entity.name)
  .filter(name => !config.skippedPackages.includes(`mdc-${name}`))
  .filter(hasCorrespondingMdcPackage)
  .forEach(name => {
    checkPackage(name);

    const testingName = name + '/testing';
    if (hasTestingPackage(name) && hasCorrespondingMdcPackage(testingName)) {
      checkPackage(testingName);
    }
  });

if (hasFailed) {
  console.log(chalk.redBright(
    '\nDetected one or more MDC packages that do not export the same set of symbols from\n' +
    'public-api.ts as their non-MDC counterpart.\nEither implement the missing symbols or ' +
    're-export them from the Material package,\nor add them to the `skippedExports` list in ' +
    `scripts/check-mdc-exports-config.ts.`
    ));
  process.exit(1);
} else {
  console.log(chalk.green(
    'All MDC packages export the same public API symbols as their non-MDC counterparts.'));
  process.exit(0);
}

/** Checks whether the public API of a package matches up with its MDC counterpart. */
function checkPackage(name: string) {
  const missingSymbols = getMissingSymbols(name,
      config.skippedExports[`mdc-${name}`] || [],
      config.skippedSymbols || []);

  if (missingSymbols.length) {
    console.log(chalk.redBright(`\nMissing symbols from mdc-${name}:`));
    console.log(missingSymbols.join('\n'));
    hasFailed = true;
  }
}

/**
 * Gets the names of symbols that are present in a Material package,
 * but not its MDC counterpart.
 */
function getMissingSymbols(name: string, skipped: string[], skippedPatterns: RegExp[]): string[] {
  const mdcExports = getExports(`material-experimental/mdc-${name}`);
  const materialExports = getExports(`material/${name}`);

  if (!mdcExports.length) {
    throw Error(`Could not resolve exports in mdc-${name}`);
  }

  if (!materialExports.length) {
    throw Error(`Could not resolve exports in ${name}`);
  }

  return materialExports.filter(exportName => {
    return !skipped.includes(exportName) && !mdcExports.includes(exportName) &&
           !skippedPatterns.some(pattern => pattern.test(exportName));
  });
}

/**
 * Gets the name of the exported symbols from a particular package.
 */
function getExports(name: string): string[] {
  const entryPoint = join(__dirname, '../src', name, 'public-api.ts');
  const program = ts.createProgram([entryPoint], {
    // This is a bit faster than the default and seems to produce identical results.
    moduleResolution: ts.ModuleResolutionKind.Classic
  });
  const sourceFile = program.getSourceFiles().find(f => f.fileName.endsWith('public-api.ts'))!;
  const typeChecker = program.getTypeChecker();
  const mainSymbol = typeChecker.getSymbolAtLocation(sourceFile);

  return (mainSymbol ? (typeChecker.getExportsOfModule(mainSymbol) || []) : []).map(symbol => {
    // tslint:disable-next-line:no-bitwise
    if (symbol.flags & ts.SymbolFlags.Alias) {
      const resolvedSymbol = typeChecker.getAliasedSymbol(symbol);
      return (!resolvedSymbol.valueDeclaration && !resolvedSymbol.declarations) ?
        symbol : resolvedSymbol;
    } else {
      return symbol;
    }
  }).map(symbol => symbol.name);
}

/** Checks whether a particular Material package has an MDC-based equivalent. */
function hasCorrespondingMdcPackage(name: string): boolean {
  return existsSync(join(__dirname, '../src/material-experimental', 'mdc-' + name));
}

/** Checks whether a particular Material package has a testing sub-package. */
function hasTestingPackage(name: string): boolean {
  return existsSync(join(__dirname, '../src/material', name, 'testing'));
}
