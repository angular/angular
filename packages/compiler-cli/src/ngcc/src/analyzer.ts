/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import * as ts from 'typescript';
import {ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, PipeDecoratorHandler, ResourceLoader, SelectorScopeRegistry} from '../../ngtsc/annotations';
import {Decorator} from '../../ngtsc/host';
import {CompileResult, DecoratorHandler} from '../../ngtsc/transform';
import {NgccReflectionHost} from './host/ngcc_host';
import {DecoratedClass, ParsedFile} from './parser/parser';

export interface AnalyzedClass {
  clazz: DecoratedClass;
  handler: DecoratorHandler<any>;
  analysis: any;
  diagnostics?: ts.Diagnostic[];
  compilation: CompileResult[];
}

export interface AnalyzedFile {
  analyzedClasses: AnalyzedClass[];
  sourceFile: ts.SourceFile;
}

export interface MatchingHandler<T> {
  handler: DecoratorHandler<T>;
  decorator: Decorator;
}

/**
 * `ResourceLoader` which directly uses the filesystem to resolve resources synchronously.
 */
export class FileResourceLoader implements ResourceLoader {
  load(url: string): string { return fs.readFileSync(url, 'utf8'); }
}

export class Analyzer {

  resourceLoader = new FileResourceLoader();
  scopeRegistry = new SelectorScopeRegistry(this.typeChecker, this.host);
  handlers: DecoratorHandler<any>[] = [
    new ComponentDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, false, this.resourceLoader),
    new DirectiveDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, false),
    new InjectableDecoratorHandler(this.host, false),
    new NgModuleDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, false),
    new PipeDecoratorHandler(this.typeChecker, this.host, this.scopeRegistry, false),
  ];

  constructor(private typeChecker: ts.TypeChecker, private host: NgccReflectionHost) {}

  /**
   * Analyize a parsed file to generate the information about decorated classes that
   * should be converted to use ivy definitions.
   * @param file The file to be analysed for decorated classes.
   */
  analyzeFile(file: ParsedFile): AnalyzedFile {
    const analyzedClasses = file.decoratedClasses
      .map(clazz => this.analyzeClass(file.sourceFile, clazz))
      .filter(analysis => !!analysis) as AnalyzedClass[];

    return {
      analyzedClasses,
      sourceFile: file.sourceFile,
    };
  }

  protected analyzeClass(file: ts.SourceFile, clazz: DecoratedClass): AnalyzedClass|undefined {
    const matchingHandlers = this.handlers
      .map(handler => ({ handler, decorator: handler.detect(clazz.decorators) }))
      .filter((matchingHandler): matchingHandler is MatchingHandler<any> => !!matchingHandler.decorator);

    if (matchingHandlers.length > 0) {
      if (matchingHandlers.length > 1) {
        throw new Error('TODO.Diagnostic: Class has multiple Angular decorators.');
      }

      const handler = matchingHandlers[0].handler;
      const decorator = matchingHandlers[0].decorator;

      const {analysis, diagnostics} = handler.analyze(clazz.declaration, decorator);
      let compilation = handler.compile(clazz.declaration, analysis);
      if (!Array.isArray(compilation)) {
        compilation = [compilation];
      }
      return { clazz, handler, analysis, diagnostics, compilation };
    }
  }

}
