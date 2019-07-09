/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {logging, normalize} from '@angular-devkit/core';
import {Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {sync as globSync} from 'glob';
import {dirname, relative} from 'path';
import * as ts from 'typescript';

import {ComponentResourceCollector} from './component-resource-collector';
import {MigrationFailure, MigrationRule} from './migration-rule';
import {TargetVersion} from './target-version';
import {parseTsconfigFile} from './utils/parse-tsconfig';

export type Constructor<T> = new (...args: any[]) => T;

export function runMigrationRules<T>(
    tree: Tree, logger: logging.LoggerApi, tsconfigPath: string, targetVersion: TargetVersion,
    ruleTypes: Constructor<MigrationRule<T>>[], upgradeData: T,
    analyzedFiles: Set<string>): boolean {
  // The CLI uses the working directory as the base directory for the
  // virtual file system tree.
  const basePath = process.cwd();
  const parsed = parseTsconfigFile(tsconfigPath, dirname(tsconfigPath));
  const host = ts.createCompilerHost(parsed.options, true);

  // We need to overwrite the host "readFile" method, as we want the TypeScript
  // program to be based on the file contents in the virtual file tree.
  host.readFile = fileName => {
    const buffer = tree.read(getProjectRelativePath(fileName));
    // Strip BOM as otherwise TSC methods (e.g. "getWidth") will return an offset which
    // which breaks the CLI UpdateRecorder. https://github.com/angular/angular/pull/30719
    return buffer ? buffer.toString().replace(/^\uFEFF/, '') : undefined;
  };

  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const rules: MigrationRule<T>[] = [];

  // Create instances of all specified migration rules.
  for (const ruleCtor of ruleTypes) {
    const rule = new ruleCtor(program, typeChecker, targetVersion, upgradeData);
    rule.getUpdateRecorder = getUpdateRecorder;
    rule.init();
    if (rule.ruleEnabled) {
      rules.push(rule);
    }
  }

  const sourceFiles = program.getSourceFiles().filter(
      f => !f.isDeclarationFile && !program.isSourceFileFromExternalLibrary(f));
  const resourceCollector = new ComponentResourceCollector(typeChecker);
  const updateRecorderCache = new Map<string, UpdateRecorder>();

  sourceFiles.forEach(sourceFile => {
    const relativePath = getProjectRelativePath(sourceFile.fileName);
    // Do not visit source files which have been checked as part of a
    // previously migrated TypeScript project.
    if (!analyzedFiles.has(relativePath)) {
      _visitTypeScriptNode(sourceFile);
      analyzedFiles.add(relativePath);
    }
  });

  resourceCollector.resolvedTemplates.forEach(template => {
    const relativePath = getProjectRelativePath(template.filePath);
    // Do not visit the template if it has been checked before. Inline
    // templates cannot be referenced multiple times.
    if (template.inline || !analyzedFiles.has(relativePath)) {
      rules.forEach(r => r.visitTemplate(template));
      analyzedFiles.add(relativePath);
    }
  });

  resourceCollector.resolvedStylesheets.forEach(stylesheet => {
    const relativePath = getProjectRelativePath(stylesheet.filePath);
    // Do not visit the stylesheet if it has been checked before. Inline
    // stylesheets cannot be referenced multiple times.
    if (stylesheet.inline || !analyzedFiles.has(relativePath)) {
      rules.forEach(r => r.visitStylesheet(stylesheet));
      analyzedFiles.add(relativePath);
    }
  });

  // In some applications, developers will have global stylesheets which are not specified in any
  // Angular component. Therefore we glob up all CSS and SCSS files outside of node_modules and
  // dist. The files will be read by the individual stylesheet rules and checked.
  // TODO(devversion): double-check if we can solve this in a more elegant way.
  globSync('!(node_modules|dist)/**/*.+(css|scss)', {absolute: true, cwd: basePath})
      .filter(filePath => !resourceCollector.resolvedStylesheets.some(s => s.filePath === filePath))
      .forEach(filePath => {
        const stylesheet = resourceCollector.resolveExternalStylesheet(filePath, null);
        rules.forEach(r => r.visitStylesheet(stylesheet));
      });

  // Commit all recorded updates in the update recorder. We need to perform the
  // replacements per source file in order to ensure that offsets in the TypeScript
  // program are not incorrectly shifted.
  updateRecorderCache.forEach(recorder => tree.commitUpdate(recorder));

  // Collect all failures reported by individual migration rules.
  const ruleFailures =
      rules.reduce((res, rule) => res.concat(rule.failures), [] as MigrationFailure[]);

  // In case there are rule failures, print these to the CLI logger as warnings.
  if (ruleFailures.length) {
    ruleFailures.forEach(({filePath, message, position}) => {
      const normalizedFilePath = normalize(relative(basePath, filePath));
      const lineAndCharacter = `${position.line + 1}:${position.character + 1}`;
      logger.warn(`${normalizedFilePath}@${lineAndCharacter} - ${message}`);
    });
  }

  return !!ruleFailures.length;

  function getUpdateRecorder(filePath: string): UpdateRecorder {
    const treeFilePath = relative(basePath, filePath);
    if (updateRecorderCache.has(treeFilePath)) {
      return updateRecorderCache.get(treeFilePath)!;
    }
    const treeRecorder = tree.beginUpdate(treeFilePath);
    updateRecorderCache.set(treeFilePath, treeRecorder);
    return treeRecorder;
  }

  function _visitTypeScriptNode(node: ts.Node) {
    rules.forEach(r => r.visitNode(node));
    ts.forEachChild(node, _visitTypeScriptNode);
    resourceCollector.visitNode(node);
  }

  /** Gets the specified path relative to the project root. */
  function getProjectRelativePath(filePath: string) {
    return relative(basePath, filePath);
  }
}
