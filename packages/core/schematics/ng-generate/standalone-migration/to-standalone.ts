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

import {getAngularDecorators, NgDecorator} from '../../utils/ng_decorators';
import {getImportSpecifier} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';
import {isReferenceToImport} from '../../utils/typescript/symbol';

import {ChangesByFile, ChangeTracker, findClassDeclaration, findLiteralProperty, ImportRemapper, NamedClassDeclaration} from './util';

/**
 * Converts all declarations in the specified files to standalone.
 * @param sourceFiles Files that should be migrated.
 * @param program
 * @param printer
 */
export function toStandalone(
    sourceFiles: ts.SourceFile[], program: NgtscProgram, printer: ts.Printer,
    importRemapper?: ImportRemapper): ChangesByFile {
  const templateTypeChecker = program.compiler.getTemplateTypeChecker();
  const typeChecker = program.getTsProgram().getTypeChecker();
  const modulesToMigrate: ts.ClassDeclaration[] = [];
  const testObjectsToMigrate: ts.ObjectLiteralExpression[] = [];
  const declarations: Reference<ts.ClassDeclaration>[] = [];
  const tracker = new ChangeTracker(printer, importRemapper);

  for (const sourceFile of sourceFiles) {
    const {modules, testObjects} = findModulesToMigrate(sourceFile, typeChecker);
    modules.forEach(
        module => declarations.push(...extractDeclarationsFromModule(module, templateTypeChecker)));
    modulesToMigrate.push(...modules);
    testObjectsToMigrate.push(...testObjects);
  }

  for (const declaration of declarations) {
    convertNgModuleDeclarationToStandalone(declaration, declarations, tracker, templateTypeChecker);
  }

  for (const node of modulesToMigrate) {
    migrateNgModuleClass(node, declarations, tracker, typeChecker, templateTypeChecker);
  }

  migrateTestDeclarations(testObjectsToMigrate, declarations, tracker, typeChecker);
  return tracker.recordChanges();
}

/**
 * Converts a single declaration defined through an NgModule to standalone.
 * @param ref References to the declaration being converted.
 * @param tracker Tracker used to track the file changes.
 * @param allDeclarations All the declarations that are being converted as a part of this migration.
 * @param typeChecker
 */
export function convertNgModuleDeclarationToStandalone(
    ref: Reference<ts.ClassDeclaration>, allDeclarations: Reference<ts.ClassDeclaration>[],
    tracker: ChangeTracker, typeChecker: TemplateTypeChecker): void {
  const directiveMeta = typeChecker.getDirectiveMetadata(ref.node);

  if (directiveMeta && directiveMeta.decorator && !directiveMeta.isStandalone) {
    let decorator = addStandaloneToDecorator(directiveMeta.decorator);

    if (directiveMeta.isComponent) {
      const importsToAdd =
          getComponentImportExpressions(ref, allDeclarations, tracker, typeChecker);

      if (importsToAdd.length > 0) {
        decorator = addPropertyToAngularDecorator(
            decorator,
            ts.factory.createPropertyAssignment(
                'imports', ts.factory.createArrayLiteralExpression(importsToAdd)));
      }
    }

    tracker.replaceNode(directiveMeta.decorator, decorator);
  } else {
    const pipeMeta = typeChecker.getPipeMetadata(ref.node);

    if (pipeMeta && pipeMeta.decorator && !pipeMeta.isStandalone) {
      tracker.replaceNode(pipeMeta.decorator, addStandaloneToDecorator(pipeMeta.decorator));
    }
  }
}

/**
 * Gets the expressions that should be added to a component's
 * `imports` array based on its template dependencies.
 * @param ref Reference to the component class.
 * @param allDeclarations All the declarations that are being converted as a part of this migration.
 * @param tracker
 * @param typeChecker
 */
function getComponentImportExpressions(
    ref: Reference<ts.ClassDeclaration>, allDeclarations: Reference<ts.ClassDeclaration>[],
    tracker: ChangeTracker, typeChecker: TemplateTypeChecker): ts.Expression[] {
  const templateDependencies = findTemplateDependencies(ref, typeChecker);
  const usedDependenciesInMigration = new Set(templateDependencies.filter(
      dep => allDeclarations.find(current => current.node === dep.node)));
  const imports: ts.Expression[] = [];
  const seenImports = new Set<string>();

  for (const dep of templateDependencies) {
    const importLocation = findImportLocation(
        dep as Reference<NamedClassDeclaration>, ref,
        usedDependenciesInMigration.has(dep) ? PotentialImportMode.ForceDirect :
                                               PotentialImportMode.Normal,
        typeChecker);

    if (importLocation && !seenImports.has(importLocation.symbolName)) {
      if (importLocation.moduleSpecifier) {
        const identifier = tracker.addImport(
            ref.node.getSourceFile(), importLocation.symbolName, importLocation.moduleSpecifier);
        imports.push(identifier);
      } else {
        const identifier = ts.factory.createIdentifier(importLocation.symbolName);

        if (importLocation.isForwardReference) {
          const forwardRefExpression =
              tracker.addImport(ref.node.getSourceFile(), 'forwardRef', '@angular/core');
          const arrowFunction = ts.factory.createArrowFunction(
              undefined, undefined, [], undefined, undefined, identifier);
          imports.push(
              ts.factory.createCallExpression(forwardRefExpression, undefined, [arrowFunction]));
        } else {
          imports.push(identifier);
        }
      }

      seenImports.add(importLocation.symbolName);
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
    node: ts.ClassDeclaration, allDeclarations: Reference<ts.ClassDeclaration>[],
    tracker: ChangeTracker, typeChecker: ts.TypeChecker, templateTypeChecker: TemplateTypeChecker) {
  const decorator = templateTypeChecker.getNgModuleMetadata(node)?.decorator;

  if (decorator && ts.isCallExpression(decorator.expression) &&
      decorator.expression.arguments.length === 1 &&
      ts.isObjectLiteralExpression(decorator.expression.arguments[0])) {
    moveDeclarationsToImports(
        decorator.expression.arguments[0], allDeclarations.map(decl => decl.node), typeChecker,
        tracker);
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
    literal: ts.ObjectLiteralExpression, allDeclarations: ts.ClassDeclaration[],
    typeChecker: ts.TypeChecker, tracker: ChangeTracker): void {
  const declarationsProp = findLiteralProperty(literal, 'declarations');

  if (!declarationsProp) {
    return;
  }

  const declarationsToPreserve: ts.Expression[] = [];
  const declarationsToCopy: ts.Expression[] = [];
  const properties: ts.ObjectLiteralElementLike[] = [];
  const importsProp = findLiteralProperty(literal, 'imports');

  // Separate the declarations that we want to keep and ones we need to copy into the `imports`.
  if (ts.isPropertyAssignment(declarationsProp)) {
    // If the declarations are an array, we can analyze it to
    // find any classes from the current migration.
    if (ts.isArrayLiteralExpression(declarationsProp.initializer)) {
      for (const el of declarationsProp.initializer.elements) {
        if (ts.isIdentifier(el)) {
          const correspondingClass = findClassDeclaration(el, typeChecker);

          if (!correspondingClass || allDeclarations.includes(correspondingClass)) {
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
        'imports', ts.factory.createArrayLiteralExpression(declarationsToCopy)));
  }

  for (const prop of literal.properties) {
    if (!isNamedPropertyAssignment(prop)) {
      properties.push(prop);
      continue;
    }

    // If we have declarations to preserve, update the existing property, otherwise drop it.
    if (prop === declarationsProp) {
      if (declarationsToPreserve.length > 0) {
        properties.push(ts.factory.updatePropertyAssignment(
            prop, prop.name, ts.factory.createArrayLiteralExpression(declarationsToPreserve)));
      }
      continue;
    }

    // If we have an `imports` array and declarations
    // that should be copied, we merge the two arrays.
    if (prop === importsProp && declarationsToCopy.length > 0) {
      let initializer: ts.Expression;

      if (ts.isArrayLiteralExpression(prop.initializer)) {
        initializer = ts.factory.updateArrayLiteralExpression(
            prop.initializer, [...prop.initializer.elements, ...declarationsToCopy]);
      } else {
        initializer = ts.factory.createArrayLiteralExpression(
            [ts.factory.createSpreadElement(prop.initializer), ...declarationsToCopy]);
      }

      properties.push(ts.factory.updatePropertyAssignment(prop, prop.name, initializer));
      continue;
    }

    // Retain any remaining properties.
    properties.push(prop);
  }

  tracker.replaceNode(
      literal, ts.factory.updateObjectLiteralExpression(literal, properties),
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

  if (node.expression.arguments.length === 0) {
    literalProperties = [property];
  } else if (ts.isObjectLiteralExpression(node.expression.arguments[0])) {
    literalProperties = [...node.expression.arguments[0].properties, property];
  } else {
    // Unsupported case (e.g. `@Component(SOME_CONST)`). Return the original node.
    return node;
  }

  // Use `createDecorator` instead of `updateDecorator`, because
  // the latter ends up duplicating the node's leading comment.
  return ts.factory.createDecorator(ts.factory.createCallExpression(
      node.expression.expression, node.expression.typeArguments,
      [ts.factory.createObjectLiteralExpression(literalProperties, literalProperties.length > 1)]));
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
    target: Reference<NamedClassDeclaration>, inComponent: Reference<ts.ClassDeclaration>,
    importMode: PotentialImportMode, typeChecker: TemplateTypeChecker): PotentialImport|null {
  const importLocations = typeChecker.getPotentialImportsFor(target, inComponent.node, importMode);
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
function findModulesToMigrate(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
  const modules: ts.ClassDeclaration[] = [];
  const testObjects: ts.ObjectLiteralExpression[] = [];
  const testBedImport = getImportSpecifier(sourceFile, '@angular/core/testing', 'TestBed');
  const catalystImport = getImportSpecifier(sourceFile, /testing\/catalyst$/, 'setupModule');

  sourceFile.forEachChild(function walk(node) {
    if (ts.isClassDeclaration(node)) {
      const decorator = getAngularDecorators(typeChecker, ts.getDecorators(node) || [])
                            .find(current => current.name === 'NgModule');
      const metadata = decorator?.node.expression.arguments[0];

      if (metadata && ts.isObjectLiteralExpression(metadata)) {
        const declarations = findLiteralProperty(metadata, 'declarations');
        const bootstrap = findLiteralProperty(metadata, 'bootstrap');
        const hasDeclarations = declarations != null && hasNgModuleMetadataElements(declarations);
        const hasBootstrap = bootstrap != null && hasNgModuleMetadataElements(bootstrap);

        // Skip modules that bootstrap components since changing them would also involve
        // converting `bootstrapModule` calls to `bootstrapApplication`. These declarations
        // will be converted to standalone in the `standalone-bootstrap` step.
        if (hasDeclarations && !hasBootstrap) {
          modules.push(node);
        }
      }
    } else if (
        ts.isCallExpression(node) && node.arguments.length > 0 &&
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

  return {modules, testObjects};
}

/**
 * Finds the classes corresponding to dependencies used in a component's template.
 * @param ref Component in whose template we're looking for dependencies.
 * @param typeChecker
 */
function findTemplateDependencies(
    ref: Reference<ts.ClassDeclaration>,
    typeChecker: TemplateTypeChecker): Reference<NamedClassDeclaration>[] {
  const results: Reference<NamedClassDeclaration>[] = [];
  const usedDirectives = typeChecker.getUsedDirectives(ref.node);
  const usedPipes = typeChecker.getUsedPipes(ref.node);

  if (usedDirectives !== null) {
    for (const dir of usedDirectives) {
      if (ts.isClassDeclaration(dir.ref.node)) {
        results.push(dir.ref as Reference<NamedClassDeclaration>);
      }
    }
  }

  if (usedPipes !== null) {
    const potentialPipes = typeChecker.getPotentialPipes(ref.node);

    for (const pipe of potentialPipes) {
      if (ts.isClassDeclaration(pipe.ref.node) &&
          usedPipes.some(current => pipe.name === current)) {
        results.push(pipe.ref as Reference<NamedClassDeclaration>);
      }
    }
  }

  return results;
}

/** Extracts classes that are referred to in a module's `declarations` array. */
function extractDeclarationsFromModule(
    ngModule: ts.ClassDeclaration,
    typeChecker: TemplateTypeChecker): Reference<ts.ClassDeclaration>[] {
  return typeChecker.getNgModuleMetadata(ngModule)?.declarations.filter(
             decl => ts.isClassDeclaration(decl.node)) as Reference<ts.ClassDeclaration>[] ||
      [];
}

/**
 * Migrates the `declarations` from a unit test file to standalone.
 * @param testObjects Object literals used to configure the testing modules.
 * @param tracker
 * @param typeChecker
 */
function migrateTestDeclarations(
    testObjects: ts.ObjectLiteralExpression[],
    declarationsOutsideOfTestFiles: Reference<ts.ClassDeclaration>[], tracker: ChangeTracker,
    typeChecker: ts.TypeChecker) {
  const {decorators, componentImports} = analyzeTestingModules(testObjects, typeChecker);
  const allDeclarations: ts.ClassDeclaration[] =
      declarationsOutsideOfTestFiles.map(ref => ref.node);

  for (const decorator of decorators) {
    const closestClass = closestNode(decorator.node, ts.isClassDeclaration);

    if (decorator.name === 'Pipe' || decorator.name === 'Directive') {
      tracker.replaceNode(decorator.node, addStandaloneToDecorator(decorator.node));

      if (closestClass) {
        allDeclarations.push(closestClass);
      }
    } else if (decorator.name === 'Component') {
      const newDecorator = addStandaloneToDecorator(decorator.node);
      const importsToAdd = componentImports.get(decorator.node);

      if (closestClass) {
        allDeclarations.push(closestClass);
      }

      if (importsToAdd && importsToAdd.size > 0) {
        tracker.replaceNode(
            decorator.node,
            addPropertyToAngularDecorator(
                newDecorator,
                ts.factory.createPropertyAssignment(
                    'imports', ts.factory.createArrayLiteralExpression(Array.from(importsToAdd)))));
      } else {
        tracker.replaceNode(decorator.node, newDecorator);
      }
    }
  }

  for (const obj of testObjects) {
    moveDeclarationsToImports(obj, allDeclarations, typeChecker, tracker);
  }
}

/**
 * Analyzes a set of objects used to configure testing modules and returns the AST
 * nodes that need to be migrated and the imports that should be added to the imports
 * of any declared components.
 * @param testObjects Object literals that should be analyzed.
 */
function analyzeTestingModules(
    testObjects: ts.ObjectLiteralExpression[], typeChecker: ts.TypeChecker) {
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
        importsProp.initializer.elements :
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
