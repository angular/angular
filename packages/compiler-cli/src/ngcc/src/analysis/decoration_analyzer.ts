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

import {BaseDefDecoratorHandler, ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, PipeDecoratorHandler, ReferencesRegistry, ResourceLoader, SelectorScopeRegistry} from '../../../ngtsc/annotations';
import {CycleAnalyzer, ImportGraph} from '../../../ngtsc/cycles';
import {ModuleResolver, TsReferenceResolver} from '../../../ngtsc/imports';
import {PartialEvaluator} from '../../../ngtsc/partial_evaluator';
import {CompileResult, DecoratorHandler} from '../../../ngtsc/transform';
import {DecoratedClass} from '../host/decorated_class';
import {NgccReflectionHost} from '../host/ngcc_host';
import {isDefined} from '../utils';

export interface AnalyzedFile {
  sourceFile: ts.SourceFile;
  analyzedClasses: AnalyzedClass[];
}

export interface AnalyzedClass extends DecoratedClass {
  diagnostics?: ts.Diagnostic[];
  handler: DecoratorHandler<any, any>;
  analysis: any;
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
  match: M;
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
  resolver = new TsReferenceResolver(this.program, this.typeChecker, this.options, this.host);
  scopeRegistry = new SelectorScopeRegistry(this.typeChecker, this.reflectionHost, this.resolver);
  evaluator = new PartialEvaluator(this.reflectionHost, this.typeChecker, this.resolver);
  moduleResolver = new ModuleResolver(this.program, this.options, this.host);
  importGraph = new ImportGraph(this.moduleResolver);
  cycleAnalyzer = new CycleAnalyzer(this.importGraph);
  handlers: DecoratorHandler<any, any>[] = [
    new BaseDefDecoratorHandler(this.reflectionHost, this.evaluator),
    new ComponentDecoratorHandler(
        this.reflectionHost, this.evaluator, this.scopeRegistry, this.isCore, this.resourceManager,
        this.rootDirs, /* defaultPreserveWhitespaces */ false, /* i18nUseExternalIds */ true,
        this.moduleResolver, this.cycleAnalyzer),
    new DirectiveDecoratorHandler(
        this.reflectionHost, this.evaluator, this.scopeRegistry, this.isCore),
    new InjectableDecoratorHandler(this.reflectionHost, this.isCore),
    new NgModuleDecoratorHandler(
        this.reflectionHost, this.evaluator, this.scopeRegistry, this.referencesRegistry,
        this.isCore, /* routeAnalyzer */ null),
    new PipeDecoratorHandler(this.reflectionHost, this.evaluator, this.scopeRegistry, this.isCore),
  ];

  constructor(
      private program: ts.Program, private options: ts.CompilerOptions,
      private host: ts.CompilerHost, private typeChecker: ts.TypeChecker,
      private reflectionHost: NgccReflectionHost, private referencesRegistry: ReferencesRegistry,
      private rootDirs: string[], private isCore: boolean) {}

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
                                   const match =
                                       handler.detect(clazz.declaration, clazz.decorators);
                                   return {handler, match};
                                 })
                                 .filter(isMatchingHandler);

    if (matchingHandlers.length > 1) {
      throw new Error('TODO.Diagnostic: Class has multiple Angular decorators.');
    }
    if (matchingHandlers.length === 0) {
      return null;
    }
    const {handler, match} = matchingHandlers[0];
    const {analysis, diagnostics} = handler.analyze(clazz.declaration, match);
    return {...clazz, handler, analysis, diagnostics};
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
    let compilation = clazz.handler.compile(clazz.declaration, clazz.analysis, constantPool);
    if (!Array.isArray(compilation)) {
      compilation = [compilation];
    }
    return compilation;
  }
}

function isMatchingHandler<A, M>(handler: Partial<MatchingHandler<A, M>>):
    handler is MatchingHandler<A, M> {
  return !!handler.match;
}
