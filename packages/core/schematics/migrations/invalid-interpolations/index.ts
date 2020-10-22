/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {logging, normalize} from '@angular-devkit/core';
import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {AbsoluteSourceSpan, DEFAULT_INTERPOLATION_CONFIG} from '@angular/compiler';
import {relative} from 'path';

import {computeLineStartsMap, getLineAndCharacterFromPosition} from '../../utils/line_mappings';
import {NgComponentTemplateVisitor, ResolvedTemplate} from '../../utils/ng_component_template';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {createMigrationProgram} from '../../utils/typescript/compiler_host';

type Logger = logging.LoggerApi;

interface FixedTemplate {
  origTemplate: ResolvedTemplate;
  newContent: string;
  invalidInterpolations: InvalidInterpolation[];
}

interface InvalidInterpolation {
  original: string;
  span: AbsoluteSourceSpan;
}

/** Entry point for the V8 template variable assignment schematic. */
export default function(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();

    if (!buildPaths.length && !testPaths.length) {
      throw new SchematicsException(
          'Could not find any project config file; cannot check for invalid interpolations.');
    }

    const logger = context.logger.createChild('Invalid Interpolation Fixer');
    for (const tsconfigPath of [...buildPaths, ...testPaths]) {
      fixInvalidInterpolations(tree, tsconfigPath, basePath, logger);
    }
  };
}

/**
 * Detects, fixes, and informs user of malformed interpolation-like strings in
 * all templates in the project.
 */
function fixInvalidInterpolations(
    tree: Tree, tsconfigPath: string, basePath: string, logger: Logger) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
  const sourceFiles = program.getSourceFiles().filter(
      f => !f.isDeclarationFile && !program.isSourceFileFromExternalLibrary(f));
  sourceFiles.forEach(sourceFile => templateVisitor.visitNode(sourceFile));

  const collectedFixes: string[] = [];
  const fixesByFile = getFixesByFile(templateVisitor.resolvedTemplates);

  fixesByFile.forEach((fixes, absFilePath) => {
    const treeFilePath = normalize(relative(basePath, absFilePath));
    const origFileContent = tree.read(treeFilePath)?.toString();
    if (origFileContent === undefined) {
      logger.error(
          'Failed to read file containing template; cannot apply fixes for invalid interpolations.');
      return;
    }

    // Apply fixes for each template in the current file.
    const updater = tree.beginUpdate(treeFilePath);
    for (const fix of fixes) {
      updater.remove(fix.origTemplate.start, fix.origTemplate.content.length);
      updater.insertLeft(fix.origTemplate.start, fix.newContent);
    }
    tree.commitUpdate(updater);

    // Record detected malformed interpolation-like content
    const lineStartsMap = computeLineStartsMap(origFileContent);
    for (const tmplFix of fixes) {
      for (const {span, original} of tmplFix.invalidInterpolations) {
        const {line, character} = getLineAndCharacterFromPosition(lineStartsMap, span.start);
        collectedFixes.push(`${treeFilePath}@${line + 1}:${character + 1}: ${original}`);
      }
    }
  });

  if (collectedFixes.length > 0) {
    logger.info('---- Invalid Interpolation schematic ----');
    logger.info('Malformed interpolation-like markup like "{{ 1 }" or "{{ 1 }<!-- -->}"');
    logger.info('are no longer valid. Interpolation delimiters should be escaped explicitly,');
    logger.info(`for example as in "{{ '{{' }} 1 {{ '}}' }}".`);
    logger.info('');
    logger.info('This schematic has detected and fixed the following malformed interpolations:');
    for (const fix of collectedFixes) {
      logger.info(`    ${fix}`);
    }
  }
}

/**
 * Returns fixes for nodes in a template containing invalid interpolations,
 * grouped by file.
 */
function getFixesByFile(templates: ResolvedTemplate[]): Map<string, FixedTemplate[]> {
  const fixesByFile = new Map<string, FixedTemplate[]>();
  for (const template of templates) {
    if (template.interpolationConfig !== DEFAULT_INTERPOLATION_CONFIG) {
      // This schematic is only concerned with the default interpolation config
      // delimited by {{ / }}; do not attempt to fix custom interpolations.
      continue;
    }

    const templateFix = fixInterpolations(template);
    if (templateFix === null) {
      continue;
    }

    const file = template.filePath;
    if (fixesByFile.has(file)) {
      fixesByFile.get(file)!.push(templateFix);
    } else {
      fixesByFile.set(file, [templateFix]);
    }
  }

  return fixesByFile;
}

const RE_INTERPOLATIONS: ReadonlyArray<[RegExp, string]> = [
  // Matching an interpolation:
  //
  // {{((?:[^}'"]|'[^']*?'|"[^"]*?")*?)}
  //        ^^^^^^                    match everything except a }, ", or '
  //               ^^^^^^^^ ^^^^^^^^  or any quoted string

  // Replace "{{expr}<!-- cmt -->}" with "{{ '{{' }} expr {{ '}}' }}".
  // The former is a little-known pattern previously used to display an
  // iterpolation literally, but that does not longer parse. The latter would
  // still parse.
  [
    /{{((?:'[^']*?'|"[^"]*?"|[^}'"])*?)}<!--.*-->}/g,
    //                                 ^^^^^^^^^^^ match a comment b/w braces
    `{{ '{{' }}$1{{ '}}' }}`
  ],

  // Replace "{{expr}" with "{{ '{{' }} expr {{ '}' }}".
  [/{{((?:'[^']*?'|"[^"]*?"|[^}'"])*?)}(?!})/g, `{{ '{{' }}$1{{ '}' }}`],
  //                                  ^^^^^^ match a singularly-terminated interpolation
];

/**
 * Finds all invalid interpolation-like markup in a template, returning a `FixedTemplate` if 1+
 * invalid interpolations are found, and `null` otherwise.
 */
function fixInterpolations(template: ResolvedTemplate): FixedTemplate|null {
  let newContent = template.content;
  const invalidInterpolations: InvalidInterpolation[] = [];
  for (const [reInterpolation, replacement] of RE_INTERPOLATIONS) {
    // First detect invalid interpolations, then fix all of them.
    let match;
    while (match = reInterpolation.exec(newContent)) {
      const start = template.start + match.index;
      const end = start + match[0].length;
      invalidInterpolations.push({span: new AbsoluteSourceSpan(start, end), original: match[0]});
    }

    newContent = newContent.replace(reInterpolation, replacement);
  }

  if (invalidInterpolations.length === 0) {
    return null;
  }

  return {
    origTemplate: template,
    newContent,
    invalidInterpolations,
  };
}
