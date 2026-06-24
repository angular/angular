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
import {ImportManager, TypeScriptReflectionHost} from '@angular/compiler-cli/private/migrations';
import {getImportOfIdentifier} from '../../utils/typescript/imports';

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
  // Match ngTemplateOutlet as structural (*ngTemplateOutlet) or property binding [ngTemplateOutlet]
  {pattern: /(\*ngTemplateOutlet\b|\[ngTemplateOutlet\])/g, imports: ['NgTemplateOutlet']},
  // Match ngComponentOutlet as structural (*ngComponentOutlet) or property binding [ngComponentOutlet]
  {pattern: /(\*ngComponentOutlet\b|\[ngComponentOutlet\])/g, imports: ['NgComponentOutlet']},

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

function migrateCommonModuleUsage(
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

function createCommonModuleImportsArrayRemoval(
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
    return !isCommonModuleFromAngularCommon(typeChecker, el);
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

  return importsArray.elements.some((el) => {
    if (!ts.isIdentifier(el)) return false;
    return isCommonModuleFromAngularCommon(typeChecker, el);
  });
}

function isCommonModuleFromAngularCommon(
  typeChecker: ts.TypeChecker,
  identifier: ts.Identifier,
): boolean {
  const importInfo = getImportOfIdentifier(typeChecker, identifier);
  return (
    importInfo !== null &&
    importInfo.name === commonModuleStr &&
    importInfo.importModule === angularCommonStr
  );
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
