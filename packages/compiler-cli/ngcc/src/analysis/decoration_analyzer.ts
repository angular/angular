/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler';
import * as ts from 'typescript';
import {BaseDefDecoratorHandler, ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, PipeDecoratorHandler, ReferencesRegistry, ResourceLoader} from '../../../src/ngtsc/annotations';
import {CycleAnalyzer, ImportGraph} from '../../../src/ngtsc/cycles';
import {isFatalDiagnosticError} from '../../../src/ngtsc/diagnostics';
import {FileSystem, LogicalFileSystem, absoluteFrom, dirname, resolve} from '../../../src/ngtsc/file_system';
import {AbsoluteModuleStrategy, LocalIdentifierStrategy, LogicalProjectStrategy, ModuleResolver, NOOP_DEFAULT_IMPORT_RECORDER, ReferenceEmitter} from '../../../src/ngtsc/imports';
import {CompoundMetadataReader, CompoundMetadataRegistry, DtsMetadataReader, LocalMetadataRegistry} from '../../../src/ngtsc/metadata';
import {PartialEvaluator} from '../../../src/ngtsc/partial_evaluator';
import {ClassSymbol} from '../../../src/ngtsc/reflection';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from '../../../src/ngtsc/scope';
import {CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence} from '../../../src/ngtsc/transform';
import {NgccReflectionHost} from '../host/ngcc_host';
import {Migration, MigrationHost} from '../migrations/migration';
import {EntryPointBundle} from '../packages/entry_point_bundle';
import {isDefined} from '../utils';
import {DefaultMigrationHost} from './migration_host';
import {AnalyzedClass, AnalyzedFile, CompiledClass, CompiledFile, DecorationAnalyses} from './types';
import {analyzeDecorators, isWithinPackage} from './util';

/**
 * Simple class that resolves and loads files directly from the filesystem.
 */
class NgccResourceLoader implements ResourceLoader {
  constructor(private fs: FileSystem) {}
  canPreload = false;
  preload(): undefined|Promise<void> { throw new Error('Not implemented.'); }
  load(url: string): string { return this.fs.readFile(resolve(url)); }
  resolve(url: string, containingFile: string): string {
    return resolve(dirname(absoluteFrom(containingFile)), url);
  }
}

/**
 * This Analyzer will analyze the files that have decorated classes that need to be transformed.
 */
export class DecorationAnalyzer {
  private program = this.bundle.src.program;
  private options = this.bundle.src.options;
  private host = this.bundle.src.host;
  private typeChecker = this.bundle.src.program.getTypeChecker();
  private rootDirs = this.bundle.rootDirs;
  private packagePath = this.bundle.entryPoint.package;
  private isCore = this.bundle.isCore;
  resourceManager = new NgccResourceLoader(this.fs);
  metaRegistry = new LocalMetadataRegistry();
  dtsMetaReader = new DtsMetadataReader(this.typeChecker, this.reflectionHost);
  fullMetaReader = new CompoundMetadataReader([this.metaRegistry, this.dtsMetaReader]);
  refEmitter = new ReferenceEmitter([
    new LocalIdentifierStrategy(),
    new AbsoluteModuleStrategy(
        this.program, this.typeChecker, this.options, this.host, this.reflectionHost),
    // TODO(alxhub): there's no reason why ngcc needs the "logical file system" logic here, as ngcc
    // projects only ever have one rootDir. Instead, ngcc should just switch its emitted import
    // based on whether a bestGuessOwningModule is present in the Reference.
    new LogicalProjectStrategy(this.typeChecker, new LogicalFileSystem(this.rootDirs)),
  ]);
  dtsModuleScopeResolver =
      new MetadataDtsModuleScopeResolver(this.dtsMetaReader, /* aliasGenerator */ null);
  scopeRegistry = new LocalModuleScopeRegistry(
      this.metaRegistry, this.dtsModuleScopeResolver, this.refEmitter, /* aliasGenerator */ null);
  fullRegistry = new CompoundMetadataRegistry([this.metaRegistry, this.scopeRegistry]);
  evaluator = new PartialEvaluator(this.reflectionHost, this.typeChecker);
  moduleResolver = new ModuleResolver(this.program, this.options, this.host);
  importGraph = new ImportGraph(this.moduleResolver);
  cycleAnalyzer = new CycleAnalyzer(this.importGraph);
  handlers: DecoratorHandler<any, any>[] = [
    new BaseDefDecoratorHandler(this.reflectionHost, this.evaluator, this.isCore),
    new ComponentDecoratorHandler(
        this.reflectionHost, this.evaluator, this.fullRegistry, this.fullMetaReader,
        this.scopeRegistry, this.isCore, this.resourceManager, this.rootDirs,
        /* defaultPreserveWhitespaces */ false,
        /* i18nUseExternalIds */ true, this.moduleResolver, this.cycleAnalyzer, this.refEmitter,
        NOOP_DEFAULT_IMPORT_RECORDER),
    new DirectiveDecoratorHandler(
        this.reflectionHost, this.evaluator, this.fullRegistry, NOOP_DEFAULT_IMPORT_RECORDER,
        this.isCore),
    new InjectableDecoratorHandler(
        this.reflectionHost, NOOP_DEFAULT_IMPORT_RECORDER, this.isCore,
        /* strictCtorDeps */ false),
    new NgModuleDecoratorHandler(
        this.reflectionHost, this.evaluator, this.fullRegistry, this.scopeRegistry,
        this.referencesRegistry, this.isCore, /* routeAnalyzer */ null, this.refEmitter,
        NOOP_DEFAULT_IMPORT_RECORDER),
    new PipeDecoratorHandler(
        this.reflectionHost, this.evaluator, this.metaRegistry, NOOP_DEFAULT_IMPORT_RECORDER,
        this.isCore),
  ];
  migrations: Migration[] = [];

  constructor(
      private fs: FileSystem, private bundle: EntryPointBundle,
      private reflectionHost: NgccReflectionHost, private referencesRegistry: ReferencesRegistry,
      private diagnosticHandler: (error: ts.Diagnostic) => void = () => {}) {}

  /**
   * Analyze a program to find all the decorated files should be transformed.
   *
   * @returns a map of the source files to the analysis for those files.
   */
  analyzeProgram(): DecorationAnalyses {
    const decorationAnalyses = new DecorationAnalyses();
    const analyzedFiles = this.program.getSourceFiles()
                              .filter(sourceFile => isWithinPackage(this.packagePath, sourceFile))
                              .map(sourceFile => this.analyzeFile(sourceFile))
                              .filter(isDefined);
    const migrationHost = new DefaultMigrationHost(
        this.reflectionHost, this.fullMetaReader, this.evaluator, this.handlers, analyzedFiles);
    analyzedFiles.forEach(analyzedFile => this.migrateFile(migrationHost, analyzedFile));
    analyzedFiles.forEach(analyzedFile => this.resolveFile(analyzedFile));
    const compiledFiles = analyzedFiles.map(analyzedFile => this.compileFile(analyzedFile));
    compiledFiles.forEach(
        compiledFile => decorationAnalyses.set(compiledFile.sourceFile, compiledFile));
    return decorationAnalyses;
  }

  protected analyzeFile(sourceFile: ts.SourceFile): AnalyzedFile|undefined {
    const analyzedClasses = this.reflectionHost.findClassSymbols(sourceFile)
                                .map(symbol => this.analyzeClass(symbol))
                                .filter(isDefined);
    return analyzedClasses.length ? {sourceFile, analyzedClasses} : undefined;
  }

  protected analyzeClass(symbol: ClassSymbol): AnalyzedClass|null {
    const decorators = this.reflectionHost.getDecoratorsOfSymbol(symbol);
    return analyzeDecorators(symbol, decorators, this.handlers);
  }

  protected migrateFile(migrationHost: MigrationHost, analyzedFile: AnalyzedFile): void {
    analyzedFile.analyzedClasses.forEach(({declaration}) => {
      this.migrations.forEach(migration => {
        try {
          const result = migration.apply(declaration, migrationHost);
          if (result !== null) {
            this.diagnosticHandler(result);
          }
        } catch (e) {
          if (isFatalDiagnosticError(e)) {
            this.diagnosticHandler(e.toDiagnostic());
          } else {
            throw e;
          }
        }
      });
    });
  }

  protected compileFile(analyzedFile: AnalyzedFile): CompiledFile {
    const constantPool = new ConstantPool();
    const compiledClasses: CompiledClass[] = analyzedFile.analyzedClasses.map(analyzedClass => {
      const compilation = this.compileClass(analyzedClass, constantPool);
      return {...analyzedClass, compilation};
    });
    return {constantPool, sourceFile: analyzedFile.sourceFile, compiledClasses};
  }

  protected compileClass(clazz: AnalyzedClass, constantPool: ConstantPool): CompileResult[] {
    const compilations: CompileResult[] = [];
    for (const {handler, analysis} of clazz.matches) {
      const result = handler.compile(clazz.declaration, analysis, constantPool);
      if (Array.isArray(result)) {
        compilations.push(...result);
      } else {
        compilations.push(result);
      }
    }
    return compilations;
  }

  protected resolveFile(analyzedFile: AnalyzedFile): void {
    analyzedFile.analyzedClasses.forEach(({declaration, matches}) => {
      matches.forEach(({handler, analysis}) => {
        if ((handler.resolve !== undefined) && analysis) {
          handler.resolve(declaration, analysis);
        }
      });
    });
  }
}
