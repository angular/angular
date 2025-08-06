/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HtmlParser, ParseTreeResult, visitAll, RecursiveVisitor, Element} from '@angular/compiler';
import {
  ProgramInfo,
  projectFile,
  ProjectFileID,
  Replacement,
  TextUpdate,
  ProjectFile,
} from '../../utils/tsurge';
import ts from 'typescript';
import {ImportManager} from '@angular/compiler-cli/src/ngtsc/translator';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {MigrationConfig} from './types';

export function migrateNgClassBindings(
  template: string,
  config: MigrationConfig,
  componentNode?: ts.ClassDeclaration,
  typeChecker?: ts.TypeChecker,
): {
  replacementCount: number;
  migrated: string;
  changed: boolean;
} {
  const parsed = parseHtmlTemplate(template);
  if (!parsed.tree || !parsed.tree.rootNodes.length) {
    return {migrated: template, changed: false, replacementCount: 0};
  }

  const visitor = new NgClassCollector(template, componentNode, typeChecker);
  visitAll(visitor, parsed.tree.rootNodes, config);

  let newTemplate = template;
  let changedOffset = 0;
  let replacementCount = 0;

  for (const {start, end, replacement} of visitor.replacements) {
    const currentLength = newTemplate.length;

    newTemplate = replaceTemplate(newTemplate, replacement, start, end, changedOffset);
    changedOffset += newTemplate.length - currentLength;
    replacementCount++;
  }

  return {migrated: newTemplate, changed: changedOffset !== 0, replacementCount};
}

/**
 * Creates a Replacement to remove `NgClass` from a component's `imports` array.
 */
export function createNgClassImportsArrayRemoval(
  classNode: ts.ClassDeclaration,
  file: ProjectFile,
): Replacement | null {
  const decorator = ts
    .getDecorators(classNode)
    ?.find(
      (d) =>
        ts.isCallExpression(d.expression) &&
        ts.isIdentifier(d.expression.expression) &&
        d.expression.expression.text === 'Component',
    );

  if (
    !decorator ||
    !ts.isCallExpression(decorator.expression) ||
    decorator.expression.arguments.length === 0 ||
    !ts.isObjectLiteralExpression(decorator.expression.arguments[0])
  ) {
    return null;
  }

  const objLiteral = decorator.expression.arguments[0];
  const importsProperty = objLiteral.properties.find(
    (p): p is ts.PropertyAssignment =>
      ts.isPropertyAssignment(p) &&
      p.name.getText() === 'imports' &&
      ts.isArrayLiteralExpression(p.initializer),
  );

  if (!importsProperty || !ts.isArrayLiteralExpression(importsProperty.initializer)) {
    return null;
  }

  const importsArray = importsProperty.initializer;
  const ngClassImportElement = importsArray.elements.find(
    (e): e is ts.Identifier => ts.isIdentifier(e) && e.text === 'NgClass',
  );

  if (!ngClassImportElement) {
    return null;
  }

  const elements = importsArray.elements;
  const index = elements.indexOf(ngClassImportElement);
  let start = ngClassImportElement.getStart();
  let end = ngClassImportElement.getEnd();

  // Handle commas to avoid leaving trailing commas or syntax errors.
  if (elements.length > 1) {
    if (index === 0) {
      // First element: remove up to the start of the next element (including comma).
      const nextElement = elements[index + 1];
      const sourceFile = ngClassImportElement.getSourceFile();
      const text = sourceFile.text.substring(end, nextElement.getStart());
      const commaMatch = text.match(/^\s*,/);
      if (commaMatch) {
        end = end + commaMatch[0].length;
      }
    } else {
      // Middle or last element: remove from the end of the previous element (including comma).
      const prevElement = elements[index - 1];
      const sourceFile = ngClassImportElement.getSourceFile();
      const text = sourceFile.text.substring(prevElement.getEnd(), start);
      const commaMatch = text.match(/,\s*$/);
      if (commaMatch) {
        start = prevElement.getEnd() + text.lastIndexOf(',');
      }
    }
  }

  return new Replacement(file, new TextUpdate({position: start, end, toInsert: ''}));
}

export function calculateImportReplacements(info: ProgramInfo, sourceFiles: Set<ts.SourceFile>) {
  const importReplacements: Record<
    ProjectFileID,
    {add: Replacement[]; addAndRemove: Replacement[]}
  > = {};

  for (const sf of sourceFiles) {
    const file = projectFile(sf, info);
    const importManager = new ImportManager();

    const directiveImportElement = 'NgClass';
    const moduleSpecifier = '@angular/common';
    importManager.removeImport(sf, directiveImportElement, moduleSpecifier);

    const addRemove: Replacement[] = [];
    applyImportManagerChanges(importManager, addRemove, [sf], info);

    importReplacements[file.id] = {
      add: [],
      addAndRemove: addRemove,
    };
  }

  return importReplacements;
}

function parseHtmlTemplate(template: string): {tree: ParseTreeResult | undefined; errors: any[]} {
  let parsed: ParseTreeResult;
  try {
    parsed = new HtmlParser().parse(template, '', {
      tokenizeExpansionForms: true,
      tokenizeBlocks: true,
      preserveLineEndings: true,
    });

    if (parsed.errors && parsed.errors.length > 0) {
      const errors = parsed.errors.map((e) => ({type: 'parse', error: e}));
      return {tree: undefined, errors};
    }
  } catch (e: any) {
    return {tree: undefined, errors: [{type: 'parse', error: e}]};
  }
  return {tree: parsed, errors: []};
}

function replaceTemplate(
  template: string,
  replaceValue: string,
  start: number,
  end: number,
  offset: number,
) {
  return template.slice(0, start + offset) + replaceValue + template.slice(end + offset);
}

/**
 * Visitor class that scans Angular templates and collects replacements
 * for [ngClass] bindings that use static object literals.
 */
export class NgClassCollector extends RecursiveVisitor {
  readonly replacements: {start: number; end: number; replacement: string}[] = [];
  private originalTemplate: string;
  private isNgClassImported: boolean = false;

  constructor(
    template: string,
    private componentNode?: ts.ClassDeclaration,
    private typeChecker?: ts.TypeChecker,
  ) {
    super();
    this.originalTemplate = template;

    if (componentNode && typeChecker) {
      this.isNgClassImported = this.checkIfNgClassIsImported(componentNode);
    }
  }

  private checkIfNgClassIsImported(node: ts.ClassDeclaration): boolean {
    const sourceFile = node.getSourceFile();

    // Check for NgClass imports from @angular/common or @angular/core
    let hasNgClassImport = false;
    ts.forEachChild(sourceFile, (child) => {
      if (
        ts.isImportDeclaration(child) &&
        child.moduleSpecifier &&
        ts.isStringLiteral(child.moduleSpecifier) &&
        (child.moduleSpecifier.text === '@angular/common' ||
          child.moduleSpecifier.text === '@angular/core')
      ) {
        // Check if NgClass is among the imported elements
        if (child.importClause && child.importClause.namedBindings) {
          const namedBindings = child.importClause.namedBindings;

          if (ts.isNamedImports(namedBindings)) {
            hasNgClassImport = namedBindings.elements.some(
              (element) => element.name.text === 'NgClass',
            );
          }
        }
      }
    });

    // Also check if NgClass is included in the @Component decorator's imports
    const decorator = ts
      .getDecorators(node)
      ?.find(
        (d) =>
          ts.isCallExpression(d.expression) &&
          ts.isIdentifier(d.expression.expression) &&
          d.expression.expression.text === 'Component',
      );

    if (
      decorator &&
      ts.isCallExpression(decorator.expression) &&
      decorator.expression.arguments.length > 0 &&
      ts.isObjectLiteralExpression(decorator.expression.arguments[0])
    ) {
      const objLiteral = decorator.expression.arguments[0];
      const importsProperty = objLiteral.properties.find(
        (p): p is ts.PropertyAssignment =>
          ts.isPropertyAssignment(p) &&
          p.name.getText() === 'imports' &&
          ts.isArrayLiteralExpression(p.initializer),
      );

      if (importsProperty && ts.isArrayLiteralExpression(importsProperty.initializer)) {
        const importsArray = importsProperty.initializer;
        const hasNgClassInImports = importsArray.elements.some(
          (e): boolean => ts.isIdentifier(e) && e.text === 'NgClass',
        );

        hasNgClassImport = hasNgClassImport || hasNgClassInImports;
      }
    }

    return hasNgClassImport;
  }

  override visitElement(element: Element, config: MigrationConfig) {
    if (this.componentNode && this.typeChecker && !this.isNgClassImported) {
      return super.visitElement(element, config);
    }
    for (const attr of element.attrs) {
      if (attr.name === '[ngClass]' && attr.valueSpan) {
        const expr = this.originalTemplate.slice(
          attr.valueSpan.start.offset,
          attr.valueSpan.end.offset,
        );

        const staticMatch = tryParseStaticObjectLiteral(expr);

        if (staticMatch !== null) {
          let replacement: string;

          if (staticMatch.length === 0) {
            replacement = '[class]=""';
          } else if (staticMatch.length === 1) {
            const {key, value} = staticMatch[0];
            // Special case: If the key is an empty string, use [class]=""
            if (key === '') {
              replacement = '[class]=""';
            } else {
              // Normal single condition: use [class.className]="condition"
              replacement = `[class.${key}]="${value}"`;
            }
          } else {
            // Check if all entries have the same value (condition)
            const allSameValue = staticMatch.every((entry) => entry.value === staticMatch[0].value);
            if (
              allSameValue &&
              staticMatch.length > 1 &&
              // Check if this was originally a single key with multiple classes
              expr.includes('{') &&
              expr.includes('}') &&
              expr.split(':').length === 2
            ) {
              // Multiple classes with the same condition: use [class.class1]="condition" [class.class2]="condition"
              if (config.migrateSpaceSeparatedKey) {
                replacement = staticMatch
                  .map(({key, value}) => `[class.${key}]="${value}"`)
                  .join(' ');
              } else {
                continue;
              }
            } else {
              // Multiple conditions with different values: use [class]="{'class1': condition1, 'class2': condition2}"
              replacement = `[class]="${expr}"`;
            }
          }

          this.replacements.push({
            start: attr.sourceSpan.start.offset,
            end: attr.sourceSpan.end.offset,
            replacement,
          });
        }
      }

      if (attr.name === 'ngClass' && attr.value) {
        this.replacements.push({
          start: attr.sourceSpan.start.offset,
          end: attr.sourceSpan.end.offset,
          replacement: `class="${attr.value}"`,
        });
      }
    }

    return super.visitElement(element, config);
  }
}

function tryParseStaticObjectLiteral(expr: string): {key: string; value: string}[] | null {
  const trimmedExpr = expr.trim();

  if (trimmedExpr === '{}' || trimmedExpr === '[]') {
    return [];
  }

  if (!isObjectLiteralSyntax(trimmedExpr)) {
    return null;
  }

  try {
    const objectLiteral = parseAsObjectLiteral(trimmedExpr);
    if (!objectLiteral) {
      return null;
    }

    return extractClassBindings(objectLiteral);
  } catch {
    return null;
  }
}

/**
 * Validates basic object literal syntax
 */
function isObjectLiteralSyntax(expr: string): boolean {
  return expr.startsWith('{') && expr.endsWith('}');
}

/**
 * Parses expression as TypeScript object literal
 */
function parseAsObjectLiteral(expr: string): ts.ObjectLiteralExpression | null {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    `const obj = ${expr}`,
    ts.ScriptTarget.Latest,
    true,
  );

  const variableStatement = sourceFile.statements[0];
  if (!ts.isVariableStatement(variableStatement)) {
    return null;
  }

  const declaration = variableStatement.declarationList.declarations[0];
  if (!declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) {
    return null;
  }

  return declaration.initializer;
}

/**
 * Extracts class bindings from object literal properties
 */
function extractClassBindings(
  objectLiteral: ts.ObjectLiteralExpression,
): {key: string; value: string}[] | null {
  const result: {key: string; value: string}[] = [];

  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      return null;
    }

    const keyText = extractPropertyKey(property.name);
    const valueText = extractPropertyValue(property.initializer);

    if (keyText === '' && valueText) {
      result.push({key: '', value: valueText});
    } else {
      if (!keyText || !valueText) {
        return null;
      }

      // Handle multiple CSS classes in single key (e.g., 'class1 class2': condition)
      const classNames = keyText.split(/\s+/).filter(Boolean);

      for (const className of classNames) {
        result.push({key: className, value: valueText});
      }
    }
  }

  return result;
}

/**
 * Extracts text from property key (name)
 */
function extractPropertyKey(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name)) {
    return name.text;
  }

  if (ts.isStringLiteral(name)) {
    return name.text;
  }

  if (ts.isNumericLiteral(name)) {
    return name.text;
  }

  return null;
}

/**
 * Extracts text from property value
 */
function extractPropertyValue(initializer: ts.Expression): string | null {
  // String literals: 'value' or "value"
  if (ts.isStringLiteral(initializer)) {
    return initializer.text;
  }

  // Numeric literals: 42, 3.14
  if (ts.isNumericLiteral(initializer)) {
    return initializer.text;
  }

  // Boolean and null keywords
  if (initializer.kind === ts.SyntaxKind.TrueKeyword) {
    return 'true';
  }

  if (initializer.kind === ts.SyntaxKind.FalseKeyword) {
    return 'false';
  }

  if (initializer.kind === ts.SyntaxKind.NullKeyword) {
    return 'null';
  }

  // Identifiers: isActive, condition, etc.
  if (ts.isIdentifier(initializer)) {
    return initializer.text;
  }

  return null;
}
