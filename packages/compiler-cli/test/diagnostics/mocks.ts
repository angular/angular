/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerHost, AotSummaryResolver, CompileMetadataResolver, CompilerConfig, DEFAULT_INTERPOLATION_CONFIG, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, HtmlParser, I18NHtmlParser, InterpolationConfig, JitSummaryResolver, Lexer, NgAnalyzedModules, NgModuleResolver, ParseTreeResult, Parser, PipeResolver, ResourceLoader, StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, StaticSymbolResolverHost, SummaryResolver, TemplateParser, analyzeNgModules, createOfflineCompileUrlResolver} from '@angular/compiler';
import {ViewEncapsulation, ɵConsole as Console} from '@angular/core';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {DiagnosticTemplateInfo} from '../../src/diagnostics/expression_diagnostics';
import {getClassFromStaticSymbol, getClassMembers, getPipesTable, getSymbolQuery} from '../../src/diagnostics/typescript_symbols';
import {Directory, MockAotContext} from '../mocks';
import {isInBazel, setup} from '../test_support';

function calculateAngularPath() {
  if (isInBazel()) {
    const support = setup();
    return path.join(support.basePath, 'node_modules/@angular/*');
  } else {
    const moduleFilename = module.filename.replace(/\\/g, '/');
    const distIndex = moduleFilename.indexOf('/dist/all');
    return moduleFilename.substr(0, distIndex) + '/packages/*';
  }
}

const realFiles = new Map<string, string>();

export class MockLanguageServiceHost implements ts.LanguageServiceHost {
  private options: ts.CompilerOptions;
  private context: MockAotContext;
  private assumedExist = new Set<string>();

  constructor(private scripts: string[], files: Directory, currentDirectory: string = '/') {
    this.options = {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      removeComments: false,
      noImplicitAny: false,
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      strictNullChecks: true,
      baseUrl: currentDirectory,
      lib: ['lib.es2015.d.ts', 'lib.dom.d.ts'],
      paths: {'@angular/*': [calculateAngularPath()]}
    };
    this.context = new MockAotContext(currentDirectory, files);
  }

  getCompilationSettings(): ts.CompilerOptions { return this.options; }

  getScriptFileNames(): string[] { return this.scripts; }

  getScriptVersion(fileName: string): string { return '0'; }

  getScriptSnapshot(fileName: string): ts.IScriptSnapshot|undefined {
    const content = this.internalReadFile(fileName);
    if (content) {
      return ts.ScriptSnapshot.fromString(content);
    }
  }

  getCurrentDirectory(): string { return this.context.currentDirectory; }

  getDefaultLibFileName(options: ts.CompilerOptions): string { return 'lib.d.ts'; }

  readFile(fileName: string): string { return this.internalReadFile(fileName) as string; }

  readResource(fileName: string): Promise<string> { return Promise.resolve(''); }

  assumeFileExists(fileName: string): void { this.assumedExist.add(fileName); }

  fileExists(fileName: string): boolean {
    return this.assumedExist.has(fileName) || this.internalReadFile(fileName) != null;
  }

  private internalReadFile(fileName: string): string|undefined {
    let basename = path.basename(fileName);
    if (/^lib.*\.d\.ts$/.test(basename)) {
      let libPath = path.dirname(ts.getDefaultLibFilePath(this.getCompilationSettings()));
      fileName = path.join(libPath, basename);
    }
    if (fileName.startsWith('app/')) {
      fileName = path.join(this.context.currentDirectory, fileName);
    }
    if (this.context.fileExists(fileName)) {
      return this.context.readFile(fileName);
    }
    if (realFiles.has(fileName)) {
      return realFiles.get(fileName);
    }
    if (fs.existsSync(fileName)) {
      const content = fs.readFileSync(fileName, 'utf8');
      realFiles.set(fileName, content);
      return content;
    }
    return undefined;
  }
}

const staticSymbolCache = new StaticSymbolCache();
const summaryResolver = new AotSummaryResolver(
    {
      loadSummary(filePath: string) { return null; },
      isSourceFile(sourceFilePath: string) { return true; },
      toSummaryFileName(sourceFilePath: string) { return sourceFilePath; },
      fromSummaryFileName(filePath: string): string{return filePath;},
    },
    staticSymbolCache);

export class DiagnosticContext {
  // tslint:disable
  // TODO(issue/24571): remove '!'.
  _analyzedModules !: NgAnalyzedModules;
  _staticSymbolResolver: StaticSymbolResolver|undefined;
  _reflector: StaticReflector|undefined;
  _errors: {e: any, path?: string}[] = [];
  _resolver: CompileMetadataResolver|undefined;
  // TODO(issue/24571): remove '!'.
  _refletor !: StaticReflector;
  // tslint:enable

  constructor(
      public service: ts.LanguageService, public program: ts.Program,
      public checker: ts.TypeChecker, public host: StaticSymbolResolverHost) {}

  private collectError(e: any, path?: string) { this._errors.push({e, path}); }

  private get staticSymbolResolver(): StaticSymbolResolver {
    let result = this._staticSymbolResolver;
    if (!result) {
      result = this._staticSymbolResolver = new StaticSymbolResolver(
          this.host, staticSymbolCache, summaryResolver,
          (e, filePath) => this.collectError(e, filePath));
    }
    return result;
  }

  get reflector(): StaticReflector {
    if (!this._reflector) {
      const ssr = this.staticSymbolResolver;
      const result = this._reflector = new StaticReflector(
          summaryResolver, ssr, [], [], (e, filePath) => this.collectError(e, filePath !));
      this._reflector = result;
      return result;
    }
    return this._reflector;
  }

  get resolver(): CompileMetadataResolver {
    let result = this._resolver;
    if (!result) {
      const moduleResolver = new NgModuleResolver(this.reflector);
      const directiveResolver = new DirectiveResolver(this.reflector);
      const pipeResolver = new PipeResolver(this.reflector);
      const elementSchemaRegistry = new DomElementSchemaRegistry();
      const resourceLoader = new class extends ResourceLoader {
        get(url: string): Promise<string> { return Promise.resolve(''); }
      };
      const urlResolver = createOfflineCompileUrlResolver();
      const htmlParser = new class extends HtmlParser {
        parse(
            source: string, url: string, parseExpansionForms: boolean = false,
            interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG):
            ParseTreeResult {
          return new ParseTreeResult([], []);
        }
      };

      // This tracks the CompileConfig in codegen.ts. Currently these options
      // are hard-coded.
      const config =
          new CompilerConfig({defaultEncapsulation: ViewEncapsulation.Emulated, useJit: false});
      const directiveNormalizer =
          new DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);

      result = this._resolver = new CompileMetadataResolver(
          config, htmlParser, moduleResolver, directiveResolver, pipeResolver,
          new JitSummaryResolver(), elementSchemaRegistry, directiveNormalizer, new Console(),
          staticSymbolCache, this.reflector,
          (error, type) => this.collectError(error, type && type.filePath));
    }
    return result;
  }

  get analyzedModules(): NgAnalyzedModules {
    let analyzedModules = this._analyzedModules;
    if (!analyzedModules) {
      const analyzeHost = {isSourceFile(filePath: string) { return true; }};
      const programFiles = this.program.getSourceFiles().map(sf => sf.fileName);
      analyzedModules = this._analyzedModules =
          analyzeNgModules(programFiles, analyzeHost, this.staticSymbolResolver, this.resolver);
    }
    return analyzedModules;
  }

  getStaticSymbol(path: string, name: string): StaticSymbol {
    return staticSymbolCache.get(path, name);
  }
}

function compileTemplate(context: DiagnosticContext, type: StaticSymbol, template: string) {
  // Compiler the template string.
  const resolvedMetadata = context.resolver.getNonNormalizedDirectiveMetadata(type);
  const metadata = resolvedMetadata && resolvedMetadata.metadata;
  if (metadata) {
    const rawHtmlParser = new HtmlParser();
    const htmlParser = new I18NHtmlParser(rawHtmlParser);
    const expressionParser = new Parser(new Lexer());
    const config = new CompilerConfig();
    const parser = new TemplateParser(
        config, context.reflector, expressionParser, new DomElementSchemaRegistry(), htmlParser,
        null !, []);
    const htmlResult = htmlParser.parse(template, '', true);
    const analyzedModules = context.analyzedModules;
    // let errors: Diagnostic[]|undefined = undefined;
    let ngModule = analyzedModules.ngModuleByPipeOrDirective.get(type);
    if (ngModule) {
      const resolvedDirectives = ngModule.transitiveModule.directives.map(
          d => context.resolver.getNonNormalizedDirectiveMetadata(d.reference));
      const directives = removeMissing(resolvedDirectives).map(d => d.metadata.toSummary());
      const pipes = ngModule.transitiveModule.pipes.map(
          p => context.resolver.getOrLoadPipeMetadata(p.reference).toSummary());
      const schemas = ngModule.schemas;
      const parseResult = parser.tryParseHtml(htmlResult, metadata, directives, pipes, schemas);
      return {
        htmlAst: htmlResult.rootNodes,
        templateAst: parseResult.templateAst,
        directive: metadata, directives, pipes,
        parseErrors: parseResult.errors, expressionParser
      };
    }
  }
}

export function getDiagnosticTemplateInfo(
    context: DiagnosticContext, type: StaticSymbol, templateFile: string,
    template: string): DiagnosticTemplateInfo|undefined {
  const compiledTemplate = compileTemplate(context, type, template);
  if (compiledTemplate && compiledTemplate.templateAst) {
    const members = getClassMembers(context.program, context.checker, type);
    if (members) {
      const sourceFile = context.program.getSourceFile(type.filePath);
      if (sourceFile) {
        const query = getSymbolQuery(
            context.program, context.checker, sourceFile,
            () => getPipesTable(
                sourceFile, context.program, context.checker, compiledTemplate.pipes));
        return {
          fileName: templateFile,
          offset: 0, query, members,
          htmlAst: compiledTemplate.htmlAst,
          templateAst: compiledTemplate.templateAst
        };
      }
    }
  }
}

function removeMissing<T>(values: (T | null | undefined)[]): T[] {
  return values.filter(e => !!e) as T[];
}
