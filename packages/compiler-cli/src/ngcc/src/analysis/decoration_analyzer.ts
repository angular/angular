/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler';
import * as path from 'canonical-path';
import * as fs from 'fs';
import * as ts from 'typescript';

import {BaseDefDecoratorHandler, ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, PipeDecoratorHandler, ReferencesRegistry, ResourceLoader} from '../../../ngtsc/annotations';
import {CycleAnalyzer, ImportGraph} from '../../../ngtsc/cycles';
import {AbsoluteModuleStrategy, LocalIdentifierStrategy, LogicalProjectStrategy, ModuleResolver, ReferenceEmitter} from '../../../ngtsc/imports';
import {PartialEvaluator} from '../../../ngtsc/partial_evaluator';
import {AbsoluteFsPath, LogicalFileSystem} from '../../../ngtsc/path';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from '../../../ngtsc/scope';
import {CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence} from '../../../ngtsc/transform';
import {DecoratedClass} from '../host/decorated_class';
import {NgccReflectionHost} from '../host/ngcc_host';
import {isDefined} from '../utils';

export interface AnalyzedFile {
  sourceFile: ts.SourceFile;
  analyzedClasses: AnalyzedClass[];
}

export interface AnalyzedClass extends DecoratedClass {
  diagnostics?: ts.Diagnostic[];
  matches: {handler: DecoratorHandler<any, any>; analysis: any;}[];
}

export interface CompiledClass extends AnalyzedClass { compilation: CompileResult[]; }

export interface CompiledFile {
  compiledClasses: CompiledClass[];
  sourceFile: ts.SourceFile;
  constantPool: ConstantPool;
}

export type DecorationAnalyses = Map<ts.SourceFile, CompiledFile>;
export const DecorationAnalyses = Map;

export interface MatchingHandler<A, M> {
  handler: DecoratorHandler<A, M>;
  detected: M;
}

/**
 * Simple class that resolves and loads files directly from the filesystem.
 */
class NgccResourceLoader implements ResourceLoader {
  canPreload = false;
  preload(): undefined|Promise<void> { throw new Error('Not implemented.'); }
  load(url: string): string { return fs.readFileSync(url, 'utf8'); }
  resolve(url: string, containingFile: string): string {
    return path.resolve(path.dirname(containingFile), url);
  }
}

/**
 * This Analyzer will analyze the files that have decorated classes that need to be transformed.
 */
export class DecorationAnalyzer {
  resourceManager = new NgccResourceLoader();
  refEmitter = new ReferenceEmitter([
    new LocalIdentifierStrategy(),
    new AbsoluteModuleStrategy(this.program, this.typeChecker, this.options, this.host),
    // TODO(alxhub): there's no reason why ngcc needs the "logical file system" logic here, as ngcc
    // projects only ever have one rootDir. Instead, ngcc should just switch its emitted imort based
    // on whether a bestGuessOwningModule is present in the Reference.
    new LogicalProjectStrategy(this.typeChecker, new LogicalFileSystem(this.rootDirs)),
  ]);
  dtsModuleScopeResolver = new MetadataDtsModuleScopeResolver(
      this.typeChecker, this.reflectionHost, /* aliasGenerator */ null);
  scopeRegistry = new LocalModuleScopeRegistry(
      this.dtsModuleScopeResolver, this.refEmitter, /* aliasGenerator */ null);
  evaluator = new PartialEvaluator(this.reflectionHost, this.typeChecker);
  moduleResolver = new ModuleResolver(this.program, this.options, this.host);
  importGraph = new ImportGraph(this.moduleResolver);
  cycleAnalyzer = new CycleAnalyzer(this.importGraph);
  handlers: DecoratorHandler<any, any>[] = [
    new BaseDefDecoratorHandler(this.reflectionHost, this.evaluator),
    new ComponentDecoratorHandler(
        this.reflectionHost, this.evaluator, this.scopeRegistry, this.isCore, this.resourceManager,
        this.rootDirs, /* defaultPreserveWhitespaces */ false, /* i18nUseExternalIds */ true,
        this.moduleResolver, this.cycleAnalyzer, this.refEmitter),
    new DirectiveDecoratorHandler(
        this.reflectionHost, this.evaluator, this.scopeRegistry, this.isCore),
    new InjectableDecoratorHandler(this.reflectionHost, this.isCore, /* strictCtorDeps */ false),
    new NgModuleDecoratorHandler(
        this.reflectionHost, this.evaluator, this.scopeRegistry, this.referencesRegistry,
        this.isCore, /* routeAnalyzer */ null, this.refEmitter),
    new PipeDecoratorHandler(this.reflectionHost, this.evaluator, this.scopeRegistry, this.isCore),
  ];

  constructor(
      private program: ts.Program, private options: ts.CompilerOptions,
      private host: ts.CompilerHost, private typeChecker: ts.TypeChecker,
      private reflectionHost: NgccReflectionHost, private referencesRegistry: ReferencesRegistry,
      private rootDirs: AbsoluteFsPath[], private isCore: boolean) {}

  /**
   * Analyze a program to find all the decorated files should be transformed.
   *
   * @returns a map of the source files to the analysis for those files.
   */
  analyzeProgram(): DecorationAnalyses {
    const decorationAnalyses = new DecorationAnalyses();
    const analysedFiles = this.program.getSourceFiles()
                              .map(sourceFile => this.analyzeFile(sourceFile))
                              .filter(isDefined);
    const compiledFiles = analysedFiles.map(analysedFile => this.compileFile(analysedFile));
    compiledFiles.forEach(
        compiledFile => decorationAnalyses.set(compiledFile.sourceFile, compiledFile));
    return decorationAnalyses;
  }

  protected analyzeFile(sourceFile: ts.SourceFile): AnalyzedFile|undefined {
    const decoratedClasses = this.reflectionHost.findDecoratedClasses(sourceFile);
    return decoratedClasses.length ? {
      sourceFile,
      analyzedClasses: decoratedClasses.map(clazz => this.analyzeClass(clazz)).filter(isDefined)
    } :
                                     undefined;
  }

  protected analyzeClass(clazz: DecoratedClass): AnalyzedClass|null {
    const matchingHandlers = this.handlers
                                 .map(handler => {
                                   const detected =
                                       handler.detect(clazz.declaration, clazz.decorators);
                                   return {handler, detected};
                                 })
                                 .filter(isMatchingHandler);

    if (matchingHandlers.length === 0) {
      return null;
    }
    const detections: {handler: DecoratorHandler<any, any>, detected: DetectResult<any>}[] = [];
    let hasWeakHandler: boolean = false;
    let hasNonWeakHandler: boolean = false;
    let hasPrimaryHandler: boolean = false;

    for (const {handler, detected} of matchingHandlers) {
      if (hasNonWeakHandler && handler.precedence === HandlerPrecedence.WEAK) {
        continue;
      } else if (hasWeakHandler && handler.precedence !== HandlerPrecedence.WEAK) {
        // Clear all the WEAK handlers from the list of matches.
        detections.length = 0;
      }
      if (hasPrimaryHandler && handler.precedence === HandlerPrecedence.PRIMARY) {
        throw new Error(`TODO.Diagnostic: Class has multiple incompatible Angular decorators.`);
      }

      detections.push({handler, detected});
      if (handler.precedence === HandlerPrecedence.WEAK) {
        hasWeakHandler = true;
      } else if (handler.precedence === HandlerPrecedence.SHARED) {
        hasNonWeakHandler = true;
      } else if (handler.precedence === HandlerPrecedence.PRIMARY) {
        hasNonWeakHandler = true;
        hasPrimaryHandler = true;
      }
    }

    const matches: {handler: DecoratorHandler<any, any>, analysis: any}[] = [];
    const allDiagnostics: ts.Diagnostic[] = [];
    for (const {handler, detected} of detections) {
      const {analysis, diagnostics} = handler.analyze(clazz.declaration, detected.metadata);
      if (diagnostics !== undefined) {
        allDiagnostics.push(...diagnostics);
      }
      matches.push({handler, analysis});
    }
    return {...clazz, matches, diagnostics: allDiagnostics.length > 0 ? allDiagnostics : undefined};
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
}

function isMatchingHandler<A, M>(handler: Partial<MatchingHandler<A, M>>):
    handler is MatchingHandler<A, M> {
  return !!handler.detected;
}
