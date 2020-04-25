/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  join as devkitJoin,
  normalize as devkitNormalize,
  Path as DevkitPath
} from '@angular-devkit/core';
import {SchematicContext, Tree} from '@angular-devkit/schematics';
import {
  addSymbolToNgModuleMetadata,
  DevkitMigration,
  getDecoratorMetadata,
  getImportOfIdentifier,
  getMetadataField,
  getProjectIndexFiles,
  getProjectMainFile,
  Import,
  MigrationFailure,
  PostMigrationAction,
  ResolvedResource,
  TargetVersion
} from '@angular/cdk/schematics';
import {InsertChange} from '@schematics/angular/utility/change';
import {readFileSync} from 'fs';
import {dirname, join, relative} from 'path';
import * as ts from 'typescript';

import {findHammerScriptImportElements} from './find-hammer-script-tags';
import {findMainModuleExpression} from './find-main-module';
import {isHammerJsUsedInTemplate} from './hammer-template-check';
import {ImportManager} from './import-manager';
import {removeElementFromArrayExpression} from './remove-array-element';
import {removeElementFromHtml} from './remove-element-from-html';

const GESTURE_CONFIG_CLASS_NAME = 'GestureConfig';
const GESTURE_CONFIG_FILE_NAME = 'gesture-config';
const GESTURE_CONFIG_TEMPLATE_PATH = './gesture-config.template';

const HAMMER_CONFIG_TOKEN_NAME = 'HAMMER_GESTURE_CONFIG';
const HAMMER_CONFIG_TOKEN_MODULE = '@angular/platform-browser';

const HAMMER_MODULE_NAME = 'HammerModule';
const HAMMER_MODULE_IMPORT = '@angular/platform-browser';

const HAMMER_MODULE_SPECIFIER = 'hammerjs';

const CANNOT_REMOVE_REFERENCE_ERROR =
    `Cannot remove reference to "GestureConfig". Please remove manually.`;

interface IdentifierReference {
  node: ts.Identifier;
  importData: Import;
  isImport: boolean;
}

export class HammerGesturesMigration extends DevkitMigration<null> {
  // Only enable this rule if the migration targets v9 or v10 and is running for a non-test
  // target. We cannot migrate test targets since they have a limited scope
  // (in regards to source files) and therefore the HammerJS usage detection can be incorrect.
  enabled =
      (this.targetVersion === TargetVersion.V9 || this.targetVersion === TargetVersion.V10) &&
      !this.context.isTestTarget;

  private _printer = ts.createPrinter();
  private _importManager = new ImportManager(this.fileSystem, this._printer);
  private _nodeFailures: {node: ts.Node, message: string}[] = [];

  /**
   * Whether custom HammerJS events provided by the Material gesture
   * config are used in a template.
   */
  private _customEventsUsedInTemplate = false;

  /** Whether standard HammerJS events are used in a template. */
  private _standardEventsUsedInTemplate = false;

  /** Whether HammerJS is accessed at runtime. */
  private _usedInRuntime = false;

  /**
   * List of imports that make "hammerjs" available globally. We keep track of these
   * since we might need to remove them if Hammer is not used.
   */
  private _installImports: ts.ImportDeclaration[] = [];

  /**
   * List of identifiers which resolve to the gesture config from Angular Material.
   */
  private _gestureConfigReferences: IdentifierReference[] = [];

  /**
   * List of identifiers which resolve to the "HAMMER_GESTURE_CONFIG" token from
   * "@angular/platform-browser".
   */
  private _hammerConfigTokenReferences: IdentifierReference[] = [];

  /**
   * List of identifiers which resolve to the "HammerModule" from
   * "@angular/platform-browser".
   */
  private _hammerModuleReferences: IdentifierReference[] = [];

  /**
   * List of identifiers that have been deleted from source files. This can be
   * used to determine if certain imports are still used or not.
   */
  private _deletedIdentifiers: ts.Identifier[] = [];

  visitTemplate(template: ResolvedResource): void {
    if (!this._customEventsUsedInTemplate || !this._standardEventsUsedInTemplate) {
      const {standardEvents, customEvents} = isHammerJsUsedInTemplate(template.content);
      this._customEventsUsedInTemplate = this._customEventsUsedInTemplate || customEvents;
      this._standardEventsUsedInTemplate = this._standardEventsUsedInTemplate || standardEvents;
    }
  }

  visitNode(node: ts.Node): void {
    this._checkHammerImports(node);
    this._checkForRuntimeHammerUsage(node);
    this._checkForMaterialGestureConfig(node);
    this._checkForHammerGestureConfigToken(node);
    this._checkForHammerModuleReference(node);
  }

  postAnalysis(): void {
    // Walk through all hammer config token references and check if there
    // is a potential custom gesture config setup.
    const hasCustomGestureConfigSetup =
        this._hammerConfigTokenReferences.some(r => this._checkForCustomGestureConfigSetup(r));
    const usedInTemplate = this._standardEventsUsedInTemplate || this._customEventsUsedInTemplate;

    /*
      Possible scenarios and how the migration should change the project:
        1. We detect that a custom HammerJS gesture config is set up:
            - Remove references to the Material gesture config if no HammerJS event is used.
            - Print a warning about ambiguous configuration that cannot be handled completely
              if there are references to the Material gesture config.
        2. We detect that HammerJS is only used programmatically:
            - Remove references to GestureConfig of Material.
            - Remove references to the "HammerModule" if present.
        3. We detect that standard HammerJS events are used in a template:
            - Set up the "HammerModule" from platform-browser.
            - Remove all gesture config references.
        4. We detect that custom HammerJS events provided by the Material gesture
           config are used.
            - Copy the Material gesture config into the app.
            - Rewrite all gesture config references to the newly copied one.
            - Set up the new gesture config in the root app module.
            - Set up the "HammerModule" from platform-browser.
        4. We detect no HammerJS usage at all:
            - Remove Hammer imports
            - Remove Material gesture config references
            - Remove HammerModule setup if present.
            - Remove Hammer script imports in "index.html" files.
    */

    if (hasCustomGestureConfigSetup) {
      // If a custom gesture config is provided, we always assume that HammerJS is used.
      HammerGesturesMigration.globalUsesHammer = true;
      if (!usedInTemplate && this._gestureConfigReferences.length) {
        // If the Angular Material gesture events are not used and we found a custom
        // gesture config, we can safely remove references to the Material gesture config
        // since events provided by the Material gesture config are guaranteed to be unused.
        this._removeMaterialGestureConfigSetup();
        this.printInfo(
            'The HammerJS v9 migration for Angular Components detected that HammerJS is ' +
            'manually set up in combination with references to the Angular Material gesture ' +
            'config. This target cannot be migrated completely, but all references to the ' +
            'deprecated Angular Material gesture have been removed. Read more here: ' +
            'https://git.io/ng-material-v9-hammer-ambiguous-usage');
      } else if (usedInTemplate && this._gestureConfigReferences.length) {
        // Since there is a reference to the Angular Material gesture config, and we detected
        // usage of a gesture event that could be provided by Angular Material, we *cannot*
        // automatically remove references. This is because we do *not* know whether the
        // event is actually provided by the custom config or by the Material config.
        this.printInfo(
            'The HammerJS v9 migration for Angular Components detected that HammerJS is ' +
            'manually set up in combination with references to the Angular Material gesture ' +
            'config. This target cannot be migrated completely. Please manually remove ' +
            'references to the deprecated Angular Material gesture config. Read more here: ' +
            'https://git.io/ng-material-v9-hammer-ambiguous-usage');
      }
    } else if (this._usedInRuntime || usedInTemplate) {
      // We keep track of whether Hammer is used globally. This is necessary because we
      // want to only remove Hammer from the "package.json" if it is not used in any project
      // target. Just because it isn't used in one target doesn't mean that we can safely
      // remove the dependency.
      HammerGesturesMigration.globalUsesHammer = true;

      // If hammer is only used at runtime, we don't need the gesture config or "HammerModule"
      // and can remove it (along with the hammer config token import if no longer needed).
      if (!usedInTemplate) {
        this._removeMaterialGestureConfigSetup();
        this._removeHammerModuleReferences();
      } else if (this._standardEventsUsedInTemplate && !this._customEventsUsedInTemplate) {
        this._setupHammerWithStandardEvents();
      } else {
        this._setupHammerWithCustomEvents();
      }
    } else {
      this._removeHammerSetup();
    }

    // Record the changes collected in the import manager. Changes need to be applied
    // once the import manager registered all import modifications. This avoids collisions.
    this._importManager.recordChanges();

    // Create migration failures that will be printed by the update-tool on migration
    // completion. We need special logic for updating failure positions to reflect
    // the new source file after modifications from the import manager.
    this.failures.push(...this._createMigrationFailures());

    // The template check for HammerJS events is not completely reliable as the event
    // output could also be from a component having an output named similarly to a known
    // hammerjs event (e.g. "@Output() slide"). The usage is therefore somewhat ambiguous
    // and we want to print a message that developers might be able to remove Hammer manually.
    if (!hasCustomGestureConfigSetup && !this._usedInRuntime && usedInTemplate) {
      this.printInfo(
          'The HammerJS v9 migration for Angular Components migrated the ' +
          'project to keep HammerJS installed, but detected ambiguous usage of HammerJS. Please ' +
          'manually check if you can remove HammerJS from your application. More details: ' +
          'https://git.io/ng-material-v9-hammer-ambiguous-usage');
    }
  }

  /**
   * Sets up the hammer gesture config in the current project. To achieve this, the
   * following steps are performed:
   *   1) Create copy of Angular Material gesture config.
   *   2) Rewrite all references to the Angular Material gesture config to the
   *      new gesture config.
   *   3) Setup the HAMMER_GESTURE_CONFIG in the root app module (if not done already).
   *   4) Setup the "HammerModule" in the root app module (if not done already).
   */
  private _setupHammerWithCustomEvents() {
    const project = this.context.project;
    const sourceRoot = devkitNormalize(project.sourceRoot || project.root);
    const newConfigPath =
        devkitJoin(sourceRoot, this._getAvailableGestureConfigFileName(sourceRoot));

    // Copy gesture config template into the CLI project.
    this.fileSystem.create(
        newConfigPath, readFileSync(require.resolve(GESTURE_CONFIG_TEMPLATE_PATH), 'utf8'));

    // Replace all Material gesture config references to resolve to the
    // newly copied gesture config.
    this._gestureConfigReferences.forEach(
        i => this._replaceGestureConfigReference(
            i, GESTURE_CONFIG_CLASS_NAME,
            getModuleSpecifier(newConfigPath, i.node.getSourceFile().fileName)));

    // Setup the gesture config provider and the "HammerModule" in the root module
    // if not done already. The "HammerModule" is needed in v9 since it enables the
    // Hammer event plugin that was previously enabled by default in v8.
    this._setupNewGestureConfigInRootModule(newConfigPath);
    this._setupHammerModuleInRootModule();
  }

  /**
   * Sets up the standard hammer module in the project and removes all
   * references to the deprecated Angular Material gesture config.
   */
  private _setupHammerWithStandardEvents() {
    // Setup the HammerModule. The HammerModule enables support for
    // the standard HammerJS events.
    this._setupHammerModuleInRootModule();
    this._removeMaterialGestureConfigSetup();
  }

  /**
   * Removes Hammer from the current project. The following steps are performed:
   *   1) Delete all TypeScript imports to "hammerjs".
   *   2) Remove references to the Angular Material gesture config.
   *   3) Remove "hammerjs" from all index HTML files of the current project.
   */
  private _removeHammerSetup() {
    this._installImports.forEach(i => this._importManager.deleteImportByDeclaration(i));

    this._removeMaterialGestureConfigSetup();
    this._removeHammerModuleReferences();
    this._removeHammerFromIndexFile();
  }

  /**
   * Removes the gesture config setup by deleting all found references to the Angular
   * Material gesture config. Additionally, unused imports to the hammer gesture config
   * token from "@angular/platform-browser" will be removed as well.
   */
  private _removeMaterialGestureConfigSetup() {
    this._gestureConfigReferences.forEach(r => this._removeGestureConfigReference(r));

    this._hammerConfigTokenReferences.forEach(r => {
      if (r.isImport) {
        this._removeHammerConfigTokenImportIfUnused(r);
      }
    });
  }

  /** Removes all references to the "HammerModule" from "@angular/platform-browser". */
  private _removeHammerModuleReferences() {
    this._hammerModuleReferences.forEach(({node, isImport, importData}) => {
      const sourceFile = node.getSourceFile();
      const recorder = this.fileSystem.edit(sourceFile.fileName);

      // Only remove the import for the HammerModule if the module has been accessed
      // through a non-namespaced identifier access.
      if (!isNamespacedIdentifierAccess(node)) {
        this._importManager.deleteNamedBindingImport(
            sourceFile, HAMMER_MODULE_NAME, importData.moduleName);
      }

      // For references from within an import, we do not need to do anything other than
      // removing the import. For other references, we remove the import and the actual
      // identifier in the module imports.
      if (isImport) {
        return;
      }

      // If the "HammerModule" is referenced within an array literal, we can
      // remove the element easily. Otherwise if it's outside of an array literal,
      // we need to replace the reference with an empty object literal w/ todo to
      // not break the application.
      if (ts.isArrayLiteralExpression(node.parent)) {
        // Removes the "HammerModule" from the parent array expression. Removes
        // the trailing comma token if present.
        removeElementFromArrayExpression(node, recorder);
      } else {
        recorder.remove(node.getStart(), node.getWidth());
        recorder.insertRight(node.getStart(), `/* TODO: remove */ {}`);
        this._nodeFailures.push({
          node: node,
          message: 'Unable to delete reference to "HammerModule".',
        });
      }
    });
  }

  /**
   * Checks if the given node is a reference to the hammer gesture config
   * token from platform-browser. If so, keeps track of the reference.
   */
  private _checkForHammerGestureConfigToken(node: ts.Node) {
    if (ts.isIdentifier(node)) {
      const importData = getImportOfIdentifier(node, this.typeChecker);
      if (importData && importData.symbolName === HAMMER_CONFIG_TOKEN_NAME &&
          importData.moduleName === HAMMER_CONFIG_TOKEN_MODULE) {
        this._hammerConfigTokenReferences.push(
            {node, importData, isImport: ts.isImportSpecifier(node.parent)});
      }
    }
  }

  /**
   * Checks if the given node is a reference to the HammerModule from
   * "@angular/platform-browser". If so, keeps track of the reference.
   */
  private _checkForHammerModuleReference(node: ts.Node) {
    if (ts.isIdentifier(node)) {
      const importData = getImportOfIdentifier(node, this.typeChecker);
      if (importData && importData.symbolName === HAMMER_MODULE_NAME &&
          importData.moduleName === HAMMER_MODULE_IMPORT) {
        this._hammerModuleReferences.push(
            {node, importData, isImport: ts.isImportSpecifier(node.parent)});
      }
    }
  }

  /**
   * Checks if the given node is an import to the HammerJS package. Imports to
   * HammerJS which load specific symbols from the package are considered as
   * runtime usage of Hammer. e.g. `import {Symbol} from "hammerjs";`.
   */
  private _checkHammerImports(node: ts.Node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text === HAMMER_MODULE_SPECIFIER) {
      // If there is an import to HammerJS that imports symbols, or is namespaced
      // (e.g. "import {A, B} from ..." or "import * as hammer from ..."), then we
      // assume that some exports are used at runtime.
      if (node.importClause &&
          !(node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings) &&
            node.importClause.namedBindings.elements.length === 0)) {
        this._usedInRuntime = true;
      } else {
        this._installImports.push(node);
      }
    }
  }

  /**
   * Checks if the given node accesses the global "Hammer" symbol at runtime. If so,
   * the migration rule state will be updated to reflect that Hammer is used at runtime.
   */
  private _checkForRuntimeHammerUsage(node: ts.Node) {
    if (this._usedInRuntime) {
      return;
    }

    // Detects usages of "window.Hammer".
    if (ts.isPropertyAccessExpression(node) && node.name.text === 'Hammer') {
      const originExpr = unwrapExpression(node.expression);
      if (ts.isIdentifier(originExpr) && originExpr.text === 'window') {
        this._usedInRuntime = true;
      }
      return;
    }

    // Detects usages of "window['Hammer']".
    if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression) &&
        node.argumentExpression.text === 'Hammer') {
      const originExpr = unwrapExpression(node.expression);
      if (ts.isIdentifier(originExpr) && originExpr.text === 'window') {
        this._usedInRuntime = true;
      }
      return;
    }

    // Handles usages of plain identifier with the name "Hammer". These usage
    // are valid if they resolve to "@types/hammerjs". e.g. "new Hammer(myElement)".
    if (ts.isIdentifier(node) && node.text === 'Hammer' &&
        !ts.isPropertyAccessExpression(node.parent) && !ts.isElementAccessExpression(node.parent)) {
      const symbol = this._getDeclarationSymbolOfNode(node);
      if (symbol && symbol.valueDeclaration &&
          symbol.valueDeclaration.getSourceFile().fileName.includes('@types/hammerjs')) {
        this._usedInRuntime = true;
      }
    }
  }

  /**
   * Checks if the given node references the gesture config from Angular Material.
   * If so, we keep track of the found symbol reference.
   */
  private _checkForMaterialGestureConfig(node: ts.Node) {
    if (ts.isIdentifier(node)) {
      const importData = getImportOfIdentifier(node, this.typeChecker);
      if (importData && importData.symbolName === GESTURE_CONFIG_CLASS_NAME &&
          importData.moduleName.startsWith('@angular/material/')) {
        this._gestureConfigReferences.push(
            {node, importData, isImport: ts.isImportSpecifier(node.parent)});
      }
    }
  }

  /**
   * Checks if the given Hammer gesture config token reference is part of an
   * Angular provider definition that sets up a custom gesture config.
   */
  private _checkForCustomGestureConfigSetup(tokenRef: IdentifierReference): boolean {
    // Walk up the tree to look for a parent property assignment of the
    // reference to the hammer gesture config token.
    let propertyAssignment: ts.Node = tokenRef.node;
    while (propertyAssignment && !ts.isPropertyAssignment(propertyAssignment)) {
      propertyAssignment = propertyAssignment.parent;
    }

    if (!propertyAssignment || !ts.isPropertyAssignment(propertyAssignment) ||
        getPropertyNameText(propertyAssignment.name) !== 'provide') {
      return false;
    }

    const objectLiteralExpr = propertyAssignment.parent;
    const matchingIdentifiers = findMatchingChildNodes(objectLiteralExpr, ts.isIdentifier);

    // We naively assume that if there is a reference to the "GestureConfig" export
    // from Angular Material in the provider literal, that the provider sets up the
    // Angular Material gesture config.
    return !this._gestureConfigReferences.some(r => matchingIdentifiers.includes(r.node));
  }

  /**
   * Determines an available file name for the gesture config which should
   * be stored in the specified file path.
   */
  private _getAvailableGestureConfigFileName(sourceRoot: DevkitPath) {
    if (!this.fileSystem.exists(devkitJoin(sourceRoot, `${GESTURE_CONFIG_FILE_NAME}.ts`))) {
      return `${GESTURE_CONFIG_FILE_NAME}.ts`;
    }

    let possibleName = `${GESTURE_CONFIG_FILE_NAME}-`;
    let index = 1;
    while (this.fileSystem.exists(devkitJoin(sourceRoot, `${possibleName}-${index}.ts`))) {
      index++;
    }
    return `${possibleName + index}.ts`;
  }

  /** Replaces a given gesture config reference with a new import. */
  private _replaceGestureConfigReference(
      {node, importData, isImport}: IdentifierReference, symbolName: string,
      moduleSpecifier: string) {
    const sourceFile = node.getSourceFile();
    const recorder = this.fileSystem.edit(sourceFile.fileName);

    // List of all identifiers referring to the gesture config in the current file. This
    // allows us to add an import for the copied gesture configuration without generating a
    // new identifier for the import to avoid collisions. i.e. "GestureConfig_1". The import
    // manager checks for possible name collisions, but is able to ignore specific identifiers.
    // We use this to ignore all references to the original Angular Material gesture config,
    // because these will be replaced and therefore will not interfere.
    const gestureIdentifiersInFile = this._getGestureConfigIdentifiersOfFile(sourceFile);

    // If the parent of the identifier is accessed through a namespace, we can just
    // import the new gesture config without rewriting the import declaration because
    // the config has been imported through a namespaced import.
    if (isNamespacedIdentifierAccess(node)) {
      const newExpression = this._importManager.addImportToSourceFile(
          sourceFile, symbolName, moduleSpecifier, false, gestureIdentifiersInFile);

      recorder.remove(node.parent.getStart(), node.parent.getWidth());
      recorder.insertRight(node.parent.getStart(), this._printNode(newExpression, sourceFile));
      return;
    }

    // Delete the old import to the "GestureConfig".
    this._importManager.deleteNamedBindingImport(
        sourceFile, GESTURE_CONFIG_CLASS_NAME, importData.moduleName);

    // If the current reference is not from inside of a import, we need to add a new
    // import to the copied gesture config and replace the identifier. For references
    // within an import, we do nothing but removing the actual import. This allows us
    // to remove unused imports to the Material gesture config.
    if (!isImport) {
      const newExpression = this._importManager.addImportToSourceFile(
          sourceFile, symbolName, moduleSpecifier, false, gestureIdentifiersInFile);

      recorder.remove(node.getStart(), node.getWidth());
      recorder.insertRight(node.getStart(), this._printNode(newExpression, sourceFile));
    }
  }

  /**
   * Removes a given gesture config reference and its corresponding import from
   * its containing source file. Imports will be always removed, but in some cases,
   * where it's not guaranteed that a removal can be performed safely, we just
   * create a migration failure (and add a TODO if possible).
   */
  private _removeGestureConfigReference({node, importData, isImport}: IdentifierReference) {
    const sourceFile = node.getSourceFile();
    const recorder = this.fileSystem.edit(sourceFile.fileName);
    // Only remove the import for the gesture config if the gesture config has
    // been accessed through a non-namespaced identifier access.
    if (!isNamespacedIdentifierAccess(node)) {
      this._importManager.deleteNamedBindingImport(
          sourceFile, GESTURE_CONFIG_CLASS_NAME, importData.moduleName);
    }

    // For references from within an import, we do not need to do anything other than
    // removing the import. For other references, we remove the import and the reference
    // identifier if used inside of a provider definition.
    if (isImport) {
      return;
    }

    const providerAssignment = node.parent;

    // Only remove references to the gesture config which are part of a statically
    // analyzable provider definition. We only support the common case of a gesture
    // config provider definition where the config is set up through "useClass".
    // Otherwise, it's not guaranteed that we can safely remove the provider definition.
    if (!ts.isPropertyAssignment(providerAssignment) ||
        getPropertyNameText(providerAssignment.name) !== 'useClass') {
      this._nodeFailures.push({node, message: CANNOT_REMOVE_REFERENCE_ERROR});
      return;
    }

    const objectLiteralExpr = providerAssignment.parent;
    const provideToken = objectLiteralExpr.properties.find(
        (p): p is ts.PropertyAssignment =>
            ts.isPropertyAssignment(p) && getPropertyNameText(p.name) === 'provide');

    // Do not remove the reference if the gesture config is not part of a provider definition,
    // or if the provided toke is not referring to the known HAMMER_GESTURE_CONFIG token
    // from platform-browser.
    if (!provideToken || !this._isReferenceToHammerConfigToken(provideToken.initializer)) {
      this._nodeFailures.push({node, message: CANNOT_REMOVE_REFERENCE_ERROR});
      return;
    }

    // Collect all nested identifiers which will be deleted. This helps us
    // determining if we can remove imports for the "HAMMER_GESTURE_CONFIG" token.
    this._deletedIdentifiers.push(...findMatchingChildNodes(objectLiteralExpr, ts.isIdentifier));

    // In case the found provider definition is not part of an array literal,
    // we cannot safely remove the provider. This is because it could be declared
    // as a variable. e.g. "const gestureProvider = {provide: .., useClass: GestureConfig}".
    // In that case, we just add an empty object literal with TODO and print a failure.
    if (!ts.isArrayLiteralExpression(objectLiteralExpr.parent)) {
      recorder.remove(objectLiteralExpr.getStart(), objectLiteralExpr.getWidth());
      recorder.insertRight(objectLiteralExpr.getStart(), `/* TODO: remove */ {}`);
      this._nodeFailures.push({
        node: objectLiteralExpr,
        message: `Unable to delete provider definition for "GestureConfig" completely. ` +
            `Please clean up the provider.`
      });
      return;
    }

    // Removes the object literal from the parent array expression. Removes
    // the trailing comma token if present.
    removeElementFromArrayExpression(objectLiteralExpr, recorder);
  }

  /** Removes the given hammer config token import if it is not used. */
  private _removeHammerConfigTokenImportIfUnused({node, importData}: IdentifierReference) {
    const sourceFile = node.getSourceFile();
    const isTokenUsed = this._hammerConfigTokenReferences.some(
        r => !r.isImport && !isNamespacedIdentifierAccess(r.node) &&
            r.node.getSourceFile() === sourceFile && !this._deletedIdentifiers.includes(r.node));

    // We don't want to remove the import for the token if the token is
    // still used somewhere.
    if (!isTokenUsed) {
      this._importManager.deleteNamedBindingImport(
          sourceFile, HAMMER_CONFIG_TOKEN_NAME, importData.moduleName);
    }
  }

  /** Removes Hammer from all index HTML files of the current project. */
  private _removeHammerFromIndexFile() {
    const indexFilePaths = getProjectIndexFiles(this.context.project);
    indexFilePaths.forEach(filePath => {
      if (!this.fileSystem.exists(filePath)) {
        return;
      }

      const htmlContent = this.fileSystem.read(filePath)!;
      const recorder = this.fileSystem.edit(filePath);

      findHammerScriptImportElements(htmlContent)
          .forEach(el => removeElementFromHtml(el, recorder));
    });
  }

  /** Sets up the Hammer gesture config in the root module if needed. */
  private _setupNewGestureConfigInRootModule(gestureConfigPath: string) {
    const {workspaceFsPath, project} = this.context;
    const mainFilePath = join(workspaceFsPath, getProjectMainFile(project));
    const rootModuleSymbol = this._getRootModuleSymbol(mainFilePath);

    if (rootModuleSymbol === null) {
      this.failures.push({
        filePath: mainFilePath,
        message: `Could not setup Hammer gestures in module. Please ` +
            `manually ensure that the Hammer gesture config is set up.`,
      });
      return;
    }

    const sourceFile = rootModuleSymbol.valueDeclaration.getSourceFile();
    const relativePath = relative(workspaceFsPath, sourceFile.fileName);
    const metadata = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core') as
        ts.ObjectLiteralExpression[];

    // If no "NgModule" definition is found inside the source file, we just do nothing.
    if (!metadata.length) {
      return;
    }

    const recorder = this.fileSystem.edit(sourceFile.fileName);
    const providersField = getMetadataField(metadata[0], 'providers')[0];
    const providerIdentifiers =
        providersField ? findMatchingChildNodes(providersField, ts.isIdentifier) : null;
    const gestureConfigExpr = this._importManager.addImportToSourceFile(
        sourceFile, GESTURE_CONFIG_CLASS_NAME,
        getModuleSpecifier(gestureConfigPath, sourceFile.fileName), false,
        this._getGestureConfigIdentifiersOfFile(sourceFile));
    const hammerConfigTokenExpr = this._importManager.addImportToSourceFile(
        sourceFile, HAMMER_CONFIG_TOKEN_NAME, HAMMER_CONFIG_TOKEN_MODULE);
    const newProviderNode = ts.createObjectLiteral([
      ts.createPropertyAssignment('provide', hammerConfigTokenExpr),
      ts.createPropertyAssignment('useClass', gestureConfigExpr)
    ]);

    // If the providers field exists and already contains references to the hammer gesture
    // config token and the gesture config, we naively assume that the gesture config is
    // already set up. We only want to add the gesture config provider if it is not set up.
    if (!providerIdentifiers ||
        !(this._hammerConfigTokenReferences.some(r => providerIdentifiers.includes(r.node)) &&
          this._gestureConfigReferences.some(r => providerIdentifiers.includes(r.node)))) {
      addSymbolToNgModuleMetadata(
          sourceFile, relativePath, 'providers', this._printNode(newProviderNode, sourceFile), null)
          .forEach(change => {
            if (change instanceof InsertChange) {
              recorder.insertRight(change.pos, change.toAdd);
            }
          });
    }
  }

  /**
   * Gets the TypeScript symbol of the root module by looking for the module
   * bootstrap expression in the specified source file.
   */
  private _getRootModuleSymbol(mainFilePath: string): ts.Symbol|null {
    const mainFile = this.program.getSourceFile(mainFilePath);
    if (!mainFile) {
      return null;
    }

    const appModuleExpr = findMainModuleExpression(mainFile);
    if (!appModuleExpr) {
      return null;
    }

    const appModuleSymbol = this._getDeclarationSymbolOfNode(unwrapExpression(appModuleExpr));
    if (!appModuleSymbol || !appModuleSymbol.valueDeclaration) {
      return null;
    }
    return appModuleSymbol;
  }

  /** Sets up the "HammerModule" in the root module of the current project. */
  private _setupHammerModuleInRootModule() {
    const {workspaceFsPath, project} = this.context;
    const mainFilePath = join(workspaceFsPath, getProjectMainFile(project));
    const rootModuleSymbol = this._getRootModuleSymbol(mainFilePath);

    if (rootModuleSymbol === null) {
      this.failures.push({
        filePath: mainFilePath,
        message: `Could not setup HammerModule. Please manually set up the "HammerModule" ` +
            `from "@angular/platform-browser".`,
      });
      return;
    }

    const sourceFile = rootModuleSymbol.valueDeclaration.getSourceFile();
    const relativePath = relative(workspaceFsPath, sourceFile.fileName);
    const metadata = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core') as
        ts.ObjectLiteralExpression[];
    if (!metadata.length) {
      return;
    }

    const importsField = getMetadataField(metadata[0], 'imports')[0];
    const importIdentifiers =
        importsField ? findMatchingChildNodes(importsField, ts.isIdentifier) : null;
    const recorder = this.fileSystem.edit(sourceFile.fileName);
    const hammerModuleExpr = this._importManager.addImportToSourceFile(
        sourceFile, HAMMER_MODULE_NAME, HAMMER_MODULE_IMPORT);

    // If the "HammerModule" is not already imported in the app module, we set it up
    // by adding it to the "imports" field of the app module.
    if (!importIdentifiers ||
        !this._hammerModuleReferences.some(r => importIdentifiers.includes(r.node))) {
      addSymbolToNgModuleMetadata(
          sourceFile, relativePath, 'imports', this._printNode(hammerModuleExpr, sourceFile), null)
          .forEach(change => {
            if (change instanceof InsertChange) {
              recorder.insertRight(change.pos, change.toAdd);
            }
          });
    }
  }

  /** Prints a given node within the specified source file. */
  private _printNode(node: ts.Node, sourceFile: ts.SourceFile): string {
    return this._printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  }

  /** Gets all referenced gesture config identifiers of a given source file */
  private _getGestureConfigIdentifiersOfFile(sourceFile: ts.SourceFile): ts.Identifier[] {
    return this._gestureConfigReferences.filter(d => d.node.getSourceFile() === sourceFile)
        .map(d => d.node);
  }

  /** Gets the symbol that contains the value declaration of the specified node. */
  private _getDeclarationSymbolOfNode(node: ts.Node): ts.Symbol|undefined {
    const symbol = this.typeChecker.getSymbolAtLocation(node);

    // Symbols can be aliases of the declaration symbol. e.g. in named import specifiers.
    // We need to resolve the aliased symbol back to the declaration symbol.
    // tslint:disable-next-line:no-bitwise
    if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
      return this.typeChecker.getAliasedSymbol(symbol);
    }
    return symbol;
  }

  /**
   * Checks whether the given expression resolves to a hammer gesture config
   * token reference from "@angular/platform-browser".
   */
  private _isReferenceToHammerConfigToken(expr: ts.Expression) {
    const unwrapped = unwrapExpression(expr);
    if (ts.isIdentifier(unwrapped)) {
      return this._hammerConfigTokenReferences.some(r => r.node === unwrapped);
    } else if (ts.isPropertyAccessExpression(unwrapped)) {
      return this._hammerConfigTokenReferences.some(r => r.node === unwrapped.name);
    }
    return false;
  }

  /**
   * Creates migration failures of the collected node failures. The returned migration
   * failures are updated to reflect the post-migration state of source files. Meaning
   * that failure positions are corrected if source file modifications shifted lines.
   */
  private _createMigrationFailures(): MigrationFailure[] {
    return this._nodeFailures.map(({node, message}) => {
      const sourceFile = node.getSourceFile();
      const offset = node.getStart();
      const position = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
      return {
        position: this._importManager.correctNodePosition(node, offset, position),
        message: message,
        filePath: sourceFile.fileName,
      };
    });
  }

  /** Global state of whether Hammer is used in any analyzed project target. */
  static globalUsesHammer = false;

  /**
   * Static migration rule method that will be called once all project targets
   * have been migrated individually. This method can be used to make changes based
   * on the analysis of the individual targets. For example: we only remove Hammer
   * from the "package.json" if it is not used in *any* project target.
   */
  static globalPostMigration(tree: Tree, context: SchematicContext): PostMigrationAction {
    // Always notify the developer that the Hammer v9 migration does not migrate tests.
    context.logger.info(
        '\n⚠  General notice: The HammerJS v9 migration for Angular Components is not able to ' +
        'migrate tests. Please manually clean up tests in your project if they rely on ' +
        (this.globalUsesHammer ? 'the deprecated Angular Material gesture config.' : 'HammerJS.'));
    context.logger.info(
        'Read more about migrating tests: https://git.io/ng-material-v9-hammer-migrate-tests');

    if (!this.globalUsesHammer && this._removeHammerFromPackageJson(tree)) {
      // Since Hammer has been removed from the workspace "package.json" file,
      // we schedule a node package install task to refresh the lock file.
      return {runPackageManager: true};
    }

    // Clean global state once the workspace has been migrated. This is technically
    // not necessary in "ng update", but in tests we re-use the same rule class.
    this.globalUsesHammer = false;
  }

  /**
   * Removes the hammer package from the workspace "package.json".
   * @returns Whether Hammer was set up and has been removed from the "package.json"
   */
  private static _removeHammerFromPackageJson(tree: Tree): boolean {
    if (!tree.exists('/package.json')) {
      return false;
    }

    const packageJson = JSON.parse(tree.read('/package.json')!.toString('utf8'));

    // We do not handle the case where someone manually added "hammerjs" to the dev dependencies.
    if (packageJson.dependencies && packageJson.dependencies[HAMMER_MODULE_SPECIFIER]) {
      delete packageJson.dependencies[HAMMER_MODULE_SPECIFIER];
      tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));
      return true;
    }
    return false;
  }
}

/**
 * Recursively unwraps a given expression if it is wrapped
 * by parenthesis, type casts or type assertions.
 */
function unwrapExpression(node: ts.Node): ts.Node {
  if (ts.isParenthesizedExpression(node)) {
    return unwrapExpression(node.expression);
  } else if (ts.isAsExpression(node)) {
    return unwrapExpression(node.expression);
  } else if (ts.isTypeAssertion(node)) {
    return unwrapExpression(node.expression);
  }
  return node;
}

/**
 * Converts the specified path to a valid TypeScript module specifier which is
 * relative to the given containing file.
 */
function getModuleSpecifier(newPath: string, containingFile: string) {
  let result = relative(dirname(containingFile), newPath).replace(/\\/g, '/').replace(/\.ts$/, '');
  if (!result.startsWith('.')) {
    result = `./${result}`;
  }
  return result;
}

/**
 * Gets the text of the given property name.
 * @returns Text of the given property name. Null if not statically analyzable.
 */
function getPropertyNameText(node: ts.PropertyName): string|null {
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) {
    return node.text;
  }
  return null;
}

/** Checks whether the given identifier is part of a namespaced access. */
function isNamespacedIdentifierAccess(node: ts.Identifier): boolean {
  return ts.isQualifiedName(node.parent) || ts.isPropertyAccessExpression(node.parent);
}

/**
 * Walks through the specified node and returns all child nodes which match the
 * given predicate.
 */
function findMatchingChildNodes<T extends ts.Node>(
    parent: ts.Node, predicate: (node: ts.Node) => node is T): T[] {
  const result: T[] = [];
  const visitNode = (node: ts.Node) => {
    if (predicate(node)) {
      result.push(node);
    }
    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(parent, visitNode);
  return result;
}
