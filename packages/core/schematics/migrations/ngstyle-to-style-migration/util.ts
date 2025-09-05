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

const ngStyleStr = 'NgStyle';
const commonModuleStr = '@angular/common';
const commonModuleImportsStr = 'CommonModule';

export function migrateNgStyleBindings(
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

  const visitor = new NgStyleCollector(template, componentNode, typeChecker);
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
 * Creates a Replacement to remove `NgStyle` from a component's `imports` array.
 * Uses ReflectionHost + PartialEvaluator for robust AST analysis.
 */
export function createNgStyleImportsArrayRemoval(
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

  const ngStyleIndex = importsArray.elements.findIndex(
    (e): e is ts.Identifier => ts.isIdentifier(e) && e.text === ngStyleStr,
  );

  if (ngStyleIndex === -1) {
    return null;
  }

  const elements = importsArray.elements;
  const ngStyleElement = elements[ngStyleIndex];

  const range = getNgStyleRemovalRange(
    importsProperty,
    importsArray,
    ngStyleElement,
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
 * If there is more than one import, it affects the NgStyle element within the array.
 * Otherwise, `NgStyle` is the only import. The removal affects the entire `imports: [...]` property.
 */
function getNgStyleRemovalRange(
  importsProperty: ts.PropertyAssignment,
  importsArray: ts.ArrayLiteralExpression,
  ngStyleElement: ts.Expression,
  sourceFile: ts.SourceFile,
): {start: number; end: number} {
  if (importsArray.elements.length > 1) {
    return getElementRemovalRange(ngStyleElement, sourceFile);
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

    importManager.removeImport(sf, ngStyleStr, commonModuleStr);

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
 * for [ngStyle] bindings that use static object literals.
 */
export class NgStyleCollector extends RecursiveVisitor {
  readonly replacements: {start: number; end: number; replacement: string}[] = [];
  private originalTemplate: string;
  private isNgStyleImported: boolean = true; // Default to true (permissive)

  constructor(
    template: string,
    private componentNode?: ts.ClassDeclaration,
    private typeChecker?: ts.TypeChecker,
  ) {
    super();
    this.originalTemplate = template;

    // If we have enough information, check if NgStyle is actually imported.
    // If not, we can confidently disable the migration for this component.
    if (componentNode && typeChecker) {
      const imports = getImportSpecifiers(componentNode.getSourceFile(), commonModuleStr, [
        ngStyleStr,
        commonModuleImportsStr,
      ]);

      if (imports.length === 0) {
        this.isNgStyleImported = false;
      }
    }
  }

  override visitElement(element: Element, config: MigrationConfig) {
    // If NgStyle is not imported, do not attempt to migrate.
    if (!this.isNgStyleImported) {
      return;
    }

    for (const attr of element.attrs) {
      if (attr.name === '[ngStyle]' && attr.valueSpan) {
        const expr = this.originalTemplate.slice(
          attr.valueSpan.start.offset,
          attr.valueSpan.end.offset,
        );

        const staticMatch = tryParseStaticObjectLiteral(expr);

        if (staticMatch === null) {
          if (config.migrateObjectReferences && !isObjectLiteralSyntax(expr.trim())) {
            const keyReplacement = this.originalTemplate
              .slice(attr.sourceSpan.start.offset, attr.valueSpan.start.offset)
              .replace('[ngStyle]', '[style]');

            this.replacements.push({
              start: attr.sourceSpan.start.offset,
              end: attr.valueSpan.start.offset,
              replacement: keyReplacement,
            });
          }
          continue;
        }

        let replacement: string;

        if (staticMatch.length === 0) {
          replacement = '[style]=""';
        } else if (staticMatch.length === 1) {
          const {key, value} = staticMatch[0];
          // Special case: If the key is an empty string, use [style]=""
          if (key === '') {
            replacement = '';
          } else {
            // Normal single condition: use [style]="{styleName: condition}"
            replacement = `[style.${key}]="${value}"`;
          }
        } else {
          replacement = `[style]="${expr}"`;
        }

        this.replacements.push({
          start: attr.sourceSpan.start.offset,
          end: attr.sourceSpan.end.offset,
          replacement,
        });
        continue;
      }

      if (attr.name === 'ngStyle' && attr.value) {
        this.replacements.push({
          start: attr.sourceSpan.start.offset,
          end: attr.sourceSpan.end.offset,
          replacement: `style="${attr.value}"`,
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

    return extractStyleBindings(objectLiteral);
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

    return declaration.initializer;
  } catch (error) {
    return null;
  }
}

function extractStyleBindings(
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

        const styleNames = keyText.split(/\s+/).filter(Boolean);
        for (const styleName of styleNames) {
          result.push({key: styleName, value: valueText});
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
