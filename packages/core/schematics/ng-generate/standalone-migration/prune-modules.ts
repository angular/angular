/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscProgram} from '@angular/compiler-cli';
import ts from 'typescript';

import {ChangeTracker, ImportRemapper} from '../../utils/change_tracker';
import {getAngularDecorators, NgDecorator} from '../../utils/ng_decorators';
import {closestNode} from '../../utils/typescript/nodes';

import {findClassDeclaration, findLiteralProperty, getNodeLookup, offsetsToNodes, ReferenceResolver, UniqueItemTracker} from './util';

/** Keeps track of the places from which we need to remove AST nodes. */
interface RemovalLocations {
  arrays: UniqueItemTracker<ts.ArrayLiteralExpression, ts.Node>;
  imports: UniqueItemTracker<ts.NamedImports, ts.Node>;
  exports: UniqueItemTracker<ts.NamedExports, ts.Node>;
  unknown: Set<ts.Node>;
}

export function pruneNgModules(
    program: NgtscProgram, host: ts.CompilerHost, basePath: string, rootFileNames: string[],
    sourceFiles: ts.SourceFile[], printer: ts.Printer, importRemapper?: ImportRemapper,
    referenceLookupExcludedFiles?: RegExp) {
  const filesToRemove = new Set<ts.SourceFile>();
  const tracker = new ChangeTracker(printer, importRemapper);
  const tsProgram = program.getTsProgram();
  const typeChecker = tsProgram.getTypeChecker();
  const referenceResolver =
      new ReferenceResolver(program, host, rootFileNames, basePath, referenceLookupExcludedFiles);
  const removalLocations: RemovalLocations = {
    arrays: new UniqueItemTracker<ts.ArrayLiteralExpression, ts.Node>(),
    imports: new UniqueItemTracker<ts.NamedImports, ts.Node>(),
    exports: new UniqueItemTracker<ts.NamedExports, ts.Node>(),
    unknown: new Set<ts.Node>()
  };
  const classesToRemove = new Set<ts.ClassDeclaration>();
  const barrelExports = new UniqueItemTracker<ts.SourceFile, ts.ExportDeclaration>();
  const nodesToRemove = new Set<ts.Node>();

  sourceFiles.forEach(function walk(node: ts.Node) {
    if (ts.isClassDeclaration(node) && canRemoveClass(node, typeChecker)) {
      collectRemovalLocations(node, removalLocations, referenceResolver, program);
      classesToRemove.add(node);
    } else if (
        ts.isExportDeclaration(node) && !node.exportClause && node.moduleSpecifier &&
        ts.isStringLiteralLike(node.moduleSpecifier) && node.moduleSpecifier.text.startsWith('.')) {
      const exportedSourceFile =
          typeChecker.getSymbolAtLocation(node.moduleSpecifier)?.valueDeclaration?.getSourceFile();

      if (exportedSourceFile) {
        barrelExports.track(exportedSourceFile, node);
      }
    }
    node.forEachChild(walk);
  });

  // We collect all the places where we need to remove references first before generating the
  // removal instructions since we may have to remove multiple references from one node.
  removeArrayReferences(removalLocations.arrays, tracker);
  removeImportReferences(removalLocations.imports, tracker);
  removeExportReferences(removalLocations.exports, tracker);
  addRemovalTodos(removalLocations.unknown, tracker);

  // Collect all the nodes to be removed before determining which files to delete since we need
  // to know it ahead of time when deleting barrel files that export other barrel files.
  (function trackNodesToRemove(nodes: Set<ts.Node>) {
    for (const node of nodes) {
      const sourceFile = node.getSourceFile();

      if (!filesToRemove.has(sourceFile) && canRemoveFile(sourceFile, nodes)) {
        const barrelExportsForFile = barrelExports.get(sourceFile);
        nodesToRemove.add(node);
        filesToRemove.add(sourceFile);
        barrelExportsForFile && trackNodesToRemove(barrelExportsForFile);
      } else {
        nodesToRemove.add(node);
      }
    }
  })(classesToRemove);

  for (const node of nodesToRemove) {
    const sourceFile = node.getSourceFile();

    if (!filesToRemove.has(sourceFile) && canRemoveFile(sourceFile, nodesToRemove)) {
      filesToRemove.add(sourceFile);
    } else {
      tracker.removeNode(node);
    }
  }

  return {pendingChanges: tracker.recordChanges(), filesToRemove};
}

/**
 * Collects all the nodes that a module needs to be removed from.
 * @param ngModule Module being removed.
 * @param removalLocations
 * @param referenceResolver
 * @param program
 */
function collectRemovalLocations(
    ngModule: ts.ClassDeclaration, removalLocations: RemovalLocations,
    referenceResolver: ReferenceResolver, program: NgtscProgram) {
  const refsByFile = referenceResolver.findReferencesInProject(ngModule.name!);
  const tsProgram = program.getTsProgram();
  const nodes = new Set<ts.Node>();

  for (const [fileName, refs] of refsByFile) {
    const sourceFile = tsProgram.getSourceFile(fileName);

    if (sourceFile) {
      offsetsToNodes(getNodeLookup(sourceFile), refs, nodes);
    }
  }

  for (const node of nodes) {
    const closestArray = closestNode(node, ts.isArrayLiteralExpression);
    if (closestArray) {
      removalLocations.arrays.track(closestArray, node);
      continue;
    }

    const closestImport = closestNode(node, ts.isNamedImports);
    if (closestImport) {
      removalLocations.imports.track(closestImport, node);
      continue;
    }

    const closestExport = closestNode(node, ts.isNamedExports);
    if (closestExport) {
      removalLocations.exports.track(closestExport, node);
      continue;
    }

    removalLocations.unknown.add(node);
  }
}

/**
 * Removes all tracked array references.
 * @param locations Locations from which to remove the references.
 * @param tracker Tracker in which to register the changes.
 */
function removeArrayReferences(
    locations: UniqueItemTracker<ts.ArrayLiteralExpression, ts.Node>,
    tracker: ChangeTracker): void {
  for (const [array, toRemove] of locations.getEntries()) {
    const newElements = filterRemovedElements(array.elements, toRemove);
    tracker.replaceNode(
        array,
        ts.factory.updateArrayLiteralExpression(
            array, ts.factory.createNodeArray(newElements, array.elements.hasTrailingComma)));
  }
}

/**
 * Removes all tracked import references.
 * @param locations Locations from which to remove the references.
 * @param tracker Tracker in which to register the changes.
 */
function removeImportReferences(
    locations: UniqueItemTracker<ts.NamedImports, ts.Node>, tracker: ChangeTracker) {
  for (const [namedImports, toRemove] of locations.getEntries()) {
    const newElements = filterRemovedElements(namedImports.elements, toRemove);

    // If no imports are left, we can try to drop the entire import.
    if (newElements.length === 0) {
      const importClause = closestNode(namedImports, ts.isImportClause);

      // If the import clause has a name we can only drop then named imports.
      // e.g. `import Foo, {ModuleToRemove} from './foo';` becomes `import Foo from './foo';`.
      if (importClause && importClause.name) {
        tracker.replaceNode(
            importClause,
            ts.factory.updateImportClause(
                importClause, importClause.isTypeOnly, importClause.name, undefined));
      } else {
        // Otherwise we can drop the entire declaration.
        const declaration = closestNode(namedImports, ts.isImportDeclaration);

        if (declaration) {
          tracker.removeNode(declaration);
        }
      }
    } else {
      // Otherwise we just drop the imported symbols and keep the declaration intact.
      tracker.replaceNode(namedImports, ts.factory.updateNamedImports(namedImports, newElements));
    }
  }
}

/**
 * Removes all tracked export references.
 * @param locations Locations from which to remove the references.
 * @param tracker Tracker in which to register the changes.
 */
function removeExportReferences(
    locations: UniqueItemTracker<ts.NamedExports, ts.Node>, tracker: ChangeTracker) {
  for (const [namedExports, toRemove] of locations.getEntries()) {
    const newElements = filterRemovedElements(namedExports.elements, toRemove);

    // If no exports are left, we can drop the entire declaration.
    if (newElements.length === 0) {
      const declaration = closestNode(namedExports, ts.isExportDeclaration);

      if (declaration) {
        tracker.removeNode(declaration);
      }
    } else {
      // Otherwise we just drop the exported symbols and keep the declaration intact.
      tracker.replaceNode(namedExports, ts.factory.updateNamedExports(namedExports, newElements));
    }
  }
}

/**
 * Determines whether an `@NgModule` class is safe to remove. A module is safe to remove if:
 * 1. It has no `declarations`.
 * 2. It has no `providers`.
 * 3. It has no `bootstrap` components.
 * 4. It has no `ModuleWithProviders` in its `imports`.
 * 5. It has no class members. Empty construstors are ignored.
 * @param node Class that is being checked.
 * @param typeChecker
 */
function canRemoveClass(node: ts.ClassDeclaration, typeChecker: ts.TypeChecker): boolean {
  const decorator = findNgModuleDecorator(node, typeChecker)?.node;

  // We can't remove a declaration if it's not a valid `NgModule`.
  if (!decorator || !ts.isCallExpression(decorator.expression)) {
    return false;
  }

  // Unsupported case, e.g. `@NgModule(SOME_VALUE)`.
  if (decorator.expression.arguments.length > 0 &&
      !ts.isObjectLiteralExpression(decorator.expression.arguments[0])) {
    return false;
  }

  // We can't remove modules that have class members. We make an exception for an
  // empty constructor which may have been generated by a tool and forgotten.
  if (node.members.length > 0 && node.members.some(member => !isEmptyConstructor(member))) {
    return false;
  }

  // An empty `NgModule` call can be removed.
  if (decorator.expression.arguments.length === 0) {
    return true;
  }

  const literal = decorator.expression.arguments[0] as ts.ObjectLiteralExpression;
  const imports = findLiteralProperty(literal, 'imports');

  if (imports && isNonEmptyNgModuleProperty(imports)) {
    // We can't remove the class if at least one import isn't identifier, because it may be a
    // `ModuleWithProviders` which is the equivalent of having something in the `providers` array.
    for (const dep of imports.initializer.elements) {
      if (!ts.isIdentifier(dep)) {
        return false;
      }

      const depDeclaration = findClassDeclaration(dep, typeChecker);
      const depNgModule =
          depDeclaration ? findNgModuleDecorator(depDeclaration, typeChecker) : null;

      // If any of the dependencies of the class is an `NgModule` that can't be removed, the class
      // itself can't be removed either, because it may be part of a transitive dependency chain.
      if (depDeclaration !== null && depNgModule !== null &&
          !canRemoveClass(depDeclaration, typeChecker)) {
        return false;
      }
    }
  }

  // We can't remove classes that have any `declarations`, `providers` or `bootstrap` elements.
  // Also err on the side of caution and don't remove modules where any of the aforementioned
  // properties aren't initialized to an array literal.
  for (const prop of literal.properties) {
    if (isNonEmptyNgModuleProperty(prop) &&
        (prop.name.text === 'declarations' || prop.name.text === 'providers' ||
         prop.name.text === 'bootstrap')) {
      return false;
    }
  }

  return true;
}

/**
 * Checks whether a node is a non-empty property from an NgModule's metadata. This is defined as a
 * property assignment with a static name, initialized to an array literal with more than one
 * element.
 * @param node Node to be checked.
 */
function isNonEmptyNgModuleProperty(node: ts.Node): node is ts.PropertyAssignment&
    {name: ts.Identifier, initializer: ts.ArrayLiteralExpression} {
  return ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) &&
      ts.isArrayLiteralExpression(node.initializer) && node.initializer.elements.length > 0;
}

/**
 * Determines if a file is safe to delete. A file is safe to delete if all it contains are
 * import statements, class declarations that are about to be deleted and non-exported code.
 * @param sourceFile File that is being checked.
 * @param nodesToBeRemoved Nodes that are being removed as a part of the migration.
 */
function canRemoveFile(sourceFile: ts.SourceFile, nodesToBeRemoved: Set<ts.Node>) {
  for (const node of sourceFile.statements) {
    if (ts.isImportDeclaration(node) || nodesToBeRemoved.has(node)) {
      continue;
    }

    if (ts.isExportDeclaration(node) ||
        (ts.canHaveModifiers(node) &&
         ts.getModifiers(node)?.some(m => m.kind === ts.SyntaxKind.ExportKeyword))) {
      return false;
    }
  }

  return true;
}

/**
 * Gets whether an AST node contains another AST node.
 * @param parent Parent node that may contain the child.
 * @param child Child node that is being checked.
 */
function contains(parent: ts.Node, child: ts.Node): boolean {
  return parent === child ||
      (parent.getSourceFile().fileName === child.getSourceFile().fileName &&
       child.getStart() >= parent.getStart() && child.getStart() <= parent.getEnd());
}

/**
 * Removes AST nodes from a node array.
 * @param elements Array from which to remove the nodes.
 * @param toRemove Nodes that should be removed.
 */
function filterRemovedElements<T extends ts.Node>(
    elements: ts.NodeArray<T>, toRemove: Set<ts.Node>): T[] {
  return elements.filter(el => {
    for (const node of toRemove) {
      // Check that the element contains the node, despite knowing with relative certainty that it
      // does, because this allows us to unwrap some nodes. E.g. if we have `[((toRemove))]`, we
      // want to remove the entire parenthesized expression, rather than just `toRemove`.
      if (contains(el, node)) {
        return false;
      }
    }
    return true;
  });
}

/** Returns whether a node as an empty constructor. */
function isEmptyConstructor(node: ts.Node): boolean {
  return ts.isConstructorDeclaration(node) && node.parameters.length === 0 &&
      (node.body == null || node.body.statements.length === 0);
}

/**
 * Adds TODO comments to nodes that couldn't be removed manually.
 * @param nodes Nodes to which to add the TODO.
 * @param tracker Tracker in which to register the changes.
 */
function addRemovalTodos(nodes: Set<ts.Node>, tracker: ChangeTracker) {
  for (const node of nodes) {
    // Note: the comment is inserted using string manipulation, instead of going through the AST,
    // because this way we preserve more of the app's original formatting.
    // Note: in theory this can duplicate comments if the module pruning runs multiple times on
    // the same node. In practice it is unlikely, because the second time the node won't be picked
    // up by the language service as a reference, because the class won't exist anymore.
    tracker.insertText(
        node.getSourceFile(), node.getFullStart(),
        ` /* TODO(standalone-migration): clean up removed NgModule reference manually. */ `);
  }
}

/** Finds the `NgModule` decorator in a class, if it exists. */
function findNgModuleDecorator(node: ts.ClassDeclaration, typeChecker: ts.TypeChecker): NgDecorator|
    null {
  const decorators = getAngularDecorators(typeChecker, ts.getDecorators(node) || []);
  return decorators.find(decorator => decorator.name === 'NgModule') || null;
}
