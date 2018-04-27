/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerOptions, AotSummaryResolver, CompileMetadataResolver, CompilerConfig, DEFAULT_INTERPOLATION_CONFIG, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, HtmlParser, Lexer, NgModuleResolver, ParseError, Parser, PipeResolver, StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, TemplateParser, TypeScriptEmitter, analyzeNgModules, createAotUrlResolver} from '@angular/compiler';
import {ViewEncapsulation} from '@angular/core';
import * as ts from 'typescript';

import {NgAnalyzedModules} from '../../src/aot/compiler';
import {ConstantPool} from '../../src/constant_pool';
import * as html from '../../src/ml_parser/ast';
import {removeWhitespaces} from '../../src/ml_parser/html_whitespaces';
import * as o from '../../src/output/output_ast';
import {compilePipe} from '../../src/render3/r3_pipe_compiler';
import {htmlAstToRender3Ast} from '../../src/render3/r3_template_transform';
import {compileComponentFromRender2, compileDirectiveFromRender2} from '../../src/render3/view/compiler';
import {BindingParser} from '../../src/template_parser/binding_parser';
import {OutputContext, escapeRegExp} from '../../src/util';
import {MockAotCompilerHost, MockCompilerHost, MockData, MockDirectory, arrayToMockDir, expectNoDiagnostics, settings, toMockFileArray} from '../aot/test_util';


const IDENTIFIER = /[A-Za-z_$ɵ][A-Za-z0-9_$]*/;
const OPERATOR =
    /!|%|\*|\/|\^|&&?|\|\|?|\(|\)|\{|\}|\[|\]|:|;|<=?|>=?|={1,3}|!==?|=>|\+\+?|--?|@|,|\.|\.\.\./;
const STRING = /'[^']*'|"[^"]*"|`[\s\S]*?`/;
const NUMBER = /\d+/;

const ELLIPSIS = '…';
const TOKEN = new RegExp(
    `\\s*((${IDENTIFIER.source})|(${OPERATOR.source})|(${STRING.source})|${NUMBER.source}|${ELLIPSIS})`,
    'y');

type Piece = string | RegExp;

const SKIP = /(?:.|\n|\r)*/;

const ERROR_CONTEXT_WIDTH = 30;
// Transform the expected output to set of tokens
function tokenize(text: string): Piece[] {
  TOKEN.lastIndex = 0;

  let match: RegExpMatchArray|null;
  const pieces: Piece[] = [];

  while ((match = TOKEN.exec(text)) !== null) {
    const token = match[1];
    if (token === 'IDENT') {
      pieces.push(IDENTIFIER);
    } else if (token === ELLIPSIS) {
      pieces.push(SKIP);
    } else {
      pieces.push(token);
    }
  }

  if (pieces.length === 0 || TOKEN.lastIndex !== 0) {
    const from = TOKEN.lastIndex;
    const to = from + ERROR_CONTEXT_WIDTH;
    throw Error(`Invalid test, no token found for '${text.substr(from, to)}...'`);
  }

  return pieces;
}

export function expectEmit(
    source: string, expected: string, description: string,
    assertIdentifiers?: {[name: string]: RegExp}) {
  // turns `// ...` into `…`
  // remove `// TODO` comment lines
  expected = expected.replace(/\/\/\s*\.\.\./g, ELLIPSIS).replace(/\/\/\s*TODO.*?\n/g, '');

  const pieces = tokenize(expected);
  const {regexp, groups} = buildMatcher(pieces);
  const matches = source.match(regexp);
  if (matches === null) {
    let last: number = 0;
    for (let i = 1; i < pieces.length; i++) {
      const {regexp} = buildMatcher(pieces.slice(0, i));
      const m = source.match(regexp);
      const expectedPiece = pieces[i - 1] == IDENTIFIER ? '<IDENT>' : pieces[i - 1];
      if (!m) {
        fail(
            `${description}: Expected to find ${expectedPiece} '${source.substr(0,last)}[<---HERE expected "${expectedPiece}"]${source.substr(last)}'`);
        return;
      } else {
        last = (m.index || 0) + m[0].length;
      }
    }
    fail(
        `Test helper failure: Expected expression failed but the reporting logic could not find where it failed in: ${source}`);
  } else {
    if (assertIdentifiers) {
      // It might be possible to add the constraints in the original regexp (see `buildMatcher`)
      // by transforming the assertion regexps when using anchoring, grouping, back references,
      // flags, ...
      //
      // Checking identifiers after they have matched allows for a simple and flexible
      // implementation.
      // The overall performance are not impacted when `assertIdentifiers` is empty.
      const ids = Object.keys(assertIdentifiers);
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (groups.has(id)) {
          const name = matches[groups.get(id) as number];
          const regexp = assertIdentifiers[id];
          if (!regexp.test(name)) {
            throw Error(
                `${description}: The matching identifier "${id}" is "${name}" which doesn't match ${regexp}`);
          }
        }
      }
    }
  }
}

const IDENT_LIKE = /^[a-z][A-Z]/;
const MATCHING_IDENT = /^\$.*\$$/;

/*
 * Builds a regexp that matches the given `pieces`
 *
 * It returns:
 * - the `regexp` to be used to match the generated code,
 * - the `groups` which maps `$...$` identifier to their position in the regexp matches.
 */
function buildMatcher(pieces: (string | RegExp)[]): {regexp: RegExp, groups: Map<string, number>} {
  const results: string[] = [];
  let first = true;
  let group = 0;

  const groups = new Map<string, number>();
  for (const piece of pieces) {
    if (!first)
      results.push(`\\s${typeof piece === 'string' && IDENT_LIKE.test(piece) ? '+' : '*'}`);
    first = false;
    if (typeof piece === 'string') {
      if (MATCHING_IDENT.test(piece)) {
        const matchGroup = groups.get(piece);
        if (!matchGroup) {
          results.push('(' + IDENTIFIER.source + ')');
          const newGroup = ++group;
          groups.set(piece, newGroup);
        } else {
          results.push(`\\${matchGroup}`);
        }
      } else {
        results.push(escapeRegExp(piece));
      }
    } else {
      results.push('(?:' + piece.source + ')');
    }
  }
  return {
    regexp: new RegExp(results.join('')),
    groups,
  };
}

function doCompile(
    data: MockDirectory, angularFiles: MockData, options: AotCompilerOptions = {},
    errorCollector: (error: any, fileName?: string) => void = error => { throw error; },
    compileAction: (
        outputCtx: OutputContext, analyzedModules: NgAnalyzedModules,
        resolver: CompileMetadataResolver, htmlParser: HtmlParser, templateParser: TemplateParser,
        hostBindingParser: BindingParser, reflector: StaticReflector) => void) {
  const testFiles = toMockFileArray(data);
  const scripts = testFiles.map(entry => entry.fileName);
  const angularFilesArray = toMockFileArray(angularFiles);
  const files = arrayToMockDir([...testFiles, ...angularFilesArray]);
  const mockCompilerHost = new MockCompilerHost(scripts, files);
  const compilerHost = new MockAotCompilerHost(mockCompilerHost);

  const program = ts.createProgram(scripts, {...settings}, mockCompilerHost);
  expectNoDiagnostics(program);

  // TODO(chuckj): Replace with a variant of createAotCompiler() when the r3_view_compiler is
  // integrated

  const urlResolver = createAotUrlResolver(compilerHost);
  const symbolCache = new StaticSymbolCache();
  const summaryResolver = new AotSummaryResolver(compilerHost, symbolCache);
  const symbolResolver = new StaticSymbolResolver(compilerHost, symbolCache, summaryResolver);
  const staticReflector =
      new StaticReflector(summaryResolver, symbolResolver, [], [], errorCollector);
  const htmlParser = new HtmlParser();
  const config = new CompilerConfig({
    defaultEncapsulation: ViewEncapsulation.Emulated,
    useJit: false,
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

  const pipesOrDirectives = Array.from(analyzedModules.ngModuleByPipeOrDirective.keys());

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

  const errors: ParseError[] = [];

  const hostBindingParser = new BindingParser(
      expressionParser, DEFAULT_INTERPOLATION_CONFIG, elementSchemaRegistry, null, errors);

  // Load all directives and pipes
  for (const pipeOrDirective of pipesOrDirectives) {
    const module = analyzedModules.ngModuleByPipeOrDirective.get(pipeOrDirective) !;
    resolver.loadNgModuleDirectiveAndPipeMetadata(module.type.reference, true);
  }

  compileAction(
      fakeOutputContext, analyzedModules, resolver, htmlParser, templateParser, hostBindingParser,
      staticReflector);

  fakeOutputContext.statements.unshift(...fakeOutputContext.constantPool.statements);

  const emitter = new TypeScriptEmitter();

  const result = emitter.emitStatementsAndContext(
      fakeOutputContext.genFilePath, fakeOutputContext.statements, '', false,
      /* referenceFilter */ undefined,
      /* importFilter */ e => e.moduleName != null && e.moduleName.startsWith('/app'));

  if (errors.length) {
    throw new Error('Unexpected errors:' + errors.map(e => e.toString()).join(', '));
  }

  return {source: result.sourceText, outputContext: fakeOutputContext};
}

export function compile(
    data: MockDirectory, angularFiles: MockData, options: AotCompilerOptions = {},
    errorCollector: (error: any, fileName?: string) => void = error => { throw error;}) {
  return doCompile(
      data, angularFiles, options, errorCollector,
      (outputCtx: OutputContext, analyzedModules: NgAnalyzedModules,
       resolver: CompileMetadataResolver, htmlParser: HtmlParser, templateParser: TemplateParser,
       hostBindingParser: BindingParser, reflector: StaticReflector) => {
        const pipesOrDirectives = Array.from(analyzedModules.ngModuleByPipeOrDirective.keys());
        for (const pipeOrDirective of pipesOrDirectives) {
          const module = analyzedModules.ngModuleByPipeOrDirective.get(pipeOrDirective);
          if (!module || !module.type.reference.filePath.startsWith('/app')) {
            continue;
          }
          if (resolver.isDirective(pipeOrDirective)) {
            const directive = resolver.getDirectiveMetadata(pipeOrDirective);
            if (directive.isComponent) {
              const fakeUrl = 'ng://fake-template-url.html';
              let htmlAst = htmlParser.parse(directive.template !.template !, fakeUrl);

              // Map of StaticType by directive selectors
              const directiveTypeBySel = new Map<string, any>();

              const directives = module.transitiveModule.directives.map(
                  dir => resolver.getDirectiveSummary(dir.reference));

              directives.forEach(directive => {
                if (directive.selector) {
                  directiveTypeBySel.set(directive.selector, directive.type.reference);
                }
              });

              // Map of StaticType by pipe names
              const pipeTypeByName = new Map<string, any>();

              const pipes = module.transitiveModule.pipes.map(
                  pipe => resolver.getPipeSummary(pipe.reference));

              pipes.forEach(pipe => { pipeTypeByName.set(pipe.name, pipe.type.reference); });

              const preserveWhitespaces = directive.template !.preserveWhitespaces;
              if (!preserveWhitespaces) {
                htmlAst = removeWhitespaces(htmlAst);
              }

              const render3Ast = htmlAstToRender3Ast(htmlAst.rootNodes, hostBindingParser);

              compileComponentFromRender2(
                  outputCtx, directive, render3Ast, reflector, hostBindingParser,
                  directiveTypeBySel, pipeTypeByName);
            } else {
              compileDirectiveFromRender2(outputCtx, directive, reflector, hostBindingParser);
            }
          } else if (resolver.isPipe(pipeOrDirective)) {
            const metadata = resolver.getPipeMetadata(pipeOrDirective);
            if (metadata) {
              compilePipe(outputCtx, metadata, reflector);
            }
          }
        }

      });
}
