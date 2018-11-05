/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, CssSelector, Expression, R3ComponentMetadata, R3DirectiveMetadata, SelectorMatcher, Statement, TmplAstNode, WrappedNodeExpr, compileComponentFromMetadata, makeBindingParser, parseTemplate} from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {Decorator, ReflectionHost} from '../../host';
import {AbsoluteReference, Reference, ResolvedReference, filterToMembersWithDecorator, reflectObjectLiteral, staticallyResolve} from '../../metadata';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';
import {TypeCheckContext, TypeCheckableDirectiveMeta} from '../../typecheck';

import {ResourceLoader} from './api';
import {extractDirectiveMetadata, extractQueriesFromDecorator, parseFieldArrayValue, queriesFromFields} from './directive';
import {generateSetClassMetadataCall} from './metadata';
import {ScopeDirective, SelectorScopeRegistry} from './selector_scope';
import {extractDirectiveGuards, isAngularCore, unwrapExpression} from './util';

const EMPTY_MAP = new Map<string, Expression>();

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
      private checker: ts.TypeChecker, private reflector: ReflectionHost,
      private scopeRegistry: SelectorScopeRegistry, private isCore: boolean,
      private resourceLoader: ResourceLoader, private rootDirs: string[]) {}

  private literalCache = new Map<Decorator, ts.ObjectLiteralExpression>();


  detect(node: ts.Declaration, decorators: Decorator[]|null): Decorator|undefined {
    if (!decorators) {
      return undefined;
    }
    return decorators.find(
        decorator => decorator.name === 'Component' && (this.isCore || isAngularCore(decorator)));
  }

  preanalyze(node: ts.ClassDeclaration, decorator: Decorator): Promise<void>|undefined {
    const meta = this._resolveLiteral(decorator);
    const component = reflectObjectLiteral(meta);

    if (this.resourceLoader.preload !== undefined && component.has('templateUrl')) {
      const templateUrlExpr = component.get('templateUrl') !;
      const templateUrl = staticallyResolve(templateUrlExpr, this.reflector, this.checker);
      if (typeof templateUrl !== 'string') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, templateUrlExpr, 'templateUrl must be a string');
      }
      const url = path.posix.resolve(path.dirname(node.getSourceFile().fileName), templateUrl);
      return this.resourceLoader.preload(url);
    }
    return undefined;
  }

  analyze(node: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<ComponentHandlerData> {
    const meta = this._resolveLiteral(decorator);
    this.literalCache.delete(decorator);

    // @Component inherits @Directive, so begin by extracting the @Directive metadata and building
    // on it.
    const directiveResult =
        extractDirectiveMetadata(node, decorator, this.checker, this.reflector, this.isCore);
    if (directiveResult === undefined) {
      // `extractDirectiveMetadata` returns undefined when the @Directive has `jit: true`. In this
      // case, compilation of the decorator is skipped. Returning an empty object signifies
      // that no analysis was produced.
      return {};
    }

    // Next, read the `@Component`-specific fields.
    const {decoratedElements, decorator: component, metadata} = directiveResult;

    let templateStr: string|null = null;
    if (component.has('templateUrl')) {
      const templateUrlExpr = component.get('templateUrl') !;
      const templateUrl = staticallyResolve(templateUrlExpr, this.reflector, this.checker);
      if (typeof templateUrl !== 'string') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, templateUrlExpr, 'templateUrl must be a string');
      }
      const url = path.posix.resolve(path.dirname(node.getSourceFile().fileName), templateUrl);
      templateStr = this.resourceLoader.load(url);
    } else if (component.has('template')) {
      const templateExpr = component.get('template') !;
      const resolvedTemplate = staticallyResolve(templateExpr, this.reflector, this.checker);
      if (typeof resolvedTemplate !== 'string') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, templateExpr, 'template must be a string');
      }
      templateStr = resolvedTemplate;
    } else {
      throw new FatalDiagnosticError(
          ErrorCode.COMPONENT_MISSING_TEMPLATE, decorator.node, 'component is missing a template');
    }

    let preserveWhitespaces: boolean = false;
    if (component.has('preserveWhitespaces')) {
      const expr = component.get('preserveWhitespaces') !;
      const value = staticallyResolve(expr, this.reflector, this.checker);
      if (typeof value !== 'boolean') {
        throw new FatalDiagnosticError(
            ErrorCode.VALUE_HAS_WRONG_TYPE, expr, 'preserveWhitespaces must be a boolean');
      }
      preserveWhitespaces = value;
    }

    const viewProviders: Expression|null = component.has('viewProviders') ?
        new WrappedNodeExpr(component.get('viewProviders') !) :
        null;

    // Go through the root directories for this project, and select the one with the smallest
    // relative path representation.
    const filePath = node.getSourceFile().fileName;
    const relativeFilePath = this.rootDirs.reduce<string|undefined>((previous, rootDir) => {
      const candidate = path.posix.relative(rootDir, filePath);
      if (previous === undefined || candidate.length < previous.length) {
        return candidate;
      } else {
        return previous;
      }
    }, undefined) !;

    const template = parseTemplate(
        templateStr, `${node.getSourceFile().fileName}#${node.name!.text}/template.html`,
        {preserveWhitespaces}, relativeFilePath);
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
        this.checker);
    const viewChildrenFromFields = queriesFromFields(
        filterToMembersWithDecorator(decoratedElements, 'ViewChildren', coreModule), this.reflector,
        this.checker);
    const viewQueries = [...viewChildFromFields, ...viewChildrenFromFields];

    if (component.has('queries')) {
      const queriesFromDecorator = extractQueriesFromDecorator(
          component.get('queries') !, this.reflector, this.checker, this.isCore);
      viewQueries.push(...queriesFromDecorator.view);
    }

    let styles: string[]|null = null;
    if (component.has('styles')) {
      styles = parseFieldArrayValue(component, 'styles', this.reflector, this.checker);
    }

    let encapsulation: number = 0;
    if (component.has('encapsulation')) {
      encapsulation = parseInt(staticallyResolve(
          component.get('encapsulation') !, this.reflector, this.checker) as string);
    }

    let animations: Expression|null = null;
    if (component.has('animations')) {
      animations = new WrappedNodeExpr(component.get('animations') !);
    }

    return {
      analysis: {
        meta: {
          ...metadata,
          template,
          viewQueries,
          encapsulation,
          styles: styles || [],

          // These will be replaced during the compilation step, after all `NgModule`s have been
          // analyzed and the full compilation scope for the component can be realized.
          pipes: EMPTY_MAP,
          directives: EMPTY_MAP,
          wrapDirectivesAndPipesInClosure: false,  //
          animations,
          viewProviders
        },
        metadataStmt: generateSetClassMetadataCall(node, this.reflector, this.isCore),
        parsedTemplate: template.nodes,
      },
      typeCheck: true,
    };
  }

  typeCheck(ctx: TypeCheckContext, node: ts.Declaration, meta: ComponentHandlerData): void {
    const scope = this.scopeRegistry.lookupCompilationScopeAsRefs(node);
    const matcher = new SelectorMatcher<ScopeDirective<any>>();
    if (scope !== null) {
      scope.directives.forEach(
          (meta, selector) => { matcher.addSelectables(CssSelector.parse(selector), meta); });
      ctx.addTemplate(node as ts.ClassDeclaration, meta.parsedTemplate, matcher);
    }
  }

  compile(node: ts.ClassDeclaration, analysis: ComponentHandlerData, pool: ConstantPool):
      CompileResult {
    // Check whether this component was registered with an NgModule. If so, it should be compiled
    // under that module's compilation scope.
    const scope = this.scopeRegistry.lookupCompilationScope(node);
    let metadata = analysis.meta;
    if (scope !== null) {
      // Replace the empty components and directives from the analyze() step with a fully expanded
      // scope. This is possible now because during compile() the whole compilation unit has been
      // fully analyzed.
      const {pipes, containsForwardDecls} = scope;
      const directives = new Map<string, Expression>();
      scope.directives.forEach((meta, selector) => directives.set(selector, meta.directive));
      const wrapDirectivesAndPipesInClosure: boolean = !!containsForwardDecls;
      metadata = {...metadata, directives, pipes, wrapDirectivesAndPipesInClosure};
    }

    const res = compileComponentFromMetadata(metadata, pool, makeBindingParser());

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
}
