/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompiler, AotCompilerHost, CompileMetadataResolver, StaticSymbol, StaticSymbolResolver, SummaryResolver} from '@angular/compiler';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';
import * as ts from 'typescript';

import {ImportManager} from '../../utils/import_manager';
import {getAngularDecorators} from '../../utils/ng_decorators';
import {hasExplicitConstructor} from '../../utils/typescript/class_declaration';
import {findBaseClassDeclarations} from '../../utils/typescript/find_base_classes';
import {getImportOfIdentifier} from '../../utils/typescript/imports';

import {convertDirectiveMetadataToExpression, UnexpectedMetadataValueError} from './decorator_rewrite/convert_directive_metadata';
import {DecoratorRewriter} from './decorator_rewrite/decorator_rewriter';
import {hasDirectiveDecorator, hasInjectableDecorator} from './ng_declaration_collector';
import {UpdateRecorder} from './update_recorder';



/** Resolved metadata of a declaration. */
interface DeclarationMetadata {
  metadata: any;
  type: 'Component'|'Directive'|'Pipe';
}

export interface TransformFailure {
  node: ts.Node;
  message: string;
}

export class UndecoratedClassesTransform {
  private printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});
  private importManager = new ImportManager(this.getUpdateRecorder, this.printer);
  private decoratorRewriter =
      new DecoratorRewriter(this.importManager, this.typeChecker, this.evaluator, this.compiler);

  private compilerHost: AotCompilerHost;
  private symbolResolver: StaticSymbolResolver;
  private metadataResolver: CompileMetadataResolver;

  /** Set of class declarations which have been decorated with "@Directive". */
  private decoratedDirectives = new Set<ts.ClassDeclaration>();
  /** Set of class declarations which have been decorated with "@Injectable" */
  private decoratedProviders = new Set<ts.ClassDeclaration>();
  /**
   * Set of class declarations which have been analyzed and need to specify
   * an explicit constructor.
   */
  private missingExplicitConstructorClasses = new Set<ts.ClassDeclaration>();

  constructor(
      private typeChecker: ts.TypeChecker, private compiler: AotCompiler,
      private evaluator: PartialEvaluator,
      private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {
    this.symbolResolver = compiler['_symbolResolver'];
    this.compilerHost = compiler['_host'];
    this.metadataResolver = compiler['_metadataResolver'];

    // Unset the default error recorder so that the reflector will throw an exception
    // if metadata cannot be resolved.
    this.compiler.reflector['errorRecorder'] = undefined;

    // Disables that static symbols are resolved through summaries from within the static
    // reflector. Summaries cannot be used for decorator serialization as decorators are
    // omitted in summaries and the decorator can't be reconstructed from the directive summary.
    this._disableSummaryResolution();
  }

  /**
   * Migrates decorated directives which can potentially inherit a constructor
   * from an undecorated base class. All base classes until the first one
   * with an explicit constructor will be decorated with the abstract "@Directive()"
   * decorator. See case 1 in the migration plan: https://hackmd.io/@alx/S1XKqMZeS
   */
  migrateDecoratedDirectives(directives: ts.ClassDeclaration[]): TransformFailure[] {
    return directives.reduce(
        (failures, node) => failures.concat(this._migrateDirectiveBaseClass(node)),
        [] as TransformFailure[]);
  }

  /**
   * Migrates decorated providers which can potentially inherit a constructor
   * from an undecorated base class. All base classes until the first one
   * with an explicit constructor will be decorated with the "@Injectable()".
   */
  migrateDecoratedProviders(providers: ts.ClassDeclaration[]): TransformFailure[] {
    return providers.reduce(
        (failures, node) => failures.concat(this._migrateProviderBaseClass(node)),
        [] as TransformFailure[]);
  }

  private _migrateProviderBaseClass(node: ts.ClassDeclaration): TransformFailure[] {
    return this._migrateDecoratedClassWithInheritedCtor(
        node, symbol => this.metadataResolver.isInjectable(symbol),
        node => this._addInjectableDecorator(node));
  }

  private _migrateDirectiveBaseClass(node: ts.ClassDeclaration): TransformFailure[] {
    return this._migrateDecoratedClassWithInheritedCtor(
        node, symbol => this.metadataResolver.isDirective(symbol),
        node => this._addAbstractDirectiveDecorator(node));
  }


  private _migrateDecoratedClassWithInheritedCtor(
      node: ts.ClassDeclaration, isClassDecorated: (symbol: StaticSymbol) => boolean,
      addClassDecorator: (node: ts.ClassDeclaration) => void): TransformFailure[] {
    // In case the provider has an explicit constructor, we don't need to do anything
    // because the class is already decorated and does not inherit a constructor.
    if (hasExplicitConstructor(node)) {
      return [];
    }

    const orderedBaseClasses = findBaseClassDeclarations(node, this.typeChecker);
    const undecoratedBaseClasses: ts.ClassDeclaration[] = [];

    for (let {node: baseClass, identifier} of orderedBaseClasses) {
      const baseClassFile = baseClass.getSourceFile();

      if (hasExplicitConstructor(baseClass)) {
        // All classes in between the decorated class and the undecorated class
        // that defines the constructor need to be decorated as well.
        undecoratedBaseClasses.forEach(b => addClassDecorator(b));

        if (baseClassFile.isDeclarationFile) {
          const staticSymbol = this._getStaticSymbolOfIdentifier(identifier);

          // If the base class is decorated through metadata files, we don't
          // need to add a comment to the derived class for the external base class.
          if (staticSymbol && isClassDecorated(staticSymbol)) {
            break;
          }

          // Find the last class in the inheritance chain that is decorated and will be
          // used as anchor for a comment explaining that the class that defines the
          // constructor cannot be decorated automatically.
          const lastDecoratedClass =
              undecoratedBaseClasses[undecoratedBaseClasses.length - 1] || node;
          return this._addMissingExplicitConstructorTodo(lastDecoratedClass);
        }

        // Decorate the class that defines the constructor that is inherited.
        addClassDecorator(baseClass);
        break;
      }

      // Add the class decorator for all base classes in the inheritance chain until
      // the base class with the explicit constructor. The decorator will be only
      // added for base classes which can be modified.
      if (!baseClassFile.isDeclarationFile) {
        undecoratedBaseClasses.push(baseClass);
      }
    }
    return [];
  }

  /**
   * Adds the abstract "@Directive()" decorator to the given class in case there
   * is no existing directive decorator.
   */
  private _addAbstractDirectiveDecorator(baseClass: ts.ClassDeclaration) {
    if (hasDirectiveDecorator(baseClass, this.typeChecker) ||
        this.decoratedDirectives.has(baseClass)) {
      return;
    }

    const baseClassFile = baseClass.getSourceFile();
    const recorder = this.getUpdateRecorder(baseClassFile);
    const directiveExpr =
        this.importManager.addImportToSourceFile(baseClassFile, 'Directive', '@angular/core');

    const newDecorator = ts.createDecorator(ts.createCall(directiveExpr, undefined, []));
    const newDecoratorText =
        this.printer.printNode(ts.EmitHint.Unspecified, newDecorator, baseClassFile);

    recorder.addClassDecorator(baseClass, newDecoratorText);
    this.decoratedDirectives.add(baseClass);
  }

  /**
   * Adds the abstract "@Injectable()" decorator to the given class in case there
   * is no existing directive decorator.
   */
  private _addInjectableDecorator(baseClass: ts.ClassDeclaration) {
    if (hasInjectableDecorator(baseClass, this.typeChecker) ||
        this.decoratedProviders.has(baseClass)) {
      return;
    }

    const baseClassFile = baseClass.getSourceFile();
    const recorder = this.getUpdateRecorder(baseClassFile);
    const injectableExpr =
        this.importManager.addImportToSourceFile(baseClassFile, 'Injectable', '@angular/core');

    const newDecorator = ts.createDecorator(ts.createCall(injectableExpr, undefined, []));
    const newDecoratorText =
        this.printer.printNode(ts.EmitHint.Unspecified, newDecorator, baseClassFile);

    recorder.addClassDecorator(baseClass, newDecoratorText);
    this.decoratedProviders.add(baseClass);
  }

  /** Adds a comment for adding an explicit constructor to the given class declaration. */
  private _addMissingExplicitConstructorTodo(node: ts.ClassDeclaration): TransformFailure[] {
    // In case a todo comment has been already inserted to the given class, we don't
    // want to add a comment or transform failure multiple times.
    if (this.missingExplicitConstructorClasses.has(node)) {
      return [];
    }
    this.missingExplicitConstructorClasses.add(node);
    const recorder = this.getUpdateRecorder(node.getSourceFile());
    recorder.addClassComment(node, 'TODO: add explicit constructor');
    return [{node: node, message: 'Class needs to declare an explicit constructor.'}];
  }

  /**
   * Migrates undecorated directives which were referenced in NgModule declarations.
   * These directives inherit the metadata from a parent base class, but with Ivy
   * these classes need to explicitly have a decorator for locality. The migration
   * determines the inherited decorator and copies it to the undecorated declaration.
   *
   * Note that the migration serializes the metadata for external declarations
   * where the decorator is not part of the source file AST.
   *
   * See case 2 in the migration plan: https://hackmd.io/@alx/S1XKqMZeS
   */
  migrateUndecoratedDeclarations(directives: ts.ClassDeclaration[]): TransformFailure[] {
    return directives.reduce(
        (failures, node) => failures.concat(this._migrateDerivedDeclaration(node)),
        [] as TransformFailure[]);
  }

  private _migrateDerivedDeclaration(node: ts.ClassDeclaration): TransformFailure[] {
    const targetSourceFile = node.getSourceFile();
    const orderedBaseClasses = findBaseClassDeclarations(node, this.typeChecker);
    let newDecoratorText: string|null = null;

    for (let {node: baseClass, identifier} of orderedBaseClasses) {
      // Before looking for decorators within the metadata or summary files, we
      // try to determine the directive decorator through the source file AST.
      if (baseClass.decorators) {
        const ngDecorator =
            getAngularDecorators(this.typeChecker, baseClass.decorators)
                .find(({name}) => name === 'Component' || name === 'Directive' || name === 'Pipe');

        if (ngDecorator) {
          const newDecorator = this.decoratorRewriter.rewrite(ngDecorator, node.getSourceFile());
          newDecoratorText = this.printer.printNode(
              ts.EmitHint.Unspecified, newDecorator, ngDecorator.node.getSourceFile());
          break;
        }
      }

      // If no metadata could be found within the source-file AST, try to find
      // decorator data through Angular metadata and summary files.
      const staticSymbol = this._getStaticSymbolOfIdentifier(identifier);

      // Check if the static symbol resolves to a class declaration with
      // pipe or directive metadata.
      if (!staticSymbol ||
          !(this.metadataResolver.isPipe(staticSymbol) ||
            this.metadataResolver.isDirective(staticSymbol))) {
        continue;
      }

      const metadata = this._resolveDeclarationMetadata(staticSymbol);

      // If no metadata could be resolved for the static symbol, print a failure message
      // and ask the developer to manually migrate the class. This case is rare because
      // usually decorator metadata is always present but just can't be read if a program
      // only has access to summaries (this is a special case in google3).
      if (!metadata) {
        return [{
          node,
          message: `Class cannot be migrated as the inherited metadata from ` +
              `${identifier.getText()} cannot be converted into a decorator. Please manually
            decorate the class.`,
        }];
      }

      const newDecorator = this._constructDecoratorFromMetadata(metadata, targetSourceFile);
      if (!newDecorator) {
        const annotationType = metadata.type;
        return [{
          node,
          message: `Class cannot be migrated as the inherited @${annotationType} decorator ` +
              `cannot be copied. Please manually add a @${annotationType} decorator.`,
        }];
      }

      // In case the decorator could be constructed from the resolved metadata, use
      // that decorator for the derived undecorated classes.
      newDecoratorText =
          this.printer.printNode(ts.EmitHint.Unspecified, newDecorator, targetSourceFile);
      break;
    }

    if (!newDecoratorText) {
      return [{
        node,
        message:
            'Class cannot be migrated as no directive/component/pipe metadata could be found. ' +
            'Please manually add a @Directive, @Component or @Pipe decorator.'
      }];
    }

    this.getUpdateRecorder(targetSourceFile).addClassDecorator(node, newDecoratorText);
    return [];
  }

  /** Records all changes that were made in the import manager. */
  recordChanges() {
    this.importManager.recordChanges();
  }

  /**
   * Constructs a TypeScript decorator node from the specified declaration metadata. Returns
   * null if the metadata could not be simplified/resolved.
   */
  private _constructDecoratorFromMetadata(
      directiveMetadata: DeclarationMetadata, targetSourceFile: ts.SourceFile): ts.Decorator|null {
    try {
      const decoratorExpr = convertDirectiveMetadataToExpression(
          directiveMetadata.metadata,
          staticSymbol =>
              this.compilerHost
                  .fileNameToModuleName(staticSymbol.filePath, targetSourceFile.fileName)
                  .replace(/\/index$/, ''),
          (moduleName: string, name: string) =>
              this.importManager.addImportToSourceFile(targetSourceFile, name, moduleName),
          (propertyName, value) => {
            // Only normalize properties called "changeDetection" and "encapsulation"
            // for "@Directive" and "@Component" annotations.
            if (directiveMetadata.type === 'Pipe') {
              return null;
            }

            // Instead of using the number as value for the "changeDetection" and
            // "encapsulation" properties, we want to use the actual enum symbols.
            if (propertyName === 'changeDetection' && typeof value === 'number') {
              return ts.createPropertyAccess(
                  this.importManager.addImportToSourceFile(
                      targetSourceFile, 'ChangeDetectionStrategy', '@angular/core'),
                  ChangeDetectionStrategy[value]);
            } else if (propertyName === 'encapsulation' && typeof value === 'number') {
              return ts.createPropertyAccess(
                  this.importManager.addImportToSourceFile(
                      targetSourceFile, 'ViewEncapsulation', '@angular/core'),
                  ViewEncapsulation[value]);
            }
            return null;
          });

      return ts.createDecorator(ts.createCall(
          this.importManager.addImportToSourceFile(
              targetSourceFile, directiveMetadata.type, '@angular/core'),
          undefined, [decoratorExpr]));
    } catch (e) {
      if (e instanceof UnexpectedMetadataValueError) {
        return null;
      }
      throw e;
    }
  }

  /**
   * Resolves the declaration metadata of a given static symbol. The metadata
   * is determined by resolving metadata for the static symbol.
   */
  private _resolveDeclarationMetadata(symbol: StaticSymbol): null|DeclarationMetadata {
    try {
      // Note that this call can throw if the metadata is not computable. In that
      // case we are not able to serialize the metadata into a decorator and we return
      // null.
      const annotations = this.compiler.reflector.annotations(symbol).find(
          s => s.ngMetadataName === 'Component' || s.ngMetadataName === 'Directive' ||
              s.ngMetadataName === 'Pipe');

      if (!annotations) {
        return null;
      }

      const {ngMetadataName, ...metadata} = annotations;

      // Delete the "ngMetadataName" property as we don't want to generate
      // a property assignment in the new decorator for that internal property.
      delete metadata['ngMetadataName'];

      return {type: ngMetadataName, metadata};
    } catch (e) {
      return null;
    }
  }

  private _getStaticSymbolOfIdentifier(node: ts.Identifier): StaticSymbol|null {
    const sourceFile = node.getSourceFile();
    const resolvedImport = getImportOfIdentifier(this.typeChecker, node);

    if (!resolvedImport) {
      return null;
    }

    const moduleName =
        this.compilerHost.moduleNameToFileName(resolvedImport.importModule, sourceFile.fileName);

    if (!moduleName) {
      return null;
    }

    // Find the declaration symbol as symbols could be aliased due to
    // metadata re-exports.
    return this.compiler.reflector.findSymbolDeclaration(
        this.symbolResolver.getStaticSymbol(moduleName, resolvedImport.name));
  }

  /**
   * Disables that static symbols are resolved through summaries. Summaries
   * cannot be used for decorator analysis as decorators are omitted in summaries.
   */
  private _disableSummaryResolution() {
    // We never want to resolve symbols through summaries. Summaries never contain
    // decorators for class symbols and therefore summaries will cause every class
    // to be considered as undecorated. See reason for this in: "ToJsonSerializer".
    // In order to ensure that metadata is not retrieved through summaries, we
    // need to disable summary resolution, clear previous symbol caches. This way
    // future calls to "StaticReflector#annotations" are based on metadata files.
    this.symbolResolver['_resolveSymbolFromSummary'] = () => null;
    this.symbolResolver['resolvedSymbols'].clear();
    this.symbolResolver['symbolFromFile'].clear();
    this.compiler.reflector['annotationCache'].clear();

    // Original summary resolver used by the AOT compiler.
    const summaryResolver = this.symbolResolver['summaryResolver'];

    // Additionally we need to ensure that no files are treated as "library" files when
    // resolving metadata. This is necessary because by default the symbol resolver discards
    // class metadata for library files. See "StaticSymbolResolver#createResolvedSymbol".
    // Patching this function **only** for the static symbol resolver ensures that metadata
    // is not incorrectly omitted. Note that we only want to do this for the symbol resolver
    // because otherwise we could break the summary loading logic which is used to detect
    // if a static symbol is either a directive, component or pipe (see MetadataResolver).
    this.symbolResolver['summaryResolver'] = <SummaryResolver<StaticSymbol>>{
      fromSummaryFileName: summaryResolver.fromSummaryFileName.bind(summaryResolver),
      addSummary: summaryResolver.addSummary.bind(summaryResolver),
      getImportAs: summaryResolver.getImportAs.bind(summaryResolver),
      getKnownModuleName: summaryResolver.getKnownModuleName.bind(summaryResolver),
      resolveSummary: summaryResolver.resolveSummary.bind(summaryResolver),
      toSummaryFileName: summaryResolver.toSummaryFileName.bind(summaryResolver),
      getSymbolsOf: summaryResolver.getSymbolsOf.bind(summaryResolver),
      isLibraryFile: () => false,
    };
  }
}
