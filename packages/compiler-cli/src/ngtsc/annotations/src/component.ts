/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, Expression, R3ComponentMetadata, R3DirectiveMetadata, WrappedNodeExpr, compileComponentFromMetadata, makeBindingParser, parseTemplate} from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import {Decorator, ReflectionHost} from '../../host';
import {filterToMembersWithDecorator, reflectObjectLiteral, staticallyResolve} from '../../metadata';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';

import {ResourceLoader} from './api';
import {extractDirectiveMetadata, extractQueriesFromDecorator, parseFieldArrayValue, queriesFromFields} from './directive';
import {SelectorScopeRegistry} from './selector_scope';
import {isAngularCore, unwrapExpression} from './util';

const EMPTY_MAP = new Map<string, Expression>();

/**
 * `DecoratorHandler` which handles the `@Component` annotation.
 */
export class ComponentDecoratorHandler implements DecoratorHandler<R3ComponentMetadata, Decorator> {
  constructor(
      private checker: ts.TypeChecker, private reflector: ReflectionHost,
      private scopeRegistry: SelectorScopeRegistry, private isCore: boolean,
      private resourceLoader: ResourceLoader) {}

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
      const templateUrl =
          staticallyResolve(component.get('templateUrl') !, this.reflector, this.checker);
      if (typeof templateUrl !== 'string') {
        throw new Error(`templateUrl should be a string`);
      }
      const url = path.posix.resolve(path.dirname(node.getSourceFile().fileName), templateUrl);
      return this.resourceLoader.preload(url);
    }
    return undefined;
  }

  analyze(node: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<R3ComponentMetadata> {
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
      const templateUrl =
          staticallyResolve(component.get('templateUrl') !, this.reflector, this.checker);
      if (typeof templateUrl !== 'string') {
        throw new Error(`templateUrl should be a string`);
      }
      const url = path.posix.resolve(path.dirname(node.getSourceFile().fileName), templateUrl);
      templateStr = this.resourceLoader.load(url);
    } else if (component.has('template')) {
      const templateExpr = component.get('template') !;
      const resolvedTemplate = staticallyResolve(templateExpr, this.reflector, this.checker);
      if (typeof resolvedTemplate !== 'string') {
        throw new Error(`Template must statically resolve to a string: ${node.name!.text}`);
      }
      templateStr = resolvedTemplate;
    } else {
      throw new Error(`Component has no template or templateUrl`);
    }

    let preserveWhitespaces: boolean = false;
    if (component.has('preserveWhitespaces')) {
      const value =
          staticallyResolve(component.get('preserveWhitespaces') !, this.reflector, this.checker);
      if (typeof value !== 'boolean') {
        throw new Error(`preserveWhitespaces must resolve to a boolean if present`);
      }
      preserveWhitespaces = value;
    }

    const template = parseTemplate(
        templateStr, `${node.getSourceFile().fileName}#${node.name!.text}/template.html`,
        {preserveWhitespaces});
    if (template.errors !== undefined) {
      throw new Error(
          `Errors parsing template: ${template.errors.map(e => e.toString()).join(', ')}`);
    }

    // If the component has a selector, it should be registered with the `SelectorScopeRegistry` so
    // when this component appears in an `@NgModule` scope, its selector can be determined.
    if (metadata.selector !== null) {
      this.scopeRegistry.registerSelector(node, metadata.selector);
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

    return {
      analysis: {
        ...metadata,
        template,
        viewQueries,
        encapsulation,
        styles: styles || [],

        // These will be replaced during the compilation step, after all `NgModule`s have been
        // analyzed and the full compilation scope for the component can be realized.
        pipes: EMPTY_MAP,
        directives: EMPTY_MAP,
        wrapDirectivesInClosure: false,
      }
    };
  }

  compile(node: ts.ClassDeclaration, analysis: R3ComponentMetadata, pool: ConstantPool):
      CompileResult {
    // Check whether this component was registered with an NgModule. If so, it should be compiled
    // under that module's compilation scope.
    const scope = this.scopeRegistry.lookupCompilationScope(node);
    if (scope !== null) {
      // Replace the empty components and directives from the analyze() step with a fully expanded
      // scope. This is possible now because during compile() the whole compilation unit has been
      // fully analyzed.
      const {directives, pipes, containsForwardDecls} = scope;
      const wrapDirectivesInClosure: boolean = !!containsForwardDecls;
      analysis = {...analysis, directives, pipes, wrapDirectivesInClosure};
    }

    const res = compileComponentFromMetadata(analysis, pool, makeBindingParser());
    return {
      name: 'ngComponentDef',
      initializer: res.expression,
      statements: res.statements,
      type: res.type,
    };
  }

  private _resolveLiteral(decorator: Decorator): ts.ObjectLiteralExpression {
    if (this.literalCache.has(decorator)) {
      return this.literalCache.get(decorator) !;
    }
    if (decorator.args === null || decorator.args.length !== 1) {
      throw new Error(`Incorrect number of arguments to @Component decorator`);
    }
    const meta = unwrapExpression(decorator.args[0]);

    if (!ts.isObjectLiteralExpression(meta)) {
      throw new Error(`Decorator argument must be literal.`);
    }

    this.literalCache.set(decorator, meta);
    return meta;
  }
}
