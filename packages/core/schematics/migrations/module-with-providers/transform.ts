/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '@angular/compiler-cli/src/ngtsc/imports';
import {DynamicValue, PartialEvaluator, ResolvedValue, ResolvedValueMap} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import * as ts from 'typescript';

import {ResolvedNgModule} from './module_collector';
import {UpdateRecorder} from './update_recorder';
import {addGeneric} from './util';

export interface AnalysisFailure {
  node: ts.Node;
  message: string;
}

export class ModuleWithProvidersTransform {
  private printer = ts.createPrinter();
  private partialEvaluator: PartialEvaluator =
      new PartialEvaluator(new TypeScriptReflectionHost(this.typeChecker), this.typeChecker);

  /** Set of methods which were already checked or migrated. */
  private visitedMethods = new Set<ts.MethodDeclaration>();
  private failures: AnalysisFailure[] = [];

  constructor(
      private typeChecker: ts.TypeChecker,
      private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {}

  /** Migrates a given NgModule by walking through the referenced providers and static methods. */
  migrateModule(module: ResolvedNgModule): AnalysisFailure[] {
    module.staticMethods.forEach(this._resolveStaticMethod.bind(this));
    return this.failures;
  }

  /**
   * Migrates a given static method if its ModuleWithProviders does not provide
   * a generic type.
   */
  migrateStaticMethod(method: ts.MethodDeclaration, typeName: string) {
    if (this.visitedMethods.has(method)) {
      return;
    }
    this.visitedMethods.add(method);

    const sourceFile = method.getSourceFile();
    const updateRecorder = this.getUpdateRecorder(sourceFile);
    const newGenericExpr = addGeneric(typeName, method.type as ts.TypeReferenceNode);
    const newMethodDecl = ts.updateMethod(
        method, method.decorators, method.modifiers, method.asteriskToken, method.name,
        method.questionToken, method.typeParameters, method.parameters, newGenericExpr,
        method.body);
    const newMethodText =
        this.printer.printNode(ts.EmitHint.Unspecified, newMethodDecl, sourceFile);

    updateRecorder.addGenericType(method, newMethodText);
  }

  /** Whether the resolved value map represents a ModuleWithProviders object */
  isModuleWithProvidersType(value: ResolvedValueMap): boolean {
    const ngModule = value.get('ngModule') !== undefined;
    const providers = value.get('providers') !== undefined;

    return ngModule && (value.size === 1 || (providers && value.size === 2));
  }

  /** Determine the generic type of a suspected ModuleWithProviders return type */
  private _resolveStaticMethod(node: ts.MethodDeclaration) {
    const returnStatement: ts.ReturnStatement|undefined = node.body &&
        node.body.statements.find(n => ts.isReturnStatement(n)) as ts.ReturnStatement | undefined;

    // No return type found, exit
    if (!returnStatement || !returnStatement.expression) {
      return;
    }

    const evaluatedExpr = this.partialEvaluator.evaluate(returnStatement.expression);
    this._visitReturnStatementResolvedValue(evaluatedExpr, node);
  }

  /** Visits the given resolved return statement of a static method. */
  private _visitReturnStatementResolvedValue(value: ResolvedValue, method: ts.MethodDeclaration) {
    if (value instanceof Map && this.isModuleWithProvidersType(value)) {
      const mapValue = value.get('ngModule') !;
      if (mapValue instanceof Reference && ts.isClassDeclaration(mapValue.node) &&
          mapValue.node.name) {
        this.migrateStaticMethod(method, mapValue.node.name.text);
      }
    } else if (value instanceof DynamicValue) {
      this.failures.push(
          {node: value.node, message: `Return statement is not statically analyzable.`});
    }
  }
}
