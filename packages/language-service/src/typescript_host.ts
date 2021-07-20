/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {analyzeNgModules, AotSummaryResolver, CompileDirectiveSummary, CompileMetadataResolver, CompileNgModuleMetadata, CompilePipeSummary, CompilerConfig, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, FormattedError, FormattedMessageChain, HtmlParser, isFormattedError, JitSummaryResolver, Lexer, NgAnalyzedModules, NgModuleResolver, Parser, ParseTreeResult, PipeResolver, ResourceLoader, StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, TemplateParser, UrlResolver} from '@angular/compiler';
import {SchemaMetadata, ViewEncapsulation, ɵConsole as Console} from '@angular/core';
import * as path from 'path';
import * as tss from 'typescript/lib/tsserverlibrary';

import {ReflectorHost} from './reflector_host';
import {ExternalTemplate, InlineTemplate} from './template';
import {findTightestNode, getClassDeclFromDecoratorProp, getDirectiveClassLike, getPropertyAssignmentFromValue} from './ts_utils';
import {AstResult, Declaration, DeclarationError, DiagnosticMessageChain, LanguageServiceHost, Span, TemplateSource} from './types';

/**
 * The language service never needs the normalized versions of the metadata. To avoid parsing
 * the content and resolving references, return an empty file. This also allows normalizing
 * template that are syntatically incorrect which is required to provide completions in
 * syntactically incorrect templates.
 */
export class DummyHtmlParser extends HtmlParser {
  override parse(): ParseTreeResult {
    return new ParseTreeResult([], []);
  }
}

/**
 * Avoid loading resources in the language servcie by using a dummy loader.
 */
export class DummyResourceLoader extends ResourceLoader {
  override get(_url: string): Promise<string> {
    return Promise.resolve('');
  }
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
  /**
   * Key of the `fileToComponent` map must be TS internal normalized path (path
   * separator must be `/`), value of the map is the StaticSymbol for the
   * Component class declaration.
   */
  private readonly fileToComponent = new Map<ts.server.NormalizedPath, StaticSymbol>();
  private readonly collectedErrors = new Map<string, any[]>();
  private readonly fileVersions = new Map<string, string>();
  private readonly urlResolver: UrlResolver;

  private lastProgram: tss.Program|undefined = undefined;
  private analyzedModules: NgAnalyzedModules = {
    files: [],
    ngModuleByPipeOrDirective: new Map(),
    ngModules: [],
  };

  constructor(readonly tsLsHost: tss.LanguageServiceHost, readonly tsLS: tss.LanguageService) {
    this.summaryResolver = new AotSummaryResolver(
        {
          loadSummary(_filePath: string) {
            return null;
          },
          isSourceFile(_sourceFilePath: string) {
            return true;
          },
          toSummaryFileName(sourceFilePath: string) {
            return sourceFilePath;
          },
          fromSummaryFileName(filePath: string): string {
            return filePath;
          },
        },
        this.staticSymbolCache);
    this.reflectorHost = new ReflectorHost(() => this.program, tsLsHost);
    this.staticSymbolResolver = new StaticSymbolResolver(
        this.reflectorHost, this.staticSymbolCache, this.summaryResolver,
        (e, filePath) => this.collectError(e, filePath));
    this.urlResolver = {
      resolve: (baseUrl: string, url: string) => {
        // In practice, `directoryExists` is always defined.
        // https://github.com/microsoft/TypeScript/blob/0b6c9254a850dd07056259d4eefca7721745af75/src/server/project.ts#L1608-L1614
        if (tsLsHost.directoryExists!(baseUrl)) {
          return path.resolve(baseUrl, url);
        }
        return path.resolve(path.dirname(baseUrl), url);
      }
    };
  }

  // The resolver is instantiated lazily and should not be accessed directly.
  // Instead, call the resolver getter. The instantiation of the resolver also
  // requires instantiation of the StaticReflector, and the latter requires
  // resolution of core Angular symbols. Module resolution should not be done
  // during instantiation to avoid cyclic dependency between the plugin and the
  // containing Project, so the Singleton pattern is used here.
  private _resolver: CompileMetadataResolver|undefined;

  /**
   * Return the singleton instance of the MetadataResolver.
   */
  private get resolver(): CompileMetadataResolver {
    if (this._resolver) {
      return this._resolver;
    }
    // StaticReflector keeps its own private caches that are not clearable.
    // We have no choice but to create a new instance to invalidate the caches.
    // TODO: Revisit this when language service gets rewritten for Ivy.
    const staticReflector = new StaticReflector(
        this.summaryResolver, this.staticSymbolResolver,
        [],  // knownMetadataClasses
        [],  // knownMetadataFunctions
        (e, filePath) => this.collectError(e, filePath));
    // Because static reflector above is changed, we need to create a new
    // resolver.
    const moduleResolver = new NgModuleResolver(staticReflector);
    const directiveResolver = new DirectiveResolver(staticReflector);
    const pipeResolver = new PipeResolver(staticReflector);
    const elementSchemaRegistry = new DomElementSchemaRegistry();
    const resourceLoader = new DummyResourceLoader();
    const htmlParser = new DummyHtmlParser();
    // This tracks the CompileConfig in codegen.ts. Currently these options
    // are hard-coded.
    const config = new CompilerConfig({
      defaultEncapsulation: ViewEncapsulation.Emulated,
      useJit: false,
    });
    const directiveNormalizer =
        new DirectiveNormalizer(resourceLoader, this.urlResolver, htmlParser, config);
    this._resolver = new CompileMetadataResolver(
        config, htmlParser, moduleResolver, directiveResolver, pipeResolver,
        new JitSummaryResolver(), elementSchemaRegistry, directiveNormalizer, new Console(),
        this.staticSymbolCache, staticReflector,
        (error, type) => this.collectError(error, type && type.filePath));
    return this._resolver;
  }

  /**
   * Return the singleton instance of the StaticReflector hosted in the
   * MetadataResolver.
   */
  private get reflector(): StaticReflector {
    return this.resolver.getReflector() as StaticReflector;
  }

  /**
   * Return all known external templates.
   */
  getExternalTemplates(): ts.server.NormalizedPath[] {
    return [...this.fileToComponent.keys()];
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
    this.fileToComponent.clear();
    this.collectedErrors.clear();
    this.resolver.clearCache();

    const analyzeHost = {
      isSourceFile(_filePath: string) {
        return true;
      }
    };
    const programFiles = this.program.getSourceFiles().map(sf => sf.fileName);

    try {
      this.analyzedModules =
          analyzeNgModules(programFiles, analyzeHost, this.staticSymbolResolver, this.resolver);
    } catch (e) {
      // Analyzing modules may throw; in that case, reuse the old modules.
      this.error(`Analyzing NgModules failed. ${e}`);
      return this.analyzedModules;
    }

    // update template references and fileToComponent
    for (const ngModule of this.analyzedModules.ngModules) {
      for (const directive of ngModule.declaredDirectives) {
        const {metadata} = this.resolver.getNonNormalizedDirectiveMetadata(directive.reference)!;
        if (metadata.isComponent && metadata.template && metadata.template.templateUrl) {
          const templateName = this.urlResolver.resolve(
              this.reflector.componentModuleUrl(directive.reference),
              metadata.template.templateUrl);
          this.fileToComponent.set(tss.server.toNormalizedPath(templateName), directive.reference);
        }
      }
    }

    return this.analyzedModules;
  }

  /**
   * Checks whether the program has changed, and invalidate static symbols in
   * the source files that have changed.
   * Returns true if modules are up-to-date, false otherwise.
   * This should only be called by getAnalyzedModules().
   */
  private upToDate(): boolean {
    const {lastProgram, program} = this;
    if (lastProgram === program) {
      return true;
    }
    this.lastProgram = program;

    // Even though the program has changed, it could be the case that none of
    // the source files have changed. If all source files remain the same, then
    // program is still up-to-date, and we should not invalidate caches.
    let filesAdded = 0;
    const filesChangedOrRemoved: string[] = [];

    // Check if any source files have been added / changed since last computation.
    const seen = new Set<string>();
    const ANGULAR_CORE = '@angular/core';
    const corePath = this.reflectorHost.moduleNameToFileName(ANGULAR_CORE);
    for (const {fileName} of program.getSourceFiles()) {
      // If `@angular/core` is edited, the language service would have to be
      // restarted, so ignore changes to `@angular/core`.
      // When the StaticReflector is initialized at startup, it loads core
      // symbols from @angular/core by calling initializeConversionMap(). This
      // is only done once. If the file is invalidated, some of the core symbols
      // will be lost permanently.
      if (fileName === corePath) {
        continue;
      }
      seen.add(fileName);
      const version = this.tsLsHost.getScriptVersion(fileName);
      const lastVersion = this.fileVersions.get(fileName);
      if (lastVersion === undefined) {
        filesAdded++;
        this.fileVersions.set(fileName, version);
      } else if (version !== lastVersion) {
        filesChangedOrRemoved.push(fileName);  // changed
        this.fileVersions.set(fileName, version);
      }
    }

    // Check if any source files have been removed since last computation.
    for (const [fileName] of this.fileVersions) {
      if (!seen.has(fileName)) {
        filesChangedOrRemoved.push(fileName);  // removed
        // Because Maps are iterated in insertion order, it is safe to delete
        // entries from the same map while iterating.
        // See https://stackoverflow.com/questions/35940216 and
        // https://www.ecma-international.org/ecma-262/10.0/index.html#sec-map.prototype.foreach
        this.fileVersions.delete(fileName);
      }
    }

    for (const fileName of filesChangedOrRemoved) {
      const symbols = this.staticSymbolResolver.invalidateFile(fileName);
      this.reflector.invalidateSymbols(symbols);
    }

    // Program is up-to-date iff no files are added, changed, or removed.
    return filesAdded === 0 && filesChangedOrRemoved.length === 0;
  }

  /**
   * Find all templates in the specified `file`.
   * @param fileName TS or HTML file
   */
  getTemplates(fileName: string): TemplateSource[] {
    const results: TemplateSource[] = [];
    if (fileName.endsWith('.ts')) {
      // Find every template string in the file
      const visit = (child: tss.Node) => {
        const template = this.getInternalTemplate(child);
        if (template) {
          results.push(template);
        } else {
          tss.forEachChild(child, visit);
        }
      };
      const sourceFile = this.getSourceFile(fileName);
      if (sourceFile) {
        tss.forEachChild(sourceFile, visit);
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
    const visit = (child: tss.Node) => {
      const candidate = getDirectiveClassLike(child);
      if (candidate) {
        const {classId} = candidate;
        const declarationSpan = spanOf(classId);
        const className = classId.getText();
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
    tss.forEachChild(sourceFile, visit);

    return results;
  }

  getSourceFile(fileName: string): tss.SourceFile|undefined {
    if (!fileName.endsWith('.ts')) {
      throw new Error(`Non-TS source file requested: ${fileName}`);
    }
    return this.program.getSourceFile(fileName);
  }

  get program(): tss.Program {
    const program = this.tsLS.getProgram();
    if (!program) {
      // Program is very very unlikely to be undefined.
      throw new Error('No program in language service!');
    }
    return program;
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
  private getInternalTemplate(node: tss.Node): TemplateSource|undefined {
    if (!tss.isStringLiteralLike(node)) {
      return;
    }
    const tmplAsgn = getPropertyAssignmentFromValue(node, 'template');
    if (!tmplAsgn) {
      return;
    }
    const classDecl = getClassDeclFromDecoratorProp(tmplAsgn);
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
    const snapshot = this.tsLsHost.getScriptSnapshot(fileName);
    if (!snapshot) {
      return;
    }
    const source = snapshot.getText(0, snapshot.getLength());
    // Next find the component class symbol
    const classSymbol = this.fileToComponent.get(tss.server.toNormalizedPath(fileName));
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
      if (tss.isClassDeclaration(child) && child.name && child.name.text === classSymbol.name) {
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

  private getCollectedErrors(defaultSpan: Span, sourceFile: tss.SourceFile): DeclarationError[] {
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
    return this.getTemplateAst(template);
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
   * Parse the `template` and return its AST, if any.
   * @param template template to be parsed
   */
  getTemplateAst(template: TemplateSource): AstResult|undefined {
    const {type: classSymbol, fileName} = template;
    const data = this.resolver.getNonNormalizedDirectiveMetadata(classSymbol);
    if (!data) {
      return;
    }
    const htmlParser = new HtmlParser();
    const expressionParser = new Parser(new Lexer());
    const parser = new TemplateParser(
        new CompilerConfig(), this.reflector, expressionParser, new DomElementSchemaRegistry(),
        htmlParser,
        null,  // console
        []     // tranforms
    );
    const htmlResult = htmlParser.parse(template.source, fileName, {
      tokenizeExpansionForms: true,
      preserveLineEndings: true,  // do not convert CRLF to LF
    });
    const {directives, pipes, schemas} = this.getModuleMetadataForDirective(classSymbol);
    const parseResult = parser.tryParseHtml(htmlResult, data.metadata, directives, pipes, schemas);
    if (!parseResult.templateAst) {
      return;
    }
    return {
      htmlAst: htmlResult.rootNodes,
      templateAst: parseResult.templateAst,
      directive: data.metadata,
      directives,
      pipes,
      parseErrors: parseResult.errors,
      expressionParser,
      template,
    };
  }

  /**
   * Log the specified `msg` to file at INFO level. If logging is not enabled
   * this method is a no-op.
   * @param msg Log message
   */
  log(msg: string) {
    if (this.tsLsHost.log) {
      this.tsLsHost.log(msg);
    }
  }

  /**
   * Log the specified `msg` to file at ERROR level. If logging is not enabled
   * this method is a no-op.
   * @param msg error message
   */
  error(msg: string) {
    if (this.tsLsHost.error) {
      this.tsLsHost.error(msg);
    }
  }

  /**
   * Log debugging info to file at INFO level, only if verbose setting is turned
   * on. Otherwise, this method is a no-op.
   * @param msg debugging message
   */
  debug(msg: string) {
    const project = this.tsLsHost as tss.server.Project;
    if (!project.projectService) {
      // tsLsHost is not a Project
      return;
    }
    const {logger} = project.projectService;
    if (logger.hasLevel(tss.server.LogLevel.verbose)) {
      logger.info(msg);
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

function spanOf(node: tss.Node): Span {
  return {start: node.getStart(), end: node.getEnd()};
}

function spanAt(sourceFile: tss.SourceFile, line: number, column: number): Span|undefined {
  if (line != null && column != null) {
    const position = tss.getPositionOfLineAndCharacter(sourceFile, line, column);
    const findChild = function findChild(node: tss.Node): tss.Node|undefined {
      if (node.kind > tss.SyntaxKind.LastToken && node.pos <= position && node.end > position) {
        const betterNode = tss.forEachChild(node, findChild);
        return betterNode || node;
      }
    };

    const node = tss.forEachChild(sourceFile, findChild);
    if (node) {
      return {start: node.getStart(), end: node.getEnd()};
    }
  }
}

function convertChain(chain: FormattedMessageChain): DiagnosticMessageChain {
  return {message: chain.message, next: chain.next ? chain.next.map(convertChain) : undefined};
}

function errorToDiagnosticWithChain(error: FormattedError, span: Span): DeclarationError {
  return {message: error.chain ? convertChain(error.chain) : error.message, span};
}
