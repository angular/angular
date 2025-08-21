/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {visitAll, RecursiveVisitor, Element} from '@angular/compiler';
import {
  ProgramInfo,
  projectFile,
  ProjectFileID,
  Replacement,
  TextUpdate,
  ProjectFile,
} from '../../utils/tsurge';
import ts from 'typescript';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {MigrationConfig} from './types';
import {getImportSpecifiers} from '../../utils/typescript/imports';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {ImportManager, PartialEvaluator} from '@angular/compiler-cli/private/migrations';
import {parseTemplate} from '../../utils/parse_html';

const ngClassStr = 'NgClass';
const commonModuleStr = '@angular/common';
const commonModuleImportsStr = 'CommonModule';

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
  const parsed = parseTemplate(template);
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

  return {migrated: newTemplate, changed: newTemplate !== template, replacementCount};
}

/**
 * Creates a Replacement to remove `NgClass` from a component's `imports` array.
 * Uses ReflectionHost + PartialEvaluator for robust AST analysis.
 */
export function createNgClassImportsArrayRemoval(
  classNode: ts.ClassDeclaration,
  file: ProjectFile,
  typeChecker: ts.TypeChecker,
): Replacement | null {
  const reflector = new TypeScriptReflectionHost(typeChecker);
  const evaluator = new PartialEvaluator(reflector, typeChecker, null);

  // Use ReflectionHost to get decorators instead of manual AST traversal
  const decorators = reflector.getDecoratorsOfDeclaration(classNode);
  if (!decorators) {
    return null;
  }

  // Find @Component decorator using ReflectionHost
  const componentDecorator = decorators.find((decorator) => decorator.name === 'Component');

  if (!componentDecorator || !componentDecorator.args || componentDecorator.args.length === 0) {
    return null;
  }

  // Use PartialEvaluator to evaluate the decorator metadata
  const decoratorMetadata = evaluator.evaluate(componentDecorator.args[0]);

  if (!decoratorMetadata || typeof decoratorMetadata !== 'object') {
    return null;
  }

  // Get the actual AST node for the imports property
  const componentDecoratorNode = componentDecorator.node;
  if (
    !ts.isDecorator(componentDecoratorNode) ||
    !ts.isCallExpression(componentDecoratorNode.expression) ||
    !ts.isObjectLiteralExpression(componentDecoratorNode.expression.arguments[0])
  ) {
    return null;
  }

  const objLiteral = componentDecoratorNode.expression.arguments[0];
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

  const ngClassIndex = importsArray.elements.findIndex(
    (e): e is ts.Identifier => ts.isIdentifier(e) && e.text === ngClassStr,
  );

  if (ngClassIndex === -1) {
    return null;
  }

  const elements = importsArray.elements;
  const ngClassElement = elements[ngClassIndex];

  const range = getNgClassRemovalRange(
    importsProperty,
    importsArray,
    ngClassElement,
    classNode.getSourceFile(),
  );

  return new Replacement(
    file,
    new TextUpdate({position: range.start, end: range.end, toInsert: ''}),
  );
}

function getElementRemovalRange(
  elementNode: ts.Node,
  sourceFile: ts.SourceFile,
): {start: number; end: number} {
  const parent = elementNode.parent;

  // Check if in array context (imports: [..]) or object context (@Component({..}))
  const isArrayLiteralExpression = ts.isArrayLiteralExpression(parent);
  const isObjectLiteralExpression = ts.isObjectLiteralExpression(parent);

  let elements: ts.NodeArray<ts.Node>;

  if (isArrayLiteralExpression) {
    elements = parent.elements;
  } else if (isObjectLiteralExpression) {
    elements = parent.properties;
  } else {
    return {start: elementNode.getStart(sourceFile), end: elementNode.getEnd()};
  }

  const elementIndex = elements.indexOf(elementNode);
  const isLastElement = elementIndex === elements.length - 1;

  if (isLastElement) {
    // If this is the LAST element, the range is from the END of the previous element
    // to the END of this element. This captures the comma and space preceding it.
    // Ex: `[a, b]` -> remove `, b`
    const start =
      elementIndex > 0 ? elements[elementIndex - 1].getEnd() : elementNode.getStart(sourceFile); // If it is also the first (only) element, there is no comma before it.

    return {start: start, end: elementNode.getEnd()};
  } else {
    // If it's the FIRST or MIDDLE element, the range goes from the BEGINNING of this element
    // to the BEGINNING of the next one. This captures the element itself and the comma that FOLLOWS it.
    // Ex: `[a, b]` -> remove `a,`
    const nextElement = elements[elementIndex + 1];
    return {
      start: elementNode.getStart(sourceFile),
      end: nextElement.getStart(sourceFile),
    };
  }
}

/**
 * If there is more than one import, it affects the NgClass element within the array.
 * Otherwise, `NgClass` is the only import. The removal affects the entire `imports: [...]` property.
 */
function getNgClassRemovalRange(
  importsProperty: ts.PropertyAssignment,
  importsArray: ts.ArrayLiteralExpression,
  ngClassElement: ts.Expression,
  sourceFile: ts.SourceFile,
): {start: number; end: number} {
  if (importsArray.elements.length > 1) {
    return getElementRemovalRange(ngClassElement, sourceFile);
  } else {
    return getElementRemovalRange(importsProperty, sourceFile);
  }
}

export function calculateImportReplacements(info: ProgramInfo, sourceFiles: Set<ts.SourceFile>) {
  const importReplacements: Record<
    ProjectFileID,
    {add: Replacement[]; addAndRemove: Replacement[]}
  > = {};

  const importManager = new ImportManager();
  for (const sf of sourceFiles) {
    const file = projectFile(sf, info);

    importManager.removeImport(sf, ngClassStr, commonModuleStr);

    const addRemove: Replacement[] = [];
    applyImportManagerChanges(importManager, addRemove, [sf], info);

    importReplacements[file.id] = {
      add: [],
      addAndRemove: addRemove,
    };
  }

  return importReplacements;
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
  private isNgClassImported: boolean = true; // Default to true (permissive)

  constructor(
    template: string,
    private componentNode?: ts.ClassDeclaration,
    private typeChecker?: ts.TypeChecker,
  ) {
    super();
    this.originalTemplate = template;

    // If we have enough information, check if NgClass is actually imported.
    // If not, we can confidently disable the migration for this component.
    if (componentNode && typeChecker) {
      const imports = getImportSpecifiers(componentNode.getSourceFile(), commonModuleStr, [
        ngClassStr,
        commonModuleImportsStr,
      ]);

      if (imports.length === 0) {
        this.isNgClassImported = false;
      }
    }
  }

  override visitElement(element: Element, config: MigrationConfig) {
    // If NgClass is not imported, do not attempt to migrate.
    if (!this.isNgClassImported) {
      return;
    }

    for (const attr of element.attrs) {
      if (attr.name === '[ngClass]' && attr.valueSpan) {
        const expr = this.originalTemplate.slice(
          attr.valueSpan.start.offset,
          attr.valueSpan.end.offset,
        );

        const staticMatch = tryParseStaticObjectLiteral(expr);

        if (staticMatch === null) {
          continue;
        }

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
        continue;
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
  try {
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

    // Manage invalid syntax ngClass="{class1 class2}"
    const content = expr.slice(1, -1).trim();
    if (content && !content.includes(':') && content.includes(' ') && !content.includes(',')) {
      return null;
    }

    return declaration.initializer;
  } catch (error) {
    return null;
  }
}

/**
 * Extracts class bindings from object literal properties
 */
function extractClassBindings(
  objectLiteral: ts.ObjectLiteralExpression,
): {key: string; value: string}[] | null {
  const result: {key: string; value: string}[] = [];

  for (const property of objectLiteral.properties) {
    if (ts.isShorthandPropertyAssignment(property)) {
      const key = property.name.getText();
      if (key.includes(' ')) {
        return null;
      }
      result.push({key, value: key});
    } else if (ts.isPropertyAssignment(property)) {
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
    } else {
      return null;
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
    return `'${initializer.text}'`;
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

  return initializer.getText();
}
