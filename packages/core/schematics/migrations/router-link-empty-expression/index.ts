/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {logging, normalize} from '@angular-devkit/core';
import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import type {TmplAstBoundAttribute} from '@angular/compiler';
import {relative} from 'path';
import {loadEsmModule} from '../../utils/load_esm';

import {NgComponentTemplateVisitor, ResolvedTemplate} from '../../utils/ng_component_template';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {analyzeResolvedTemplate} from './analyze_template';

type Logger = logging.LoggerApi;

const README_URL =
    'https://github.com/angular/angular/blob/master/packages/core/schematics/migrations/router-link-empty-expression/README.md';

interface Replacement {
  start: number;
  end: number;
  newContent: string;
}
interface FixedTemplate {
  originalTemplate: ResolvedTemplate;
  replacements: Replacement[];
  emptyRouterlinkExpressions: TmplAstBoundAttribute[];
}

/** Entry point for the RouterLink empty expression migration. */
export default function(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();

    if (!buildPaths.length && !testPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot check templates for empty routerLinks.');
    }

    let compilerModule;
    try {
      // Load ESM `@angular/compiler` using the TypeScript dynamic import workaround.
      // Once TypeScript provides support for keeping the dynamic import this workaround can be
      // changed to a direct dynamic import.
      compilerModule = await loadEsmModule<typeof import('@angular/compiler')>('@angular/compiler');
    } catch (e) {
      throw new SchematicsException(
          `Unable to load the '@angular/compiler' package. Details: ${e.message}`);
    }

    for (const tsconfigPath of [...buildPaths, ...testPaths]) {
      runEmptyRouterLinkExpressionMigration(
          tree, tsconfigPath, basePath, context.logger, compilerModule);
    }
  };
}

/**
 * Runs the routerLink migration, changing routerLink="" to routerLink="[]" and notifying developers
 * which templates received updates.
 */
function runEmptyRouterLinkExpressionMigration(
    tree: Tree, tsconfigPath: string, basePath: string, logger: Logger,
    compilerModule: typeof import('@angular/compiler')) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  // Analyze source files by detecting HTML templates.
  sourceFiles.forEach(sourceFile => templateVisitor.visitNode(sourceFile));

  const {resolvedTemplates} = templateVisitor;
  fixEmptyRouterlinks(resolvedTemplates, tree, logger, compilerModule);
}

function fixEmptyRouterlinks(
    resolvedTemplates: ResolvedTemplate[], tree: Tree, logger: Logger,
    compilerModule: typeof import('@angular/compiler')) {
  const basePath = process.cwd();
  const collectedFixes: string[] = [];
  const fixesByFile = getFixesByFile(resolvedTemplates, compilerModule);

  for (const [absFilePath, templateFixes] of fixesByFile) {
    const treeFilePath = relative(normalize(basePath), normalize(absFilePath));
    const originalFileContent = tree.read(treeFilePath)?.toString();
    if (originalFileContent === undefined) {
      logger.error(
          `Failed to read file containing template; cannot apply fixes for empty routerLink expressions in ${
              treeFilePath}.`);
      continue;
    }

    const updater = tree.beginUpdate(treeFilePath);
    for (const templateFix of templateFixes) {
      // Sort backwards so string replacements do not conflict
      templateFix.replacements.sort((a, b) => b.start - a.start);
      for (const replacement of templateFix.replacements) {
        updater.remove(replacement.start, replacement.end - replacement.start);
        updater.insertLeft(replacement.start, replacement.newContent);
      }
      const displayFilePath = normalize(relative(basePath, templateFix.originalTemplate.filePath));
      for (const n of templateFix.emptyRouterlinkExpressions) {
        const {line, character} =
            templateFix.originalTemplate.getCharacterAndLineOfPosition(n.sourceSpan.start.offset);
        collectedFixes.push(`${displayFilePath}@${line + 1}:${character + 1}`);
      }
      tree.commitUpdate(updater);
    }
  }

  if (collectedFixes.length > 0) {
    logger.info('---- RouterLink empty assignment schematic ----');
    logger.info('The behavior of empty/`undefined` inputs for `routerLink` has changed');
    logger.info('from linking to the current page to instead completely disable the link.');
    logger.info(`Read more about this change here: ${README_URL}`);
    logger.info('');
    logger.info('The following empty `routerLink` inputs were found and fixed:');
    collectedFixes.forEach(fix => logger.warn(`⮑   ${fix}`));
  }
}

/**
 * Returns fixes for nodes in templates which contain empty routerLink assignments, grouped by file.
 */
function getFixesByFile(
    templates: ResolvedTemplate[],
    compilerModule: typeof import('@angular/compiler')): Map<string, FixedTemplate[]> {
  const fixesByFile = new Map<string, FixedTemplate[]>();
  for (const template of templates) {
    const templateFix = fixEmptyRouterlinksInTemplate(template, compilerModule);
    if (templateFix === null) {
      continue;
    }

    const file = template.filePath;
    if (fixesByFile.has(file)) {
      if (template.inline) {
        // External templates may be referenced multiple times in the project
        // (e.g. if shared between components), but we only want to record them
        // once. On the other hand, an inline template resides in a TS file that
        // may contain multiple inline templates.
        fixesByFile.get(file)!.push(templateFix);
      }
    } else {
      fixesByFile.set(file, [templateFix]);
    }
  }

  return fixesByFile;
}

function fixEmptyRouterlinksInTemplate(
    template: ResolvedTemplate, compilerModule: typeof import('@angular/compiler')): FixedTemplate|
    null {
  const emptyRouterlinkExpressions = analyzeResolvedTemplate(template, compilerModule);

  if (!emptyRouterlinkExpressions || emptyRouterlinkExpressions.length === 0) {
    return null;
  }

  const replacements: Replacement[] = [];
  for (const expr of emptyRouterlinkExpressions) {
    let replacement: Replacement;
    if (expr.valueSpan) {
      replacement = {
        start: template.start + expr.value.sourceSpan.start,
        end: template.start + expr.value.sourceSpan.end,
        newContent: '[]',
      };
    } else {
      const spanLength = expr.sourceSpan.end.offset - expr.sourceSpan.start.offset;
      // `expr.value.sourceSpan.start` is the start of the very beginning of the binding since there
      // is no value
      const endOfExpr = template.start + expr.value.sourceSpan.start + spanLength;
      replacement = {
        start: endOfExpr,
        end: endOfExpr,
        newContent: '="[]"',
      };
    }
    replacements.push(replacement);
  }

  return {originalTemplate: template, replacements, emptyRouterlinkExpressions};
}
