/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ProgramInfo, projectFile, Replacement, TextUpdate, ProjectFile} from '../../utils/tsurge';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {ImportManager} from '@angular/compiler-cli/private/migrations';
import {getAngularDecorators} from '../../utils/ng_decorators';

export interface TemplateAnalysis {
  neededImports: Set<string>;
  errors: string[];
}

const commonModuleStr = 'CommonModule';
const angularCommonStr = '@angular/common';

const PATTERN_IMPORTS = [
  // Structural directives
  {pattern: /\*ngIf\b/g, imports: ['NgIf']},
  {pattern: /\*ngFor\b/g, imports: ['NgFor']},
  {pattern: /\[ngForOf]\b/g, imports: ['NgForOf']},
  {pattern: /\[ngPlural\]/g, imports: ['NgPlural']},
  // Match ngPluralCase as structural (*ngPluralCase) or attribute (ngPluralCase="value")
  {pattern: /(\*ngPluralCase\b|\s+ngPluralCase\s*=)/g, imports: ['NgPluralCase']},
  // Match ngSwitchCase as structural (*ngSwitchCase) or attribute (ngSwitchCase="value")
  {pattern: /(\*ngSwitchCase\b|\s+ngSwitchCase\s*=)/g, imports: ['NgSwitchCase']},
  // Match ngSwitchDefault as structural (*ngSwitchDefault) or standalone attribute (ngSwitchDefault>)
  {pattern: /(\*ngSwitchDefault\b|\s+ngSwitchDefault(?=\s*>))/g, imports: ['NgSwitchDefault']},
  {pattern: /\[ngClass\]/g, imports: ['NgClass']},
  {pattern: /\[ngStyle\]/g, imports: ['NgStyle']},
  // Match ngSwitch as property binding [ngSwitch] or attribute ngSwitch="value"
  {pattern: /(\[ngSwitch\]|\s+ngSwitch\s*=)/g, imports: ['NgSwitch']},
  {pattern: /\[ngTemplateOutlet\]/g, imports: ['NgTemplateOutlet']},
  {pattern: /\[ngComponentOutlet\]/g, imports: ['NgComponentOutlet']},

  // Common pipes
  {pattern: /\|\s*async\b/g, imports: ['AsyncPipe']},
  {pattern: /\|\s*json\b/g, imports: ['JsonPipe']},
  {pattern: /\|\s*date\b/g, imports: ['DatePipe']},
  {pattern: /\|\s*currency\b/g, imports: ['CurrencyPipe']},
  {pattern: /\|\s*number\b/g, imports: ['DecimalPipe']},
  {pattern: /\|\s*percent\b/g, imports: ['PercentPipe']},
  {pattern: /\|\s*lowercase\b/g, imports: ['LowerCasePipe']},
  {pattern: /\|\s*uppercase\b/g, imports: ['UpperCasePipe']},
  {pattern: /\|\s*titlecase\b/g, imports: ['TitleCasePipe']},
  {pattern: /\|\s*slice\b/g, imports: ['SlicePipe']},
  {pattern: /\|\s*keyvalue\b/g, imports: ['KeyValuePipe']},
  {pattern: /\|\s*i18nPlural\b/g, imports: ['I18nPluralPipe']},
  {pattern: /\|\s*i18nSelect\b/g, imports: ['I18nSelectPipe']},
];

function analyzeTemplateWithRegex(template: string, neededImports: Set<string>): void {
  PATTERN_IMPORTS.forEach(({pattern, imports}) => {
    // Reset regex lastIndex to avoid state issues with global flag
    pattern.lastIndex = 0;
    if (pattern.test(template)) {
      imports.forEach((imp: string) => neededImports.add(imp));
    }
  });
}

export function migrateCommonModuleUsage(
  template: string,
  componentNode: ts.ClassDeclaration,
  typeChecker: ts.TypeChecker,
): {
  migrated: string;
  changed: boolean;
  replacementCount: number;
  canRemoveCommonModule: boolean;
  neededImports: string[];
} {
  const analysis = analyzeTemplateContent(template);

  const hasCommonModule = hasCommonModuleInImports(componentNode, typeChecker);

  return {
    migrated: template,
    changed: hasCommonModule,
    replacementCount: hasCommonModule ? 1 : 0,
    canRemoveCommonModule: hasCommonModule,
    neededImports: Array.from(analysis.neededImports),
  };
}

export function isCommonModuleAlias(
  identifier: ts.Identifier,
  typeChecker: ts.TypeChecker,
): boolean {
  const symbol = typeChecker.getSymbolAtLocation(identifier);
  if (!symbol) {
    return checkImportStatementsForAlias(identifier);
  }

  // Handle aliased imports by checking the original symbol
  const aliasedSymbol = typeChecker.getAliasedSymbol(symbol);
  const targetSymbol = aliasedSymbol !== symbol ? aliasedSymbol : symbol;

  // Check if this symbol is CommonModule from @angular/common
  if (targetSymbol.name !== commonModuleStr) {
    return checkImportStatementsForAlias(identifier);
  }

  const declaration = targetSymbol.valueDeclaration || targetSymbol.declarations?.[0];
  if (!declaration) {
    return checkImportStatementsForAlias(identifier);
  }

  const sourceFile = declaration.getSourceFile();

  return sourceFile.fileName.includes(angularCommonStr);
}

export function checkImportStatementsForAlias(identifier: ts.Identifier): boolean {
  const sourceFile = identifier.getSourceFile();

  // Look through import statements for CommonModule aliases
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;

    const moduleSpecifier = statement.moduleSpecifier;
    if (!ts.isStringLiteral(moduleSpecifier) || moduleSpecifier.text !== angularCommonStr) continue;

    const importClause = statement.importClause;
    if (!importClause?.namedBindings || !ts.isNamedImports(importClause.namedBindings)) continue;

    // Check each import specifier for CommonModule alias
    for (const specifier of importClause.namedBindings.elements) {
      // For `import {CommonModule as CM}`:
      // - specifier.propertyName.text = 'CommonModule'
      // - specifier.name.text = 'CM'
      if (
        specifier.propertyName &&
        specifier.propertyName.text === commonModuleStr &&
        specifier.name.text === identifier.text
      ) {
        return true;
      }
    }
  }

  return false;
}

export function createCommonModuleImportsArrayRemoval(
  classNode: ts.ClassDeclaration,
  file: ProjectFile,
  typeChecker: ts.TypeChecker,

  neededImports: string[],
): Replacement | null {
  const reflector = new TypeScriptReflectionHost(typeChecker);
  const decorators = reflector.getDecoratorsOfDeclaration(classNode);
  if (!decorators) {
    return null;
  }

  const decorator = decorators.find((decorator) => decorator.name === 'Component');
  if (!decorator?.node) {
    return null;
  }

  const decoratorNode = decorator.node;
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

  const originalElements = importsArray.elements;
  const filteredElements = originalElements.filter((el) => {
    if (!ts.isIdentifier(el)) return true;

    // Check for direct CommonModule usage
    if (el.text === commonModuleStr) return false;

    // Check for aliased CommonModule usage
    return !isCommonModuleAlias(el, typeChecker);
  });

  const newElements = [
    ...filteredElements,
    ...neededImports.sort().map((imp) => ts.factory.createIdentifier(imp)),
  ];

  if (newElements.length === originalElements.length && neededImports.length === 0) {
    return null;
  }

  if (newElements.length === 0) {
    // For standalone components, keep imports: [] instead of removing the property entirely
    const printer = ts.createPrinter();
    const emptyArray = ts.factory.createArrayLiteralExpression([]);
    const newText = printer.printNode(
      ts.EmitHint.Unspecified,
      emptyArray,
      classNode.getSourceFile(),
    );

    return new Replacement(
      file,
      new TextUpdate({
        position: importsArray.getStart(),
        end: importsArray.getEnd(),
        toInsert: newText,
      }),
    );
  }

  const printer = ts.createPrinter();
  const newArray = ts.factory.updateArrayLiteralExpression(importsArray, newElements);
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

function analyzeTemplateContent(templateContent: string): TemplateAnalysis {
  const neededImports = new Set<string>();
  const errors: string[] = [];

  try {
    analyzeTemplateWithRegex(templateContent, neededImports);
  } catch (error) {
    errors.push(`Failed to analyze template: ${error}`);
  }

  return {neededImports, errors};
}

export function hasCommonModuleInImports(
  componentNode: ts.ClassDeclaration,
  typeChecker: ts.TypeChecker,
): boolean {
  // First check if there's a CommonModule in the imports array
  const reflector = new TypeScriptReflectionHost(typeChecker);
  const decorators = reflector.getDecoratorsOfDeclaration(componentNode);
  if (!decorators) {
    return false;
  }

  const decorator = decorators.find((decorator) => decorator.name === 'Component');
  if (!decorator?.node) {
    return false;
  }

  const decoratorNode = decorator.node;
  if (
    !ts.isDecorator(decoratorNode) ||
    !ts.isCallExpression(decoratorNode.expression) ||
    decoratorNode.expression.arguments.length === 0 ||
    !ts.isObjectLiteralExpression(decoratorNode.expression.arguments[0])
  ) {
    return false;
  }

  const metadata = decoratorNode.expression.arguments[0];
  const importsProperty = metadata.properties.find(
    (p): p is ts.PropertyAssignment =>
      ts.isPropertyAssignment(p) && p.name?.getText() === 'imports',
  );

  if (!importsProperty || !ts.isArrayLiteralExpression(importsProperty.initializer)) {
    return false;
  }

  const importsArray = importsProperty.initializer;
  const hasCommonModuleIdentifier = importsArray.elements.some((el) => {
    if (!ts.isIdentifier(el)) return false;

    // Check for direct CommonModule usage
    return el.text === commonModuleStr || isCommonModuleAlias(el, typeChecker);
  });

  if (!hasCommonModuleIdentifier) {
    return false;
  }

  // Now verify that CommonModule is imported from @angular/common
  const sourceFile = componentNode.getSourceFile();
  return isCommonModuleFromAngularCommon(sourceFile);
}

export function isCommonModuleFromAngularCommon(sourceFile: ts.SourceFile): boolean {
  // Look for import statements that import CommonModule from @angular/common
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!statement.moduleSpecifier) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;

    const moduleSpecifier = statement.moduleSpecifier.text;
    if (moduleSpecifier !== angularCommonStr) continue;
    if (!statement.importClause) continue;

    if (!statement.importClause.namedBindings) continue;
    if (!ts.isNamedImports(statement.importClause.namedBindings)) continue;

    return statement.importClause.namedBindings.elements.some((element) => {
      // For `import {CommonModule as CM}`: element.propertyName.text = 'CommonModule', element.name.text = 'CM'
      // For `import {CommonModule}`: element.propertyName = undefined, element.name.text = 'CommonModule'
      const importedName = element.propertyName?.text || element.name.text;
      return importedName === commonModuleStr;
    });
  }

  return false;
}

function findComponentInFile(
  componentName: string,
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
): ts.ClassDeclaration | null {
  const visitNode = (node: ts.Node): ts.ClassDeclaration | null => {
    if (ts.isClassDeclaration(node) && node.name && node.name.text === componentName) {
      // Check if this is actually a Component
      const decorators = ts.getDecorators(node);
      if (decorators) {
        const angularDecorators = getAngularDecorators(typeChecker, decorators);
        if (angularDecorators.some((d) => d.name === 'Component')) {
          return node;
        }
      }
    }

    for (const child of node.getChildren()) {
      const result = visitNode(child);
      if (result) return result;
    }

    return null;
  };

  return visitNode(sourceFile);
}

export function findComponentByName(
  componentName: string,
  info: ProgramInfo,
  typeChecker: ts.TypeChecker,
): ts.ClassDeclaration | null {
  // Search across all files in the program
  for (const file of info.sourceFiles) {
    const component = findComponentInFile(componentName, file, typeChecker);
    if (component) return component;
  }

  return null;
}

export function processResolvedTemplate(
  template: {content: string; inline: boolean; filePath: string | null; start: number},
  componentNode: ts.ClassDeclaration,
  info: ProgramInfo,
  typeChecker: ts.TypeChecker,
  replacements: Replacement[],
  filesWithNeededImports: Map<string, string[]>,
): void {
  const result = migrateCommonModuleUsage(template.content, componentNode, typeChecker);

  if (result.changed) {
    const sourceFile = componentNode.getSourceFile();
    const file = projectFile(sourceFile, info);

    filesWithNeededImports.set(sourceFile.fileName, result.neededImports);

    const replacement = createCommonModuleImportsArrayRemoval(
      componentNode,
      file,
      typeChecker,
      result.neededImports,
    );

    if (replacement) {
      replacements.push(replacement);
    }

    const importManager = new ImportManager({
      shouldUseSingleQuotes: () => true,
    });

    // Always remove 'CommonModule' regardless of whether it's aliased or not
    // ImportManager handles removing the correct import specifier
    importManager.removeImport(sourceFile, commonModuleStr, angularCommonStr);

    if (result.neededImports.length > 0) {
      result.neededImports.forEach((importName) => {
        importManager.addImport({
          exportSymbolName: importName,
          exportModuleSpecifier: angularCommonStr,
          requestedFile: sourceFile,
        });
      });
    }

    const importReplacements: Replacement[] = [];
    applyImportManagerChanges(importManager, importReplacements, [sourceFile], info);
    replacements.push(...importReplacements);
  }
}
