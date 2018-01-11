/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerHost, AotCompilerOptions, AotSummaryResolver, CompileDirectiveMetadata, CompileMetadataResolver, CompilerConfig, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, HtmlParser, I18NHtmlParser, Lexer, NgModuleResolver, Parser, PipeResolver, StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, TemplateParser, TypeScriptEmitter, analyzeNgModules, createAotUrlResolver} from '@angular/compiler';
import {ViewEncapsulation} from '@angular/core';
import * as ts from 'typescript';

import {ConstantPool} from '../../src/constant_pool';
import * as o from '../../src/output/output_ast';
import {compileComponent, compileDirective} from '../../src/render3/r3_view_compiler';
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

  /* These tests are codified version of the tests in compiler_canonical_spec.ts. Every
   * test in compiler_canonical_spec.ts should have a corresponding test here.
   */
  describe('compiler conformance', () => {
    describe('elements', () => {
      it('should translate DOM structure', () => {
        const files = {
          app: {
            'spec.ts': `
                import {Component, NgModule} from '@angular/core';

                @Component({
                  selector: 'my-component',
                  template: \`<div class="my-app" title="Hello">Hello <b>World</b>!</div>\`
                })
                export class MyComponent {}

                @NgModule({declarations: [MyComponent]})
                export class MyModule {}
            `
          }
        };

        // The factory should look like this:
        const factory = 'factory: () => { return new MyComponent(); }';

        // The template should look like this (where IDENT is a wild card for an identifier):
        const template = `
          template: (ctx: IDENT, cm: IDENT) => {
            if (cm) {
              IDENT.ɵE(0, 'div', IDENT);
              IDENT.ɵT(1, 'Hello ');
              IDENT.ɵE(2, 'b');
              IDENT.ɵT(3, 'World');
              IDENT.ɵe();
              IDENT.ɵT(4, '!');
              IDENT.ɵe();
            }
          }
        `;

        // The compiler should also emit a const array like this:
        const constants = `const IDENT = ['class', 'my-app', 'title', 'Hello'];`;

        const result = compile(files, angularFiles);

        expectEmit(result.source, factory, 'Incorrect factory');
        expectEmit(result.source, template, 'Incorrect template');
        expectEmit(result.source, constants, 'Incorrect shared constants');
      });
    });
  });

  describe('components & directives', () => {
    it('should instantiate directives', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule} from '@angular/core';

            @Component({selector: 'child', template: 'child-view'})
            export class ChildComponent {}

            @Directive({selector: '[some-directive]'})
            export class SomeDirective {}

            @Component({selector: 'my-component', template: '<child some-directive></child>!'})
            export class MyComponent {}

            @NgModule({declarations: [ChildComponent, SomeDirective, MyComponent]})
            export class MyModule{}
          `
        }
      };

      // ChildComponent definition should be:
      const ChildComponentDefinition = `
        static ngComponentDef = IDENT.ɵdefineComponent({
          tag: 'child',
          factory: () => { return new ChildComponent(); },
          template: (ctx: IDENT, cm: IDENT) => {
            if (cm) {
              IDENT.ɵT(0, 'child-view');
            }
          }
        });`;

      // SomeDirective definition should be:
      const SomeDirectiveDefinition = `
        static ngDirectiveDef = IDENT.ɵdefineDirective({
          factory: () => {return new SomeDirective(); }
        });
      `;

      // MyComponent definition should be:
      const MyComponentDefinition = `
        static ngComponentDef = IDENT.ɵdefineComponent({
          tag: 'my-component',
          factory: () => { return new MyComponent(); },
          template: (ctx: IDENT, cm: IDENT) => {
            if (cm) {
              IDENT.ɵE(0, ChildComponent, IDENT, IDENT);
              IDENT.ɵe();
              IDENT.ɵT(3, '!');
            }
            ChildComponent.ngComponentDef.r(1, 0);
            SomeDirective.ngDirectiveDef.r(2, 0);
          }
        });
      `;

      // The following constants should be emitted as well.
      const AttributesConstant = `const IDENT = ['some-directive', ''];`;

      const DirectivesConstant = `const IDENT = [SomeDirective];`;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, ChildComponentDefinition, 'Incorrect ChildComponent.ngComponentDef');
      expectEmit(source, SomeDirectiveDefinition, 'Incorrect SomeDirective.ngDirectiveDef');
      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponentDefinition.ngComponentDef');
      expectEmit(source, AttributesConstant, 'Incorrect shared attributes constant');
      expectEmit(source, DirectivesConstant, 'Incorrect share directives constant');
    });

    it('should support structural directives', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

            @Directive({selector: '[if]'})
            export class IfDirective {
              constructor(template: TemplateRef<any>) { }
            }

            @Component({
              selector: 'my-component',
              template: '<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>'
            })
            export class MyComponent {
              salutation = 'Hello';
            }

            @NgModule({declarations: [IfDirective, MyComponent]})
            export class MyModule {}
            `
        }
      };

      const IfDirectiveDefinition = `
        static ngDirectiveDef = IDENT.ɵdefineDirective({
          factory: () => { return new IfDirective(IDENT.ɵinjectTemplateRef()); }
        });`;
      const MyComponentDefinition = `
        static ngComponentDef = IDENT.ɵdefineComponent({
          tag: 'my-component',
          factory: () => { return new MyComponent(); },
          template: (ctx: IDENT, cm: IDENT) => {
            if (cm) {
              IDENT.ɵE(0, 'ul', null, null, IDENT);
              IDENT.ɵC(2, IDENT, C2Template);
              IDENT.ɵe();
            }
            const IDENT = IDENT.ɵm(1);
            IDENT.ɵcR(2);
            IfDirective.ngDirectiveDef.r(3,2);
            IDENT.ɵcr();

            function C2Template(ctx0: IDENT, cm: IDENT) {
              if (cm) {
                IDENT.ɵE(0, 'li');
                IDENT.ɵT(1);
                IDENT.ɵe();
              }
              IDENT.ɵt(1, IDENT.ɵb2('', ctx.salutation, ' ', IDENT, ''));
            }
          }
        });`;
      const locals = `const IDENT = ['foo', ''];`;
      const directives = `const IDENT = [IfDirective];`;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, IfDirectiveDefinition, 'Incorrect IfDirective.ngDirectiveDef');
      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ngComponentDef');
      expectEmit(source, locals, 'Incorrect share locals constant');
      expectEmit(source, directives, 'Incorrect shared directive constant');
    });

    it('local reference', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({selector: 'my-component', template: '<input #user>Hello {{user.value}}!'})
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const MyComponentDefinition = `
        static ngComponentDef = IDENT.ɵdefineComponent({
          tag: 'my-component',
          factory: () => { return new MyComponent(); },
          template: (ctx: IDENT, cm: IDENT) => {
            if (cm) {
              IDENT.ɵE(0, 'input', null, null, IDENT);
              IDENT.ɵe();
              IDENT.ɵT(2);
            }
            const IDENT = IDENT.ɵm(1);
            IDENT.ɵt(2, IDENT.ɵb1('Hello ', IDENT.value, '!'));
          }
        });
      `;

      const locals = `
        const IDENT = ['user', ''];
      `;

      const result = compile(files, angularFiles);
      const source = result.source;

      expectEmit(source, MyComponentDefinition, 'Incorrect MyComponent.ngComponentDef');
      expectEmit(source, locals, 'Incorrect locals constant definition');
    });
  });
});

const IDENTIFIER = /[A-Za-z_$ɵ][A-Za-z0-9_$]*/;
const OPERATOR =
    /!|%|\*|\/|\^|\&|\&\&\|\||\|\||\(|\)|\{|\}|\[|\]|:|;|\.|<|<=|>|>=|=|==|===|!=|!==|=>|\+|\+\+|-|--|@|,|\.|\.\.\./;
const STRING = /\'[^'\n]*\'|"[^'\n]*"|`[^`]*`/;
const NUMBER = /[0-9]+/;
const TOKEN = new RegExp(
    `^((${IDENTIFIER.source})|(${OPERATOR.source})|(${STRING.source})|${NUMBER.source})`);
const WHITESPACE = /^\s+/;

type Piece = string | RegExp;

const IDENT = /[A-Za-z$_][A-Za-z0-9$_]*/;

function tokenize(text: string): Piece[] {
  function matches(exp: RegExp): string|false {
    const m = text.match(exp);
    if (!m) return false;
    text = text.substr(m[0].length);
    return m[0];
  }
  function next(): string {
    const result = matches(TOKEN);
    if (!result) {
      throw Error(`Invalid test, no token found for '${text.substr(0, 30)}...'`);
    }
    matches(WHITESPACE);
    return result;
  }

  const pieces: Piece[] = [];
  matches(WHITESPACE);
  while (text) {
    const token = next();
    if (token === 'IDENT') {
      pieces.push(IDENT);
    } else {
      pieces.push(token);
    }
  }
  return pieces;
}

const contextWidth = 100;
function expectEmit(source: string, emitted: string, description: string) {
  const pieces = tokenize(emitted);
  const expr = r(...pieces);
  if (!expr.test(source)) {
    let last: number = 0;
    for (let i = 1; i < pieces.length; i++) {
      let t = r(...pieces.slice(0, i));
      let m = source.match(t);
      let expected = pieces[i - 1] == IDENT ? '<IDENT>' : pieces[i - 1];
      if (!m) {
        const contextPieceWidth = contextWidth / 2;
        fail(
            `${description}: Expected to find ${expected} '${source.substr(0,last)}[<---HERE]${source.substr(last)}'`);
        return;
      } else {
        last = (m.index || 0) + m[0].length;
      }
    }
    fail(
        'Test helper failure: Expected expression failed but the reporting logic could not find where it failed');
  }
}

const IDENT_LIKE = /^[a-z][A-Z]/;
const SPECIAL_RE_CHAR = /\/|\(|\)|\||\*|\+|\[|\]|\{|\}/g;
function r(...pieces: (string | RegExp)[]): RegExp {
  let results: string[] = [];
  let first = true;
  for (const piece of pieces) {
    if (!first)
      results.push(`\\s${typeof piece === 'string' && IDENT_LIKE.test(piece) ? '+' : '*'}`);
    first = false;
    if (typeof piece === 'string') {
      results.push(piece.replace(SPECIAL_RE_CHAR, s => '\\' + s));
    } else {
      results.push('(' + piece.source + ')');
    }
  }
  return new RegExp(results.join(''));
}

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

  const fakeOutputContext: OutputContext = {
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
    const module = analyzedModules.ngModuleByPipeOrDirective.get(directive);
    if (!module || !module.type.reference.filePath.startsWith('/app')) {
      continue;
    }
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

        compileComponent(fakeOutputContext, metadata, parsedTemplate.template, staticReflector);
      } else {
        compileDirective(fakeOutputContext, metadata, staticReflector);
      }
    }
  }

  fakeOutputContext.statements.unshift(...fakeOutputContext.constantPool.statements);

  const emitter = new TypeScriptEmitter();

  const moduleName = compilerHost.fileNameToModuleName(
      fakeOutputContext.genFilePath, fakeOutputContext.genFilePath);

  const result = emitter.emitStatementsAndContext(
      fakeOutputContext.genFilePath, fakeOutputContext.statements, '', false,
      /* referenceFilter */ undefined,
      /* importFilter */ e => e.moduleName != null && e.moduleName.startsWith('/app'));

  return {source: result.sourceText, outputContext: fakeOutputContext};
}