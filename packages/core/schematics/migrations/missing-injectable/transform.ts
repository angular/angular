/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '@angular/compiler-cli/src/ngtsc/imports';
import {DynamicValue, ResolvedValue} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import * as ts from 'typescript';

import {ImportManager} from '../../utils/import_manager';
import {getAngularDecorators} from '../../utils/ng_decorators';

import {ResolvedDirective, ResolvedNgModule} from './definition_collector';
import {ProviderLiteral, ProvidersEvaluator} from './providers_evaluator';
import {UpdateRecorder} from './update_recorder';

/**
 * Name of decorators which imply that a given class does not need to be migrated.
 *    - `@Injectable`, `@Directive`, `@Component` and `@Pipe` instruct the compiler
 *       to generate a factory definition.
 *    - `@NgModule` instructs the compiler to generate a provider definition that holds
 *       the factory function.
 */
const NO_MIGRATE_DECORATORS = ['Injectable', 'Directive', 'Component', 'Pipe', 'NgModule'];

export interface AnalysisFailure {
  node: ts.Node;
  message: string;
}

export class MissingInjectableTransform {
  private printer = ts.createPrinter();
  private importManager = new ImportManager(this.getUpdateRecorder, this.printer);
  private providersEvaluator: ProvidersEvaluator;

  /** Set of provider class declarations which were already checked or migrated. */
  private visitedProviderClasses = new Set<ts.ClassDeclaration>();

  /** Set of provider object literals which were already checked or migrated. */
  private visitedProviderLiterals = new Set<ts.ObjectLiteralExpression>();

  constructor(
      private typeChecker: ts.TypeChecker,
      private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {
    this.providersEvaluator = new ProvidersEvaluator(
        new TypeScriptReflectionHost(typeChecker), typeChecker, /* dependencyTracker */ null);
  }

  recordChanges() {
    this.importManager.recordChanges();
  }

  /**
   * Migrates all specified NgModule's by walking through referenced providers
   * and decorating them with "@Injectable" if needed.
   */
  migrateModules(modules: ResolvedNgModule[]): AnalysisFailure[] {
    return modules.reduce(
        (failures, node) => failures.concat(this.migrateModule(node)), [] as AnalysisFailure[]);
  }

  /**
   * Migrates all specified directives by walking through referenced providers
   * and decorating them with "@Injectable" if needed.
   */
  migrateDirectives(directives: ResolvedDirective[]): AnalysisFailure[] {
    return directives.reduce(
        (failures, node) => failures.concat(this.migrateDirective(node)), [] as AnalysisFailure[]);
  }

  /** Migrates a given NgModule by walking through the referenced providers. */
  migrateModule(module: ResolvedNgModule): AnalysisFailure[] {
    if (module.providersExpr === null) {
      return [];
    }

    const {resolvedValue, literals} = this.providersEvaluator.evaluate(module.providersExpr);
    this._migrateLiteralProviders(literals);

    if (!Array.isArray(resolvedValue)) {
      return [
        {node: module.providersExpr, message: 'Providers of module are not statically analyzable.'}
      ];
    }

    return this._visitProviderResolvedValue(resolvedValue, module);
  }


  /**
   * Migrates a given directive by walking through defined providers. This method
   * also handles components with "viewProviders" defined.
   */
  migrateDirective(directive: ResolvedDirective): AnalysisFailure[] {
    const failures: AnalysisFailure[] = [];

    // Migrate "providers" on directives and components if defined.
    if (directive.providersExpr) {
      const {resolvedValue, literals} = this.providersEvaluator.evaluate(directive.providersExpr);
      this._migrateLiteralProviders(literals);
      if (!Array.isArray(resolvedValue)) {
        return [
          {node: directive.providersExpr, message: `Providers are not statically analyzable.`}
        ];
      }
      failures.push(...this._visitProviderResolvedValue(resolvedValue, directive));
    }

    // Migrate "viewProviders" on components if defined.
    if (directive.viewProvidersExpr) {
      const {resolvedValue, literals} =
          this.providersEvaluator.evaluate(directive.viewProvidersExpr);
      this._migrateLiteralProviders(literals);
      if (!Array.isArray(resolvedValue)) {
        return [
          {node: directive.viewProvidersExpr, message: `Providers are not statically analyzable.`}
        ];
      }
      failures.push(...this._visitProviderResolvedValue(resolvedValue, directive));
    }
    return failures;
  }

  /**
   * Migrates a given provider class if it is not decorated with
   * any Angular decorator.
   */
  migrateProviderClass(node: ts.ClassDeclaration, context: ResolvedNgModule|ResolvedDirective) {
    if (this.visitedProviderClasses.has(node)) {
      return;
    }
    this.visitedProviderClasses.add(node);

    const sourceFile = node.getSourceFile();

    // We cannot migrate provider classes outside of source files. This is because the
    // migration for third-party library files should happen in "ngcc", and in general
    // would also involve metadata parsing.
    if (sourceFile.isDeclarationFile) {
      return;
    }

    const ngDecorators =
        node.decorators ? getAngularDecorators(this.typeChecker, node.decorators) : null;

    if (ngDecorators !== null &&
        ngDecorators.some(d => NO_MIGRATE_DECORATORS.indexOf(d.name) !== -1)) {
      return;
    }

    const updateRecorder = this.getUpdateRecorder(sourceFile);
    const importExpr =
        this.importManager.addImportToSourceFile(sourceFile, 'Injectable', '@angular/core');
    const newDecoratorExpr = ts.createDecorator(ts.createCall(importExpr, undefined, undefined));
    const newDecoratorText =
        this.printer.printNode(ts.EmitHint.Unspecified, newDecoratorExpr, sourceFile);


    // In case the class is already decorated with "@Inject(..)", we replace the "@Inject"
    // decorator with "@Injectable()" since using "@Inject(..)" on a class is a noop and
    // most likely was meant to be "@Injectable()".
    const existingInjectDecorator =
        ngDecorators !== null ? ngDecorators.find(d => d.name === 'Inject') : null;
    if (existingInjectDecorator) {
      updateRecorder.replaceDecorator(existingInjectDecorator.node, newDecoratorText, context.name);
    } else {
      updateRecorder.addClassDecorator(node, newDecoratorText, context.name);
    }
  }

  /**
   * Migrates object literal providers which do not use "useValue", "useClass",
   * "useExisting" or "useFactory". These providers behave differently in Ivy. e.g.
   *
   * ```ts
   *   {provide: X} -> {provide: X, useValue: undefined} // this is how it behaves in VE
   *   {provide: X} -> {provide: X, useClass: X} // this is how it behaves in Ivy
   * ```
   *
   * To ensure forward compatibility, we migrate these empty object literal providers
   * to explicitly use `useValue: undefined`.
   */
  private _migrateLiteralProviders(literals: ProviderLiteral[]) {
    for (let {node, resolvedValue} of literals) {
      if (this.visitedProviderLiterals.has(node)) {
        continue;
      }
      this.visitedProviderLiterals.add(node);

      if (!resolvedValue || !(resolvedValue instanceof Map) || !resolvedValue.has('provide') ||
          resolvedValue.has('useClass') || resolvedValue.has('useValue') ||
          resolvedValue.has('useExisting') || resolvedValue.has('useFactory')) {
        continue;
      }

      const sourceFile = node.getSourceFile();
      const newObjectLiteral = ts.updateObjectLiteral(
          node,
          node.properties.concat(
              ts.createPropertyAssignment('useValue', ts.createIdentifier('undefined'))));

      this.getUpdateRecorder(sourceFile)
          .updateObjectLiteral(
              node, this.printer.printNode(ts.EmitHint.Unspecified, newObjectLiteral, sourceFile));
    }
  }

  /**
   * Visits the given resolved value of a provider. Providers can be nested in
   * arrays and we need to recursively walk through the providers to be able to
   * migrate all referenced provider classes. e.g. "providers: [[A, [B]]]".
   */
  private _visitProviderResolvedValue(value: ResolvedValue, module: ResolvedNgModule):
      AnalysisFailure[] {
    if (value instanceof Reference && ts.isClassDeclaration(value.node)) {
      this.migrateProviderClass(value.node, module);
    } else if (value instanceof Map) {
      // If a "ClassProvider" has the "deps" property set, then we do not need to
      // decorate the class. This is because the class is instantiated through the
      // specified "deps" and the class does not need a factory definition.
      if (value.has('provide') && value.has('useClass') && value.get('deps') == null) {
        return this._visitProviderResolvedValue(value.get('useClass')!, module);
      }
    } else if (Array.isArray(value)) {
      return value.reduce(
          (res, v) => res.concat(this._visitProviderResolvedValue(v, module)),
          [] as AnalysisFailure[]);
    } else if (value instanceof DynamicValue) {
      return [{node: value.node, message: `Provider is not statically analyzable.`}];
    }
    return [];
  }
}
