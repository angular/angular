/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  BindingType,
  R3Identifiers,
  TmplAstBoundAttribute,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstTemplate,
  TransplantedType,
} from '@angular/compiler';
import ts from 'typescript';
import {BindingPropertyName, ClassPropertyName} from '../../../metadata';
import {TypeCheckableDirectiveMeta} from '../../api';
import {markIgnoreDiagnostics} from '../comments';
import {addParseSpanInfo, wrapForDiagnostics} from '../diagnostics';
import {REGISTRY} from '../dom';
import {tsCreateTypeQueryForCoercedInput, tsDeclareVariable} from '../ts_util';
import {TcbOp} from './base';
import {getBoundAttributes, widenBinding} from './bindings';
import type {Context} from './context';
import {tcbExpression, unwrapWritableSignal} from './expression';
import {LocalSymbol} from './references';
import type {Scope} from './scope';
import {
  checkUnsupportedFieldBindings,
  customFormControlBannedInputFields,
  CustomFormControlType,
  expandBoundAttributesForField,
} from './signal_forms';

/**
 * Translates the given attribute binding to a `ts.Expression`.
 */
export function translateInput(value: AST | string, tcb: Context, scope: Scope): ts.Expression {
  if (typeof value === 'string') {
    // For regular attributes with a static string value, use the represented string literal.
    return ts.factory.createStringLiteral(value);
  } else {
    // Produce an expression representing the value of the binding.
    return tcbExpression(value, tcb, scope);
  }
}

/**
 * A `TcbOp` which generates code to check input bindings on an element that correspond with the
 * members of a directive.
 *
 * Executing this operation returns nothing.
 */
export class TcbDirectiveInputsOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private node: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
    private dir: TypeCheckableDirectiveMeta,
    private isFormControl: boolean = false,
    private customFormControlType: CustomFormControlType | null,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    let dirId: ts.Expression | null = null;

    // TODO(joost): report duplicate properties
    const seenRequiredInputs = new Set<ClassPropertyName>();
    const boundAttrs = getBoundAttributes(this.dir, this.node);

    if (this.customFormControlType !== null) {
      checkUnsupportedFieldBindings(this.node, customFormControlBannedInputFields, this.tcb);
    }

    if (this.customFormControlType !== null || this.isFormControl) {
      const additionalBindings = expandBoundAttributesForField(
        this.dir,
        this.node,
        this.customFormControlType,
      );

      if (additionalBindings !== null) {
        boundAttrs.push(...additionalBindings);
      }
    }

    for (const attr of boundAttrs) {
      // For bound inputs, the property is assigned the binding expression.
      const expr = widenBinding(translateInput(attr.value, this.tcb, this.scope), this.tcb);

      let assignment: ts.Expression = wrapForDiagnostics(expr);

      // With this variable we make sure to follow the pattern where multiple targets assign a single expression.
      // This is a significant requirement for language service auto-completion.
      let statement;

      for (const {fieldName, required, transformType, isSignal, isTwoWayBinding} of attr.inputs) {
        let target: ts.LeftHandSideExpression;

        if (required) {
          seenRequiredInputs.add(fieldName);
        }

        // Note: There is no special logic for transforms/coercion with signal inputs.
        // For signal inputs, a `transformType` will never be set as we do not capture
        // the transform in the compiler metadata. Signal inputs incorporate their
        // transform write type into their member type, and we extract it below when
        // setting the `WriteT` of such `InputSignalWithTransform<_, WriteT>`.

        if (this.dir.coercedInputFields.has(fieldName)) {
          let type: ts.TypeNode;

          if (transformType !== null) {
            type = this.tcb.env.referenceTransplantedType(new TransplantedType(transformType));
          } else {
            // The input has a coercion declaration which should be used instead of assigning the
            // expression into the input field directly. To achieve this, a variable is declared
            // with a type of `typeof Directive.ngAcceptInputType_fieldName` which is then used as
            // target of the assignment.
            const dirTypeRef: ts.TypeNode = this.tcb.env.referenceType(this.dir.ref);

            if (!ts.isTypeReferenceNode(dirTypeRef)) {
              throw new Error(
                `Expected TypeReferenceNode from reference to ${this.dir.ref.debugName}`,
              );
            }

            type = tsCreateTypeQueryForCoercedInput(dirTypeRef.typeName, fieldName);
          }

          const id = this.tcb.allocateId();
          this.scope.addStatement(tsDeclareVariable(id, type));

          target = id;
        } else if (this.dir.undeclaredInputFields.has(fieldName)) {
          // If no coercion declaration is present nor is the field declared (i.e. the input is
          // declared in a `@Directive` or `@Component` decorator's `inputs` property) there is no
          // assignment target available, so this field is skipped.
          statement = ts.factory.createExpressionStatement(assignment);
          continue;
        } else if (
          !this.tcb.env.config.honorAccessModifiersForInputBindings &&
          this.dir.restrictedInputFields.has(fieldName) &&
          !isSignal
        ) {
          // If strict checking of access modifiers is disabled and the field is restricted
          // (i.e. private/protected/readonly), generate an assignment into a temporary variable
          // that has the type of the field. This achieves type-checking but circumvents the access
          // modifiers.
          if (dirId === null) {
            dirId = this.scope.resolve(this.node, this.dir);
          }

          const id = this.tcb.allocateId();
          const dirTypeRef = this.tcb.env.referenceType(this.dir.ref);
          if (!ts.isTypeReferenceNode(dirTypeRef)) {
            throw new Error(
              `Expected TypeReferenceNode from reference to ${this.dir.ref.debugName}`,
            );
          }
          const type = ts.factory.createIndexedAccessTypeNode(
            ts.factory.createTypeQueryNode(dirId as ts.Identifier),
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(fieldName)),
          );
          const temp = tsDeclareVariable(id, type);
          this.scope.addStatement(temp);
          target = id;
        } else {
          if (dirId === null) {
            dirId = this.scope.resolve(this.node, this.dir);
          }

          // To get errors assign directly to the fields on the instance, using property access
          // when possible. String literal fields may not be valid JS identifiers so we use
          // literal element access instead for those cases.
          target = this.dir.stringLiteralInputFields.has(fieldName)
            ? ts.factory.createElementAccessExpression(
                dirId,
                ts.factory.createStringLiteral(fieldName),
              )
            : ts.factory.createPropertyAccessExpression(
                dirId,
                ts.factory.createIdentifier(fieldName),
              );
        }

        // Two-way bindings accept `T | WritableSignal<T>` so we have to unwrap the value.
        if (isTwoWayBinding && this.tcb.env.config.allowSignalsInTwoWayBindings) {
          assignment = unwrapWritableSignal(assignment, this.tcb);
        }

        if (isSignal) {
          // TL;DR: For signal inputs, this block generates the type-checking code by:
          // 1. Extracting the "write type" of the signal (which includes any transformations)
          //    using the `ɵInputSignalWriteType` helper.
          // 2. Creating a temporary variable in the Type Check Block (TCB) explicitly typed
          //    with that extracted write type.
          // 3. Assigning the binding expression to this variable.
          //
          // This forces TypeScript to check if the bound value is valid for the signal's *input*
          // side (the `WriteT`), effectively validating transforms and types for signal inputs.

          const value = this.tcb.allocateId();
          if (attr.keySpan !== null) {
            addParseSpanInfo(value, attr.keySpan);
          }

          const propAccess = target;
          if (
            !ts.isPropertyAccessExpression(propAccess) &&
            !ts.isElementAccessExpression(propAccess)
          ) {
            throw new Error('Unsupported symbol in signal input type extraction');
          }

          let inputType: ts.TypeNode;
          if (ts.isPropertyAccessExpression(propAccess) && ts.isIdentifier(propAccess.name)) {
            inputType = ts.factory.createIndexedAccessTypeNode(
              ts.factory.createTypeQueryNode(propAccess.expression as ts.Identifier),
              ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(propAccess.name.text),
              ),
            );
          } else if (
            ts.isElementAccessExpression(propAccess) &&
            ts.isStringLiteral(propAccess.argumentExpression)
          ) {
            inputType = ts.factory.createIndexedAccessTypeNode(
              ts.factory.createTypeQueryNode(propAccess.expression as ts.Identifier),
              ts.factory.createLiteralTypeNode(propAccess.argumentExpression),
            );
          } else {
            throw new Error('Unsupported symbol in signal input type extraction');
          }

          // For restricted inputs (like private/protected) we still need to add a statement
          // to trigger diagnostics.
          if (
            this.dir.restrictedInputFields.has(fieldName) &&
            this.tcb.env.config.honorAccessModifiersForInputBindings
          ) {
            addParseSpanInfo(propAccess, attr.keySpan!);
            this.scope.addStatement(ts.factory.createExpressionStatement(propAccess));
          }

          const inputSignalWriteType = this.tcb.env.referenceExternalSymbol(
            R3Identifiers.InputSignalWriteType.moduleName,
            R3Identifiers.InputSignalWriteType.name,
          );
          if (
            !ts.isIdentifier(inputSignalWriteType) &&
            !ts.isPropertyAccessExpression(inputSignalWriteType)
          ) {
            throw new Error(
              `Expected identifier or property access for reference to ${R3Identifiers.InputSignalWriteType.name}`,
            );
          }

          let typeName: ts.EntityName;
          if (ts.isIdentifier(inputSignalWriteType)) {
            typeName = inputSignalWriteType;
          } else {
            typeName = ts.factory.createQualifiedName(
              inputSignalWriteType.expression as ts.Identifier,
              inputSignalWriteType.name as ts.Identifier,
            );
          }

          const type = ts.factory.createTypeReferenceNode(typeName, [inputType]);
          addParseSpanInfo(type, attr.keySpan!);

          // RHS Express
          const inputVar = ts.factory.createVariableDeclaration(value, undefined, type, assignment);
          addParseSpanInfo(inputVar, attr.sourceSpan);

          const inputVarList = ts.factory.createVariableDeclarationList(
            [inputVar],
            ts.NodeFlags.Const,
          );
          statement = ts.factory.createVariableStatement(undefined, inputVarList);

          // Ignore diagnostics for text attributes if configured to do so.
          if (!this.tcb.env.config.checkTypeOfAttributes && typeof attr.value === 'string') {
            markIgnoreDiagnostics(inputVar);
          }
        } else {
          assignment = ts.factory.createBinaryExpression(
            target,
            ts.SyntaxKind.EqualsToken,
            assignment,
          );
          statement = ts.factory.createExpressionStatement(assignment);

          addParseSpanInfo(assignment, attr.sourceSpan);
          // Ignore diagnostics for text attributes if configured to do so.
          if (!this.tcb.env.config.checkTypeOfAttributes && typeof attr.value === 'string') {
            markIgnoreDiagnostics(assignment);
          }
        }

        if (attr.keySpan !== null) {
          addParseSpanInfo(target, attr.keySpan);
        }
      }

      if (statement) {
        this.scope.addStatement(statement);
      }
    }

    this.checkRequiredInputs(seenRequiredInputs);

    return null;
  }

  private checkRequiredInputs(seenRequiredInputs: Set<ClassPropertyName>): void {
    const missing: BindingPropertyName[] = [];

    for (const input of this.dir.inputs) {
      if (input.required && !seenRequiredInputs.has(input.classPropertyName)) {
        missing.push(input.bindingPropertyName);
      }
    }

    if (missing.length > 0) {
      this.tcb.oobRecorder.missingRequiredInputs(
        this.tcb.id,
        this.node,
        this.dir.name,
        this.dir.isComponent,
        missing,
      );
    }
  }
}

/**
 * A `TcbOp` which generates code to check "unclaimed inputs" - bindings on an element which were
 * not attributed to any directive or component, and are instead processed against the HTML element
 * itself.
 *
 * Currently, only the expressions of these bindings are checked. The targets of the bindings are
 * checked against the DOM schema via a `TcbDomSchemaCheckerOp`.
 *
 * Executing this operation returns nothing.
 */
export class TcbUnclaimedInputsOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private inputs: TmplAstBoundAttribute[],
    private target: LocalSymbol,
    private claimedInputs: Set<string> | null,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    // `this.inputs` contains only those bindings not matched by any directive. These bindings go to
    // the element itself.
    let elId: ts.Expression | null = null;

    // TODO(alxhub): this could be more efficient.
    for (const binding of this.inputs) {
      const isPropertyBinding =
        binding.type === BindingType.Property || binding.type === BindingType.TwoWay;

      if (isPropertyBinding && this.claimedInputs?.has(binding.name)) {
        // Skip this binding as it was claimed by a directive.
        continue;
      }

      const expr = widenBinding(tcbExpression(binding.value, this.tcb, this.scope), this.tcb);

      if (this.tcb.env.config.checkTypeOfDomBindings && isPropertyBinding) {
        if (binding.name !== 'style' && binding.name !== 'class') {
          if (elId === null) {
            elId = this.scope.resolve(this.target);
          }
          // A direct binding to a property.
          const propertyName = REGISTRY.getMappedPropName(binding.name);
          const prop = ts.factory.createElementAccessExpression(
            elId,
            ts.factory.createStringLiteral(propertyName),
          );
          const stmt = ts.factory.createBinaryExpression(
            prop,
            ts.SyntaxKind.EqualsToken,
            wrapForDiagnostics(expr),
          );
          addParseSpanInfo(stmt, binding.sourceSpan);
          this.scope.addStatement(ts.factory.createExpressionStatement(stmt));
        } else {
          this.scope.addStatement(ts.factory.createExpressionStatement(expr));
        }
      } else {
        // A binding to an animation, attribute, class or style. For now, only validate the right-
        // hand side of the expression.
        // TODO: properly check class and style bindings.
        this.scope.addStatement(ts.factory.createExpressionStatement(expr));
      }
    }

    return null;
  }
}
