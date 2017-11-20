/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerHost, AotCompilerOptions, AotSummaryResolver, CompileMetadataResolver, CompilerConfig, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, HtmlParser, I18NHtmlParser, Lexer, NgModuleResolver, Parser, PipeResolver, StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, TemplateParser, TypeScriptEmitter, analyzeNgModules, createAotUrlResolver} from '@angular/compiler';
import {ViewEncapsulation} from '@angular/core';
import * as ts from 'typescript';

import {ConstantPool} from '../../src/constant_pool';
import * as o from '../../src/output/output_ast';
import {compileComponent} from '../../src/render3/r3_view_compiler';
import {OutputContext} from '../../src/util';
import {MockAotCompilerHost, MockCompilerHost, MockData, MockDirectory, arrayToMockDir, settings, setup, toMockFileArray} from '../aot/test_util';

describe('r3_view_compiler', () => {
  const angularFiles = setup({
    compileAngular: true,
    compileAnimations: false,
    compileCommon: true,
  });

  describe('hello world', () => {
    it('should be able to generate the hello world component', () => {
      const files: MockDirectory = {
        app: {
          'hello.ts': `
           import {Component, NgModule} from '@angular/core';

           @Component({
             selector: 'hello-world',
             template: 'Hello, world!'
           })
           export class HelloWorldComponent {

           }

           @NgModule({
             declarations: [HelloWorldComponent]
           })
           export class HelloWorldModule {}
        `
        }
      };
      compile(files, angularFiles);
    });
  });

  it('should be able to generate the example', () => {
    const files: MockDirectory = {
      app: {
        'example.ts': `
        import {Component, OnInit, OnDestroy, ElementRef, Input, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'my-app',
          template: '<todo [data]="list"></todo>'
        })
        export class MyApp implements OnInit {

          list: any[] = [];

          constructor(public elementRef: ElementRef) {}

          ngOnInit(): void {
          }
        }

        @Component({
          selector: 'todo',
          template: '<ul class="list" [title]="myTitle"><li *ngFor="let item of data">{{data}}</li></ul>'
        })
        export class TodoComponent implements OnInit, OnDestroy {

          @Input()
          data: any[] = [];

          myTitle: string;

          constructor(public elementRef: ElementRef) {}

          ngOnInit(): void {}

          ngOnDestroy(): void {}
        }

        @NgModule({
          declarations: [TodoComponent, MyApp],
          imports: [CommonModule]
        })
        export class TodoModule{}
        `
      }
    };
    const result = compile(files, angularFiles);
    expect(result.source).toContain('@angular/core');
  });
});

function compile(
    data: MockDirectory, angularFiles: MockData, options: AotCompilerOptions = {},
    errorCollector: (error: any, fileName?: string) => void = error => { throw error; }) {
  const testFiles = toMockFileArray(data);
  const scripts = testFiles.map(entry => entry.fileName);
  const angularFilesArray = toMockFileArray(angularFiles);
  const files = arrayToMockDir([...testFiles, ...angularFilesArray]);
  const mockCompilerHost = new MockCompilerHost(scripts, files);
  const compilerHost = new MockAotCompilerHost(mockCompilerHost);

  const program = ts.createProgram(scripts, {...settings}, mockCompilerHost);

  // TODO(chuckj): Replace with a variant of createAotCompiler() when the r3_view_compiler is
  // integrated
  const translations = options.translations || '';

  const urlResolver = createAotUrlResolver(compilerHost);
  const symbolCache = new StaticSymbolCache();
  const summaryResolver = new AotSummaryResolver(compilerHost, symbolCache);
  const symbolResolver = new StaticSymbolResolver(compilerHost, symbolCache, summaryResolver);
  const staticReflector =
      new StaticReflector(summaryResolver, symbolResolver, [], [], errorCollector);
  const htmlParser = new I18NHtmlParser(
      new HtmlParser(), translations, options.i18nFormat, options.missingTranslation, console);
  const config = new CompilerConfig({
    defaultEncapsulation: ViewEncapsulation.Emulated,
    useJit: false,
    enableLegacyTemplate: options.enableLegacyTemplate === true,
    missingTranslation: options.missingTranslation,
    preserveWhitespaces: options.preserveWhitespaces,
    strictInjectionParameters: options.strictInjectionParameters,
  });
  const normalizer = new DirectiveNormalizer(
      {get: (url: string) => compilerHost.loadResource(url)}, urlResolver, htmlParser, config);
  const expressionParser = new Parser(new Lexer());
  const elementSchemaRegistry = new DomElementSchemaRegistry();
  const templateParser = new TemplateParser(
      config, staticReflector, expressionParser, elementSchemaRegistry, htmlParser, console, []);
  const resolver = new CompileMetadataResolver(
      config, htmlParser, new NgModuleResolver(staticReflector),
      new DirectiveResolver(staticReflector), new PipeResolver(staticReflector), summaryResolver,
      elementSchemaRegistry, normalizer, console, symbolCache, staticReflector, errorCollector);



  // Create the TypeScript program
  const sourceFiles = program.getSourceFiles().map(sf => sf.fileName);

  // Analyze the modules
  // TODO(chuckj): Eventually this should not be necessary as the ts.SourceFile should be sufficient
  // to generate a template definition.
  const analyzedModules = analyzeNgModules(sourceFiles, compilerHost, symbolResolver, resolver);

  const directives = Array.from(analyzedModules.ngModuleByPipeOrDirective.keys());

  const fakeOuputContext: OutputContext = {
    genFilePath: 'fakeFactory.ts',
    statements: [],
    importExpr(symbol: StaticSymbol, typeParams: o.Type[]) {
      if (!(symbol instanceof StaticSymbol)) {
        if (!symbol) {
          throw new Error('Invalid: undefined passed to as a symbol');
        }
        throw new Error(`Invalid: ${(symbol as any).constructor.name} is not a symbol`);
      }
      return (symbol.members || [])
          .reduce(
              (expr, member) => expr.prop(member),
              <o.Expression>o.importExpr(new o.ExternalReference(symbol.filePath, symbol.name)));
    },
    constantPool: new ConstantPool()
  };

  // Load All directives
  for (const directive of directives) {
    const module = analyzedModules.ngModuleByPipeOrDirective.get(directive) !;
    resolver.loadNgModuleDirectiveAndPipeMetadata(module.type.reference, true);
  }

  // Compile the directives.
  for (const directive of directives) {
    const module = analyzedModules.ngModuleByPipeOrDirective.get(directive) !;
    if (resolver.isDirective(directive)) {
      const metadata = resolver.getDirectiveMetadata(directive);
      if (metadata.isComponent) {
        const fakeUrl = 'ng://fake-template-url.html';
        const htmlAst = htmlParser.parse(metadata.template !.template !, fakeUrl);

        const directives = module.transitiveModule.directives.map(
            dir => resolver.getDirectiveSummary(dir.reference));
        const pipes =
            module.transitiveModule.pipes.map(pipe => resolver.getPipeSummary(pipe.reference));
        const parsedTemplate = templateParser.parse(
            metadata, htmlAst, directives, pipes, module.schemas, fakeUrl, false);

        compileComponent(fakeOuputContext, metadata, parsedTemplate.template, staticReflector);
      }
    }
  }

  fakeOuputContext.statements.unshift(...fakeOuputContext.constantPool.statements);

  const emitter = new TypeScriptEmitter();

  const result = emitter.emitStatementsAndContext(
      fakeOuputContext.genFilePath, fakeOuputContext.statements, '', false);

  return {source: result.sourceText, outputContext: fakeOuputContext};
}