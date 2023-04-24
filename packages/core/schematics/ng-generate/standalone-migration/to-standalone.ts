/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscProgram} from '@angular/compiler-cli';
import {PotentialImport, PotentialImportKind, PotentialImportMode, Reference, TemplateTypeChecker} from '@angular/compiler-cli/private/migrations';
import ts from 'typescript';

import {ChangesByFile, ChangeTracker, ImportRemapper} from '../../utils/change_tracker';
import {getAngularDecorators, NgDecorator} from '../../utils/ng_decorators';
import {getImportSpecifier} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';
import {isReferenceToImport} from '../../utils/typescript/symbol';

import {findClassDeclaration, findLiteralProperty, isClassReferenceInAngularModule, NamedClassDeclaration} from './util';

/**
 * Function that can be used to prcess the dependencies that
 * are going to be added to the imports of a component.
 */
export type ComponentImportsRemapper =
    (imports: PotentialImport[], component: ts.ClassDeclaration) => PotentialImport[];

/**
 * Converts all declarations in the specified files to standalone.
 * @param sourceFiles Files that should be migrated.
 * @param program
 * @param printer
 * @param fileImportRemapper Optional function that can be used to remap file-level imports.
 * @param componentImportRemapper Optional function that can be used to remap component-level
 * imports.
 */
export function toStandalone(
    sourceFiles: ts.SourceFile[], program: NgtscProgram, printer: ts.Printer,
    fileImportRemapper?: ImportRemapper,
    componentImportRemapper?: ComponentImportsRemapper): ChangesByFile {
  const templateTypeChecker = program.compiler.getTemplateTypeChecker();
  const typeChecker = program.getTsProgram().getTypeChecker();
  const modulesToMigrate = new Set<ts.ClassDeclaration>();
  const testObjectsToMigrate = new Set<ts.ObjectLiteralExpression>();
  const declarations = new Set<ts.ClassDeclaration>();
  const tracker = new ChangeTracker(printer, fileImportRemapper);

  for (const sourceFile of sourceFiles) {
    const modules = findNgModuleClassesToMigrate(sourceFile, typeChecker);
    const testObjects = findTestObjectsToMigrate(sourceFile, typeChecker);

    for (const module of modules) {
      const allModuleDeclarations = extractDeclarationsFromModule(module, templateTypeChecker);
      const unbootstrappedDeclarations = filterNonBootstrappedDeclarations(
          allModuleDeclarations, module, templateTypeChecker, typeChecker);

      if (unbootstrappedDeclarations.length > 0) {
        modulesToMigrate.add(module);
        unbootstrappedDeclarations.forEach(decl => declarations.add(decl));
      }
    }

    testObjects.forEach(obj => testObjectsToMigrate.add(obj));
  }

  for (const declaration of declarations) {
    convertNgModuleDeclarationToStandalone(
        declaration, declarations, tracker, templateTypeChecker, componentImportRemapper);
  }

  for (const node of modulesToMigrate) {
    migrateNgModuleClass(node, declarations, tracker, typeChecker, templateTypeChecker);
  }

  migrateTestDeclarations(
      testObjectsToMigrate, declarations, tracker, templateTypeChecker, typeChecker);
  return tracker.recordChanges();
}

/**
 * Converts a single declaration defined through an NgModule to standalone.
 * @param decl Declaration being converted.
 * @param tracker Tracker used to track the file changes.
 * @param allDeclarations All the declarations that are being converted as a part of this migration.
 * @param typeChecker
 * @param importRemapper
 */
export function convertNgModuleDeclarationToStandalone(
    decl: ts.ClassDeclaration, allDeclarations: Set<ts.ClassDeclaration>, tracker: ChangeTracker,
    typeChecker: TemplateTypeChecker, importRemapper?: ComponentImportsRemapper): void {
  const directiveMeta = typeChecker.getDirectiveMetadata(decl);

  if (directiveMeta && directiveMeta.decorator && !directiveMeta.isStandalone) {
    let decorator = addStandaloneToDecorator(directiveMeta.decorator);

    if (directiveMeta.isComponent) {
      const importsToAdd = getComponentImportExpressions(
          decl, allDeclarations, tracker, typeChecker, importRemapper);

      if (importsToAdd.length > 0) {
        const hasTrailingComma = importsToAdd.length > 2 &&
            !!extractMetadataLiteral(directiveMeta.decorator)?.properties.hasTrailingComma;
        decorator = addPropertyToAngularDecorator(
            decorator,
            ts.factory.createPropertyAssignment(
                'imports',
                ts.factory.createArrayLiteralExpression(
                    // Create a multi-line array when it has a trailing comma.
                    ts.factory.createNodeArray(importsToAdd, hasTrailingComma), hasTrailingComma)));
      }
    }

    tracker.replaceNode(directiveMeta.decorator, decorator);
  } else {
    const pipeMeta = typeChecker.getPipeMetadata(decl);

    if (pipeMeta && pipeMeta.decorator && !pipeMeta.isStandalone) {
      tracker.replaceNode(pipeMeta.decorator, addStandaloneToDecorator(pipeMeta.decorator));
    }
  }
}

/**
 * Gets the expressions that should be added to a component's
 * `imports` array based on its template dependencies.
 * @param decl Component class declaration.
 * @param allDeclarations All the declarations that are being converted as a part of this migration.
 * @param tracker
 * @param typeChecker
 * @param importRemapper
 */
function getComponentImportExpressions(
    decl: ts.ClassDeclaration, allDeclarations: Set<ts.ClassDeclaration>, tracker: ChangeTracker,
    typeChecker: TemplateTypeChecker, importRemapper?: ComponentImportsRemapper): ts.Expression[] {
  const templateDependencies = findTemplateDependencies(decl, typeChecker);
  const usedDependenciesInMigration =
      new Set(templateDependencies.filter(dep => allDeclarations.has(dep.node)));
  const imports: ts.Expression[] = [];
  const seenImports = new Set<string>();
  const resolvedDependencies: PotentialImport[] = [];

  for (const dep of templateDependencies) {
    const importLocation = findImportLocation(
        dep as Reference<NamedClassDeclaration>, decl,
        usedDependenciesInMigration.has(dep) ? PotentialImportMode.ForceDirect :
                                               PotentialImportMode.Normal,
        typeChecker);

    if (importLocation && !seenImports.has(importLocation.symbolName)) {
      seenImports.add(importLocation.symbolName);
      resolvedDependencies.push(importLocation);
    }
  }

  const processedDependencies =
      importRemapper ? importRemapper(resolvedDependencies, decl) : resolvedDependencies;

  for (const importLocation of processedDependencies) {
    if (importLocation.moduleSpecifier) {
      const identifier = tracker.addImport(
          decl.getSourceFile(), importLocation.symbolName, importLocation.moduleSpecifier);
      imports.push(identifier);
    } else {
      const identifier = ts.factory.createIdentifier(importLocation.symbolName);

      if (importLocation.isForwardReference) {
        const forwardRefExpression =
            tracker.addImport(decl.getSourceFile(), 'forwardRef', '@angular/core');
        const arrowFunction = ts.factory.createArrowFunction(
            undefined, undefined, [], undefined, undefined, identifier);
        imports.push(
            ts.factory.createCallExpression(forwardRefExpression, undefined, [arrowFunction]));
      } else {
        imports.push(identifier);
      }
    }
  }

  return imports;
}

/**
 * Moves all of the declarations of a class decorated with `@NgModule` to its imports.
 * @param node Class being migrated.
 * @param allDeclarations All the declarations that are being converted as a part of this migration.
 * @param tracker
 * @param typeChecker
 * @param templateTypeChecker
 */
function migrateNgModuleClass(
    node: ts.ClassDeclaration, allDeclarations: Set<ts.ClassDeclaration>, tracker: ChangeTracker,
    typeChecker: ts.TypeChecker, templateTypeChecker: TemplateTypeChecker) {
  const decorator = templateTypeChecker.getNgModuleMetadata(node)?.decorator;
  const metadata = decorator ? extractMetadataLiteral(decorator) : null;

  if (metadata) {
    moveDeclarationsToImports(metadata, allDeclarations, typeChecker, templateTypeChecker, tracker);
  }
}

/**
 * Moves all the symbol references from the `declarations` array to the `imports`
 * array of an `NgModule` class and removes the `declarations`.
 * @param literal Object literal used to configure the module that should be migrated.
 * @param allDeclarations All the declarations that are being converted as a part of this migration.
 * @param typeChecker
 * @param tracker
 */
function moveDeclarationsToImports(
    literal: ts.ObjectLiteralExpression, allDeclarations: Set<ts.ClassDeclaration>,
    typeChecker: ts.TypeChecker, templateTypeChecker: TemplateTypeChecker,
    tracker: ChangeTracker): void {
  const declarationsProp = findLiteralProperty(literal, 'declarations');

  if (!declarationsProp) {
    return;
  }

  const declarationsToPreserve: ts.Expression[] = [];
  const declarationsToCopy: ts.Expression[] = [];
  const properties: ts.ObjectLiteralElementLike[] = [];
  const importsProp = findLiteralProperty(literal, 'imports');
  const hasAnyArrayTrailingComma = literal.properties.some(
      prop => ts.isPropertyAssignment(prop) && ts.isArrayLiteralExpression(prop.initializer) &&
          prop.initializer.elements.hasTrailingComma);

  // Separate the declarations that we want to keep and ones we need to copy into the `imports`.
  if (ts.isPropertyAssignment(declarationsProp)) {
    // If the declarations are an array, we can analyze it to
    // find any classes from the current migration.
    if (ts.isArrayLiteralExpression(declarationsProp.initializer)) {
      for (const el of declarationsProp.initializer.elements) {
        if (ts.isIdentifier(el)) {
          const correspondingClass = findClassDeclaration(el, typeChecker);

          if (!correspondingClass ||
              // Check whether the declaration is either standalone already or is being converted
              // in this migration. We need to check if it's standalone already, in order to correct
              // some cases where the main app and the test files are being migrated in separate
              // programs.
              isStandaloneDeclaration(correspondingClass, allDeclarations, templateTypeChecker)) {
            declarationsToCopy.push(el);
          } else {
            declarationsToPreserve.push(el);
          }
        } else {
          declarationsToCopy.push(el);
        }
      }
    } else {
      // Otherwise create a spread that will be copied into the `imports`.
      declarationsToCopy.push(ts.factory.createSpreadElement(declarationsProp.initializer));
    }
  }

  // If there are no `imports`, create them with the declarations we want to copy.
  if (!importsProp && declarationsToCopy.length > 0) {
    properties.push(ts.factory.createPropertyAssignment(
        'imports',
        ts.factory.createArrayLiteralExpression(ts.factory.createNodeArray(
            declarationsToCopy, hasAnyArrayTrailingComma && declarationsToCopy.length > 2))));
  }

  for (const prop of literal.properties) {
    if (!isNamedPropertyAssignment(prop)) {
      properties.push(prop);
      continue;
    }

    // If we have declarations to preserve, update the existing property, otherwise drop it.
    if (prop === declarationsProp) {
      if (declarationsToPreserve.length > 0) {
        const hasTrailingComma = ts.isArrayLiteralExpression(prop.initializer) ?
            prop.initializer.elements.hasTrailingComma :
            hasAnyArrayTrailingComma;
        properties.push(ts.factory.updatePropertyAssignment(
            prop, prop.name,
            ts.factory.createArrayLiteralExpression(ts.factory.createNodeArray(
                declarationsToPreserve, hasTrailingComma && declarationsToPreserve.length > 2))));
      }
      continue;
    }

    // If we have an `imports` array and declarations
    // that should be copied, we merge the two arrays.
    if (prop === importsProp && declarationsToCopy.length > 0) {
      let initializer: ts.Expression;

      if (ts.isArrayLiteralExpression(prop.initializer)) {
        initializer = ts.factory.updateArrayLiteralExpression(
            prop.initializer,
            ts.factory.createNodeArray(
                [...prop.initializer.elements, ...declarationsToCopy],
                prop.initializer.elements.hasTrailingComma));
      } else {
        initializer = ts.factory.createArrayLiteralExpression(ts.factory.createNodeArray(
            [ts.factory.createSpreadElement(prop.initializer), ...declarationsToCopy],
            // Expect the declarations to be greater than 1 since
            // we have the pre-existing initializer already.
            hasAnyArrayTrailingComma && declarationsToCopy.length > 1));
      }

      properties.push(ts.factory.updatePropertyAssignment(prop, prop.name, initializer));
      continue;
    }

    // Retain any remaining properties.
    properties.push(prop);
  }

  tracker.replaceNode(
      literal,
      ts.factory.updateObjectLiteralExpression(
          literal, ts.factory.createNodeArray(properties, literal.properties.hasTrailingComma)),
      ts.EmitHint.Expression);
}

/** Adds `standalone: true` to a decorator node. */
function addStandaloneToDecorator(node: ts.Decorator): ts.Decorator {
  return addPropertyToAngularDecorator(
      node,
      ts.factory.createPropertyAssignment(
          'standalone', ts.factory.createToken(ts.SyntaxKind.TrueKeyword)));
}

/**
 * Adds a property to an Angular decorator node.
 * @param node Decorator to which to add the property.
 * @param property Property to add.
 */
function addPropertyToAngularDecorator(
    node: ts.Decorator, property: ts.PropertyAssignment): ts.Decorator {
  // Invalid decorator.
  if (!ts.isCallExpression(node.expression) || node.expression.arguments.length > 1) {
    return node;
  }

  let literalProperties: ts.ObjectLiteralElementLike[];
  let hasTrailingComma = false;

  if (node.expression.arguments.length === 0) {
    literalProperties = [property];
  } else if (ts.isObjectLiteralExpression(node.expression.arguments[0])) {
    hasTrailingComma = node.expression.arguments[0].properties.hasTrailingComma;
    literalProperties = [...node.expression.arguments[0].properties, property];
  } else {
    // Unsupported case (e.g. `@Component(SOME_CONST)`). Return the original node.
    return node;
  }

  // Use `createDecorator` instead of `updateDecorator`, because
  // the latter ends up duplicating the node's leading comment.
  return ts.factory.createDecorator(ts.factory.createCallExpression(
      node.expression.expression, node.expression.typeArguments,
      [ts.factory.createObjectLiteralExpression(
          ts.factory.createNodeArray(literalProperties, hasTrailingComma),
          literalProperties.length > 1)]));
}

/** Checks if a node is a `PropertyAssignment` with a name. */
function isNamedPropertyAssignment(node: ts.Node): node is ts.PropertyAssignment&
    {name: ts.Identifier} {
  return ts.isPropertyAssignment(node) && node.name && ts.isIdentifier(node.name);
}

/**
 * Finds the import from which to bring in a template dependency of a component.
 * @param target Dependency that we're searching for.
 * @param inComponent Component in which the dependency is used.
 * @param importMode Mode in which to resolve the import target.
 * @param typeChecker
 */
function findImportLocation(
    target: Reference<NamedClassDeclaration>, inComponent: ts.ClassDeclaration,
    importMode: PotentialImportMode, typeChecker: TemplateTypeChecker): PotentialImport|null {
  const importLocations = typeChecker.getPotentialImportsFor(target, inComponent, importMode);
  let firstSameFileImport: PotentialImport|null = null;
  let firstModuleImport: PotentialImport|null = null;

  for (const location of importLocations) {
    // Prefer a standalone import, if we can find one.
    // Otherwise fall back to the first module-based import.
    if (location.kind === PotentialImportKind.Standalone) {
      return location;
    }
    if (!location.moduleSpecifier && !firstSameFileImport) {
      firstSameFileImport = location;
    }
    if (location.kind === PotentialImportKind.NgModule && !firstModuleImport &&
        // ɵ is used for some internal Angular modules that we want to skip over.
        !location.symbolName.startsWith('ɵ')) {
      firstModuleImport = location;
    }
  }

  return firstSameFileImport || firstModuleImport || importLocations[0] || null;
}

/**
 * Checks whether a node is an `NgModule` metadata element with at least one element.
 * E.g. `declarations: [Foo]` or `declarations: SOME_VAR` would match this description,
 * but not `declarations: []`.
 */
function hasNgModuleMetadataElements(node: ts.Node): node is ts.PropertyAssignment&
    {initializer: ts.ArrayLiteralExpression} {
  return ts.isPropertyAssignment(node) &&
      (!ts.isArrayLiteralExpression(node.initializer) || node.initializer.elements.length > 0);
}

/** Finds all modules whose declarations can be migrated. */
function findNgModuleClassesToMigrate(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
  const modules: ts.ClassDeclaration[] = [];

  if (getImportSpecifier(sourceFile, '@angular/core', 'NgModule')) {
    sourceFile.forEachChild(function walk(node) {
      if (ts.isClassDeclaration(node)) {
        const decorator = getAngularDecorators(typeChecker, ts.getDecorators(node) || [])
                              .find(current => current.name === 'NgModule');
        const metadata = decorator ? extractMetadataLiteral(decorator.node) : null;

        if (metadata) {
          const declarations = findLiteralProperty(metadata, 'declarations');

          if (declarations != null && hasNgModuleMetadataElements(declarations)) {
            modules.push(node);
          }
        }
      }

      node.forEachChild(walk);
    });
  }

  return modules;
}

/** Finds all testing object literals that need to be migrated. */
export function findTestObjectsToMigrate(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
  const testObjects: ts.ObjectLiteralExpression[] = [];
  const testBedImport = getImportSpecifier(sourceFile, '@angular/core/testing', 'TestBed');
  const catalystImport = getImportSpecifier(sourceFile, /testing\/catalyst$/, 'setupModule');

  if (testBedImport || catalystImport) {
    sourceFile.forEachChild(function walk(node) {
      if (ts.isCallExpression(node) && node.arguments.length > 0 &&
          // `arguments[0]` is the testing module config.
          ts.isObjectLiteralExpression(node.arguments[0])) {
        if ((testBedImport && ts.isPropertyAccessExpression(node.expression) &&
             node.expression.name.text === 'configureTestingModule' &&
             isReferenceToImport(typeChecker, node.expression.expression, testBedImport)) ||
            (catalystImport && ts.isIdentifier(node.expression) &&
             isReferenceToImport(typeChecker, node.expression, catalystImport))) {
          testObjects.push(node.arguments[0]);
        }
      }

      node.forEachChild(walk);
    });
  }

  return testObjects;
}

/**
 * Finds the classes corresponding to dependencies used in a component's template.
 * @param decl Component in whose template we're looking for dependencies.
 * @param typeChecker
 */
function findTemplateDependencies(decl: ts.ClassDeclaration, typeChecker: TemplateTypeChecker):
    Reference<NamedClassDeclaration>[] {
  const results: Reference<NamedClassDeclaration>[] = [];
  const usedDirectives = typeChecker.getUsedDirectives(decl);
  const usedPipes = typeChecker.getUsedPipes(decl);

  if (usedDirectives !== null) {
    for (const dir of usedDirectives) {
      if (ts.isClassDeclaration(dir.ref.node)) {
        results.push(dir.ref as Reference<NamedClassDeclaration>);
      }
    }
  }

  if (usedPipes !== null) {
    const potentialPipes = typeChecker.getPotentialPipes(decl);

    for (const pipe of potentialPipes) {
      if (ts.isClassDeclaration(pipe.ref.node) &&
          usedPipes.some(current => pipe.name === current)) {
        results.push(pipe.ref as Reference<NamedClassDeclaration>);
      }
    }
  }

  return results;
}

/**
 * Removes any declarations that are a part of a module's `bootstrap`
 * array from an array of declarations.
 * @param declarations Anaalyzed declarations of the module.
 * @param ngModule Module whote declarations are being filtered.
 * @param templateTypeChecker
 * @param typeChecker
 */
function filterNonBootstrappedDeclarations(
    declarations: ts.ClassDeclaration[], ngModule: ts.ClassDeclaration,
    templateTypeChecker: TemplateTypeChecker, typeChecker: ts.TypeChecker) {
  const metadata = templateTypeChecker.getNgModuleMetadata(ngModule);
  const metaLiteral =
      metadata && metadata.decorator ? extractMetadataLiteral(metadata.decorator) : null;
  const bootstrapProp = metaLiteral ? findLiteralProperty(metaLiteral, 'bootstrap') : null;

  // If there's no `bootstrap`, we can't filter.
  if (!bootstrapProp) {
    return declarations;
  }

  // If we can't analyze the `bootstrap` property, we can't safely determine which
  // declarations aren't bootstrapped so we assume that all of them are.
  if (!ts.isPropertyAssignment(bootstrapProp) ||
      !ts.isArrayLiteralExpression(bootstrapProp.initializer)) {
    return [];
  }

  const bootstrappedClasses = new Set<ts.ClassDeclaration>();

  for (const el of bootstrapProp.initializer.elements) {
    const referencedClass = ts.isIdentifier(el) ? findClassDeclaration(el, typeChecker) : null;

    // If we can resolve an element to a class, we can filter it out,
    // otherwise assume that the array isn't static.
    if (referencedClass) {
      bootstrappedClasses.add(referencedClass);
    } else {
      return [];
    }
  }

  return declarations.filter(ref => !bootstrappedClasses.has(ref));
}

/**
 * Extracts all classes that are referenced in a module's `declarations` array.
 * @param ngModule Module whose declarations are being extraced.
 * @param templateTypeChecker
 */
export function extractDeclarationsFromModule(
    ngModule: ts.ClassDeclaration,
    templateTypeChecker: TemplateTypeChecker): ts.ClassDeclaration[] {
  const metadata = templateTypeChecker.getNgModuleMetadata(ngModule);
  return metadata ? metadata.declarations.filter(decl => ts.isClassDeclaration(decl.node))
                        .map(decl => decl.node) as ts.ClassDeclaration[] :
                    [];
}

/**
 * Migrates the `declarations` from a unit test file to standalone.
 * @param testObjects Object literals used to configure the testing modules.
 * @param declarationsOutsideOfTestFiles Non-testing declarations that are part of this migration.
 * @param tracker
 * @param templateTypeChecker
 * @param typeChecker
 */
export function migrateTestDeclarations(
    testObjects: Set<ts.ObjectLiteralExpression>,
    declarationsOutsideOfTestFiles: Set<ts.ClassDeclaration>, tracker: ChangeTracker,
    templateTypeChecker: TemplateTypeChecker, typeChecker: ts.TypeChecker) {
  const {decorators, componentImports} = analyzeTestingModules(testObjects, typeChecker);
  const allDeclarations = new Set(declarationsOutsideOfTestFiles);

  for (const decorator of decorators) {
    const closestClass = closestNode(decorator.node, ts.isClassDeclaration);

    if (decorator.name === 'Pipe' || decorator.name === 'Directive') {
      tracker.replaceNode(decorator.node, addStandaloneToDecorator(decorator.node));

      if (closestClass) {
        allDeclarations.add(closestClass);
      }
    } else if (decorator.name === 'Component') {
      const newDecorator = addStandaloneToDecorator(decorator.node);
      const importsToAdd = componentImports.get(decorator.node);

      if (closestClass) {
        allDeclarations.add(closestClass);
      }

      if (importsToAdd && importsToAdd.size > 0) {
        const hasTrailingComma = importsToAdd.size > 2 &&
            !!extractMetadataLiteral(decorator.node)?.properties.hasTrailingComma;
        const importsArray = ts.factory.createNodeArray(Array.from(importsToAdd), hasTrailingComma);

        tracker.replaceNode(
            decorator.node,
            addPropertyToAngularDecorator(
                newDecorator,
                ts.factory.createPropertyAssignment(
                    'imports', ts.factory.createArrayLiteralExpression(importsArray))));
      } else {
        tracker.replaceNode(decorator.node, newDecorator);
      }
    }
  }

  for (const obj of testObjects) {
    moveDeclarationsToImports(obj, allDeclarations, typeChecker, templateTypeChecker, tracker);
  }
}

/**
 * Analyzes a set of objects used to configure testing modules and returns the AST
 * nodes that need to be migrated and the imports that should be added to the imports
 * of any declared components.
 * @param testObjects Object literals that should be analyzed.
 */
function analyzeTestingModules(
    testObjects: Set<ts.ObjectLiteralExpression>, typeChecker: ts.TypeChecker) {
  const seenDeclarations = new Set<ts.Declaration>();
  const decorators: NgDecorator[] = [];
  const componentImports = new Map<ts.Decorator, Set<ts.Expression>>();

  for (const obj of testObjects) {
    const declarations = extractDeclarationsFromTestObject(obj, typeChecker);

    if (declarations.length === 0) {
      continue;
    }

    const importsProp = findLiteralProperty(obj, 'imports');
    const importElements = importsProp && hasNgModuleMetadataElements(importsProp) ?
        importsProp.initializer.elements.filter(el => {
          // Filter out calls since they may be a `ModuleWithProviders`.
          return !ts.isCallExpression(el) &&
              // Also filter out the animations modules since they throw errors if they're imported
              // multiple times and it's common for apps to use the `NoopAnimationsModule` to
              // disable animations in screenshot tests.
              !isClassReferenceInAngularModule(
                  el, /^BrowserAnimationsModule|NoopAnimationsModule$/,
                  'platform-browser/animations', typeChecker);
        }) :
        null;

    for (const decl of declarations) {
      if (seenDeclarations.has(decl)) {
        continue;
      }

      const [decorator] = getAngularDecorators(typeChecker, ts.getDecorators(decl) || []);

      if (decorator) {
        seenDeclarations.add(decl);
        decorators.push(decorator);

        if (decorator.name === 'Component' && importElements) {
          // We try to de-duplicate the imports being added to a component, because it may be
          // declared in different testing modules with a different set of imports.
          let imports = componentImports.get(decorator.node);
          if (!imports) {
            imports = new Set();
            componentImports.set(decorator.node, imports);
          }
          importElements.forEach(imp => imports!.add(imp));
        }
      }
    }
  }

  return {decorators, componentImports};
}

/**
 * Finds the class declarations that are being referred
 * to in the `declarations` of an object literal.
 * @param obj Object literal that may contain the declarations.
 * @param typeChecker
 */
function extractDeclarationsFromTestObject(
    obj: ts.ObjectLiteralExpression, typeChecker: ts.TypeChecker): ts.ClassDeclaration[] {
  const results: ts.ClassDeclaration[] = [];
  const declarations = findLiteralProperty(obj, 'declarations');

  if (declarations && hasNgModuleMetadataElements(declarations)) {
    for (const element of declarations.initializer.elements) {
      const declaration = findClassDeclaration(element, typeChecker);

      // Note that we only migrate classes that are in the same file as the testing module,
      // because external fixture components are somewhat rare and handling them is going
      // to involve a lot of assumptions that are likely to be incorrect.
      if (declaration && declaration.getSourceFile().fileName === obj.getSourceFile().fileName) {
        results.push(declaration);
      }
    }
  }

  return results;
}

/** Extracts the metadata object literal from an Angular decorator. */
function extractMetadataLiteral(decorator: ts.Decorator): ts.ObjectLiteralExpression|null {
  // `arguments[0]` is the metadata object literal.
  return ts.isCallExpression(decorator.expression) && decorator.expression.arguments.length === 1 &&
          ts.isObjectLiteralExpression(decorator.expression.arguments[0]) ?
      decorator.expression.arguments[0] :
      null;
}

/**
 * Checks whether a class is a standalone declaration.
 * @param node Class being checked.
 * @param declarationsInMigration Classes that are being converted to standalone in this migration.
 * @param templateTypeChecker
 */
function isStandaloneDeclaration(
    node: ts.ClassDeclaration, declarationsInMigration: Set<ts.ClassDeclaration>,
    templateTypeChecker: TemplateTypeChecker): boolean {
  if (declarationsInMigration.has(node)) {
    return true;
  }

  const metadata =
      templateTypeChecker.getDirectiveMetadata(node) || templateTypeChecker.getPipeMetadata(node);
  return metadata != null && metadata.isStandalone;
}
