/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, CssSelector, DEFAULT_INTERPOLATION_CONFIG, DomElementSchemaRegistry, Expression, ExternalExpr, InterpolationConfig, LexerRange, R3ComponentMetadata, SelectorMatcher, Statement, TmplAstNode, WrappedNodeExpr, compileComponentFromMetadata, makeBindingParser, parseTemplate} from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import {CycleAnalyzer} from '../../cycles';
import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {ModuleResolver, Reference, ResolvedReference} from '../../imports';
import {EnumValue, PartialEvaluator} from '../../partial_evaluator';
import {Decorator, ReflectionHost, filterToMembersWithDecorator, reflectObjectLiteral} from '../../reflection';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';
import {TypeCheckContext} from '../../typecheck';
import {tsSourceMapBug29300Fixed} from '../../util/src/ts_source_map_bug_29300';

import {ResourceLoader} from './api';
import {extractDirectiveMetadata, extractQueriesFromDecorator, parseFieldArrayValue, queriesFromFields} from './directive';
import {generateSetClassMetadataCall} from './metadata';
import {ScopeDirective, SelectorScopeRegistry} from './selector_scope';
import {extractDirectiveGuards, isAngularCore, isAngularCoreReference, unwrapExpression} from './util';

const EMPTY_MAP = new Map<string, Expression>();
const EMPTY_ARRAY: any[] = [];

export interface ComponentHandlerData {
  meta: R3ComponentMetadata;
  parsedTemplate: TmplAstNode[];
  metadataStmt: Statement|null;
}

/**
 * `DecoratorHandler` which handles the `@Component` annotation.
 */
export class ComponentDecoratorHandler implements
    DecoratorHandler<ComponentHandlerData, Decorator> {
  constructor(
      private reflector: ReflectionHost, private evaluator: PartialEvaluator,
      private scopeRegistry: SelectorScopeRegistry, private isCore: boolean,
      private resourceLoader: ResourceLoader, private rootDirs: string[],
      private defaultPreserveWhitespaces: boolean, private i18nUseExternalIds: boolean,
      private moduleResolver: ModuleResolver, private cycleAnalyzer: CycleAnalyzer) {}

  private literalCache = new Map<Decorator, ts.ObjectLiteralExpression>();
  private elementSchemaRegistry = new DomElementSchemaRegistry();


  detect(node: ts.Declaration, decorators: Decorator[]|null): Decorator|undefined {
    if (!decorators) {
      return undefined;
    }
    return decorators.find(
        decorator => decorator.name === 'Component' && (this.isCore || isAngularCore(decorator)));
  }

  preanalyze(node: ts.ClassDeclaration, decorator: Decorator): Promise<void>|undefined {
    if (!this.resourceLoader.canPreload) {
      return undefined;
    }

    const meta = this._resolveLiteral(decorator);
    const component = reflectObjectLiteral(meta);
    const promises: Promise<void>[] = [];
    const containingFile = node.getSourceFile().fileName;

    if (component.has('templateUrl')) {
      const templateUrlExpr = component.get('templateUrl') !;
      const templateUrl = this.evaluator.evaluate(templateUrlExpr);
      if (typeof templateUrl !== 'string') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, templateUrlExpr, 'templateUrl must be a string');
      }
      const resourceUrl = this.resourceLoader.resolve(templateUrl, containingFile);
      const promise = this.resourceLoader.preload(resourceUrl);
      if (promise !== undefined) {
        promises.push(promise);
      }
    }

    const styleUrls = this._extractStyleUrls(component);
    if (styleUrls !== null) {
      for (const styleUrl of styleUrls) {
        const resourceUrl = this.resourceLoader.resolve(styleUrl, containingFile);
        const promise = this.resourceLoader.preload(resourceUrl);
        if (promise !== undefined) {
          promises.push(promise);
        }
      }
    }

    if (promises.length !== 0) {
      return Promise.all(promises).then(() => undefined);
    } else {
      return undefined;
    }
  }

  analyze(node: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<ComponentHandlerData> {
    const containingFile = node.getSourceFile().fileName;
    const meta = this._resolveLiteral(decorator);
    this.literalCache.delete(decorator);

    // @Component inherits @Directive, so begin by extracting the @Directive metadata and building
    // on it.
    const directiveResult = extractDirectiveMetadata(
        node, decorator, this.reflector, this.evaluator, this.isCore,
        this.elementSchemaRegistry.getDefaultComponentElementName());
    if (directiveResult === undefined) {
      // `extractDirectiveMetadata` returns undefined when the @Directive has `jit: true`. In this
      // case, compilation of the decorator is skipped. Returning an empty object signifies
      // that no analysis was produced.
      return {};
    }

    // Next, read the `@Component`-specific fields.
    const {decoratedElements, decorator: component, metadata} = directiveResult;

    // Go through the root directories for this project, and select the one with the smallest
    // relative path representation.
    const filePath = node.getSourceFile().fileName;
    const relativeContextFilePath = this.rootDirs.reduce<string|undefined>((previous, rootDir) => {
      const candidate = path.posix.relative(rootDir, filePath);
      if (previous === undefined || candidate.length < previous.length) {
        return candidate;
      } else {
        return previous;
      }
    }, undefined) !;

    let templateStr: string|null = null;
    let templateUrl: string = '';
    let templateRange: LexerRange|undefined;
    let escapedString: boolean = false;

    if (component.has('templateUrl')) {
      const templateUrlExpr = component.get('templateUrl') !;
      const evalTemplateUrl = this.evaluator.evaluate(templateUrlExpr);
      if (typeof evalTemplateUrl !== 'string') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, templateUrlExpr, 'templateUrl must be a string');
      }
      templateUrl = this.resourceLoader.resolve(evalTemplateUrl, containingFile);
      templateStr = this.resourceLoader.load(templateUrl);
      if (!tsSourceMapBug29300Fixed()) {
        // By removing the template URL we are telling the translator not to try to
        // map the external source file to the generated code, since the version
        // of TS that is running does not support it.
        templateUrl = '';
      }
    } else if (component.has('template')) {
      const templateExpr = component.get('template') !;
      // We only support SourceMaps for inline templates that are simple string literals.
      if (ts.isStringLiteral(templateExpr) || ts.isNoSubstitutionTemplateLiteral(templateExpr)) {
        // the start and end of the `templateExpr` node includes the quotation marks, which we must
        // strip
        templateRange = getTemplateRange(templateExpr);
        templateStr = templateExpr.getSourceFile().text;
        templateUrl = relativeContextFilePath;
        escapedString = true;
      } else {
        const resolvedTemplate = this.evaluator.evaluate(templateExpr);
        if (typeof resolvedTemplate !== 'string') {
          throw new FatalDiagnosticError(
              ErrorCode.VALUE_HAS_WRONG_TYPE, templateExpr, 'template must be a string');
        }
        templateStr = resolvedTemplate;
      }
    } else {
      throw new FatalDiagnosticError(
          ErrorCode.COMPONENT_MISSING_TEMPLATE, decorator.node, 'component is missing a template');
    }

    let preserveWhitespaces: boolean = this.defaultPreserveWhitespaces;
    if (component.has('preserveWhitespaces')) {
      const expr = component.get('preserveWhitespaces') !;
      const value = this.evaluator.evaluate(expr);
      if (typeof value !== 'boolean') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, expr, 'preserveWhitespaces must be a boolean');
      }
      preserveWhitespaces = value;
    }

    const viewProviders: Expression|null = component.has('viewProviders') ?
        new WrappedNodeExpr(component.get('viewProviders') !) :
        null;

    let interpolation: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG;
    if (component.has('interpolation')) {
      const expr = component.get('interpolation') !;
      const value = this.evaluator.evaluate(expr);
      if (!Array.isArray(value) || value.length !== 2 ||
          !value.every(element => typeof element === 'string')) {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, expr,
            'interpolation must be an array with 2 elements of string type');
      }
      interpolation = InterpolationConfig.fromArray(value as[string, string]);
    }

    const template = parseTemplate(templateStr, templateUrl, {
      preserveWhitespaces,
      interpolationConfig: interpolation,
      range: templateRange, escapedString
    });
    if (template.errors !== undefined) {
      throw new Error(
          `Errors parsing template: ${template.errors.map(e => e.toString()).join(', ')}`);
    }

    // If the component has a selector, it should be registered with the `SelectorScopeRegistry` so
    // when this component appears in an `@NgModule` scope, its selector can be determined.
    if (metadata.selector !== null) {
      const ref = new ResolvedReference(node, node.name !);
      this.scopeRegistry.registerDirective(node, {
        ref,
        name: node.name !.text,
        directive: ref,
        selector: metadata.selector,
        exportAs: metadata.exportAs,
        inputs: metadata.inputs,
        outputs: metadata.outputs,
        queries: metadata.queries.map(query => query.propertyName),
        isComponent: true, ...extractDirectiveGuards(node, this.reflector),
      });
    }

    // Construct the list of view queries.
    const coreModule = this.isCore ? undefined : '@angular/core';
    const viewChildFromFields = queriesFromFields(
        filterToMembersWithDecorator(decoratedElements, 'ViewChild', coreModule), this.reflector,
        this.evaluator);
    const viewChildrenFromFields = queriesFromFields(
        filterToMembersWithDecorator(decoratedElements, 'ViewChildren', coreModule), this.reflector,
        this.evaluator);
    const viewQueries = [...viewChildFromFields, ...viewChildrenFromFields];

    if (component.has('queries')) {
      const queriesFromDecorator = extractQueriesFromDecorator(
          component.get('queries') !, this.reflector, this.evaluator, this.isCore);
      viewQueries.push(...queriesFromDecorator.view);
    }

    let styles: string[]|null = null;
    if (component.has('styles')) {
      styles = parseFieldArrayValue(component, 'styles', this.evaluator);
    }

    let styleUrls = this._extractStyleUrls(component);
    if (styleUrls !== null) {
      if (styles === null) {
        styles = [];
      }
      styleUrls.forEach(styleUrl => {
        const resourceUrl = this.resourceLoader.resolve(styleUrl, containingFile);
        styles !.push(this.resourceLoader.load(resourceUrl));
      });
    }

    const encapsulation: number =
        this._resolveEnumValue(component, 'encapsulation', 'ViewEncapsulation') || 0;

    const changeDetection: number|null =
        this._resolveEnumValue(component, 'changeDetection', 'ChangeDetectionStrategy');

    let animations: Expression|null = null;
    if (component.has('animations')) {
      animations = new WrappedNodeExpr(component.get('animations') !);
    }

    const output = {
      analysis: {
        meta: {
          ...metadata,
          template,
          viewQueries,
          encapsulation,
          interpolation,
          styles: styles || [],

          // These will be replaced during the compilation step, after all `NgModule`s have been
          // analyzed and the full compilation scope for the component can be realized.
          pipes: EMPTY_MAP,
          directives: EMPTY_ARRAY,
          wrapDirectivesAndPipesInClosure: false,  //
          animations,
          viewProviders,
          i18nUseExternalIds: this.i18nUseExternalIds, relativeContextFilePath
        },
        metadataStmt: generateSetClassMetadataCall(node, this.reflector, this.isCore),
        parsedTemplate: template.nodes,
      },
      typeCheck: true,
    };
    if (changeDetection !== null) {
      (output.analysis.meta as R3ComponentMetadata).changeDetection = changeDetection;
    }
    return output;
  }

  typeCheck(ctx: TypeCheckContext, node: ts.Declaration, meta: ComponentHandlerData): void {
    const scope = this.scopeRegistry.lookupCompilationScopeAsRefs(node);
    const matcher = new SelectorMatcher<ScopeDirective<any>>();
    if (scope !== null) {
      for (const meta of scope.directives) {
        matcher.addSelectables(CssSelector.parse(meta.selector), meta);
      }
      ctx.addTemplate(node as ts.ClassDeclaration, meta.parsedTemplate, matcher);
    }
  }

  resolve(node: ts.ClassDeclaration, analysis: ComponentHandlerData): void {
    // Check whether this component was registered with an NgModule. If so, it should be compiled
    // under that module's compilation scope.
    const scope = this.scopeRegistry.lookupCompilationScope(node);
    let metadata = analysis.meta;
    if (scope !== null) {
      // Replace the empty components and directives from the analyze() step with a fully expanded
      // scope. This is possible now because during resolve() the whole compilation unit has been
      // fully analyzed.
      const {pipes, containsForwardDecls} = scope;
      const directives =
          scope.directives.map(dir => ({selector: dir.selector, expression: dir.directive}));

      // Scan through the references of the `scope.directives` array and check whether
      // any import which needs to be generated for the directive would create a cycle.
      const origin = node.getSourceFile();
      const cycleDetected =
          scope.directives.some(meta => this._isCyclicImport(meta.directive, origin)) ||
          Array.from(scope.pipes.values()).some(pipe => this._isCyclicImport(pipe, origin));
      if (!cycleDetected) {
        const wrapDirectivesAndPipesInClosure: boolean = !!containsForwardDecls;
        metadata.directives = directives;
        metadata.pipes = pipes;
        metadata.wrapDirectivesAndPipesInClosure = wrapDirectivesAndPipesInClosure;
      } else {
        this.scopeRegistry.setComponentAsRequiringRemoteScoping(node);
      }
    }
  }

  compile(node: ts.ClassDeclaration, analysis: ComponentHandlerData, pool: ConstantPool):
      CompileResult {
    const res = compileComponentFromMetadata(analysis.meta, pool, makeBindingParser());

    const statements = res.statements;
    if (analysis.metadataStmt !== null) {
      statements.push(analysis.metadataStmt);
    }
    return {
      name: 'ngComponentDef',
      initializer: res.expression, statements,
      type: res.type,
    };
  }

  private _resolveLiteral(decorator: Decorator): ts.ObjectLiteralExpression {
    if (this.literalCache.has(decorator)) {
      return this.literalCache.get(decorator) !;
    }
    if (decorator.args === null || decorator.args.length !== 1) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARITY_WRONG, decorator.node,
          `Incorrect number of arguments to @Component decorator`);
    }
    const meta = unwrapExpression(decorator.args[0]);

    if (!ts.isObjectLiteralExpression(meta)) {
      throw new FatalDiagnosticError(
          ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, `Decorator argument must be literal.`);
    }

    this.literalCache.set(decorator, meta);
    return meta;
  }

  private _resolveEnumValue(
      component: Map<string, ts.Expression>, field: string, enumSymbolName: string): number|null {
    let resolved: number|null = null;
    if (component.has(field)) {
      const expr = component.get(field) !;
      const value = this.evaluator.evaluate(expr) as any;
      if (value instanceof EnumValue && isAngularCoreReference(value.enumRef, enumSymbolName)) {
        resolved = value.resolved as number;
      } else {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, expr,
            `${field} must be a member of ${enumSymbolName} enum from @angular/core`);
      }
    }
    return resolved;
  }

  private _extractStyleUrls(component: Map<string, ts.Expression>): string[]|null {
    if (!component.has('styleUrls')) {
      return null;
    }

    const styleUrlsExpr = component.get('styleUrls') !;
    const styleUrls = this.evaluator.evaluate(styleUrlsExpr);
    if (!Array.isArray(styleUrls) || !styleUrls.every(url => typeof url === 'string')) {
      throw new FatalDiagnosticError(
          ErrorCode.VALUE_HAS_WRONG_TYPE, styleUrlsExpr, 'styleUrls must be an array of strings');
    }
    return styleUrls as string[];
  }

  private _isCyclicImport(expr: Expression, origin: ts.SourceFile): boolean {
    if (!(expr instanceof ExternalExpr)) {
      return false;
    }

    // Figure out what file is being imported.
    const imported = this.moduleResolver.resolveModuleName(expr.value.moduleName !, origin);
    if (imported === null) {
      return false;
    }

    // Check whether the import is legal.
    return this.cycleAnalyzer.wouldCreateCycle(origin, imported);
  }
}

function getTemplateRange(templateExpr: ts.Expression) {
  const startPos = templateExpr.getStart() + 1;
  const {line, character} =
      ts.getLineAndCharacterOfPosition(templateExpr.getSourceFile(), startPos);
  return {
    startPos,
    startLine: line,
    startCol: character,
    endPos: templateExpr.getEnd() - 1,
  };
}
