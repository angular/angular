import {ComponentDecoratorHandler, DirectiveDecoratorHandler} from '@angular/compiler-cli/src/ngtsc/annotations';
import {AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {AliasGenerator, AliasStrategy, FileToModuleHost, FileToModuleStrategy, LocalIdentifierStrategy, NOOP_DEFAULT_IMPORT_RECORDER, NoopImportRewriter, ReferenceEmitter} from '@angular/compiler-cli/src/ngtsc/imports';
import {IncrementalState} from '@angular/compiler-cli/src/ngtsc/incremental';
import {CompoundMetadataReader, LocalMetadataRegistry} from '@angular/compiler-cli/src/ngtsc/metadata';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {NOOP_PERF_RECORDER} from '@angular/compiler-cli/src/ngtsc/perf';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from '@angular/compiler-cli/src/ngtsc/scope';
import {DecoratorHandler, IvyCompilation} from '@angular/compiler-cli/src/ngtsc/transform';
import {TypeCheckContext, typeCheckFilePath} from '@angular/compiler-cli/src/ngtsc/typecheck';
import {getRootDirs} from '@angular/compiler-cli/src/ngtsc/util/src/typescript';
import {isGeneratedFile} from '@angular/compiler/src/aot/util';
import {CompileMetadataResolver, StaticSymbolResolver} from '@angular/compiler/src/compiler';
import * as ts from 'typescript';

import {ViewEngineDtsMetadataReader} from './metadata';



/**
 * The Ivy Bridge runs the analysis phases of the 'ngtsc' Ivy compiler within the View Engine
 * compiler.
 *
 * The Ivy compiler is based on a `ts.Program`, and does not have too many dependencies. The primary
 * challenge is that .d.ts files will not have been compiled for Ivy, so will be unintelligible to
 * the normal ngtsc `DtsMetadataReader`. To work around this, a `ViewEngineDtsMetadataReader` is
 * substituted, which uses the View Engine metadata system to understand dependencies. With this
 * link made, the ngtsc compiler is able to fully understand a View Engine program.
 */
export class IvyBridge {
  private _compilation: IvyCompilation|null = null;
  private typeCheckContext: TypeCheckContext|null = null;
  private interestingFilesForTypeChecking = new Set<ts.SourceFile>();

  constructor(
      readonly host: ts.CompilerHost, readonly program: ts.Program,
      private symResolver: StaticSymbolResolver, private metaResolver: CompileMetadataResolver,
      private typeCheckFilePath: string|null, private templateTypeChecking = false) {}

  private get compilation(): IvyCompilation {
    if (this._compilation !== null) {
      return this._compilation;
    }

    const checker = this.program.getTypeChecker();
    // Assume google3 for now. This means that the host will have fileNameToModuleName.
    const fileToModuleHost = this.host as unknown as FileToModuleHost;

    const refEmitter = new ReferenceEmitter([
      new LocalIdentifierStrategy(),
      new AliasStrategy(),
      new FileToModuleStrategy(checker, fileToModuleHost),
    ]);
    const aliasGenerator = new AliasGenerator(fileToModuleHost);

    const refHost = new TypeScriptReflectionHost(checker);

    const dtsMetaReader =
        new ViewEngineDtsMetadataReader(this.program, checker, this.symResolver, this.metaResolver);
    const dtsScopeResolver = new MetadataDtsModuleScopeResolver(dtsMetaReader, aliasGenerator);

    const localMetaRegistry = new LocalMetadataRegistry();
    const localScopeRegistry = new LocalModuleScopeRegistry(
        localMetaRegistry, dtsScopeResolver, refEmitter, aliasGenerator);

    const metaReader = new CompoundMetadataReader([localMetaRegistry, dtsMetaReader]);

    const evaluator = new PartialEvaluator(refHost, checker);

    const handlers: DecoratorHandler<any, any>[] = [
      new DirectiveDecoratorHandler(
          refHost, evaluator, metaReader, localMetaRegistry, NOOP_DEFAULT_IMPORT_RECORDER, false),
    ];

    this._compilation = new IvyCompilation(
        handlers, refHost, new NoopImportRewriter(), IncrementalState.fresh(), NOOP_PERF_RECORDER,
        null, localScopeRegistry);

    if (this.templateTypeChecking) {
      const rootDirs = getRootDirs(this.host, this.program.getCompilerOptions());
      this.typeCheckFilePath = typeCheckFilePath(rootDirs);
      this.typeCheckContext = new TypeCheckContext(
          {
            applyTemplateContextGuards: false,
            checkQueries: false,
            checkTemplateBodies: false,
            checkTypeOfBindings: false,
            checkTypeOfPipes: false,
            strictSafeNavigationTypes: false,
          },
          refEmitter, this.typeCheckFilePath as AbsoluteFsPath);
    }
    return this._compilation !;
  }

  private ensureAnalyzed(): void {
    const compilation = this.compilation;
    for (const sf of this.program.getSourceFiles()) {
      if (sf.isDeclarationFile || isGeneratedFile(sf.fileName)) {
        continue;
      }
      compilation.analyzeSync(sf);
    }
    compilation.resolve();

    if (this.typeCheckContext !== null) {
      for (const sf of this.program.getSourceFiles()) {
        if (sf.isDeclarationFile || isGeneratedFile(sf.fileName)) {
          continue;
        }
        compilation.typeCheck(this.typeCheckContext);
      }
    }
  }

  getTsDiagnostics(): readonly ts.Diagnostic[] {
    this.ensureAnalyzed();
    const diagnostics = [...this.compilation.diagnostics];
    if (this.typeCheckContext) {
      diagnostics.push(this.typeCheckContext.calculateTemplateDiagnostics());
    }
    return diagnostics;
  }

  transformFileForTemplateTypeChecking(sf: ts.SourceFile): ts.SourceFile {
    if (this.typeCheckFilePath === null || this.typeCheckContext === null) {
      return sf;
    }
    if (sf.fileName === this.typeCheckFilePath) {
      return this.typeCheckContext.renderTypeCheckFile();
    } else {
      const transformedSf = this.typeCheckContext.transform(sf);
      if (transformedSf !== sf) {
        this.interestingFilesForTypeChecking.add(transformedSf);
      }
      return transformedSf;
    }
  }
}
