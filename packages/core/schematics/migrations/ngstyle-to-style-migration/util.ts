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
import {ImportManager} from '@angular/compiler-cli/private/migrations';
import {canRemoveCommonModule, parseTemplate} from '../../utils/parse_html';

const ngStyleStr = 'NgStyle';
const commonModuleStr = '@angular/common';
const commonModuleImportsStr = 'CommonModule';

export function migrateNgStyleBindings(
  template: string,
  config: MigrationConfig,
  componentNode: ts.ClassDeclaration,
  typeChecker: ts.TypeChecker,
): {
  replacementCount: number;
  migrated: string;
  changed: boolean;
  canRemoveCommonModule: boolean;
} {
  const parsed = parseTemplate(template);
  if (!parsed.tree || !parsed.tree.rootNodes.length) {
    return {migrated: template, changed: false, replacementCount: 0, canRemoveCommonModule: false};
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

  const changed = newTemplate !== template;
  return {
    migrated: newTemplate,
    changed,
    replacementCount,
    canRemoveCommonModule: changed ? canRemoveCommonModule(newTemplate) : false,
  };
}

/**
 * Creates a Replacement to remove `NgStyle` from a component's `imports` array.
 * Uses ReflectionHost + PartialEvaluator for robust AST analysis.
 */
export function createNgStyleImportsArrayRemoval(
  classNode: ts.ClassDeclaration,
  file: ProjectFile,
  typeChecker: ts.TypeChecker,
  removeCommonModule: boolean,
): Replacement | null {
  const reflector = new TypeScriptReflectionHost(typeChecker);
  const decorators = reflector.getDecoratorsOfDeclaration(classNode);
  if (!decorators) {
    return null;
  }

  const componentDecorator = decorators.find((decorator) => decorator.name === 'Component');
  if (!componentDecorator?.node) {
    return null;
  }

  const decoratorNode = componentDecorator.node;
  if (
    !ts.isDecorator(decoratorNode) ||
    !ts.isCallExpression(decoratorNode.expression) ||
    decoratorNode.expression.arguments.length === 0 ||
    !ts.isObjectLiteralExpression(decoratorNode.expression.arguments[0])
  ) {
    return null;
  }

  const metadata = decoratorNode.expression.arguments[0];
  const importsProperty = metadata.properties.find(
    (p): p is ts.PropertyAssignment =>
      ts.isPropertyAssignment(p) && p.name?.getText() === 'imports',
  );

  if (!importsProperty || !ts.isArrayLiteralExpression(importsProperty.initializer)) {
    return null;
  }

  const importsArray = importsProperty.initializer;
  const elementsToRemove = new Set<string>([ngStyleStr]);
  if (removeCommonModule) {
    elementsToRemove.add(commonModuleImportsStr);
  }

  const originalElements = importsArray.elements;
  const filteredElements = originalElements.filter(
    (el) => !ts.isIdentifier(el) || !elementsToRemove.has(el.text),
  );

  if (filteredElements.length === originalElements.length) {
    return null; // No changes needed.
  }

  // If the array becomes empty, remove the entire `imports` property.
  if (filteredElements.length === 0) {
    const removalRange = getPropertyRemovalRange(importsProperty);
    return new Replacement(
      file,
      new TextUpdate({
        position: removalRange.start,
        end: removalRange.end,
        toInsert: '',
      }),
    );
  }

  const printer = ts.createPrinter();
  const newArray = ts.factory.updateArrayLiteralExpression(importsArray, filteredElements);
  const newText = printer.printNode(ts.EmitHint.Unspecified, newArray, classNode.getSourceFile());

  return new Replacement(
    file,
    new TextUpdate({
      position: importsArray.getStart(),
      end: importsArray.getEnd(),
      toInsert: newText,
    }),
  );
}

/**
 * Calculates the removal range for a property in an object literal,
 * including the trailing comma if it's not the last property.
 */
function getPropertyRemovalRange(property: ts.ObjectLiteralElementLike): {
  start: number;
  end: number;
} {
  const parent = property.parent;
  if (!ts.isObjectLiteralExpression(parent)) {
    return {start: property.getStart(), end: property.getEnd()};
  }

  const properties = parent.properties;
  const propertyIndex = properties.indexOf(property);
  const end = property.getEnd();

  if (propertyIndex < properties.length - 1) {
    const nextProperty = properties[propertyIndex + 1];
    return {start: property.getStart(), end: nextProperty.getStart()};
  }

  return {start: property.getStart(), end};
}

export function calculateImportReplacements(
  info: ProgramInfo,
  sourceFiles: Set<ts.SourceFile>,
  filesToRemoveCommonModule: Set<ProjectFileID>,
) {
  const importReplacements: Record<
    ProjectFileID,
    {add: Replacement[]; addAndRemove: Replacement[]}
  > = {};

  const importManager = new ImportManager();
  for (const sf of sourceFiles) {
    const file = projectFile(sf, info);

    // Always remove NgStyle if it's imported directly.
    importManager.removeImport(sf, ngStyleStr, commonModuleStr);

    // Conditionally remove CommonModule if it's no longer needed.
    if (filesToRemoveCommonModule.has(file.id)) {
      importManager.removeImport(sf, commonModuleImportsStr, commonModuleStr);
    }

    const addRemove: Replacement[] = [];
    applyImportManagerChanges(importManager, addRemove, [sf], info);

    if (addRemove.length > 0) {
      importReplacements[file.id] = {
        add: [],
        addAndRemove: addRemove,
      };
    }
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
class NgStyleCollector extends RecursiveVisitor {
  readonly replacements: {start: number; end: number; replacement: string}[] = [];
  private isNgStyleImported: boolean = true; // Default to true (permissive)

  constructor(
    private originalTemplate: string,
    componentNode: ts.ClassDeclaration,
    typeChecker: ts.TypeChecker,
  ) {
    super();

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
      if (attr.name !== '[ngStyle]' && attr.name !== 'ngStyle') {
        continue;
      }
      if (attr.name === '[ngStyle]' && attr.valueSpan) {
        const expr = this.originalTemplate.slice(
          attr.valueSpan.start.offset,
          attr.valueSpan.end.offset,
        );

        const staticMatch = parseStaticObjectLiteral(expr);

        if (staticMatch === null) {
          if (config.bestEffortMode && !isObjectLiteralSyntax(expr.trim())) {
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
          replacement = '';
        } else if (staticMatch.length === 1) {
          const {key, value} = staticMatch[0];
          // Special case: If the key is an empty string, use [style]=""
          if (key === '') {
            replacement = '';
          } else {
            // Normal single condition: use [style.styleName]="condition"
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

function parseStaticObjectLiteral(expr: string): {key: string; value: string}[] | null {
  const trimmedExpr = expr.trim();

  if (trimmedExpr === '{}' || trimmedExpr === '[]') {
    return [];
  }

  if (!isObjectLiteralSyntax(trimmedExpr)) {
    return null;
  }

  const objectLiteral = parseAsObjectLiteral(trimmedExpr);
  if (!objectLiteral) {
    return null;
  }

  return extractStyleBindings(objectLiteral);
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

function extractStyleBindings(
  objectLiteral: ts.ObjectLiteralExpression,
): {key: string; value: string}[] | null {
  const result: {key: string; value: string}[] = [];

  for (const property of objectLiteral.properties) {
    if (ts.isShorthandPropertyAssignment(property)) {
      return null;
    } else if (ts.isPropertyAssignment(property)) {
      const keyText = extractPropertyKey(property.name);
      const valueText = extractPropertyValue(property.initializer);

      if (keyText === '' && valueText) {
        result.push({key: '', value: valueText});
        continue;
      }

      if (!keyText || !valueText) {
        return null;
      }

      result.push({key: keyText, value: valueText});
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
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
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
  if (ts.isNumericLiteral(initializer) || ts.isIdentifier(initializer)) {
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

  return initializer.getText();
}
