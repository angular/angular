/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '@angular/compiler-cli/src/ngtsc/imports';
import {DynamicValue, PartialEvaluator, ResolvedValue} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import * as ts from 'typescript';

import {getAngularDecorators} from '../../utils/ng_decorators';

import {ImportManager} from './import_manager';
import {ResolvedNgModule} from './module_collector';
import {UpdateRecorder} from './update_recorder';

/** Name of decorators which imply that a given class does not need to be migrated. */
const NO_MIGRATE_DECORATORS = ['Injectable', 'Directive', 'Component', 'Pipe'];

export interface AnalysisFailure {
  node: ts.Node;
  message: string;
}

export class MissingInjectableTransform {
  private printer = ts.createPrinter();
  private importManager = new ImportManager(this.getUpdateRecorder, this.printer);
  private partialEvaluator: PartialEvaluator;

  /** Set of provider class declarations which were already checked or migrated. */
  private visitedProviderClasses = new Set<ts.ClassDeclaration>();

  constructor(
      private typeChecker: ts.TypeChecker,
      private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {
    this.partialEvaluator =
        new PartialEvaluator(new TypeScriptReflectionHost(typeChecker), typeChecker);
  }

  recordChanges() { this.importManager.recordChanges(); }

  /** Migrates a given NgModule by walking through the referenced providers. */
  migrateModule(module: ResolvedNgModule): AnalysisFailure[] {
    if (module.providersExpr === null) {
      return [];
    }

    const evaluatedExpr = this.partialEvaluator.evaluate(module.providersExpr);

    if (!Array.isArray(evaluatedExpr)) {
      return [{
        node: module.providersExpr,
        message: 'Providers of module are not statically analyzable.'
      }];
    }

    return this._visitProviderResolvedValue(evaluatedExpr);
  }

  /**
   * Migrates a given provider class if it is not decorated with
   * any Angular decorator.
   */
  migrateProviderClass(node: ts.ClassDeclaration) {
    if (this.visitedProviderClasses.has(node)) {
      return;
    }
    this.visitedProviderClasses.add(node);

    if (node.decorators &&
        getAngularDecorators(this.typeChecker, node.decorators)
            .some(d => NO_MIGRATE_DECORATORS.indexOf(d.name) !== -1)) {
      return;
    }

    const sourceFile = node.getSourceFile();

    const importExpr =
        this.importManager.addImportToSourceFile(sourceFile, 'Injectable', '@angular/core');
    const newDecoratorExpr = ts.createDecorator(ts.createCall(importExpr, undefined, undefined));
    this.getUpdateRecorder(sourceFile)
        .addClassDecorator(
            node, this.printer.printNode(ts.EmitHint.Unspecified, newDecoratorExpr, sourceFile));
  }

  /**
   * Visits the given resolved value of a provider. Providers can be nested in
   * arrays and we need to recursively walk through the providers to be able to
   * migrate all referenced provider classes. e.g. "providers: [[A, [B]]]".
   */
  private _visitProviderResolvedValue(value: ResolvedValue): AnalysisFailure[] {
    if (value instanceof Reference && ts.isClassDeclaration(value.node)) {
      this.migrateProviderClass(value.node);
    } else if (value instanceof Map) {
      if (!value.has('provide') || value.has('useValue') || value.has('useFactory')) {
        return [];
      }
      if (value.has('useExisting')) {
        return this._visitProviderResolvedValue(value.get('useExisting') !);
      } else if (value.has('useClass')) {
        return this._visitProviderResolvedValue(value.get('useClass') !);
      } else {
        return this._visitProviderResolvedValue(value.get('provide') !);
      }
    } else if (Array.isArray(value)) {
      return value.reduce(
          (res, v) => res.concat(this._visitProviderResolvedValue(v)), [] as AnalysisFailure[]);
    } else if (value instanceof DynamicValue) {
      return [{node: value.node, message: `Provider is not statically analyzable.`}];
    }
    return [];
  }
}
