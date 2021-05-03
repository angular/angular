/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler';
import {NOOP_PERF_RECORDER} from '@angular/compiler-cli/src/ngtsc/perf';
import * as ts from 'typescript';

import {ParsedConfiguration} from '../../..';
import {ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, PipeDecoratorHandler, ReferencesRegistry, ResourceLoader} from '../../../src/ngtsc/annotations';
import {CycleAnalyzer, CycleHandlingStrategy, ImportGraph} from '../../../src/ngtsc/cycles';
import {isFatalDiagnosticError} from '../../../src/ngtsc/diagnostics';
import {absoluteFromSourceFile, LogicalFileSystem, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {AbsoluteModuleStrategy, LocalIdentifierStrategy, LogicalProjectStrategy, ModuleResolver, PrivateExportAliasingHost, Reexport, ReferenceEmitter} from '../../../src/ngtsc/imports';
import {SemanticSymbol} from '../../../src/ngtsc/incremental/semantic_graph';
import {CompoundMetadataReader, CompoundMetadataRegistry, DtsMetadataReader, InjectableClassRegistry, LocalMetadataRegistry, ResourceRegistry} from '../../../src/ngtsc/metadata';
import {PartialEvaluator} from '../../../src/ngtsc/partial_evaluator';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver, TypeCheckScopeRegistry} from '../../../src/ngtsc/scope';
import {DecoratorHandler} from '../../../src/ngtsc/transform';
import {NgccReflectionHost} from '../host/ngcc_host';
import {Migration} from '../migrations/migration';
import {MissingInjectableMigration} from '../migrations/missing_injectable_migration';
import {UndecoratedChildMigration} from '../migrations/undecorated_child_migration';
import {UndecoratedParentMigration} from '../migrations/undecorated_parent_migration';
import {EntryPointBundle} from '../packages/entry_point_bundle';

import {DefaultMigrationHost} from './migration_host';
import {NgccTraitCompiler} from './ngcc_trait_compiler';
import {CompiledClass, CompiledFile, DecorationAnalyses} from './types';
import {isWithinPackage, NOOP_DEPENDENCY_TRACKER} from './util';



/**
 * Simple class that resolves and loads files directly from the filesystem.
 */
class NgccResourceLoader implements ResourceLoader {
  constructor(private fs: ReadonlyFileSystem) {}
  canPreload = false;
  canPreprocess = false;
  preload(): undefined|Promise<void> {
    throw new Error('Not implemented.');
  }
  preprocessInline(): Promise<string> {
    throw new Error('Not implemented.');
  }
  load(url: string): string {
    return this.fs.readFile(this.fs.resolve(url));
  }
  resolve(url: string, containingFile: string): string {
    return this.fs.resolve(this.fs.dirname(containingFile), url);
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
  private packagePath = this.bundle.entryPoint.packagePath;
  private isCore = this.bundle.isCore;
  private compilerOptions = this.tsConfig !== null ? this.tsConfig.options : {};

  moduleResolver =
      new ModuleResolver(this.program, this.options, this.host, /* moduleResolutionCache */ null);
  resourceManager = new NgccResourceLoader(this.fs);
  metaRegistry = new LocalMetadataRegistry();
  dtsMetaReader = new DtsMetadataReader(this.typeChecker, this.reflectionHost);
  fullMetaReader = new CompoundMetadataReader([this.metaRegistry, this.dtsMetaReader]);
  refEmitter = new ReferenceEmitter([
    new LocalIdentifierStrategy(),
    new AbsoluteModuleStrategy(
        this.program, this.typeChecker, this.moduleResolver, this.reflectionHost),
    // TODO(alxhub): there's no reason why ngcc needs the "logical file system" logic here, as ngcc
    // projects only ever have one rootDir. Instead, ngcc should just switch its emitted import
    // based on whether a bestGuessOwningModule is present in the Reference.
    new LogicalProjectStrategy(
        this.reflectionHost, new LogicalFileSystem(this.rootDirs, this.host)),
  ]);
  aliasingHost = this.bundle.entryPoint.generateDeepReexports ?
      new PrivateExportAliasingHost(this.reflectionHost) :
      null;
  dtsModuleScopeResolver =
      new MetadataDtsModuleScopeResolver(this.dtsMetaReader, this.aliasingHost);
  scopeRegistry = new LocalModuleScopeRegistry(
      this.metaRegistry, this.dtsModuleScopeResolver, this.refEmitter, this.aliasingHost);
  fullRegistry = new CompoundMetadataRegistry([this.metaRegistry, this.scopeRegistry]);
  evaluator =
      new PartialEvaluator(this.reflectionHost, this.typeChecker, /* dependencyTracker */ null);
  importGraph = new ImportGraph(this.typeChecker, NOOP_PERF_RECORDER);
  cycleAnalyzer = new CycleAnalyzer(this.importGraph);
  injectableRegistry = new InjectableClassRegistry(this.reflectionHost);
  typeCheckScopeRegistry = new TypeCheckScopeRegistry(this.scopeRegistry, this.fullMetaReader);
  handlers: DecoratorHandler<unknown, unknown, SemanticSymbol|null, unknown>[] = [
    new ComponentDecoratorHandler(
        this.reflectionHost, this.evaluator, this.fullRegistry, this.fullMetaReader,
        this.scopeRegistry, this.scopeRegistry, this.typeCheckScopeRegistry, new ResourceRegistry(),
        this.isCore, this.resourceManager, this.rootDirs,
        !!this.compilerOptions.preserveWhitespaces,
        /* i18nUseExternalIds */ true, this.bundle.enableI18nLegacyMessageIdFormat,
        /* usePoisonedData */ false,
        /* i18nNormalizeLineEndingsInICUs */ false, this.moduleResolver, this.cycleAnalyzer,
        CycleHandlingStrategy.UseRemoteScoping, this.refEmitter, NOOP_DEPENDENCY_TRACKER,
        this.injectableRegistry,
        /* semanticDepGraphUpdater */ null, !!this.compilerOptions.annotateForClosureCompiler,
        NOOP_PERF_RECORDER),

    // See the note in ngtsc about why this cast is needed.
    // clang-format off
    new DirectiveDecoratorHandler(
        this.reflectionHost, this.evaluator, this.fullRegistry, this.scopeRegistry,
        this.fullMetaReader, this.injectableRegistry, this.isCore,
        /* semanticDepGraphUpdater */ null,
        !!this.compilerOptions.annotateForClosureCompiler,
        // In ngcc we want to compile undecorated classes with Angular features. As of
        // version 10, undecorated classes that use Angular features are no longer handled
        // in ngtsc, but we want to ensure compatibility in ngcc for outdated libraries that
        // have not migrated to explicit decorators. See: https://hackmd.io/@alx/ryfYYuvzH.
        /* compileUndecoratedClassesWithAngularFeatures */ true,
        NOOP_PERF_RECORDER
    ) as DecoratorHandler<unknown, unknown, SemanticSymbol|null,unknown>,
    // clang-format on
    // Pipe handler must be before injectable handler in list so pipe factories are printed
    // before injectable factories (so injectable factories can delegate to them)
    new PipeDecoratorHandler(
        this.reflectionHost, this.evaluator, this.metaRegistry, this.scopeRegistry,
        this.injectableRegistry, this.isCore, NOOP_PERF_RECORDER),
    new InjectableDecoratorHandler(
        this.reflectionHost, this.isCore,
        /* strictCtorDeps */ false, this.injectableRegistry, NOOP_PERF_RECORDER,
        /* errorOnDuplicateProv */ false),
    new NgModuleDecoratorHandler(
        this.reflectionHost, this.evaluator, this.fullMetaReader, this.fullRegistry,
        this.scopeRegistry, this.referencesRegistry, this.isCore, /* routeAnalyzer */ null,
        this.refEmitter,
        /* factoryTracker */ null, !!this.compilerOptions.annotateForClosureCompiler,
        this.injectableRegistry, NOOP_PERF_RECORDER),
  ];
  compiler = new NgccTraitCompiler(this.handlers, this.reflectionHost);
  migrations: Migration[] = [
    new UndecoratedParentMigration(),
    new UndecoratedChildMigration(),
    new MissingInjectableMigration(),
  ];

  constructor(
      private fs: ReadonlyFileSystem, private bundle: EntryPointBundle,
      private reflectionHost: NgccReflectionHost, private referencesRegistry: ReferencesRegistry,
      private diagnosticHandler: (error: ts.Diagnostic) => void = () => {},
      private tsConfig: ParsedConfiguration|null = null) {}

  /**
   * Analyze a program to find all the decorated files should be transformed.
   *
   * @returns a map of the source files to the analysis for those files.
   */
  analyzeProgram(): DecorationAnalyses {
    for (const sourceFile of this.program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile &&
          isWithinPackage(this.packagePath, absoluteFromSourceFile(sourceFile))) {
        this.compiler.analyzeFile(sourceFile);
      }
    }

    this.applyMigrations();

    this.compiler.resolve();

    this.reportDiagnostics();

    const decorationAnalyses = new DecorationAnalyses();
    for (const analyzedFile of this.compiler.analyzedFiles) {
      const compiledFile = this.compileFile(analyzedFile);
      decorationAnalyses.set(compiledFile.sourceFile, compiledFile);
    }
    return decorationAnalyses;
  }

  protected applyMigrations(): void {
    const migrationHost = new DefaultMigrationHost(
        this.reflectionHost, this.fullMetaReader, this.evaluator, this.compiler,
        this.bundle.entryPoint.path);

    this.migrations.forEach(migration => {
      this.compiler.analyzedFiles.forEach(analyzedFile => {
        const records = this.compiler.recordsFor(analyzedFile);
        if (records === null) {
          throw new Error('Assertion error: file to migrate must have records.');
        }

        records.forEach(record => {
          const addDiagnostic = (diagnostic: ts.Diagnostic) => {
            if (record.metaDiagnostics === null) {
              record.metaDiagnostics = [];
            }
            record.metaDiagnostics.push(diagnostic);
          };

          try {
            const result = migration.apply(record.node, migrationHost);
            if (result !== null) {
              addDiagnostic(result);
            }
          } catch (e) {
            if (isFatalDiagnosticError(e)) {
              addDiagnostic(e.toDiagnostic());
            } else {
              throw e;
            }
          }
        });
      });
    });
  }

  protected reportDiagnostics() {
    this.compiler.diagnostics.forEach(this.diagnosticHandler);
  }

  protected compileFile(sourceFile: ts.SourceFile): CompiledFile {
    const constantPool = new ConstantPool();
    const records = this.compiler.recordsFor(sourceFile);
    if (records === null) {
      throw new Error('Assertion error: file to compile must have records.');
    }

    const compiledClasses: CompiledClass[] = [];

    for (const record of records) {
      const compilation = this.compiler.compile(record.node, constantPool);
      if (compilation === null) {
        continue;
      }

      compiledClasses.push({
        name: record.node.name.text,
        decorators: this.compiler.getAllDecorators(record.node),
        declaration: record.node,
        compilation
      });
    }

    const reexports = this.getReexportsForSourceFile(sourceFile);
    return {constantPool, sourceFile: sourceFile, compiledClasses, reexports};
  }

  private getReexportsForSourceFile(sf: ts.SourceFile): Reexport[] {
    const exportStatements = this.compiler.exportStatements;
    if (!exportStatements.has(sf.fileName)) {
      return [];
    }
    const exports = exportStatements.get(sf.fileName)!;

    const reexports: Reexport[] = [];
    exports.forEach(([fromModule, symbolName], asAlias) => {
      reexports.push({asAlias, fromModule, symbolName});
    });
    return reexports;
  }
}
