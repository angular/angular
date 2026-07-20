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
import {
  ImportManager,
  PartialEvaluator,
  TypeScriptReflectionHost,
} from '@angular/compiler-cli/private/migrations';
import {canRemoveCommonModule, parseTemplate} from '../../utils/parse_html';

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
  canRemoveNgClass: boolean;
  canRemoveCommonModule: boolean;
} {
  const parsed = parseTemplate(template);
  if (!parsed.tree || !parsed.tree.rootNodes.length) {
    return {
      migrated: template,
      changed: false,
      replacementCount: 0,
      canRemoveNgClass: true,
      canRemoveCommonModule: false,
    };
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

  const changed = newTemplate !== template;
  return {
    migrated: newTemplate,
    changed,
    replacementCount,
    canRemoveNgClass: visitor.skippedNgClassCount === 0,
    canRemoveCommonModule: changed ? canRemoveCommonModule(newTemplate) : false,
  };
}

/**
 * Creates a Replacement to remove `NgClass` from a component's `imports` array.
 * Uses ReflectionHost + PartialEvaluator for robust AST analysis.
 */
export function createNgClassImportsArrayRemoval(
  classNode: ts.ClassDeclaration,
  file: ProjectFile,
  typeChecker: ts.TypeChecker,
  removeCommonModule: boolean,
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
  const elementsToRemove = new Set<string>([ngClassStr]);
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

  if (properties.length === 1) {
    const sourceFile = property.getSourceFile();
    let end = property.getEnd();
    const textAfter = sourceFile.text.substring(end, parent.getEnd());
    const commaIndex = textAfter.indexOf(',');
    if (commaIndex !== -1) {
      end += commaIndex + 1;
    }
    return {start: property.getFullStart(), end};
  }

  if (propertyIndex === 0) {
    return {start: property.getFullStart(), end: properties[1].getFullStart()};
  }

  return {start: properties[propertyIndex - 1].getEnd(), end: property.getEnd()};
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

    // Always remove NgClass if it's imported directly.
    importManager.removeImport(sf, ngClassStr, commonModuleStr);

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
 * for [ngClass] bindings that use static object literals.
 */
export class NgClassCollector extends RecursiveVisitor {
  readonly replacements: {start: number; end: number; replacement: string}[] = [];
  skippedNgClassCount = 0;
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

        const parseResult = tryParseStaticObjectLiteral(expr);

        if (parseResult === null) {
          this.skippedNgClassCount++;
          continue;
        }

        const {bindings: staticMatch, hasSpaceSeparatedKeys} = parseResult;

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
          // Multiple bindings. If any original key contained spaces, [class]="{...}" object
          // syntax cannot be used because [class] does not support space-separated key names
          // (only [ngClass] does). Either expand every binding individually, or skip.
          if (hasSpaceSeparatedKeys) {
            // Expanding is only safe if every binding maps to a distinct, non-empty class
            // name that doesn't contain a dot: an empty key would produce the invalid
            // `[class.]` binding, duplicate keys would produce multiple conflicting
            // `[class.foo]` bindings on one element, and a dot in the class name (e.g.
            // 'a.b') would silently bind to the wrong property since `[class.a.b]` is
            // parsed as `[class.a]` — everything after the first dot is discarded.
            const expandedKeys = staticMatch.map(({key}) => key);
            const canExpand =
              expandedKeys.every((key) => key !== '' && !key.includes('.')) &&
              new Set(expandedKeys).size === expandedKeys.length;

            if (config.migrateSpaceSeparatedKey && canExpand) {
              replacement = staticMatch
                .map(({key, value}) => `[class.${key}]="${value}"`)
                .join(' ');
            } else {
              // Cannot produce valid [class]="..." output — leave binding as-is.
              this.skippedNgClassCount++;
              continue;
            }
          } else {
            // All keys are single class names: [class]="{'cls1': cond1, 'cls2': cond2}" is valid.
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

function tryParseStaticObjectLiteral(expr: string): {
  bindings: {key: string; value: string}[];
  hasSpaceSeparatedKeys: boolean;
} | null {
  const trimmedExpr = expr.trim();

  if (trimmedExpr === '{}' || trimmedExpr === '[]') {
    return {bindings: [], hasSpaceSeparatedKeys: false};
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
 * Extracts class bindings from object literal properties.
 * Returns the list of individual `{key, value}` bindings (space-separated keys are expanded)
 * along with a flag indicating whether any original key contained spaces.
 */
function extractClassBindings(objectLiteral: ts.ObjectLiteralExpression): {
  bindings: {key: string; value: string}[];
  hasSpaceSeparatedKeys: boolean;
} | null {
  const bindings: {key: string; value: string}[] = [];
  let hasSpaceSeparatedKeys = false;

  for (const property of objectLiteral.properties) {
    if (ts.isShorthandPropertyAssignment(property)) {
      const key = property.name.getText();
      if (key.includes(' ')) {
        return null;
      }
      bindings.push({key, value: key});
    } else if (ts.isPropertyAssignment(property)) {
      const keyText = extractPropertyKey(property.name);
      const valueText = extractPropertyValue(property.initializer);

      if (keyText === '' && valueText) {
        bindings.push({key: '', value: valueText});
      } else {
        if (!keyText || !valueText) {
          return null;
        }

        // Handle multiple CSS classes in single key (e.g., 'class1 class2': condition)
        const classNames = keyText.split(/\s+/).filter(Boolean);
        if (classNames.length > 1) {
          hasSpaceSeparatedKeys = true;
        }

        for (const className of classNames) {
          bindings.push({key: className, value: valueText});
        }
      }
    } else {
      return null;
    }
  }

  return {bindings, hasSpaceSeparatedKeys};
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
