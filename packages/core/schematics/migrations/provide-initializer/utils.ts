/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ChangeTracker} from '../../utils/change_tracker';
import {getImportSpecifier} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';

export type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(sourceFile: ts.SourceFile, rewriteFn: RewriteFn) {
  const changeTracker = new ChangeTracker(ts.createPrinter());

  const visitNode = (node: ts.Node) => {
    const provider = tryParseProviderExpression(node);

    if (provider) {
      replaceProviderWithNewApi({
        sourceFile: sourceFile,
        node: node,
        provider: provider,
        changeTracker,
      });
      return;
    }

    ts.forEachChild(node, visitNode);
  };

  ts.forEachChild(sourceFile, visitNode);

  for (const change of changeTracker.recordChanges().get(sourceFile)?.values() ?? []) {
    rewriteFn(change.start, change.removeLength ?? 0, change.text);
  }
}

function replaceProviderWithNewApi({
  sourceFile,
  node,
  provider,
  changeTracker,
}: {
  sourceFile: ts.SourceFile;
  node: ts.Node;
  provider: ProviderInfo;
  changeTracker: ChangeTracker;
}) {
  const {initializerCode, importInject, provideInitializerFunctionName, initializerToken} =
    provider;

  const initializerTokenSpecifier = getImportSpecifier(
    sourceFile,
    angularCoreModule,
    initializerToken,
  );

  // The token doesn't come from `@angular/core`.
  if (!initializerTokenSpecifier) {
    return;
  }

  // Replace the provider with the new provide function.
  changeTracker.replaceText(
    sourceFile,
    node.getStart(),
    node.getWidth(),
    `${provideInitializerFunctionName}(${initializerCode})`,
  );

  // Import declaration and named imports are necessarily there.
  const namedImports = closestNode(initializerTokenSpecifier, ts.isNamedImports)!;

  // `provide*Initializer` function is already imported.
  const hasProvideInitializeFunction = namedImports.elements.some(
    (element) => element.name.getText() === provideInitializerFunctionName,
  );

  const newNamedImports = ts.factory.updateNamedImports(namedImports, [
    // Remove the `*_INITIALIZER` token from imports.
    ...namedImports.elements.filter((element) => element !== initializerTokenSpecifier),
    // Add the `inject` function to imports if needed.
    ...(importInject ? [createImportSpecifier('inject')] : []),
    // Add the `provide*Initializer` function to imports.
    ...(!hasProvideInitializeFunction
      ? [createImportSpecifier(provideInitializerFunctionName)]
      : []),
  ]);
  changeTracker.replaceNode(namedImports, newNamedImports);
}

function createImportSpecifier(name: string): ts.ImportSpecifier {
  return ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name));
}

function tryParseProviderExpression(node: ts.Node): ProviderInfo | undefined {
  if (!ts.isObjectLiteralExpression(node)) {
    return;
  }

  let deps: string[] = [];
  let initializerToken: string | undefined;
  let useExisting: ts.Expression | undefined;
  let useFactory: ts.Expression | undefined;
  let useValue: ts.Expression | undefined;
  let multi = false;

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) {
      continue;
    }

    switch (property.name.text) {
      case 'deps':
        if (ts.isArrayLiteralExpression(property.initializer)) {
          deps = property.initializer.elements.map((el) => el.getText());
        }
        break;
      case 'provide':
        initializerToken = property.initializer.getText();
        break;
      case 'useExisting':
        useExisting = property.initializer;
        break;
      case 'useFactory':
        useFactory = property.initializer;
        break;
      case 'useValue':
        useValue = property.initializer;
        break;
      case 'multi':
        multi = property.initializer.kind === ts.SyntaxKind.TrueKeyword;
        break;
    }
  }

  if (!initializerToken || !multi) {
    return;
  }

  const provideInitializerFunctionName = initializerTokenToFunctionMap.get(initializerToken);
  if (!provideInitializerFunctionName) {
    return;
  }

  const info = {
    initializerToken,
    provideInitializerFunctionName,
    importInject: false,
  } satisfies Partial<ProviderInfo>;

  if (useExisting) {
    return {
      ...info,
      importInject: true,
      initializerCode: `() => inject(${useExisting.getText()})()`,
    };
  }

  if (useFactory) {
    const args = deps.map((dep) => `inject(${dep})`);
    return {
      ...info,
      importInject: deps.length > 0,
      initializerCode: `() => { return (${useFactory.getText()})(${args.join(', ')}); }`,
    };
  }

  if (useValue) {
    return {...info, initializerCode: useValue.getText()};
  }

  return;
}

const angularCoreModule = '@angular/core';

const initializerTokenToFunctionMap = new Map<string, string>([
  ['APP_INITIALIZER', 'provideAppInitializer'],
  ['ENVIRONMENT_INITIALIZER', 'provideEnvironmentInitializer'],
  ['PLATFORM_INITIALIZER', 'providePlatformInitializer'],
]);

interface ProviderInfo {
  initializerToken: string;
  provideInitializerFunctionName: string;
  initializerCode: string;
  importInject: boolean;
}
