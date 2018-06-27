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

import {ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, PipeDecoratorHandler, ResourceLoader, SelectorScopeRegistry} from '../../ngtsc/annotations';
import {Decorator} from '../../ngtsc/host';
import {CompileResult, DecoratorHandler} from '../../ngtsc/transform';

import {NgccReflectionHost} from './host/ngcc_host';
import {ParsedClass} from './parsing/parsed_class';
import {ParsedFile} from './parsing/parsed_file';
import {isDefined} from './utils';

export interface AnalyzedClass<T = any> extends ParsedClass {
  handler: DecoratorHandler<T>;
  analysis: any;
  diagnostics?: ts.Diagnostic[];
  compilation: CompileResult[];
}

export interface AnalyzedFile {
  analyzedClasses: AnalyzedClass[];
  sourceFile: ts.SourceFile;
  constantPool: ConstantPool;
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
    new ComponentDecoratorHandler(
        this.typeChecker, this.host, this.scopeRegistry, false, this.resourceLoader),
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
    const constantPool = new ConstantPool();
    const analyzedClasses =
        file.decoratedClasses.map(clazz => this.analyzeClass(file.sourceFile, constantPool, clazz))
            .filter(isDefined);

    return {
      analyzedClasses,
      sourceFile: file.sourceFile, constantPool,
    };
  }

  protected analyzeClass(file: ts.SourceFile, pool: ConstantPool, clazz: ParsedClass): AnalyzedClass
      |undefined {
    const matchingHandlers =
        this.handlers.map(handler => ({handler, decorator: handler.detect(clazz.decorators)}))
            .filter(isMatchingHandler);

    if (matchingHandlers.length > 1) {
      throw new Error('TODO.Diagnostic: Class has multiple Angular decorators.');
    }

    if (matchingHandlers.length == 0) {
      return undefined;
    }

    const {handler, decorator} = matchingHandlers[0];
    const {analysis, diagnostics} = handler.analyze(clazz.declaration, decorator);
    let compilation = handler.compile(clazz.declaration, analysis, pool);
    if (!Array.isArray(compilation)) {
      compilation = [compilation];
    }
    return {...clazz, handler, analysis, diagnostics, compilation};
  }
}

function isMatchingHandler<T>(handler: Partial<MatchingHandler<T>>): handler is MatchingHandler<T> {
  return !!handler.decorator;
}