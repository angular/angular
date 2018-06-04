/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import {RuleFailure} from 'tslint/lib';
import {AbstractRule} from 'tslint/lib/rules';
import * as ts from 'typescript';


function _isRollupPath(path: string) {
  return /rollup\.config\.js$/.test(path);
}

// Regexes to blacklist.
const sourceFilePathBlacklist = [
  /\.spec\.ts$/,
  /_spec\.ts$/,
  /_perf\.ts$/,
  /_example\.ts$/,
  /[/\\]test[/\\]/,
  /[/\\]testing_internal\.ts$/,
  /[/\\]integrationtest[/\\]/,
  /[/\\]packages[/\\]bazel[/\\]/,
  /[/\\]packages[/\\]benchpress[/\\]/,
  /[/\\]packages[/\\]examples[/\\]/,
  /[/\\]packages[/\\]elements[/\\]schematics[/\\]/,

  // language-service bundles everything in its UMD, so we don't need a globals. There are
  // exceptions but we simply ignore those files from this rule.
  /[/\\]packages[/\\]language-service[/\\]/,

  // Compiler CLI is never part of a browser (there's a browser-rollup but it's managed
  // separately.
  /[/\\]packages[/\\]compiler-cli[/\\]/,

  // service-worker is a special package that has more than one rollup config. It confuses
  // this lint rule and we simply ignore those files.
  /[/\\]packages[/\\]service-worker[/\\]/,
];

// Import package name whitelist. These will be ignored.
const importsWhitelist = [
  '@angular/compiler-cli',                        // Not used in a browser.
  '@angular/compiler-cli/src/language_services',  // Deep import from language-service.
  'chokidar',  // Not part of compiler-cli/browser, but still imported.
  'reflect-metadata',
  'tsickle',
  'url',  // Part of node, no need to alias in rollup.
  'zone.js',
];

const packageScopedImportWhitelist: [RegExp, string[]][] = [
  [/service-worker[/\\]cli/, ['@angular/service-worker']],
];


// Return true if the file should be linted.
function _pathShouldBeLinted(path: string) {
  return /[/\\]packages[/\\]/.test(path) && sourceFilePathBlacklist.every(re => !re.test(path));
}


/**
 *                  .--.         _________________
 *  {\             / q {\      / globalGlobalMap /
 *  { `\           \ (-(~`   <__________________/
 * { '.{`\          \ \ )
 * {'-{ ' \  .-""'-. \ \
 * {._{'.' \/       '.) \
 * {_.{.   {`            |
 * {._{ ' {   ;'-=-.     |
 *  {-.{.' {  ';-=-.`    /
 *   {._.{.;    '-=-   .'
 *    {_.-' `'.__  _,-'
 *             |||`
 *            .='==,
 */
interface RollupMatchInfo {
  filePath: string;
  globals: {[packageName: string]: string};
}
const globalGlobalRollupMap = new Map<string, RollupMatchInfo>();


export class Rule extends AbstractRule {
  public apply(sourceFile: ts.SourceFile): RuleFailure[] {
    const allImports = <ts.ImportDeclaration[]>sourceFile.statements.filter(
        x => x.kind === ts.SyntaxKind.ImportDeclaration);

    // Ignore specs, non-package files, and examples.
    if (!_pathShouldBeLinted(sourceFile.fileName)) {
      return [];
    }

    // Find the rollup.config.js from this location, if it exists.
    // If rollup cannot be found, this is an error.
    let p = path.dirname(sourceFile.fileName);
    let checkedPaths = [];
    let match: RollupMatchInfo;

    while (p.startsWith(process.cwd())) {
      if (globalGlobalRollupMap.has(p)) {
        // We already resolved for this directory, just return it.
        match = globalGlobalRollupMap.get(p);
        break;
      }

      const allFiles = fs.readdirSync(p);
      const maybeRollupPath = allFiles.find(x => _isRollupPath(path.join(p, x)));
      if (maybeRollupPath) {
        const rollupFilePath = path.join(p, maybeRollupPath);
        const rollupConfig = require(rollupFilePath);
        match = {filePath: rollupFilePath, globals: rollupConfig && rollupConfig.globals};

        // Update all paths that we checked along the way.
        checkedPaths.forEach(path => globalGlobalRollupMap.set(path, match));
        globalGlobalRollupMap.set(rollupFilePath, match);
        break;
      }

      checkedPaths.push(p);
      p = path.dirname(p);
    }
    if (!match) {
      throw new Error(
          `Could not find rollup.config.js for ${JSON.stringify(sourceFile.fileName)}.`);
    }

    const rollupFilePath = match.filePath;
    const globalConfig = match.globals || Object.create(null);

    return allImports
        .map(importStatement => {
          const modulePath = (importStatement.moduleSpecifier as ts.StringLiteral).text;
          if (modulePath.startsWith('.')) {
            return null;
          }

          if (importsWhitelist.indexOf(modulePath) != -1) {
            return null;
          }

          for (const [re, arr] of packageScopedImportWhitelist) {
            if (re.test(sourceFile.fileName) && arr.indexOf(modulePath) != -1) {
              return null;
            }
          }

          if (!(modulePath in globalConfig)) {
            return new RuleFailure(
                sourceFile, importStatement.getStart(), importStatement.getWidth(),
                `Import ${JSON.stringify(modulePath)} could not be found in the rollup config ` +
                    `at path ${JSON.stringify(rollupFilePath)}.`,
                this.ruleName, );
          }

          return null;
        })
        .filter(x => !!x);
  }
}
