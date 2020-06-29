/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {analyzeNgModules, AotSummaryResolver, CompileMetadataResolver, CompilerConfig, createOfflineCompileUrlResolver, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, HtmlParser, I18NHtmlParser, JitSummaryResolver, Lexer, NgAnalyzedModules, NgModuleResolver, Parser, ParseTreeResult, PipeResolver, ResourceLoader, StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, StaticSymbolResolverHost, TemplateParser} from '@angular/compiler';
import {Directory, MockAotContext} from '@angular/compiler-cli/test/mocks';
import {setup} from '@angular/compiler-cli/test/test_support';
import {ViewEncapsulation, ɵConsole as Console} from '@angular/core';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {DiagnosticTemplateInfo} from '../src/types';
import {getClassMembers, getPipesTable, getSymbolQuery} from '../src/typescript_symbols';

const realFiles = new Map<string, string>();

export class MockLanguageServiceHost implements ts.LanguageServiceHost {
  private options: ts.CompilerOptions;
  private context: MockAotContext;
  private assumedExist = new Set<string>();

  constructor(private scripts: string[], files: Directory, currentDirectory: string = '/') {
    const support = setup();

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
      paths: {'@angular/*': [path.join(support.basePath, 'node_modules/@angular/*')]}
    };
    this.context = new MockAotContext(currentDirectory, files);
  }

  getCompilationSettings(): ts.CompilerOptions {
    return this.options;
  }

  getScriptFileNames(): string[] {
    return this.scripts;
  }

  getScriptVersion(fileName: string): string {
    return '0';
  }

  getScriptSnapshot(fileName: string): ts.IScriptSnapshot|undefined {
    const content = this.internalReadFile(fileName);
    if (content) {
      return ts.ScriptSnapshot.fromString(content);
    }
  }

  getCurrentDirectory(): string {
    return this.context.currentDirectory;
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return 'lib.d.ts';
  }

  readFile(fileName: string): string {
    return this.internalReadFile(fileName) as string;
  }

  readResource(fileName: string): Promise<string> {
    return Promise.resolve('');
  }

  assumeFileExists(fileName: string): void {
    this.assumedExist.add(fileName);
  }

  fileExists(fileName: string): boolean {
    return this.assumedExist.has(fileName) || this.internalReadFile(fileName) != null;
  }

  private internalReadFile(fileName: string): string|undefined {
    let basename = path.basename(fileName);
    if (/^lib.*\.d\.ts$/.test(basename)) {
      let libPath = path.posix.dirname(ts.getDefaultLibFilePath(this.getCompilationSettings()));
      fileName = path.posix.join(libPath, basename);
    }
    if (fileName.startsWith('app/')) {
      fileName = path.posix.join(this.context.currentDirectory, fileName);
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
      loadSummary(filePath: string) {
        return null;
      },
      isSourceFile(sourceFilePath: string) {
        return true;
      },
      toSummaryFileName(sourceFilePath: string) {
        return sourceFilePath;
      },
      fromSummaryFileName(filePath: string): string {
        return filePath;
      },
    },
    staticSymbolCache);

export class DiagnosticContext {
  private _analyzedModules: NgAnalyzedModules|undefined;
  private _staticSymbolResolver: StaticSymbolResolver|undefined;
  private _reflector: StaticReflector|undefined;
  private _errors: {e: any, path?: string}[] = [];
  private _resolver: CompileMetadataResolver|undefined;

  constructor(
      public service: ts.LanguageService, public program: ts.Program,
      public checker: ts.TypeChecker, public host: StaticSymbolResolverHost) {}

  private collectError(e: any, path?: string) {
    this._errors.push({e, path});
  }

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
          summaryResolver, ssr, [], [], (e, filePath) => this.collectError(e, filePath!));
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
        get(url: string): Promise<string> {
          return Promise.resolve('');
        }
      };
      const urlResolver = createOfflineCompileUrlResolver();
      const htmlParser = new class extends HtmlParser {
        parse(): ParseTreeResult {
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
      const analyzeHost = {
        isSourceFile(filePath: string) {
          return true;
        }
      };
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
        null!, []);
    const htmlResult = htmlParser.parse(template, '', {tokenizeExpansionForms: true});
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
        directive: metadata,
        directives,
        pipes,
        parseErrors: parseResult.errors,
        expressionParser
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
          offset: 0,
          query,
          members,
          htmlAst: compiledTemplate.htmlAst,
          templateAst: compiledTemplate.templateAst,
          source: sourceFile.text,
        };
      }
    }
  }
}

function removeMissing<T>(values: (T|null|undefined)[]): T[] {
  return values.filter(e => !!e) as T[];
}
