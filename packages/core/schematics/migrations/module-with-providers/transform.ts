/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UpdateRecorder} from '@angular-devkit/schematics';
import {Reference} from '@angular/compiler-cli/src/ngtsc/imports';
import {DynamicValue, PartialEvaluator, ResolvedValue, ResolvedValueMap} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import * as ts from 'typescript';

import {ResolvedNgModule} from './collector';
import {createModuleWithProvidersType} from './util';

export interface AnalysisFailure {
  node: ts.Node;
  message: string;
}

const TODO_COMMENT = 'TODO: The following node requires a generic type for `ModuleWithProviders`';

export class ModuleWithProvidersTransform {
  private printer = ts.createPrinter();
  private partialEvaluator: PartialEvaluator = new PartialEvaluator(
      new TypeScriptReflectionHost(this.typeChecker), this.typeChecker,
      /* dependencyTracker */ null);

  constructor(
      private typeChecker: ts.TypeChecker,
      private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {}

  /** Migrates a given NgModule by walking through the referenced providers and static methods. */
  migrateModule(module: ResolvedNgModule): AnalysisFailure[] {
    return module.staticMethodsWithoutType.map(this._migrateStaticNgModuleMethod.bind(this))
               .filter(v => v) as AnalysisFailure[];
  }

  /** Migrates a ModuleWithProviders type definition that has no explicit generic type */
  migrateType(type: ts.TypeReferenceNode): AnalysisFailure[] {
    const parent = type.parent;
    let moduleText: string|undefined;
    if ((ts.isFunctionDeclaration(parent) || ts.isMethodDeclaration(parent)) && parent.body) {
      const returnStatement = parent.body.statements.find(ts.isReturnStatement);

      // No return type found, exit
      if (!returnStatement || !returnStatement.expression) {
        return [{node: parent, message: `Return type is not statically analyzable.`}];
      }

      moduleText = this._getNgModuleTypeOfExpression(returnStatement.expression);
    } else if (ts.isPropertyDeclaration(parent) || ts.isVariableDeclaration(parent)) {
      if (!parent.initializer) {
        addTodoToNode(type, TODO_COMMENT);
        this._updateNode(type, type);
        return [{node: parent, message: `Unable to determine type for declaration.`}];
      }

      moduleText = this._getNgModuleTypeOfExpression(parent.initializer);
    }

    if (moduleText) {
      this._addGenericToTypeReference(type, moduleText);
      return [];
    }

    return [{node: parent, message: `Type is not statically analyzable.`}];
  }

  /** Add a given generic to a type reference node */
  private _addGenericToTypeReference(node: ts.TypeReferenceNode, typeName: string) {
    const newGenericExpr = createModuleWithProvidersType(typeName, node);
    this._updateNode(node, newGenericExpr);
  }

  /**
   * Migrates a given static method if its ModuleWithProviders does not provide
   * a generic type.
   */
  private _updateStaticMethodType(method: ts.MethodDeclaration, typeName: string) {
    const newGenericExpr =
        createModuleWithProvidersType(typeName, method.type as ts.TypeReferenceNode);
    const newMethodDecl = ts.updateMethod(
        method, method.decorators, method.modifiers, method.asteriskToken, method.name,
        method.questionToken, method.typeParameters, method.parameters, newGenericExpr,
        method.body);

    this._updateNode(method, newMethodDecl);
  }

  /** Whether the resolved value map represents a ModuleWithProviders object */
  isModuleWithProvidersType(value: ResolvedValueMap): boolean {
    const ngModule = value.get('ngModule') !== undefined;
    const providers = value.get('providers') !== undefined;

    return ngModule && (value.size === 1 || (providers && value.size === 2));
  }

  /**
   * Determine the generic type of a suspected ModuleWithProviders return type and add it
   * explicitly
   */
  private _migrateStaticNgModuleMethod(node: ts.MethodDeclaration): AnalysisFailure|null {
    const returnStatement = node.body &&
        node.body.statements.find(n => ts.isReturnStatement(n)) as ts.ReturnStatement | undefined;

    // No return type found, exit
    if (!returnStatement || !returnStatement.expression) {
      return {node: node, message: `Return type is not statically analyzable.`};
    }

    const moduleText = this._getNgModuleTypeOfExpression(returnStatement.expression);

    if (moduleText) {
      this._updateStaticMethodType(node, moduleText);
      return null;
    }

    return {node: node, message: `Method type is not statically analyzable.`};
  }

  /** Evaluate and return the ngModule type from an expression */
  private _getNgModuleTypeOfExpression(expr: ts.Expression): string|undefined {
    const evaluatedExpr = this.partialEvaluator.evaluate(expr);
    return this._getTypeOfResolvedValue(evaluatedExpr);
  }

  /**
   * Visits a given object literal expression to determine the ngModule type. If the expression
   * cannot be resolved, add a TODO to alert the user.
   */
  private _getTypeOfResolvedValue(value: ResolvedValue): string|undefined {
    if (value instanceof Map && this.isModuleWithProvidersType(value)) {
      const mapValue = value.get('ngModule')!;
      if (mapValue instanceof Reference && ts.isClassDeclaration(mapValue.node) &&
          mapValue.node.name) {
        return mapValue.node.name.text;
      } else if (mapValue instanceof DynamicValue) {
        addTodoToNode(mapValue.node, TODO_COMMENT);
        this._updateNode(mapValue.node, mapValue.node);
      }
    }

    return undefined;
  }

  private _updateNode(node: ts.Node, newNode: ts.Node) {
    const newText = this.printer.printNode(ts.EmitHint.Unspecified, newNode, node.getSourceFile());
    const recorder = this.getUpdateRecorder(node.getSourceFile());

    recorder.remove(node.getStart(), node.getWidth());
    recorder.insertRight(node.getStart(), newText);
  }
}

/**
 * Adds a to-do to the given TypeScript node which alerts developers to fix
 * potential issues identified by the migration.
 */
function addTodoToNode(node: ts.Node, text: string) {
  ts.setSyntheticLeadingComments(node, [{
                                   pos: -1,
                                   end: -1,
                                   hasTrailingNewLine: false,
                                   kind: ts.SyntaxKind.MultiLineCommentTrivia,
                                   text: ` ${text} `
                                 }]);
}
