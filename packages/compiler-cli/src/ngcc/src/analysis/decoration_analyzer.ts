/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler';
import * as fs from 'fs';
import * as ts from 'typescript';

import {BaseDefDecoratorHandler, ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, PipeDecoratorHandler, ResourceLoader, SelectorScopeRegistry} from '../../../ngtsc/annotations';
import {CompileResult, DecoratorHandler} from '../../../ngtsc/transform';

import {DecoratedClass} from '../host/decorated_class';
import {DecoratedFile} from '../host/decorated_file';
import {NgccReflectionHost} from '../host/ngcc_host';
import {isDefined} from '../utils';

export interface AnalyzedClass<A = any, M = any> extends DecoratedClass {
  handler: DecoratorHandler<A, M>;
  analysis: any;
  diagnostics?: ts.Diagnostic[];
  compilation: CompileResult[];
}

export interface DecorationAnalysis {
  analyzedClasses: AnalyzedClass[];
  sourceFile: ts.SourceFile;
  constantPool: ConstantPool;
}

export type DecorationAnalyses = Map<ts.SourceFile, DecorationAnalysis>;
export const DecorationAnalyses = Map;

export interface MatchingHandler<A, M> {
  handler: DecoratorHandler<A, M>;
  match: M;
}

/**
 * `ResourceLoader` which directly uses the filesystem to resolve resources synchronously.
 */
export class FileResourceLoader implements ResourceLoader {
  load(url: string): string { return fs.readFileSync(url, 'utf8'); }
}

/**
 * This Analyzer will analyze the files that have decorated classes that need to be transformed.
 */
export class DecorationAnalyzer {
  resourceLoader = new FileResourceLoader();
  scopeRegistry = new SelectorScopeRegistry(this.typeChecker, this.host);
  handlers: DecoratorHandler<any, any>[] = [
    new BaseDefDecoratorHandler(this.typeChecker, this.host),
    new ComponentDecoratorHandler(
        this.typeChecker, this.host, this.scopeRegistry, this.isCore, this.resourceLoader,
        this.rootDirs),
    new DirectiveDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, this.isCore),
    new InjectableDecoratorHandler(this.host, this.isCore),
    new NgModuleDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, this.isCore),
    new PipeDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, this.isCore),
  ];

  constructor(
      private typeChecker: ts.TypeChecker, private host: NgccReflectionHost,
      private rootDirs: string[], private isCore: boolean) {}

  /**
   * Analyze a program to find all the decorated files should be transformed.
   * @param program The program whose files should be analysed.
   * @returns a map of the source files to the analysis for those files.
   */
  analyzeProgram(program: ts.Program): DecorationAnalyses {
    const analyzedFiles = new DecorationAnalyses();
    program.getRootFileNames().forEach(fileName => {
      const entryPoint = program.getSourceFile(fileName) !;
      const decoratedFiles = this.host.findDecoratedFiles(entryPoint);
      decoratedFiles.forEach(
          decoratedFile =>
              analyzedFiles.set(decoratedFile.sourceFile, this.analyzeFile(decoratedFile)));
    });
    return analyzedFiles;
  }

  /**
   * Analyze a decorated file to generate the information about decorated classes that
   * should be converted to use ivy definitions.
   * @param file The file to be analysed for decorated classes.
   * @returns the analysis of the file
   */
  protected analyzeFile(file: DecoratedFile): DecorationAnalysis {
    const constantPool = new ConstantPool();
    const analyzedClasses =
        file.decoratedClasses.map(clazz => this.analyzeClass(constantPool, clazz))
            .filter(isDefined);

    return {
      analyzedClasses,
      sourceFile: file.sourceFile, constantPool,
    };
  }

  protected analyzeClass(pool: ConstantPool, clazz: DecoratedClass): AnalyzedClass|undefined {
    const matchingHandlers = this.handlers
                                 .map(handler => ({
                                        handler,
                                        match: handler.detect(clazz.declaration, clazz.decorators),
                                      }))
                                 .filter(isMatchingHandler);

    if (matchingHandlers.length > 1) {
      throw new Error('TODO.Diagnostic: Class has multiple Angular decorators.');
    }

    if (matchingHandlers.length === 0) {
      return undefined;
    }

    const {handler, match} = matchingHandlers[0];
    const {analysis, diagnostics} = handler.analyze(clazz.declaration, match);
    let compilation = handler.compile(clazz.declaration, analysis, pool);
    if (!Array.isArray(compilation)) {
      compilation = [compilation];
    }
    return {...clazz, handler, analysis, diagnostics, compilation};
  }
}

function isMatchingHandler<A, M>(handler: Partial<MatchingHandler<A, M>>):
    handler is MatchingHandler<A, M> {
  return !!handler.match;
}
