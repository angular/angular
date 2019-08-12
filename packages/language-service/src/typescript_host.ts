/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotSummaryResolver, CompileMetadataResolver, CompileNgModuleMetadata, CompilerConfig, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, FormattedError, FormattedMessageChain, HtmlParser, I18NHtmlParser, JitSummaryResolver, Lexer, NgAnalyzedModules, NgModuleResolver, ParseTreeResult, Parser, PipeResolver, ResourceLoader, StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, TemplateParser, analyzeNgModules, createOfflineCompileUrlResolver, isFormattedError} from '@angular/compiler';
import {getClassMembersFromDeclaration, getPipesTable, getSymbolQuery} from '@angular/compiler-cli/src/language_services';
import {ViewEncapsulation, ɵConsole as Console} from '@angular/core';
import * as ts from 'typescript';

import {AstResult, TemplateInfo} from './common';
import {createLanguageService} from './language_service';
import {ReflectorHost} from './reflector_host';
import {Declaration, DeclarationError, Declarations, Diagnostic, DiagnosticKind, DiagnosticMessageChain, LanguageService, LanguageServiceHost, Span, SymbolQuery, TemplateSource} from './types';

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

  // Data members below are prefixed with '_' because they have corresponding
  // getters. These properties get invalidated when caches are cleared.
  private _resolver: CompileMetadataResolver|null = null;
  private _reflector: StaticReflector|null = null;

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
        (e, filePath) => this.collectError(e, filePath !));
  }

  private get resolver(): CompileMetadataResolver {
    if (!this._resolver) {
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

      this._resolver = new CompileMetadataResolver(
          config, htmlParser, moduleResolver, directiveResolver, pipeResolver,
          new JitSummaryResolver(), elementSchemaRegistry, directiveNormalizer, new Console(),
          this.staticSymbolCache, this.reflector,
          (error, type) => this.collectError(error, type && type.filePath));
    }
    return this._resolver;
  }

  getTemplateReferences(): string[] { return [...this.templateReferences]; }

  /**
   * Get the Angular template in the file, if any. If TS file is provided then
   * return the inline template, otherwise return the external template.
   * @param fileName Either TS or HTML file
   * @param position Only used if file is TS
   */
  getTemplateAt(fileName: string, position: number): TemplateSource|undefined {
    if (fileName.endsWith('.ts')) {
      const sourceFile = this.getSourceFile(fileName);
      if (sourceFile) {
        const node = this.findNode(sourceFile, position);
        if (node) {
          return this.getSourceFromNode(fileName, node);
        }
      }
    } else {
      const componentSymbol = this.fileToComponent.get(fileName);
      if (componentSymbol) {
        return this.getSourceFromType(fileName, componentSymbol);
      }
    }
    return undefined;
  }

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

  getTemplates(fileName: string): TemplateSource[] {
    const results: TemplateSource[] = [];
    if (fileName.endsWith('.ts')) {
      // Find every template string in the file
      const visit = (child: ts.Node) => {
        const templateSource = this.getSourceFromNode(fileName, child);
        if (templateSource) {
          results.push(templateSource);
        } else {
          ts.forEachChild(child, visit);
        }
      };

      const sourceFile = this.getSourceFile(fileName);
      if (sourceFile) {
        ts.forEachChild(sourceFile, visit);
      }
    } else {
      const componentSymbol = this.fileToComponent.get(fileName);
      if (componentSymbol) {
        const templateSource = this.getTemplateAt(fileName, 0);
        if (templateSource) {
          results.push(templateSource);
        }
      }
    }
    return results;
  }

  getDeclarations(fileName: string): Declarations {
    if (!fileName.endsWith('.ts')) {
      return [];
    }
    const result: Declarations = [];
    const sourceFile = this.getSourceFile(fileName);
    if (sourceFile) {
      const visit = (child: ts.Node) => {
        const declaration = this.getDeclarationFromNode(sourceFile, child);
        if (declaration) {
          result.push(declaration);
        } else {
          ts.forEachChild(child, visit);
        }
      };
      ts.forEachChild(sourceFile, visit);
    }
    return result;
  }

  getSourceFile(fileName: string): ts.SourceFile|undefined {
    if (!fileName.endsWith('.ts')) {
      throw new Error(`Non-TS source file requested: ${fileName}`);
    }
    return this.program.getSourceFile(fileName);
  }

  private get program() {
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

    this._resolver = null;
    this._reflector = null;

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
   * Return the template source given the Class declaration node for the template.
   * @param fileName Name of the file that contains the template. Could be TS or HTML.
   * @param source Source text of the template.
   * @param span Source span of the template.
   * @param classSymbol Angular symbol for the class declaration.
   * @param declaration TypeScript symbol for the class declaration.
   * @param node If file is TS this is the template node, otherwise it's the class declaration node.
   * @param sourceFile Source file of the class declaration.
   */
  private getSourceFromDeclaration(
      fileName: string, source: string, span: Span, classSymbol: StaticSymbol,
      declaration: ts.ClassDeclaration, node: ts.Node, sourceFile: ts.SourceFile): TemplateSource
      |undefined {
    let queryCache: SymbolQuery|undefined = undefined;
    const self = this;
    const program = this.program;
    const typeChecker = program.getTypeChecker();
    if (declaration) {
      return {
        version: this.host.getScriptVersion(fileName),
        source,
        span,
        type: classSymbol,
        get members() {
          return getClassMembersFromDeclaration(program, typeChecker, sourceFile, declaration);
        },
        get query() {
          if (!queryCache) {
            const templateInfo = self.getTemplateAst(this, fileName);
            const pipes = templateInfo && templateInfo.pipes || [];
            queryCache = getSymbolQuery(
                program, typeChecker, sourceFile,
                () => getPipesTable(sourceFile, program, typeChecker, pipes));
          }
          return queryCache;
        }
      };
    }
  }

  /**
   * Return the TemplateSource for the inline template.
   * @param fileName TS file that contains the template
   * @param node Potential template node
   */
  private getSourceFromNode(fileName: string, node: ts.Node): TemplateSource|undefined {
    switch (node.kind) {
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      case ts.SyntaxKind.StringLiteral:
        const [declaration] = this.getTemplateClassDeclFromNode(node);
        if (declaration && declaration.name) {
          const sourceFile = this.getSourceFile(fileName);
          if (sourceFile) {
            return this.getSourceFromDeclaration(
                fileName, this.stringOf(node) || '', shrink(spanOf(node)),
                this.reflector.getStaticSymbol(sourceFile.fileName, declaration.name.text),
                declaration, node, sourceFile);
          }
        }
        break;
    }
    return;
  }

  /**
   * Return the TemplateSource for the template associated with the classSymbol.
   * @param fileName Template file (HTML)
   * @param classSymbol
   */
  private getSourceFromType(fileName: string, classSymbol: StaticSymbol): TemplateSource|undefined {
    const declaration = this.getTemplateClassFromStaticSymbol(classSymbol);
    if (declaration) {
      const snapshot = this.host.getScriptSnapshot(fileName);
      if (snapshot) {
        const source = snapshot.getText(0, snapshot.getLength());
        return this.getSourceFromDeclaration(
            fileName, source, {start: 0, end: source.length}, classSymbol, declaration, declaration,
            declaration.getSourceFile());
      }
    }
    return;
  }

  private collectError(error: any, filePath: string|null) {
    if (filePath) {
      let errors = this.collectedErrors.get(filePath);
      if (!errors) {
        errors = [];
        this.collectedErrors.set(filePath, errors);
      }
      errors.push(error);
    }
  }

  private get reflector(): StaticReflector {
    if (!this._reflector) {
      this._reflector = new StaticReflector(
          this.summaryResolver, this.staticSymbolResolver,
          [],  // knownMetadataClasses
          [],  // knownMetadataFunctions
          (e, filePath) => this.collectError(e, filePath !));
    }
    return this._reflector;
  }

  private getTemplateClassFromStaticSymbol(type: StaticSymbol): ts.ClassDeclaration|undefined {
    const source = this.getSourceFile(type.filePath);
    if (!source) {
      return;
    }
    const declarationNode = ts.forEachChild(source, child => {
      if (child.kind === ts.SyntaxKind.ClassDeclaration) {
        const classDeclaration = child as ts.ClassDeclaration;
        if (classDeclaration.name && classDeclaration.name.text === type.name) {
          return classDeclaration;
        }
      }
    });
    return declarationNode as ts.ClassDeclaration;
  }

  private static missingTemplate: [ts.ClassDeclaration | undefined, ts.Expression|undefined] =
      [undefined, undefined];

  /**
   * Given a template string node, see if it is an Angular template string, and if so return the
   * containing class.
   */
  private getTemplateClassDeclFromNode(currentToken: ts.Node):
      [ts.ClassDeclaration | undefined, ts.Expression|undefined] {
    // Verify we are in a 'template' property assignment, in an object literal, which is an call
    // arg, in a decorator
    let parentNode = currentToken.parent;  // PropertyAssignment
    if (!parentNode) {
      return TypeScriptServiceHost.missingTemplate;
    }
    if (parentNode.kind !== ts.SyntaxKind.PropertyAssignment) {
      return TypeScriptServiceHost.missingTemplate;
    } else {
      // TODO: Is this different for a literal, i.e. a quoted property name like "template"?
      if ((parentNode as any).name.text !== 'template') {
        return TypeScriptServiceHost.missingTemplate;
      }
    }
    parentNode = parentNode.parent;  // ObjectLiteralExpression
    if (!parentNode || parentNode.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
      return TypeScriptServiceHost.missingTemplate;
    }

    parentNode = parentNode.parent;  // CallExpression
    if (!parentNode || parentNode.kind !== ts.SyntaxKind.CallExpression) {
      return TypeScriptServiceHost.missingTemplate;
    }
    const callTarget = (<ts.CallExpression>parentNode).expression;

    const decorator = parentNode.parent;  // Decorator
    if (!decorator || decorator.kind !== ts.SyntaxKind.Decorator) {
      return TypeScriptServiceHost.missingTemplate;
    }

    const declaration = <ts.ClassDeclaration>decorator.parent;  // ClassDeclaration
    if (!declaration || declaration.kind !== ts.SyntaxKind.ClassDeclaration) {
      return TypeScriptServiceHost.missingTemplate;
    }
    return [declaration, callTarget];
  }

  private getCollectedErrors(defaultSpan: Span, sourceFile: ts.SourceFile): DeclarationError[] {
    const errors = this.collectedErrors.get(sourceFile.fileName);
    return (errors && errors.map((e: any) => {
             const line = e.line || (e.position && e.position.line);
             const column = e.column || (e.position && e.position.column);
             const span = spanAt(sourceFile, line, column) || defaultSpan;
             if (isFormattedError(e)) {
               return errorToDiagnosticWithChain(e, span);
             }
             return {message: e.message, span};
           })) ||
        [];
  }

  private getDeclarationFromNode(sourceFile: ts.SourceFile, node: ts.Node): Declaration|undefined {
    if (node.kind == ts.SyntaxKind.ClassDeclaration && node.decorators &&
        (node as ts.ClassDeclaration).name) {
      for (const decorator of node.decorators) {
        if (decorator.expression && decorator.expression.kind == ts.SyntaxKind.CallExpression) {
          const classDeclaration = node as ts.ClassDeclaration;
          if (classDeclaration.name) {
            const call = decorator.expression as ts.CallExpression;
            const target = call.expression;
            const type = this.program.getTypeChecker().getTypeAtLocation(target);
            if (type) {
              const staticSymbol =
                  this.reflector.getStaticSymbol(sourceFile.fileName, classDeclaration.name.text);
              try {
                if (this.resolver.isDirective(staticSymbol as any)) {
                  const {metadata} =
                      this.resolver.getNonNormalizedDirectiveMetadata(staticSymbol as any) !;
                  const declarationSpan = spanOf(target);
                  return {
                    type: staticSymbol,
                    declarationSpan,
                    metadata,
                    errors: this.getCollectedErrors(declarationSpan, sourceFile)
                  };
                }
              } catch (e) {
                if (e.message) {
                  this.collectError(e, sourceFile.fileName);
                  const declarationSpan = spanOf(target);
                  return {
                    type: staticSymbol,
                    declarationSpan,
                    errors: this.getCollectedErrors(declarationSpan, sourceFile)
                  };
                }
              }
            }
          }
        }
      }
    }
  }

  private stringOf(node: ts.Node): string|undefined {
    switch (node.kind) {
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        return (<ts.LiteralExpression>node).text;
      case ts.SyntaxKind.StringLiteral:
        return (<ts.StringLiteral>node).text;
    }
  }

  private findNode(sourceFile: ts.SourceFile, position: number): ts.Node|undefined {
    function find(node: ts.Node): ts.Node|undefined {
      if (position >= node.getStart() && position < node.getEnd()) {
        return ts.forEachChild(node, find) || node;
      }
    }

    return find(sourceFile);
  }

  getTemplateAstAtPosition(fileName: string, position: number): TemplateInfo|undefined {
    const template = this.getTemplateAt(fileName, position);
    if (!template) {
      return;
    }
    const astResult = this.getTemplateAst(template, fileName);
    if (astResult && astResult.htmlAst && astResult.templateAst && astResult.directive &&
        astResult.directives && astResult.pipes && astResult.expressionParser) {
      return {
        position,
        fileName,
        template,
        htmlAst: astResult.htmlAst,
        directive: astResult.directive,
        directives: astResult.directives,
        pipes: astResult.pipes,
        templateAst: astResult.templateAst,
        expressionParser: astResult.expressionParser
      };
    }
  }

  getTemplateAst(template: TemplateSource, contextFile: string): AstResult {
    try {
      const resolvedMetadata = this.resolver.getNonNormalizedDirectiveMetadata(template.type);
      const metadata = resolvedMetadata && resolvedMetadata.metadata;
      if (!metadata) {
        return {};
      }
      const rawHtmlParser = new HtmlParser();
      const htmlParser = new I18NHtmlParser(rawHtmlParser);
      const expressionParser = new Parser(new Lexer());
      const config = new CompilerConfig();
      const parser = new TemplateParser(
          config, this.resolver.getReflector(), expressionParser, new DomElementSchemaRegistry(),
          htmlParser, null !, []);
      const htmlResult = htmlParser.parse(template.source, '', {tokenizeExpansionForms: true});
      const errors: Diagnostic[]|undefined = undefined;
      const ngModule = this.analyzedModules.ngModuleByPipeOrDirective.get(template.type) ||
          // Reported by the the declaration diagnostics.
          findSuitableDefaultModule(this.analyzedModules);
      if (!ngModule) {
        return {};
      }
      const directives = ngModule.transitiveModule.directives
                             .map(d => this.resolver.getNonNormalizedDirectiveMetadata(d.reference))
                             .filter(d => d)
                             .map(d => d !.metadata.toSummary());
      const pipes = ngModule.transitiveModule.pipes.map(
          p => this.resolver.getOrLoadPipeMetadata(p.reference).toSummary());
      const schemas = ngModule.schemas;
      const parseResult = parser.tryParseHtml(htmlResult, metadata, directives, pipes, schemas);
      return {
        htmlAst: htmlResult.rootNodes,
        templateAst: parseResult.templateAst,
        directive: metadata, directives, pipes,
        parseErrors: parseResult.errors, expressionParser, errors
      };
    } catch (e) {
      const span =
          e.fileName === contextFile && template.query.getSpanAt(e.line, e.column) || template.span;
      return {
        errors: [{
          kind: DiagnosticKind.Error,
          message: e.message, span,
        }],
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

function shrink(span: Span, offset?: number) {
  if (offset == null) offset = 1;
  return {start: span.start + offset, end: span.end - offset};
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
