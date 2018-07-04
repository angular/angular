/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import * as ts from 'typescript';
import {WrappedNodeExpr, WritePropExpr} from '@angular/compiler';
import {ComponentDecoratorHandler, DirectiveDecoratorHandler, InjectableDecoratorHandler, NgModuleDecoratorHandler, PipeDecoratorHandler, ResourceLoader, SelectorScopeRegistry} from '../../ngtsc/annotations';
import {Decorator} from '../../ngtsc/host';
import {CompileResult, DecoratorHandler} from '../../ngtsc/transform';
import {ImportManager, translateStatement} from '../../ngtsc/transform/src/translator';
import {NgccReflectionHost} from './host/ngcc_host';
import {DecoratedClass, ParsedFile} from './parser/parser';

export interface AnalyzedClass {
  clazz: DecoratedClass;
  handler: DecoratorHandler<any>;
  analysis: any;
  diagnostics?: ts.Diagnostic[];
  compilation: CompileResult[];
  renderedDefinition: string;
}

export interface AnalyzedFile {
  analyzedClasses: AnalyzedClass[];
  imports: {name: string, as: string}[];
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

  analyzeFile(file: ParsedFile): AnalyzedFile {
    const importManager = new ImportManager(false);
    const analyzedClasses = file.decoratedClasses
      .map(clazz => this.analyzeClass(file.sourceFile, clazz, importManager))
      .filter(analysis => !!analysis) as AnalyzedClass[];

    const imports = importManager.getAllImports(file.sourceFile.fileName, null);

    return {
      analyzedClasses,
      imports,
      sourceFile: file.sourceFile,
    };
  }

  analyzeClass(file: ts.SourceFile, clazz: DecoratedClass, importManager: ImportManager): AnalyzedClass|undefined {
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
      const renderedDefinition = this.renderDefinitions(file, clazz, compilation, importManager);

      return { clazz, handler, analysis, diagnostics, compilation, renderedDefinition };
    }
  }

  protected renderDefinitions(sourceFile: ts.SourceFile, clazz: DecoratedClass, compilation: CompileResult[], imports: ImportManager): string {
    const printer = ts.createPrinter();
    const name = (clazz.declaration as ts.NamedDeclaration).name!;
    const definition = compilation.map(c => c.statements
      .map(statement => translateStatement(statement, imports))
      .concat(translateStatement(createAssignmentStatement(name, c), imports))
      .map(statement => printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile))
      .join('\n')
    ).join('\n');
    return definition;
  }
}


/**
 * Create an Angular AST statement node that contains the assignment of the
 * compiled decorator to be applied to the class.
 * @param analyzedClass The info about the class whose statement we want to create.
 */
function createAssignmentStatement(name: ts.DeclarationName, compilation: CompileResult) {
  const receiver = new WrappedNodeExpr(name);
  return new WritePropExpr(receiver, compilation.name, compilation.initializer).toStmt();
}