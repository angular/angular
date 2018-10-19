/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotSummaryResolver, CompileMetadataResolver, CompilerConfig, DEFAULT_INTERPOLATION_CONFIG, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, FormattedError, FormattedMessageChain, HtmlParser, InterpolationConfig, JitSummaryResolver, NgAnalyzedModules, NgModuleResolver, ParseTreeResult, PipeResolver, ResourceLoader, StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, SummaryResolver, analyzeNgModules, createOfflineCompileUrlResolver, isFormattedError} from '@angular/compiler';
import {CompilerOptions, getClassMembersFromDeclaration, getPipesTable, getSymbolQuery} from '@angular/compiler-cli/src/language_services';
import {ViewEncapsulation, ɵConsole as Console} from '@angular/core';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {createLanguageService} from './language_service';
import {ReflectorHost} from './reflector_host';
import {BuiltinType, Declaration, DeclarationError, DeclarationKind, Declarations, Definition, DiagnosticMessageChain, LanguageService, LanguageServiceHost, PipeInfo, Pipes, Signature, Span, Symbol, SymbolDeclaration, SymbolQuery, SymbolTable, TemplateSource, TemplateSources} from './types';
import {isTypescriptVersion} from './utils';



/**
 * Create a `LanguageServiceHost`
 */
export function createLanguageServiceFromTypescript(
    host: ts.LanguageServiceHost, service: ts.LanguageService): LanguageService {
  const ngHost = new TypeScriptServiceHost(host, service);
  const ngServer = createLanguageService(ngHost);
  ngHost.setSite(ngServer);
  return ngServer;
}

/**
 * The language service never needs the normalized versions of the metadata. To avoid parsing
 * the content and resolving references, return an empty file. This also allows normalizing
 * template that are syntatically incorrect which is required to provide completions in
 * syntactically incorrect templates.
 */
export class DummyHtmlParser extends HtmlParser {
  parse(
      source: string, url: string, parseExpansionForms: boolean = false,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): ParseTreeResult {
    return new ParseTreeResult([], []);
  }
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
  // TODO(issue/24571): remove '!'.
  private _resolver !: CompileMetadataResolver | null;
  private _staticSymbolCache = new StaticSymbolCache();
  // TODO(issue/24571): remove '!'.
  private _summaryResolver !: AotSummaryResolver;
  // TODO(issue/24571): remove '!'.
  private _staticSymbolResolver !: StaticSymbolResolver;
  // TODO(issue/24571): remove '!'.
  private _reflector !: StaticReflector | null;
  // TODO(issue/24571): remove '!'.
  private _reflectorHost !: ReflectorHost;
  // TODO(issue/24571): remove '!'.
  private _checker !: ts.TypeChecker | null;
  private _typeCache: Symbol[] = [];
  private context: string|undefined;
  private lastProgram: ts.Program|undefined;
  private modulesOutOfDate: boolean = true;
  // TODO(issue/24571): remove '!'.
  private analyzedModules !: NgAnalyzedModules | null;
  // TODO(issue/24571): remove '!'.
  private service !: LanguageService;
  // TODO(issue/24571): remove '!'.
  private fileToComponent !: Map<string, StaticSymbol>| null;
  // TODO(issue/24571): remove '!'.
  private templateReferences !: string[] | null;
  // TODO(issue/24571): remove '!'.
  private collectedErrors !: Map<string, any[]>| null;
  private fileVersions = new Map<string, string>();

  constructor(private host: ts.LanguageServiceHost, private tsService: ts.LanguageService) {}

  setSite(service: LanguageService) { this.service = service; }

  /**
   * Angular LanguageServiceHost implementation
   */
  get resolver(): CompileMetadataResolver {
    this.validate();
    let result = this._resolver;
    if (!result) {
      const moduleResolver = new NgModuleResolver(this.reflector);
      const directiveResolver = new DirectiveResolver(this.reflector);
      const pipeResolver = new PipeResolver(this.reflector);
      const elementSchemaRegistry = new DomElementSchemaRegistry();
      const resourceLoader = new DummyResourceLoader();
      const urlResolver = createOfflineCompileUrlResolver();
      const htmlParser = new DummyHtmlParser();
      // This tracks the CompileConfig in codegen.ts. Currently these options
      // are hard-coded.
      const config =
          new CompilerConfig({defaultEncapsulation: ViewEncapsulation.Emulated, useJit: false});
      const directiveNormalizer =
          new DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);

      result = this._resolver = new CompileMetadataResolver(
          config, htmlParser, moduleResolver, directiveResolver, pipeResolver,
          new JitSummaryResolver(), elementSchemaRegistry, directiveNormalizer, new Console(),
          this._staticSymbolCache, this.reflector,
          (error, type) => this.collectError(error, type && type.filePath));
    }
    return result;
  }

  getTemplateReferences(): string[] {
    this.ensureTemplateMap();
    return this.templateReferences || [];
  }

  getTemplateAt(fileName: string, position: number): TemplateSource|undefined {
    let sourceFile = this.getSourceFile(fileName);
    if (sourceFile) {
      this.context = sourceFile.fileName;
      let node = this.findNode(sourceFile, position);
      if (node) {
        return this.getSourceFromNode(
            fileName, this.host.getScriptVersion(sourceFile.fileName), node);
      }
    } else {
      this.ensureTemplateMap();
      // TODO: Cannocalize the file?
      const componentType = this.fileToComponent !.get(fileName);
      if (componentType) {
        return this.getSourceFromType(
            fileName, this.host.getScriptVersion(fileName), componentType);
      }
    }
    return undefined;
  }

  getAnalyzedModules(): NgAnalyzedModules {
    this.updateAnalyzedModules();
    return this.ensureAnalyzedModules();
  }

  private ensureAnalyzedModules(): NgAnalyzedModules {
    let analyzedModules = this.analyzedModules;
    if (!analyzedModules) {
      if (this.host.getScriptFileNames().length === 0) {
        analyzedModules = {
          files: [],
          ngModuleByPipeOrDirective: new Map(),
          ngModules: [],
        };
      } else {
        const analyzeHost = {isSourceFile(filePath: string) { return true; }};
        const programFiles = this.program !.getSourceFiles().map(sf => sf.fileName);
        analyzedModules =
            analyzeNgModules(programFiles, analyzeHost, this.staticSymbolResolver, this.resolver);
      }
      this.analyzedModules = analyzedModules;
    }
    return analyzedModules;
  }

  getTemplates(fileName: string): TemplateSources {
    this.ensureTemplateMap();
    const componentType = this.fileToComponent !.get(fileName);
    if (componentType) {
      const templateSource = this.getTemplateAt(fileName, 0);
      if (templateSource) {
        return [templateSource];
      }
    } else {
      let version = this.host.getScriptVersion(fileName);
      let result: TemplateSource[] = [];

      // Find each template string in the file
      let visit = (child: ts.Node) => {
        let templateSource = this.getSourceFromNode(fileName, version, child);
        if (templateSource) {
          result.push(templateSource);
        } else {
          ts.forEachChild(child, visit);
        }
      };

      let sourceFile = this.getSourceFile(fileName);
      if (sourceFile) {
        this.context = (sourceFile as any).path || sourceFile.fileName;
        ts.forEachChild(sourceFile, visit);
      }
      return result.length ? result : undefined;
    }
  }

  getDeclarations(fileName: string): Declarations {
    const result: Declarations = [];
    const sourceFile = this.getSourceFile(fileName);
    if (sourceFile) {
      let visit = (child: ts.Node) => {
        let declaration = this.getDeclarationFromNode(sourceFile, child);
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
    return this.tsService.getProgram() !.getSourceFile(fileName);
  }

  updateAnalyzedModules() {
    this.validate();
    if (this.modulesOutOfDate) {
      this.analyzedModules = null;
      this._reflector = null;
      this.templateReferences = null;
      this.fileToComponent = null;
      this.ensureAnalyzedModules();
      this.modulesOutOfDate = false;
    }
  }

  private get program() { return this.tsService.getProgram(); }

  private get checker() {
    let checker = this._checker;
    if (!checker) {
      checker = this._checker = this.program !.getTypeChecker();
    }
    return checker;
  }

  private validate() {
    const program = this.program;
    if (this.lastProgram !== program) {
      // Invalidate file that have changed in the static symbol resolver
      const invalidateFile = (fileName: string) =>
          this._staticSymbolResolver.invalidateFile(fileName);
      this.clearCaches();
      const seen = new Set<string>();
      for (let sourceFile of this.program !.getSourceFiles()) {
        const fileName = sourceFile.fileName;
        seen.add(fileName);
        const version = this.host.getScriptVersion(fileName);
        const lastVersion = this.fileVersions.get(fileName);
        if (version != lastVersion) {
          this.fileVersions.set(fileName, version);
          if (this._staticSymbolResolver) {
            invalidateFile(fileName);
          }
        }
      }

      // Remove file versions that are no longer in the file and invalidate them.
      const missing = Array.from(this.fileVersions.keys()).filter(f => !seen.has(f));
      missing.forEach(f => this.fileVersions.delete(f));
      if (this._staticSymbolResolver) {
        missing.forEach(invalidateFile);
      }

      this.lastProgram = program;
    }
  }

  private clearCaches() {
    this._checker = null;
    this._typeCache = [];
    this._resolver = null;
    this.collectedErrors = null;
    this.modulesOutOfDate = true;
  }

  private ensureTemplateMap() {
    if (!this.fileToComponent || !this.templateReferences) {
      const fileToComponent = new Map<string, StaticSymbol>();
      const templateReference: string[] = [];
      const ngModuleSummary = this.getAnalyzedModules();
      const urlResolver = createOfflineCompileUrlResolver();
      for (const module of ngModuleSummary.ngModules) {
        for (const directive of module.declaredDirectives) {
          const {metadata} = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference) !;
          if (metadata.isComponent && metadata.template && metadata.template.templateUrl) {
            const templateName = urlResolver.resolve(
                this.reflector.componentModuleUrl(directive.reference),
                metadata.template.templateUrl);
            fileToComponent.set(templateName, directive.reference);
            templateReference.push(templateName);
          }
        }
      }
      this.fileToComponent = fileToComponent;
      this.templateReferences = templateReference;
    }
  }

  private getSourceFromDeclaration(
      fileName: string, version: string, source: string, span: Span, type: StaticSymbol,
      declaration: ts.ClassDeclaration, node: ts.Node, sourceFile: ts.SourceFile): TemplateSource
      |undefined {
    let queryCache: SymbolQuery|undefined = undefined;
    const t = this;
    if (declaration) {
      return {
        version,
        source,
        span,
        type,
        get members() {
          return getClassMembersFromDeclaration(t.program !, t.checker, sourceFile, declaration);
        },
        get query() {
          if (!queryCache) {
            const pipes = t.service.getPipesAt(fileName, node.getStart());
            queryCache = getSymbolQuery(
                t.program !, t.checker, sourceFile,
                () => getPipesTable(sourceFile, t.program !, t.checker, pipes));
          }
          return queryCache;
        }
      };
    }
  }

  private getSourceFromNode(fileName: string, version: string, node: ts.Node): TemplateSource
      |undefined {
    let result: TemplateSource|undefined = undefined;
    const t = this;
    switch (node.kind) {
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      case ts.SyntaxKind.StringLiteral:
        let [declaration, decorator] = this.getTemplateClassDeclFromNode(node);
        if (declaration && declaration.name) {
          const sourceFile = this.getSourceFile(fileName);
          if (sourceFile) {
            return this.getSourceFromDeclaration(
                fileName, version, this.stringOf(node) || '', shrink(spanOf(node)),
                this.reflector.getStaticSymbol(sourceFile.fileName, declaration.name.text),
                declaration, node, sourceFile);
          }
        }
        break;
    }
    return result;
  }

  private getSourceFromType(fileName: string, version: string, type: StaticSymbol): TemplateSource
      |undefined {
    let result: TemplateSource|undefined = undefined;
    const declaration = this.getTemplateClassFromStaticSymbol(type);
    if (declaration) {
      const snapshot = this.host.getScriptSnapshot(fileName);
      if (snapshot) {
        const source = snapshot.getText(0, snapshot.getLength());
        result = this.getSourceFromDeclaration(
            fileName, version, source, {start: 0, end: source.length}, type, declaration,
            declaration, declaration.getSourceFile());
      }
    }
    return result;
  }

  private get reflectorHost(): ReflectorHost {
    let result = this._reflectorHost;
    if (!result) {
      if (!this.context) {
        // Make up a context by finding the first script and using that as the base dir.
        const scriptFileNames = this.host.getScriptFileNames();
        if (0 === scriptFileNames.length) {
          throw new Error('Internal error: no script file names found');
        }
        this.context = scriptFileNames[0];
      }

      // Use the file context's directory as the base directory.
      // The host's getCurrentDirectory() is not reliable as it is always "" in
      // tsserver. We don't need the exact base directory, just one that contains
      // a source file.
      const source = this.tsService.getProgram() !.getSourceFile(this.context);
      if (!source) {
        throw new Error('Internal error: no context could be determined');
      }

      const tsConfigPath = findTsConfig(source.fileName);
      const basePath = path.dirname(tsConfigPath || this.context);
      const options: CompilerOptions = {basePath, genDir: basePath};
      const compilerOptions = this.host.getCompilationSettings();
      if (compilerOptions && compilerOptions.baseUrl) {
        options.baseUrl = compilerOptions.baseUrl;
      }
      if (compilerOptions && compilerOptions.paths) {
        options.paths = compilerOptions.paths;
      }
      result = this._reflectorHost =
          new ReflectorHost(() => this.tsService.getProgram() !, this.host, options);
    }
    return result;
  }

  private collectError(error: any, filePath: string|null) {
    if (filePath) {
      let errorMap = this.collectedErrors;
      if (!errorMap || !this.collectedErrors) {
        errorMap = this.collectedErrors = new Map();
      }
      let errors = errorMap.get(filePath);
      if (!errors) {
        errors = [];
        this.collectedErrors.set(filePath, errors);
      }
      errors.push(error);
    }
  }

  private get staticSymbolResolver(): StaticSymbolResolver {
    let result = this._staticSymbolResolver;
    if (!result) {
      this._summaryResolver = new AotSummaryResolver(
          {
            loadSummary(filePath: string) { return null; },
            isSourceFile(sourceFilePath: string) { return true; },
            toSummaryFileName(sourceFilePath: string) { return sourceFilePath; },
            fromSummaryFileName(filePath: string): string{return filePath;},
          },
          this._staticSymbolCache);
      result = this._staticSymbolResolver = new StaticSymbolResolver(
          this.reflectorHost as any, this._staticSymbolCache, this._summaryResolver,
          (e, filePath) => this.collectError(e, filePath !));
    }
    return result;
  }

  private get reflector(): StaticReflector {
    let result = this._reflector;
    if (!result) {
      const ssr = this.staticSymbolResolver;
      result = this._reflector = new StaticReflector(
          this._summaryResolver, ssr, [], [], (e, filePath) => this.collectError(e, filePath !));
    }
    return result;
  }

  private getTemplateClassFromStaticSymbol(type: StaticSymbol): ts.ClassDeclaration|undefined {
    const source = this.getSourceFile(type.filePath);
    if (source) {
      const declarationNode = ts.forEachChild(source, child => {
        if (child.kind === ts.SyntaxKind.ClassDeclaration) {
          const classDeclaration = child as ts.ClassDeclaration;
          if (classDeclaration.name != null && classDeclaration.name.text === type.name) {
            return classDeclaration;
          }
        }
      });
      return declarationNode as ts.ClassDeclaration;
    }

    return undefined;
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

    let decorator = parentNode.parent;  // Decorator
    if (!decorator || decorator.kind !== ts.SyntaxKind.Decorator) {
      return TypeScriptServiceHost.missingTemplate;
    }

    let declaration = <ts.ClassDeclaration>decorator.parent;  // ClassDeclaration
    if (!declaration || declaration.kind !== ts.SyntaxKind.ClassDeclaration) {
      return TypeScriptServiceHost.missingTemplate;
    }
    return [declaration, callTarget];
  }

  private getCollectedErrors(defaultSpan: Span, sourceFile: ts.SourceFile): DeclarationError[] {
    const errors = (this.collectedErrors && this.collectedErrors.get(sourceFile.fileName));
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
            const type = this.checker.getTypeAtLocation(target);
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
}


function findTsConfig(fileName: string): string|undefined {
  let dir = path.dirname(fileName);
  while (fs.existsSync(dir)) {
    const candidate = path.join(dir, 'tsconfig.json');
    if (fs.existsSync(candidate)) return candidate;
    const parentDir = path.dirname(dir);
    if (parentDir === dir) break;
    dir = parentDir;
  }
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

function chainedMessage(chain: DiagnosticMessageChain, indent = ''): string {
  return indent + chain.message + (chain.next ? chainedMessage(chain.next, indent + '  ') : '');
}

class DiagnosticMessageChainImpl implements DiagnosticMessageChain {
  constructor(public message: string, public next?: DiagnosticMessageChain) {}
  toString(): string { return chainedMessage(this); }
}

function convertChain(chain: FormattedMessageChain): DiagnosticMessageChain {
  return {message: chain.message, next: chain.next ? convertChain(chain.next) : undefined};
}

function errorToDiagnosticWithChain(error: FormattedError, span: Span): DeclarationError {
  return {message: error.chain ? convertChain(error.chain) : error.message, span};
}
