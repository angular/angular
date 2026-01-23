/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ProgramInfo, projectFile, ProjectFile, Replacement, TextUpdate} from '../../utils/tsurge';
import {ImportManager} from '@angular/compiler-cli/private/migrations';

export const ROUTER_TESTING_MODULE = 'RouterTestingModule';

export const SPY_LOCATION = 'SpyLocation';
export const ROUTER_MODULE = 'RouterModule';
export const PROVIDE_LOCATION_MOCKS = 'provideLocationMocks';

export const ANGULAR_ROUTER_TESTING = '@angular/router/testing';
export const ANGULAR_ROUTER = '@angular/router';
export const ANGULAR_COMMON = '@angular/common';
export const ANGULAR_COMMON_TESTING = '@angular/common/testing';

export const IMPORTS_PROPERTY = 'imports';
export const PROVIDERS_PROPERTY = 'providers';
export const WITH_ROUTES_STATIC_METHOD = 'withRoutes';

export const TESTBED_IDENTIFIER = 'TestBed';
export const CONFIGURE_TESTING_MODULE = 'configureTestingModule';

export interface RouterTestingAnalysis {
  neededProviders: Set<ts.Expression>;
  neededImports: Set<ts.Expression>;
  canRemoveRouterTestingModule: boolean;
  replacementCount: number;
  hasLocationMocks: boolean;
}

export interface RouterTestingModuleUsage {
  sourceFile: ts.SourceFile;
  configObject: ts.ObjectLiteralExpression;
  importsProperty: ts.PropertyAssignment | null;
  providersProperty: ts.PropertyAssignment | null;
  routerTestingModuleElement: ts.Expression;
  routesNode: ts.Expression | null;
  optionsNode: ts.Expression | null;
  importsArrayElements: ts.Expression[];
  usesSpyLocationUrlChanges: boolean;
}

interface CallPattern {
  type: 'call';
  expression: ts.Expression;
  arguments: ts.NodeArray<ts.Expression>;
}

interface ArrayPattern {
  type: 'array';
  elements: ts.NodeArray<ts.Expression>;
}

interface LiteralPattern {
  type: 'literal';
  expression: ts.LiteralExpression;
}

function hasImportFromModule(
  sourceFile: ts.SourceFile,
  modulePath: string,
  ...symbolNames: string[]
): boolean {
  const symbolSet = new Set(symbolNames);
  let hasImport = false;

  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === modulePath &&
      node.importClause?.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings)
    ) {
      for (const element of node.importClause.namedBindings.elements) {
        if (symbolSet.has(element.name.text)) {
          hasImport = true;
          break;
        }
      }
    }
  });

  return hasImport;
}

function detectSpyLocationUrlChangesUsage(sourceFile: ts.SourceFile): boolean {
  const hasSpyLocationImport = hasImportFromModule(
    sourceFile,
    ANGULAR_COMMON_TESTING,
    SPY_LOCATION,
  );

  let usesUrlChangesFeature = false;

  function walk(node: ts.Node): void {
    if (usesUrlChangesFeature) {
      return;
    }

    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'urlChanges'
    ) {
      usesUrlChangesFeature = true;
      return;
    }

    node.forEachChild(walk);
  }

  walk(sourceFile);

  return hasSpyLocationImport && usesUrlChangesFeature;
}

function createArrayLiteralReplacement(
  file: ProjectFile,
  arrayLiteral: ts.ArrayLiteralExpression,
  newElements: (string | ts.Expression)[],
  sourceFile: ts.SourceFile,
): Replacement {
  const elementNodes = newElements.map((element) => {
    if (typeof element === 'string') {
      return parseStringToExpression(element);
    }
    return element;
  });

  const newArray = ts.factory.updateArrayLiteralExpression(arrayLiteral, elementNodes);

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });
  const newText = printer.printNode(ts.EmitHint.Unspecified, newArray, sourceFile);

  return new Replacement(
    file,
    new TextUpdate({
      position: arrayLiteral.getStart(),
      end: arrayLiteral.getEnd(),
      toInsert: newText,
    }),
  );
}

function createImportRemovalReplacement(
  file: ProjectFile,
  importDeclaration: ts.ImportDeclaration,
  namedBindings: ts.NamedImports,
  symbolToRemove: string,
  sourceFile: ts.SourceFile,
): Replacement {
  const otherImports = namedBindings.elements.filter((el) => el.name.text !== symbolToRemove);

  if (otherImports.length === 0) {
    return new Replacement(
      file,
      new TextUpdate({
        position: importDeclaration.getStart(),
        end: importDeclaration.getEnd() + 1,
        toInsert: '',
      }),
    );
  } else {
    const newNamedBindings = ts.factory.updateNamedImports(namedBindings, otherImports);

    const printer = ts.createPrinter();
    const newText = printer.printNode(ts.EmitHint.Unspecified, newNamedBindings, sourceFile);

    return new Replacement(
      file,
      new TextUpdate({
        position: namedBindings.getStart(),
        end: namedBindings.getEnd(),
        toInsert: newText,
      }),
    );
  }
}

function isEmptyArrayExpression(expression: ts.Expression): boolean {
  return ts.isArrayLiteralExpression(expression) && expression.elements.length === 0;
}

function getRoutesArgumentForMigration(
  routesNode: ts.Expression | null,
  optionsNode: ts.Expression | null,
): ts.Expression | undefined {
  if (!routesNode) {
    return undefined;
  }

  if (!isEmptyArrayExpression(routesNode)) {
    return routesNode;
  }

  return optionsNode ? routesNode : undefined;
}

function createRouterModuleExpression(
  routesArg?: ts.Expression,
  optionsArg?: ts.Expression,
): ts.Expression {
  const routerModuleIdentifier = ts.factory.createIdentifier(ROUTER_MODULE);

  if (routesArg) {
    // Build args list and include options if present
    const args: ts.Expression[] = [routesArg];
    if (optionsArg) {
      args.push(optionsArg);
    }

    // Create RouterModule.forRoot(routes, options?) expression
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        routerModuleIdentifier,
        ts.factory.createIdentifier('forRoot'),
      ),
      undefined,
      args,
    );
  }

  return routerModuleIdentifier;
}

function createProviderCallExpression(
  functionName: string,
  argument?: ts.Expression,
): ts.CallExpression {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(functionName),
    undefined,
    argument ? [argument] : [],
  );
}

function createArrayLiteralFromExpressions(
  expressions: Set<ts.Expression>,
): ts.ArrayLiteralExpression {
  return ts.factory.createArrayLiteralExpression(
    Array.from(expressions),
    true, // multiline
  );
}

function parseStringToExpression(text: string): ts.Expression {
  const wrapped = `(${text})`;
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    wrapped,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  if (sourceFile.statements.length === 1) {
    const statement = sourceFile.statements[0];
    if (ts.isExpressionStatement(statement) && ts.isParenthesizedExpression(statement.expression)) {
      return statement.expression.expression;
    }
  }

  return parseExpressionWithPatternRecognition(text);
}

function parseExpressionWithPatternRecognition(text: string): ts.Expression {
  const callPattern = analyzeCallPattern(text);
  if (callPattern) {
    return ts.factory.createCallExpression(
      callPattern.expression,
      undefined,
      Array.from(callPattern.arguments),
    );
  }

  const arrayPattern = analyzeArrayPattern(text);
  if (arrayPattern) {
    return ts.factory.createArrayLiteralExpression(Array.from(arrayPattern.elements), true);
  }

  const literalPattern = analyzeLiteralPattern(text);
  if (literalPattern) {
    return literalPattern.expression;
  }

  return ts.factory.createIdentifier(text);
}

function analyzeCallPattern(text: string): CallPattern | null {
  const testExpression = `(${text})`;
  const sourceFile = ts.createSourceFile('temp.ts', testExpression, ts.ScriptTarget.Latest, true);

  if (sourceFile.statements.length === 1) {
    const statement = sourceFile.statements[0];
    if (
      ts.isExpressionStatement(statement) &&
      ts.isParenthesizedExpression(statement.expression) &&
      ts.isCallExpression(statement.expression.expression)
    ) {
      const callExpr = statement.expression.expression;
      return {
        type: 'call',
        expression: callExpr.expression,
        arguments: callExpr.arguments,
      };
    }
  }

  return null;
}

function analyzeArrayPattern(text: string): ArrayPattern | null {
  const sourceFile = ts.createSourceFile('temp.ts', text, ts.ScriptTarget.Latest, true);

  if (sourceFile.statements.length === 1) {
    const statement = sourceFile.statements[0];
    if (ts.isExpressionStatement(statement) && ts.isArrayLiteralExpression(statement.expression)) {
      return {
        type: 'array',
        elements: statement.expression.elements,
      };
    }
  }

  return null;
}

function analyzeLiteralPattern(text: string): LiteralPattern | null {
  const sourceFile = ts.createSourceFile('temp.ts', text, ts.ScriptTarget.Latest, true);

  if (sourceFile.statements.length === 1) {
    const statement = sourceFile.statements[0];
    if (ts.isExpressionStatement(statement)) {
      const expr = statement.expression;
      if (ts.isStringLiteral(expr) || ts.isNumericLiteral(expr) || ts.isLiteralExpression(expr)) {
        return {
          type: 'literal',
          expression: expr,
        };
      }
    }
  }

  return null;
}

function removeRouterTestingModuleImport(
  sourceFile: ts.SourceFile,
  file: ProjectFile,
  replacements: Replacement[],
): void {
  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === ANGULAR_ROUTER_TESTING &&
      node.importClause?.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings)
    ) {
      const namedBindings = node.importClause.namedBindings;
      replacements.push(
        createImportRemovalReplacement(
          file,
          node,
          namedBindings,
          ROUTER_TESTING_MODULE,
          sourceFile,
        ),
      );
    }
  });
}

function migrateToRouterModule(
  usage: RouterTestingModuleUsage,
  file: ProjectFile,
  routesNode: ts.Expression | null,
  optionsNode: ts.Expression | null,
  replacements: Replacement[],
): void {
  const neededImportsExpressions = new Set<ts.Expression>();
  const neededProvidersExpressions = new Set<ts.Expression>();

  const optionsExpression = optionsNode ? optionsNode : undefined;
  const routesExpression = getRoutesArgumentForMigration(routesNode, optionsNode);
  const routerModuleExpression = createRouterModuleExpression(routesExpression, optionsExpression);
  neededImportsExpressions.add(routerModuleExpression);

  if (usage.usesSpyLocationUrlChanges) {
    const provideLocationMocksExpression = createProviderCallExpression(PROVIDE_LOCATION_MOCKS);
    neededProvidersExpressions.add(provideLocationMocksExpression);
  }

  if (usage.importsProperty && ts.isArrayLiteralExpression(usage.importsProperty.initializer)) {
    const importsArray = usage.importsProperty.initializer;

    const otherImportExpressions = usage.importsArrayElements.filter(
      (el) => el !== usage.routerTestingModuleElement,
    );

    const allImportExpressions = [
      ...otherImportExpressions,
      ...Array.from(neededImportsExpressions),
    ];

    replacements.push(
      createArrayLiteralReplacement(file, importsArray, allImportExpressions, usage.sourceFile),
    );
  }

  if (neededProvidersExpressions.size > 0) {
    if (
      usage.providersProperty &&
      ts.isArrayLiteralExpression(usage.providersProperty.initializer)
    ) {
      const existingProvidersArray = usage.providersProperty.initializer;

      const allProviderExpressions = [
        ...existingProvidersArray.elements,
        ...Array.from(neededProvidersExpressions),
      ];

      replacements.push(
        createArrayLiteralReplacement(
          file,
          existingProvidersArray,
          allProviderExpressions,
          usage.sourceFile,
        ),
      );
    } else {
      const providersArray = createArrayLiteralFromExpressions(neededProvidersExpressions);

      const printer = ts.createPrinter();
      const providersText = printer.printNode(
        ts.EmitHint.Unspecified,
        providersArray,
        usage.sourceFile,
      );

      const insertPosition = usage.importsProperty!.getEnd();
      replacements.push(
        new Replacement(
          file,
          new TextUpdate({
            position: insertPosition,
            end: insertPosition,
            toInsert: `,\n  ${PROVIDERS_PROPERTY}: ${providersText}`,
          }),
        ),
      );
    }
  }
}

function analyzeRouterTestingModuleUsage(usage: RouterTestingModuleUsage): RouterTestingAnalysis {
  const neededProviders = new Set<ts.Expression>();
  const neededImports = new Set<ts.Expression>();
  let hasLocationMocks = false;

  const optionsExpression = usage.optionsNode ? usage.optionsNode : undefined;
  const routesExpression = getRoutesArgumentForMigration(usage.routesNode, usage.optionsNode);

  // Add RouterModule to imports (preserve options when present)
  const routerModuleExpression = createRouterModuleExpression(routesExpression, optionsExpression);
  neededImports.add(routerModuleExpression);

  // Add location mocks ONLY if:
  // 1. SpyLocation is imported from @angular/common/testing, AND
  // 2. urlChanges property is accessed in the test
  // 3. provideLocationMocks() is not already present
  if (usage.usesSpyLocationUrlChanges) {
    const provideLocationMocksExpression = createProviderCallExpression(PROVIDE_LOCATION_MOCKS);
    neededProviders.add(provideLocationMocksExpression);
    hasLocationMocks = true;
  }

  return {
    neededProviders,
    neededImports,
    canRemoveRouterTestingModule: true,
    replacementCount: 1,
    hasLocationMocks,
  };
}

export function findRouterTestingModuleUsages(
  sourceFile: ts.SourceFile,
): RouterTestingModuleUsage[] {
  const usages: RouterTestingModuleUsage[] = [];

  const hasRouterTestingModule = hasImportFromModule(
    sourceFile,
    ANGULAR_ROUTER_TESTING,
    ROUTER_TESTING_MODULE,
  );

  const usesSpyLocationUrlChanges = detectSpyLocationUrlChangesUsage(sourceFile);

  if (!hasRouterTestingModule) {
    return usages;
  }

  function walk(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === CONFIGURE_TESTING_MODULE &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === TESTBED_IDENTIFIER &&
      node.arguments.length > 0 &&
      ts.isObjectLiteralExpression(node.arguments[0])
    ) {
      const config = node.arguments[0];
      let importsProperty: ts.PropertyAssignment | null = null;
      let providersProperty: ts.PropertyAssignment | null = null;

      for (const prop of config.properties) {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
          if (prop.name.text === IMPORTS_PROPERTY) {
            importsProperty = prop;
          } else if (prop.name.text === PROVIDERS_PROPERTY) {
            providersProperty = prop;
          }
        }
      }

      if (!importsProperty || !ts.isArrayLiteralExpression(importsProperty.initializer)) {
        node.forEachChild(walk);
        return;
      }

      const importsArray = importsProperty.initializer;
      let routerTestingModuleElement: ts.Expression | null = null;
      let routesNode: ts.Expression | null = null;
      let optionsNode: ts.Expression | null = null;

      for (const element of importsArray.elements) {
        if (ts.isIdentifier(element) && element.text === ROUTER_TESTING_MODULE) {
          routerTestingModuleElement = element;
          break;
        } else if (
          ts.isCallExpression(element) &&
          ts.isPropertyAccessExpression(element.expression) &&
          ts.isIdentifier(element.expression.expression) &&
          element.expression.expression.text === ROUTER_TESTING_MODULE &&
          element.expression.name.text === WITH_ROUTES_STATIC_METHOD
        ) {
          routerTestingModuleElement = element;
          if (element.arguments.length > 0) {
            routesNode = element.arguments[0];
          }
          if (element.arguments.length > 1) {
            optionsNode = element.arguments[1];
          }
          break;
        }
      }

      if (routerTestingModuleElement) {
        usages.push({
          sourceFile,
          configObject: config,
          importsProperty,
          providersProperty,
          routerTestingModuleElement,
          routesNode,
          optionsNode,
          importsArrayElements: Array.from(importsArray.elements),
          usesSpyLocationUrlChanges,
        });
      }
    }

    node.forEachChild(walk);
  }

  walk(sourceFile);
  return usages;
}

export function processRouterTestingModuleUsage(
  usage: RouterTestingModuleUsage,
  sourceFile: ts.SourceFile,
  info: ProgramInfo,
  importManager: ImportManager,
  replacements: Replacement[],
): void {
  const file = projectFile(sourceFile, info);
  const routesNode = usage.routesNode;
  const optionsNode = usage.optionsNode;

  const analysis = analyzeRouterTestingModuleUsage(usage);

  migrateToRouterModule(usage, file, routesNode, optionsNode, replacements);

  importManager.addImport({
    exportModuleSpecifier: ANGULAR_ROUTER,
    exportSymbolName: ROUTER_MODULE,
    requestedFile: sourceFile,
  });

  if (analysis.hasLocationMocks) {
    importManager.addImport({
      exportModuleSpecifier: ANGULAR_COMMON_TESTING,
      exportSymbolName: PROVIDE_LOCATION_MOCKS,
      requestedFile: sourceFile,
    });
  }

  removeRouterTestingModuleImport(sourceFile, file, replacements);
}
