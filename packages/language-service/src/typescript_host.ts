/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotSummaryResolver, CompileDirectiveSummary, CompileMetadataResolver, CompileNgModuleMetadata, CompilePipeSummary, CompilerConfig, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, FormattedError, FormattedMessageChain, HtmlParser, I18NHtmlParser, JitSummaryResolver, Lexer, NgAnalyzedModules, NgModuleResolver, ParseTreeResult, Parser, PipeResolver, ResourceLoader, StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, TemplateParser, analyzeNgModules, createOfflineCompileUrlResolver, isFormattedError} from '@angular/compiler';
import {SchemaMetadata, ViewEncapsulation, ɵConsole as Console} from '@angular/core';
import * as ts from 'typescript';

import {AstResult, isAstResult} from './common';
import {createLanguageService} from './language_service';
import {ReflectorHost} from './reflector_host';
import {ExternalTemplate, InlineTemplate, getClassDeclFromTemplateNode} from './template';
import {Declaration, DeclarationError, Diagnostic, DiagnosticKind, DiagnosticMessageChain, LanguageService, LanguageServiceHost, Span, TemplateSource} from './types';
import {findTightestNode, getDirectiveClassLike} from './utils';


/**
 * Create a `LanguageServiceHost`
 */
export function createLanguageServiceFromTypescript(
    host: ts.LanguageServiceHost, service: ts.LanguageService): LanguageService {
  const ngHost = new TypeScriptServiceHost(host, service);
  const ngServer = createLanguageService(ngHost);
  return ngServer;
}

/**
 * The language service never needs the normalized versions of the metadata. To avoid parsing
 * the content and resolving references, return an empty file. This also allows normalizing
 * template that are syntatically incorrect which is required to provide completions in
 * syntactically incorrect templates.
 */
export class DummyHtmlParser extends HtmlParser {
  parse(): ParseTreeResult { return new ParseTreeResult([], []); }
}

/**
 * Avoid loading resources in the language servcie by using a dummy loader.
 */
export class DummyResourceLoader extends ResourceLoader {
  get(url: string): Promise<string> { return Promise.resolve(''); }
}

/**
 * An implementation of a `LanguageServiceHost` for a TypeScript project.
 *
 * The `TypeScriptServiceHost` implements the Angular `LanguageServiceHost` using
 * the TypeScript language services.
 *
 * @publicApi
 */
export class TypeScriptServiceHost implements LanguageServiceHost {
  private readonly summaryResolver: AotSummaryResolver;
  private readonly reflectorHost: ReflectorHost;
  private readonly staticSymbolResolver: StaticSymbolResolver;
  private readonly reflector: StaticReflector;
  private readonly resolver: CompileMetadataResolver;

  private readonly staticSymbolCache = new StaticSymbolCache();
  private readonly fileToComponent = new Map<string, StaticSymbol>();
  private readonly collectedErrors = new Map<string, any[]>();
  private readonly fileVersions = new Map<string, string>();

  private lastProgram: ts.Program|undefined = undefined;
  private templateReferences: string[] = [];
  private analyzedModules: NgAnalyzedModules = {
    files: [],
    ngModuleByPipeOrDirective: new Map(),
    ngModules: [],
  };

  constructor(
      private readonly host: ts.LanguageServiceHost, private readonly tsLS: ts.LanguageService) {
    this.summaryResolver = new AotSummaryResolver(
        {
          loadSummary(filePath: string) { return null; },
          isSourceFile(sourceFilePath: string) { return true; },
          toSummaryFileName(sourceFilePath: string) { return sourceFilePath; },
          fromSummaryFileName(filePath: string): string{return filePath;},
        },
        this.staticSymbolCache);
    this.reflectorHost = new ReflectorHost(() => tsLS.getProgram() !, host);
    this.staticSymbolResolver = new StaticSymbolResolver(
        this.reflectorHost, this.staticSymbolCache, this.summaryResolver,
        (e, filePath) => this.collectError(e, filePath));
    this.reflector = new StaticReflector(
        this.summaryResolver, this.staticSymbolResolver,
        [],  // knownMetadataClasses
        [],  // knownMetadataFunctions
        (e, filePath) => this.collectError(e, filePath));
    this.resolver = this.createMetadataResolver();
  }

  /**
   * Creates a new metadata resolver. This should only be called once.
   */
  private createMetadataResolver(): CompileMetadataResolver {
    if (this.resolver) {
      return this.resolver;  // There should only be a single instance
    }
    const moduleResolver = new NgModuleResolver(this.reflector);
    const directiveResolver = new DirectiveResolver(this.reflector);
    const pipeResolver = new PipeResolver(this.reflector);
    const elementSchemaRegistry = new DomElementSchemaRegistry();
    const resourceLoader = new DummyResourceLoader();
    const urlResolver = createOfflineCompileUrlResolver();
    const htmlParser = new DummyHtmlParser();
    // This tracks the CompileConfig in codegen.ts. Currently these options
    // are hard-coded.
    const config = new CompilerConfig({
      defaultEncapsulation: ViewEncapsulation.Emulated,
      useJit: false,
    });
    const directiveNormalizer =
        new DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);
    return new CompileMetadataResolver(
        config, htmlParser, moduleResolver, directiveResolver, pipeResolver,
        new JitSummaryResolver(), elementSchemaRegistry, directiveNormalizer, new Console(),
        this.staticSymbolCache, this.reflector,
        (error, type) => this.collectError(error, type && type.filePath));
  }

  getTemplateReferences(): string[] { return [...this.templateReferences]; }

  /**
   * Checks whether the program has changed and returns all analyzed modules.
   * If program has changed, invalidate all caches and update fileToComponent
   * and templateReferences.
   * In addition to returning information about NgModules, this method plays the
   * same role as 'synchronizeHostData' in tsserver.
   */
  getAnalyzedModules(): NgAnalyzedModules {
    if (this.upToDate()) {
      return this.analyzedModules;
    }

    // Invalidate caches
    this.templateReferences = [];
    this.fileToComponent.clear();
    this.collectedErrors.clear();

    const analyzeHost = {isSourceFile(filePath: string) { return true; }};
    const programFiles = this.program.getSourceFiles().map(sf => sf.fileName);
    this.analyzedModules =
        analyzeNgModules(programFiles, analyzeHost, this.staticSymbolResolver, this.resolver);

    // update template references and fileToComponent
    const urlResolver = createOfflineCompileUrlResolver();
    for (const ngModule of this.analyzedModules.ngModules) {
      for (const directive of ngModule.declaredDirectives) {
        const {metadata} = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference) !;
        if (metadata.isComponent && metadata.template && metadata.template.templateUrl) {
          const templateName = urlResolver.resolve(
              this.reflector.componentModuleUrl(directive.reference),
              metadata.template.templateUrl);
          this.fileToComponent.set(templateName, directive.reference);
          this.templateReferences.push(templateName);
        }
      }
    }

    return this.analyzedModules;
  }

  /**
   * Find all templates in the specified `file`.
   * @param fileName TS or HTML file
   */
  getTemplates(fileName: string): TemplateSource[] {
    const results: TemplateSource[] = [];
    if (fileName.endsWith('.ts')) {
      // Find every template string in the file
      const visit = (child: ts.Node) => {
        const template = this.getInternalTemplate(child);
        if (template) {
          results.push(template);
        } else {
          ts.forEachChild(child, visit);
        }
      };
      const sourceFile = this.getSourceFile(fileName);
      if (sourceFile) {
        ts.forEachChild(sourceFile, visit);
      }
    } else {
      const template = this.getExternalTemplate(fileName);
      if (template) {
        results.push(template);
      }
    }
    return results;
  }

  /**
   * Return metadata about all class declarations in the file that are Angular
   * directives. Potential matches are `@NgModule`, `@Component`, `@Directive`,
   * `@Pipes`, etc. class declarations.
   *
   * @param fileName TS file
   */
  getDeclarations(fileName: string): Declaration[] {
    if (!fileName.endsWith('.ts')) {
      return [];
    }
    const sourceFile = this.getSourceFile(fileName);
    if (!sourceFile) {
      return [];
    }
    const results: Declaration[] = [];
    const visit = (child: ts.Node) => {
      const candidate = getDirectiveClassLike(child);
      if (candidate) {
        const {decoratorId, classDecl} = candidate;
        const declarationSpan = spanOf(decoratorId);
        const className = classDecl.name !.text;
        const classSymbol = this.reflector.getStaticSymbol(sourceFile.fileName, className);
        // Ask the resolver to check if candidate is actually Angular directive
        if (!this.resolver.isDirective(classSymbol)) {
          return;
        }
        const data = this.resolver.getNonNormalizedDirectiveMetadata(classSymbol);
        if (!data) {
          return;
        }
        results.push({
          type: classSymbol,
          declarationSpan,
          metadata: data.metadata,
          errors: this.getCollectedErrors(declarationSpan, sourceFile),
        });
      } else {
        child.forEachChild(visit);
      }
    };
    ts.forEachChild(sourceFile, visit);

    return results;
  }

  getSourceFile(fileName: string): ts.SourceFile|undefined {
    if (!fileName.endsWith('.ts')) {
      throw new Error(`Non-TS source file requested: ${fileName}`);
    }
    return this.program.getSourceFile(fileName);
  }

  get program() {
    const program = this.tsLS.getProgram();
    if (!program) {
      // Program is very very unlikely to be undefined.
      throw new Error('No program in language service!');
    }
    return program;
  }

  /**
   * Checks whether the program has changed, and invalidate caches if it has.
   * Returns true if modules are up-to-date, false otherwise.
   * This should only be called by getAnalyzedModules().
   */
  private upToDate() {
    const program = this.program;
    if (this.lastProgram === program) {
      return true;
    }

    // Invalidate file that have changed in the static symbol resolver
    const seen = new Set<string>();
    for (const sourceFile of program.getSourceFiles()) {
      const fileName = sourceFile.fileName;
      seen.add(fileName);
      const version = this.host.getScriptVersion(fileName);
      const lastVersion = this.fileVersions.get(fileName);
      if (version !== lastVersion) {
        this.fileVersions.set(fileName, version);
        this.staticSymbolResolver.invalidateFile(fileName);
      }
    }

    // Remove file versions that are no longer in the file and invalidate them.
    const missing = Array.from(this.fileVersions.keys()).filter(f => !seen.has(f));
    missing.forEach(f => {
      this.fileVersions.delete(f);
      this.staticSymbolResolver.invalidateFile(f);
    });

    this.lastProgram = program;

    return false;
  }

  /**
   * Return the TemplateSource if `node` is a template node.
   *
   * For example,
   *
   * @Component({
   *   template: '<div></div>' <-- template node
   * })
   * class AppComponent {}
   *           ^---- class declaration node
   *
   * @param node Potential template node
   */
  private getInternalTemplate(node: ts.Node): TemplateSource|undefined {
    if (!ts.isStringLiteralLike(node)) {
      return;
    }
    const classDecl = getClassDeclFromTemplateNode(node);
    if (!classDecl || !classDecl.name) {  // Does not handle anonymous class
      return;
    }
    const fileName = node.getSourceFile().fileName;
    const classSymbol = this.reflector.getStaticSymbol(fileName, classDecl.name.text);
    return new InlineTemplate(node, classDecl, classSymbol, this);
  }

  /**
   * Return the external template for `fileName`.
   * @param fileName HTML file
   */
  private getExternalTemplate(fileName: string): TemplateSource|undefined {
    // First get the text for the template
    const snapshot = this.host.getScriptSnapshot(fileName);
    if (!snapshot) {
      return;
    }
    const source = snapshot.getText(0, snapshot.getLength());
    // Next find the component class symbol
    const classSymbol = this.fileToComponent.get(fileName);
    if (!classSymbol) {
      return;
    }
    // Then use the class symbol to find the actual ts.ClassDeclaration node
    const sourceFile = this.getSourceFile(classSymbol.filePath);
    if (!sourceFile) {
      return;
    }
    // TODO: This only considers top-level class declarations in a source file.
    // This would not find a class declaration in a namespace, for example.
    const classDecl = sourceFile.forEachChild((child) => {
      if (ts.isClassDeclaration(child) && child.name && child.name.text === classSymbol.name) {
        return child;
      }
    });
    if (!classDecl) {
      return;
    }
    return new ExternalTemplate(source, fileName, classDecl, classSymbol, this);
  }

  private collectError(error: any, filePath?: string) {
    if (filePath) {
      let errors = this.collectedErrors.get(filePath);
      if (!errors) {
        errors = [];
        this.collectedErrors.set(filePath, errors);
      }
      errors.push(error);
    }
  }

  private getCollectedErrors(defaultSpan: Span, sourceFile: ts.SourceFile): DeclarationError[] {
    const errors = this.collectedErrors.get(sourceFile.fileName);
    if (!errors) {
      return [];
    }
    // TODO: Add better typings for the errors
    return errors.map((e: any) => {
      const line = e.line || (e.position && e.position.line);
      const column = e.column || (e.position && e.position.column);
      const span = spanAt(sourceFile, line, column) || defaultSpan;
      if (isFormattedError(e)) {
        return errorToDiagnosticWithChain(e, span);
      }
      return {message: e.message, span};
    });
  }

  /**
   * Return the parsed template for the template at the specified `position`.
   * @param fileName TS or HTML file
   * @param position Position of the template in the TS file, otherwise ignored.
   */
  getTemplateAstAtPosition(fileName: string, position: number): AstResult|undefined {
    let template: TemplateSource|undefined;
    if (fileName.endsWith('.ts')) {
      const sourceFile = this.getSourceFile(fileName);
      if (!sourceFile) {
        return;
      }
      // Find the node that most closely matches the position
      const node = findTightestNode(sourceFile, position);
      if (!node) {
        return;
      }
      template = this.getInternalTemplate(node);
    } else {
      template = this.getExternalTemplate(fileName);
    }
    if (!template) {
      return;
    }
    const astResult = this.getTemplateAst(template);
    if (!isAstResult(astResult)) {
      return;
    }
    return astResult;
  }

  /**
   * Find the NgModule which the directive associated with the `classSymbol`
   * belongs to, then return its schema and transitive directives and pipes.
   * @param classSymbol Angular Symbol that defines a directive
   */
  private getModuleMetadataForDirective(classSymbol: StaticSymbol) {
    const result = {
      directives: [] as CompileDirectiveSummary[],
      pipes: [] as CompilePipeSummary[],
      schemas: [] as SchemaMetadata[],
    };
    // First find which NgModule the directive belongs to.
    const ngModule = this.analyzedModules.ngModuleByPipeOrDirective.get(classSymbol) ||
        findSuitableDefaultModule(this.analyzedModules);
    if (!ngModule) {
      return result;
    }
    // Then gather all transitive directives and pipes.
    const {directives, pipes} = ngModule.transitiveModule;
    for (const directive of directives) {
      const data = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference);
      if (data) {
        result.directives.push(data.metadata.toSummary());
      }
    }
    for (const pipe of pipes) {
      const metadata = this.resolver.getOrLoadPipeMetadata(pipe.reference);
      result.pipes.push(metadata.toSummary());
    }
    result.schemas.push(...ngModule.schemas);
    return result;
  }

  /**
   * Parse the `template` and return its AST if there's no error. Otherwise
   * return a Diagnostic message.
   * @param template template to be parsed
   */
  getTemplateAst(template: TemplateSource): AstResult|Diagnostic {
    const {type: classSymbol, fileName} = template;
    try {
      const data = this.resolver.getNonNormalizedDirectiveMetadata(classSymbol);
      if (!data) {
        return {
          kind: DiagnosticKind.Error,
          message: `No metadata found for '${classSymbol.name}' in ${fileName}.`,
          span: template.span,
        };
      }
      const htmlParser = new I18NHtmlParser(new HtmlParser());
      const expressionParser = new Parser(new Lexer());
      const parser = new TemplateParser(
          new CompilerConfig(), this.reflector, expressionParser, new DomElementSchemaRegistry(),
          htmlParser,
          null !,  // console
          []       // tranforms
          );
      const htmlResult = htmlParser.parse(template.source, fileName, {
        tokenizeExpansionForms: true,
      });
      const {directives, pipes, schemas} = this.getModuleMetadataForDirective(classSymbol);
      const parseResult =
          parser.tryParseHtml(htmlResult, data.metadata, directives, pipes, schemas);
      if (!parseResult.templateAst) {
        return {
          kind: DiagnosticKind.Error,
          message: `Failed to parse template for '${classSymbol.name}' in ${fileName}`,
          span: template.span,
        };
      }
      return {
        htmlAst: htmlResult.rootNodes,
        templateAst: parseResult.templateAst,
        directive: data.metadata, directives, pipes,
        parseErrors: parseResult.errors, expressionParser, template,
      };
    } catch (e) {
      return {
        kind: DiagnosticKind.Error,
        message: e.message,
        span:
            e.fileName === fileName && template.query.getSpanAt(e.line, e.column) || template.span,
      };
    }
  }
}

function findSuitableDefaultModule(modules: NgAnalyzedModules): CompileNgModuleMetadata|undefined {
  let result: CompileNgModuleMetadata|undefined = undefined;
  let resultSize = 0;
  for (const module of modules.ngModules) {
    const moduleSize = module.transitiveModule.directives.length;
    if (moduleSize > resultSize) {
      result = module;
      resultSize = moduleSize;
    }
  }
  return result;
}

function spanOf(node: ts.Node): Span {
  return {start: node.getStart(), end: node.getEnd()};
}

function spanAt(sourceFile: ts.SourceFile, line: number, column: number): Span|undefined {
  if (line != null && column != null) {
    const position = ts.getPositionOfLineAndCharacter(sourceFile, line, column);
    const findChild = function findChild(node: ts.Node): ts.Node | undefined {
      if (node.kind > ts.SyntaxKind.LastToken && node.pos <= position && node.end > position) {
        const betterNode = ts.forEachChild(node, findChild);
        return betterNode || node;
      }
    };

    const node = ts.forEachChild(sourceFile, findChild);
    if (node) {
      return {start: node.getStart(), end: node.getEnd()};
    }
  }
}

function convertChain(chain: FormattedMessageChain): DiagnosticMessageChain {
  return {message: chain.message, next: chain.next ? convertChain(chain.next) : undefined};
}

function errorToDiagnosticWithChain(error: FormattedError, span: Span): DeclarationError {
  return {message: error.chain ? convertChain(error.chain) : error.message, span};
}
