/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {NgtscProgram} from '@angular/compiler-cli';
import {Reference, TemplateTypeChecker} from '@angular/compiler-cli/private/migrations';
import {dirname, join} from 'path';
import ts from 'typescript';

import {getAngularDecorators} from '../../utils/ng_decorators';
import {closestNode} from '../../utils/typescript/nodes';

import {convertNgModuleDeclarationToStandalone} from './to-standalone';
import {ChangeTracker, createLanguageService, findClassDeclaration, findLiteralProperty, getNodeLookup, getRelativeImportPath, NamedClassDeclaration, NodeLookup, offsetsToNodes} from './util';

/** Information extracted from a `bootstrapModule` call necessary to migrate it. */
interface BootstrapCallAnalysis {
  /** The call itself. */
  call: ts.CallExpression;
  /** Class that is being bootstrapped. */
  module: ts.ClassDeclaration;
  /** Metadata of the module class being bootstrapped. */
  metadata: ts.ObjectLiteralExpression;
  /** Component that the module is bootstrapping. */
  component: NamedClassDeclaration;
}

export function toStandaloneBootstrap(
    program: NgtscProgram, host: ts.CompilerHost, basePath: string, rootFileNames: string[],
    sourceFiles: ts.SourceFile[], printer: ts.Printer) {
  const tracker = new ChangeTracker(printer);
  const typeChecker = program.getTsProgram().getTypeChecker();
  const templateTypeChecker = program.compiler.getTemplateTypeChecker();
  const languageService = createLanguageService(program, host, rootFileNames, basePath);
  const bootstrapCalls: BootstrapCallAnalysis[] = [];

  sourceFiles.forEach(function walk(node: ts.Node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'bootstrapModule' &&
        isClassReferenceInModule(node.expression, 'PlatformRef', '@angular/core', typeChecker)) {
      const call = analyzeBootstrapCall(node, typeChecker);

      if (call) {
        bootstrapCalls.push(call);
      }
    }
    node.forEachChild(walk);
  });

  for (const call of bootstrapCalls) {
    migrateBootstrapCall(call, tracker, languageService, typeChecker, templateTypeChecker, printer);
  }

  return tracker.recordChanges();
}

/**
 * Extracts all of the information from a `bootstrapModule` call
 * necessary to convert it to `bootstrapApplication`.
 * @param call Call to be analyzed.
 * @param typeChecker
 */
function analyzeBootstrapCall(
    call: ts.CallExpression, typeChecker: ts.TypeChecker): BootstrapCallAnalysis|null {
  if (call.arguments.length === 0 || !ts.isIdentifier(call.arguments[0])) {
    return null;
  }

  const declaration = findClassDeclaration(call.arguments[0], typeChecker);

  if (!declaration) {
    return null;
  }

  const decorator = getAngularDecorators(typeChecker, ts.getDecorators(declaration) || [])
                        .find(decorator => decorator.name === 'NgModule');

  if (!decorator || decorator.node.expression.arguments.length === 0 ||
      !ts.isObjectLiteralExpression(decorator.node.expression.arguments[0])) {
    return null;
  }

  const metadata = decorator.node.expression.arguments[0];
  const bootstrapProp = findLiteralProperty(metadata, 'bootstrap');

  if (!bootstrapProp || !ts.isPropertyAssignment(bootstrapProp) ||
      !ts.isArrayLiteralExpression(bootstrapProp.initializer) ||
      bootstrapProp.initializer.elements.length === 0 ||
      !ts.isIdentifier(bootstrapProp.initializer.elements[0])) {
    return null;
  }

  const component = findClassDeclaration(bootstrapProp.initializer.elements[0], typeChecker);

  if (component && component.name && ts.isIdentifier(component.name)) {
    return {module: declaration, metadata, component: component as NamedClassDeclaration, call};
  }

  return null;
}

/**
 * Converts a `bootstrapModule` call to `bootstrapApplication`.
 * @param analysis Analysis result of the call.
 * @param tracker Tracker in which to register the changes.
 * @param languageService
 * @param typeChecker
 * @param templateTypeChecker
 * @param printer
 */
function migrateBootstrapCall(
    analysis: BootstrapCallAnalysis, tracker: ChangeTracker, languageService: ts.LanguageService,
    typeChecker: ts.TypeChecker, templateTypeChecker: TemplateTypeChecker, printer: ts.Printer) {
  const sourceFile = analysis.call.getSourceFile();
  const moduleSourceFile = analysis.metadata.getSourceFile();
  const providers = findLiteralProperty(analysis.metadata, 'providers');
  const imports = findLiteralProperty(analysis.metadata, 'imports');
  const nodesToCopy = new Set<ts.Node>();
  const providersInNewCall: ts.Expression[] = [];
  const moduleImportsInNewCall: ts.Expression[] = [];
  let nodeLookup: NodeLookup|null = null;

  // The previous migrations explicitly skip over modules that bootstrap a
  // component so we have to convert it as a part of this migration instead.
  convertBootstrappedModuleToStandalone(analysis, tracker, templateTypeChecker);

  // We can't reuse the module pruning logic, because we would have to recreate the entire program.
  // Instead we comment out the module's metadata so that the user doesn't get compilation errors
  // for the classes that are left in the `declarations` array. This should allow the app to
  // run and the user can run module pruning themselves to get rid of the module afterwards.
  tracker.insertText(
      moduleSourceFile, analysis.metadata.getStart(),
      '/* TODO(standalone-migration): clean up removed NgModule class manually or run the ' +
          '"Remove unnecessary NgModule classes" step of the migration again. \n');
  tracker.insertText(moduleSourceFile, analysis.metadata.getEnd(), ' */');

  if (providers && ts.isPropertyAssignment(providers)) {
    nodeLookup = nodeLookup || getNodeLookup(moduleSourceFile);

    if (ts.isArrayLiteralExpression(providers.initializer)) {
      providersInNewCall.push(...providers.initializer.elements);
    } else {
      providersInNewCall.push(ts.factory.createSpreadElement(providers.initializer));
    }

    addNodesToCopy(sourceFile, providers, nodeLookup, tracker, nodesToCopy, languageService);
  }

  if (imports && ts.isPropertyAssignment(imports)) {
    nodeLookup = nodeLookup || getNodeLookup(moduleSourceFile);
    migrateImportsForBootstrapCall(
        sourceFile, imports, nodeLookup, moduleImportsInNewCall, providersInNewCall, tracker,
        nodesToCopy, languageService, typeChecker);
  }

  if (nodesToCopy.size > 0) {
    let text = '\n\n';
    nodesToCopy.forEach(node => {
      const transformedNode = remapDynamicImports(sourceFile.fileName, node);

      // Use `getText` to try an preserve the original formatting. This only works if the node
      // hasn't been transformed. If it has, we have to fall back to the printer.
      if (transformedNode === node) {
        text += transformedNode.getText() + '\n';
      } else {
        text += printer.printNode(ts.EmitHint.Unspecified, transformedNode, node.getSourceFile());
      }
    });
    text += '\n';
    tracker.insertText(sourceFile, getLastImportEnd(sourceFile), text);
  }

  replaceBootstrapCallExpression(analysis, providersInNewCall, moduleImportsInNewCall, tracker);
}

/**
 * Replaces a `bootstrapModule` call with `bootstrapApplication`.
 * @param analysis Analysis result of the `bootstrapModule` call.
 * @param providers Providers that should be added to the new call.
 * @param modules Modules that are being imported into the new call.
 * @param tracker Object keeping track of the changes to the different files.
 */
function replaceBootstrapCallExpression(
    analysis: BootstrapCallAnalysis, providers: ts.Expression[], modules: ts.Expression[],
    tracker: ChangeTracker): void {
  const sourceFile = analysis.call.getSourceFile();
  const componentPath =
      getRelativeImportPath(sourceFile.fileName, analysis.component.getSourceFile().fileName);
  const args = [tracker.addImport(sourceFile, analysis.component.name.text, componentPath)];
  const bootstrapExpression =
      tracker.addImport(sourceFile, 'bootstrapApplication', '@angular/platform-browser');

  if (providers.length > 0 || modules.length > 0) {
    const combinedProviders: ts.Expression[] = [];

    if (modules.length > 0) {
      const importProvidersExpression =
          tracker.addImport(sourceFile, 'importProvidersFrom', '@angular/core');
      combinedProviders.push(
          ts.factory.createCallExpression(importProvidersExpression, [], modules));
    }

    // Push the providers after `importProvidersFrom` call for better readability.
    combinedProviders.push(...providers);
    const initializer = remapDynamicImports(
        sourceFile.fileName,
        ts.factory.createArrayLiteralExpression(combinedProviders, combinedProviders.length > 1));

    args.push(ts.factory.createObjectLiteralExpression(
        [ts.factory.createPropertyAssignment('providers', initializer)], true));
  }

  tracker.replaceNode(
      analysis.call, ts.factory.createCallExpression(bootstrapExpression, [], args),
      // Note: it's important to pass in the source file that the nodes originated from!
      // Otherwise TS won't print out literals inside of the providers that we're copying
      // over from the module file.
      undefined, analysis.metadata.getSourceFile());
}

/**
 * Converts the declarations of a bootstrapped module to standalone. These declarations are
 * skipped in the `convert-to-standalone` phase so they need to be migrated when converting
 * to `bootstrapApplication`.
 * @param analysis Result of the analysis of the NgModule.
 * @param tracker
 * @param templateTypeChecker
 */
function convertBootstrappedModuleToStandalone(
    analysis: BootstrapCallAnalysis, tracker: ChangeTracker,
    templateTypeChecker: TemplateTypeChecker) {
  const metadata = templateTypeChecker.getNgModuleMetadata(analysis.module);

  if (!metadata) {
    throw new Error(`Cannot resolve NgModule metadata for class ${
        analysis.module.name?.getText()}. Cannot switch to standalone bootstrap API.`);
  }

  const classDeclarations =
      metadata.declarations.filter(decl => ts.isClassDeclaration(decl.node)) as
      Reference<ts.ClassDeclaration>[];

  if (!classDeclarations.some(decl => decl.node === analysis.component)) {
    throw new Error(`Bootstrapped component is not in the declarations array of NgModule ${
        analysis.module.name?.getText()}. Cannot switch to standalone bootstrap API.`);
  }

  for (const decl of classDeclarations) {
    if (ts.isClassDeclaration(decl.node)) {
      convertNgModuleDeclarationToStandalone(decl, classDeclarations, tracker, templateTypeChecker);
    }
  }
}

/**
 * Processes the `imports` of an NgModule so that they can be used in the `bootstrapApplication`
 * call inside of a different file.
 * @param sourceFile File to which the imports will be moved.
 * @param imports Node declaring the imports.
 * @param nodeLookup Map used to look up nodes based on their positions in a file.
 * @param importsForNewCall Array keeping track of the imports that are being added to the new call.
 * @param providersInNewCall Array keeping track of the providers in the new call.
 * @param tracker Tracker in which changes to files are being stored.
 * @param nodesToCopy Nodes that should be copied to the new file.
 * @param languageService
 * @param typeChecker
 */
function migrateImportsForBootstrapCall(
    sourceFile: ts.SourceFile, imports: ts.PropertyAssignment, nodeLookup: NodeLookup,
    importsForNewCall: ts.Expression[], providersInNewCall: ts.Expression[], tracker: ChangeTracker,
    nodesToCopy: Set<ts.Node>, languageService: ts.LanguageService,
    typeChecker: ts.TypeChecker): void {
  if (!ts.isArrayLiteralExpression(imports.initializer)) {
    importsForNewCall.push(imports.initializer);
    return;
  }

  for (const element of imports.initializer.elements) {
    // If the reference is to a `RouterModule.forRoot` call with
    // one argument, we can migrate to the new `provideRouter` API.
    if (ts.isCallExpression(element) && element.arguments.length === 1 &&
        ts.isPropertyAccessExpression(element.expression) &&
        element.expression.name.text === 'forRoot' &&
        isClassReferenceInModule(
            element.expression.expression, 'RouterModule', '@angular/router', typeChecker)) {
      providersInNewCall.push(ts.factory.createCallExpression(
          tracker.addImport(sourceFile, 'provideRouter', '@angular/router'), [],
          element.arguments));
      addNodesToCopy(
          sourceFile, element.arguments[0], nodeLookup, tracker, nodesToCopy, languageService);
      continue;
    }

    if (ts.isIdentifier(element)) {
      // `BrowserAnimationsModule` can be replaced with `provideAnimations`.
      const animationsModule = '@angular/platform-browser/animations';
      if (isClassReferenceInModule(
              element, 'BrowserAnimationsModule', animationsModule, typeChecker)) {
        providersInNewCall.push(ts.factory.createCallExpression(
            tracker.addImport(sourceFile, 'provideAnimations', animationsModule), [], []));
        continue;
      }

      // `NoopAnimationsModule` can be replaced with `provideNoopAnimations`.
      if (isClassReferenceInModule(
              element, 'NoopAnimationsModule', animationsModule, typeChecker)) {
        providersInNewCall.push(ts.factory.createCallExpression(
            tracker.addImport(sourceFile, 'provideNoopAnimations', animationsModule), [], []));
        continue;
      }
    }

    const target =
        // If it's a call, it'll likely be a `ModuleWithProviders`
        // expression so the target is going to be call's expression.
        ts.isCallExpression(element) && ts.isPropertyAccessExpression(element.expression) ?
        element.expression.expression :
        element;
    const classDeclaration = findClassDeclaration(target, typeChecker);
    const decorators = classDeclaration ?
        getAngularDecorators(typeChecker, ts.getDecorators(classDeclaration) || []) :
        undefined;

    if (!decorators || decorators.length === 0 ||
        decorators.every(
            ({name}) => name !== 'Directive' && name !== 'Component' && name !== 'Pipe')) {
      importsForNewCall.push(element);
      addNodesToCopy(sourceFile, element, nodeLookup, tracker, nodesToCopy, languageService);
    }
  }
}

/**
 * Finds all the nodes that are referenced inside a root node and would need to be copied into a
 * new file in order for the node to compile, and tracks them.
 * @param targetFile File to which the nodes will be copied.
 * @param rootNode Node within which to look for references.
 * @param nodeLookup Map used to look up nodes based on their positions in a file.
 * @param tracker Tracker in which changes to files are stored.
 * @param nodesToCopy Set that keeps track of the nodes being copied.
 * @param languageService
 */
function addNodesToCopy(
    targetFile: ts.SourceFile, rootNode: ts.Node, nodeLookup: NodeLookup, tracker: ChangeTracker,
    nodesToCopy: Set<ts.Node>, languageService: ts.LanguageService): void {
  const refs = findAllSameFileReferences(rootNode, nodeLookup, languageService);

  for (const ref of refs) {
    const importSpecifier = closestOrSelf(ref, ts.isImportSpecifier);
    const importDeclaration =
        importSpecifier ? closestNode(importSpecifier, ts.isImportDeclaration) : null;

    // If the reference is in an import, we need to add an import to the main file.
    if (importDeclaration && importSpecifier &&
        ts.isStringLiteralLike(importDeclaration.moduleSpecifier)) {
      const moduleName = importDeclaration.moduleSpecifier.text.startsWith('.') ?
          remapRelativeImport(targetFile.fileName, importDeclaration.moduleSpecifier) :
          importDeclaration.moduleSpecifier.text;
      const symbolName = importSpecifier.propertyName ? importSpecifier.propertyName.text :
                                                        importSpecifier.name.text;
      const alias = importSpecifier.propertyName ? importSpecifier.name.text : null;
      tracker.addImport(targetFile, symbolName, moduleName, alias);
      continue;
    }

    const variableDeclaration = closestOrSelf(ref, ts.isVariableDeclaration);
    const variableStatement =
        variableDeclaration ? closestNode(variableDeclaration, ts.isVariableStatement) : null;

    // If the reference is a variable, we can attempt to import it or copy it over.
    if (variableDeclaration && variableStatement && ts.isIdentifier(variableDeclaration.name)) {
      if (isExported(variableStatement)) {
        tracker.addImport(
            targetFile, variableDeclaration.name.text,
            getRelativeImportPath(targetFile.fileName, ref.getSourceFile().fileName));
      } else {
        nodesToCopy.add(variableStatement);
      }
      continue;
    }

    // Otherwise check if the reference is inside of an exportable declaration, e.g. a function.
    // This code that is safe to copy over into the new file or import it, if it's exported.
    const closestExportable = closestOrSelf(ref, isExportableDeclaration);
    if (closestExportable) {
      if (isExported(closestExportable) && closestExportable.name) {
        tracker.addImport(
            targetFile, closestExportable.name.text,
            getRelativeImportPath(targetFile.fileName, ref.getSourceFile().fileName));
      } else {
        nodesToCopy.add(closestExportable);
      }
    }
  }
}

/**
 * Finds all the nodes referenced within the root node in the same file.
 * @param rootNode Node from which to start looking for references.
 * @param nodeLookup Map used to look up nodes based on their positions in a file.
 * @param languageService
 */
function findAllSameFileReferences(
    rootNode: ts.Node, nodeLookup: NodeLookup, languageService: ts.LanguageService): Set<ts.Node> {
  const results = new Set<ts.Node>();
  const excludeStart = rootNode.getStart();
  const excludeEnd = rootNode.getEnd();

  (function walk(node) {
    if (!isReferenceIdentifier(node)) {
      node.forEachChild(walk);
      return;
    }

    const refs =
        referencesToNodeWithinSameFile(node, nodeLookup, excludeStart, excludeEnd, languageService);

    if (refs === null) {
      return;
    }

    for (const ref of refs) {
      if (results.has(ref)) {
        continue;
      }
      const closestTopLevel = closestNode(ref, isTopLevelStatement);
      results.add(ref);

      // Keep searching, starting from the closest top-level node. We skip import declarations,
      // because we already know about them and they may put the search into an infinite loop.
      if (closestTopLevel && !ts.isImportDeclaration(closestTopLevel) &&
          isOutsideRange(
              excludeStart, excludeEnd, closestTopLevel.getStart(), closestTopLevel.getEnd())) {
        walk(closestTopLevel);
      }
    }
  })(rootNode);

  return results;
}

/**
 * Finds all the nodes referring to a specific node within the same file.
 * @param node Node whose references we're lookip for.
 * @param nodeLookup Map used to look up nodes based on their positions in a file.
 * @param excludeStart Start of a range that should be excluded from the results.
 * @param excludeEnd End of a range that should be excluded from the results.
 * @param languageService
 */
function referencesToNodeWithinSameFile(
    node: ts.Identifier, nodeLookup: NodeLookup, excludeStart: number, excludeEnd: number,
    languageService: ts.LanguageService): Set<ts.Node>|null {
  const sourceFile = node.getSourceFile();
  const fileName = sourceFile.fileName;
  const highlights = languageService.getDocumentHighlights(fileName, node.getStart(), [fileName]);

  if (highlights) {
    const offsets: [start: number, end: number][] = [];

    for (const file of highlights) {
      // We are pretty much guaranteed to only have one match from the current file since it is
      // the only one being passed in `getDocumentHighlight`, but we check here just in case.
      if (file.fileName === fileName) {
        for (const {textSpan: {start, length}, kind} of file.highlightSpans) {
          const end = start + length;
          if (kind !== ts.HighlightSpanKind.none &&
              isOutsideRange(excludeStart, excludeEnd, start, end)) {
            offsets.push([start, end]);
          }
        }
      }
    }

    if (offsets.length > 0) {
      const nodes = offsetsToNodes(nodeLookup, offsets, new Set());

      if (nodes.size > 0) {
        return nodes;
      }
    }
  }

  return null;
}

/**
 * Transforms a node so that any dynamic imports with relative file paths it contains are remapped
 * as if they were specified in a different file. If no transformations have occurred, the original
 * node will be returned.
 * @param targetFileName File name to which to remap the imports.
 * @param rootNode Node being transformed.
 */
function remapDynamicImports<T extends ts.Node>(targetFileName: string, rootNode: T): T {
  let hasChanged = false;
  const transformer: ts.TransformerFactory<T> = context => {
    return sourceFile => ts.visitNode(sourceFile, function walk(node: ts.Node): ts.Node {
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword &&
          node.arguments.length > 0 && ts.isStringLiteralLike(node.arguments[0]) &&
          node.arguments[0].text.startsWith('.')) {
        hasChanged = true;
        return context.factory.updateCallExpression(node, node.expression, node.typeArguments, [
          context.factory.createStringLiteral(
              remapRelativeImport(targetFileName, node.arguments[0])),
          ...node.arguments.slice(1)
        ]);
      }
      return ts.visitEachChild(node, walk, context);
    });
  };

  const result = ts.transform(rootNode, [transformer]).transformed[0];
  return hasChanged ? result : rootNode;
}

/**
 * Checks whether a node is a statement at the top level of a file.
 * @param node Node to be checked.
 */
function isTopLevelStatement(node: ts.Node): node is ts.Node {
  return node.parent != null && ts.isSourceFile(node.parent);
}

/**
 * Asserts that a node is an identifier that might be referring to a symbol. This excludes
 * identifiers of named nodes like property assignments.
 * @param node Node to be checked.
 */
function isReferenceIdentifier(node: ts.Node): node is ts.Identifier {
  return ts.isIdentifier(node) &&
      (!ts.isPropertyAssignment(node.parent) && !ts.isParameter(node.parent) ||
       node.parent.name !== node);
}

/**
 * Checks whether a range is completely outside of another range.
 * @param excludeStart Start of the exclusion range.
 * @param excludeEnd End of the exclusion range.
 * @param start Start of the range that is being checked.
 * @param end End of the range that is being checked.
 */
function isOutsideRange(
    excludeStart: number, excludeEnd: number, start: number, end: number): boolean {
  return (start < excludeStart && end < excludeStart) || start > excludeEnd;
}

/**
 * Remaps the specifier of a relative import from its original location to a new one.
 * @param targetFileName Name of the file that the specifier will be moved to.
 * @param specifier Specifier whose path is being remapped.
 */
function remapRelativeImport(targetFileName: string, specifier: ts.StringLiteralLike): string {
  return getRelativeImportPath(
      targetFileName, join(dirname(specifier.getSourceFile().fileName), specifier.text));
}

/**
 * Whether a node is exported.
 * @param node Node to be checked.
 */
function isExported(node: ts.Node): node is ts.Node {
  return ts.canHaveModifiers(node) && node.modifiers ?
      node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) :
      false;
}

/**
 * Gets the closest node that matches a predicate, including the node that the search started from.
 * @param node Node from which to start the search.
 * @param predicate Predicate that the result needs to pass.
 */
function closestOrSelf<T extends ts.Node>(node: ts.Node, predicate: (n: ts.Node) => n is T): T|
    null {
  return predicate(node) ? node : closestNode(node, predicate);
}

/**
 * Asserts that a node is an exportable declaration, which means that it can either be exported or
 * it can be safely copied into another file.
 * @param node Node to be checked.
 */
function isExportableDeclaration(node: ts.Node): node is ts.EnumDeclaration|ts.ClassDeclaration|
    ts.FunctionDeclaration|ts.InterfaceDeclaration|ts.TypeAliasDeclaration {
  return ts.isEnumDeclaration(node) || ts.isClassDeclaration(node) ||
      ts.isFunctionDeclaration(node) || ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node);
}

/**
 * Checks whether a node is referring to a specific class declaration.
 * @param node Node that is being checked.
 * @param className Name of the class that the node might be referring to.
 * @param moduleName Name of the node module that should contain the class.
 * @param typeChecker
 */
function isClassReferenceInModule(
    node: ts.Node, className: string, moduleName: string, typeChecker: ts.TypeChecker): boolean {
  const symbol = typeChecker.getTypeAtLocation(node).getSymbol();

  return !!symbol?.declarations?.some(decl => {
    const closestClass = closestOrSelf(decl, ts.isClassDeclaration);
    return closestClass && closestClass.name && ts.isIdentifier(closestClass.name) &&
        closestClass.name.text === className &&
        closestClass.getSourceFile().fileName.includes(moduleName);
  });
}

/**
 * Gets the index after the last import in a file. Can be used to insert new code into the file.
 * @param sourceFile File in which to search for imports.
 */
function getLastImportEnd(sourceFile: ts.SourceFile): number {
  let index = 0;

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      index = Math.max(index, statement.getEnd());
    } else {
      break;
    }
  }

  return index;
}
