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
  Call,
  DirectiveOwner,
  PropertyRead,
  SafeCall,
  TmplAstBoundAttribute,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstHostElement,
  TmplAstNode,
  TmplAstTemplate,
} from '@angular/compiler';
import ts from 'typescript';
import {TcbOp} from './base';
import type {Context} from './context';
import type {Scope} from './scope';
import {addParseSpanInfo} from '../diagnostics';
import {tsDeclareVariable} from '../ts_util';
import {TypeCheckableDirectiveMeta} from '../../api';
import {tcbExpression} from './expression';
import {markIgnoreDiagnostics} from '../comments';
import {TcbBoundAttribute} from './bindings';

/** Possible types of custom field directives. */
export type CustomFieldType = 'value' | 'checkbox';

/** Names of the input fields on custom controls. */
const formControlInputFields = [
  // Should be kept in sync with the `FormUiControl` bindings,
  // defined in `packages/forms/signals/src/api/control.ts`.
  'errors',
  'invalid',
  'disabled',
  'disabledReasons',
  'name',
  'readonly',
  'touched',
  'max',
  'maxLength',
  'min',
  'minLength',
  'pattern',
  'required',
];

/** Names of input fields to which users aren't allowed to bind when using a `field` directive. */
export const customFormControlBannedInputFields = new Set([
  ...formControlInputFields,
  'value',
  'checked',
]);

/** Names of the fields that are optional on a control. */
const formControlOptionalFields = new Set([
  // Should be kept in sync with the `FormUiControl` bindings,
  // defined in `packages/forms/signals/src/api/control.ts`.
  'max',
  'maxLength',
  'min',
  'minLength',
]);

/**
 * A `TcbOp` which constructs an instance of the signal forms `Field` directive on a native element.
 */
export class TcbNativeFieldOp extends TcbOp {
  /** Bindings that aren't supported on signal form fields. */
  protected readonly unsupportedBindingFields = new Set([
    ...formControlInputFields,
    'value',
    'checked',
    'maxlength',
    'minlength',
  ]);

  override get optional() {
    return false;
  }

  constructor(
    protected tcb: Context,
    protected scope: Scope,
    protected node: TmplAstElement,
    private inputType: string | null,
  ) {
    super();
  }

  override execute(): null {
    const inputs = this.node instanceof TmplAstHostElement ? this.node.bindings : this.node.inputs;
    const fieldBinding =
      inputs.find((input) => input.type === BindingType.Property && input.name === 'field') ?? null;

    // This should only happen if there's something like `<input field="static"/>`
    // which will be caught by the input type checking of the `Field` directive.
    if (fieldBinding === null) {
      return null;
    }

    checkUnsupportedFieldBindings(this.node, this.unsupportedBindingFields, this.tcb);

    const expectedType = this.getExpectedTypeFromDomNode(this.node);
    const value = extractFieldValue(fieldBinding.value, this.tcb, this.scope);

    // Create a variable with the expected type and check that the field value is assignable, e.g.
    // var t1 = null! as string | number; t1 = f().value()`.
    const id = this.tcb.allocateId();
    const assignment = ts.factory.createBinaryExpression(id, ts.SyntaxKind.EqualsToken, value);
    addParseSpanInfo(assignment, fieldBinding.valueSpan ?? fieldBinding.sourceSpan);
    this.scope.addStatement(tsDeclareVariable(id, expectedType));
    this.scope.addStatement(ts.factory.createExpressionStatement(assignment));
    return null;
  }

  private getExpectedTypeFromDomNode(node: TmplAstElement): ts.TypeNode {
    if (node.name === 'textarea' || node.name === 'select') {
      // `<textarea>` and `<select>` are always strings.
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    }

    if (node.name !== 'input') {
      return this.getUnsupportedType();
    }

    switch (this.inputType) {
      case 'checkbox':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);

      case 'number':
      case 'range':
      case 'datetime-local':
        return ts.factory.createUnionTypeNode([
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        ]);

      case 'date':
      case 'month':
      case 'time':
      case 'week':
        return ts.factory.createUnionTypeNode([
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          ts.factory.createTypeReferenceNode('Date'),
          ts.factory.createLiteralTypeNode(ts.factory.createNull()),
        ]);
    }

    // Fall back to string if we couldn't map the type.
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  }

  private getUnsupportedType(): ts.TypeNode {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
  }
}

/**
 * A variation of the `TcbNativeFieldOp` with specific logic for radio buttons.
 */
export class TcbNativeRadioButtonFieldOp extends TcbNativeFieldOp {
  constructor(tcb: Context, scope: Scope, node: TmplAstElement) {
    super(tcb, scope, node, 'radio');
    this.unsupportedBindingFields.delete('value');
  }

  override execute(): null {
    super.execute();

    const valueBinding = this.node.inputs.find((attr) => {
      return attr.type === BindingType.Property && attr.name === 'value';
    });

    if (valueBinding !== undefined) {
      // Include an additional expression to check that the `value` is a string.
      const id = this.tcb.allocateId();
      const value = tcbExpression(valueBinding.value, this.tcb, this.scope);
      const assignment = ts.factory.createBinaryExpression(id, ts.SyntaxKind.EqualsToken, value);
      addParseSpanInfo(assignment, valueBinding.sourceSpan);
      this.scope.addStatement(
        tsDeclareVariable(id, ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)),
      );
      this.scope.addStatement(ts.factory.createExpressionStatement(assignment));
    }

    return null;
  }
}

/** Expands the set of bound inputs with the ones from custom field directives. */
export function expandBoundAttributesForField(
  directive: TypeCheckableDirectiveMeta,
  node: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
  customFieldType: CustomFieldType,
): TcbBoundAttribute[] | null {
  const fieldBinding = node.inputs.find(
    (input) => input.type === BindingType.Property && input.name === 'field',
  );

  if (!fieldBinding) {
    return null;
  }

  let boundInputs: TcbBoundAttribute[] | null = null;
  let primaryInput: TcbBoundAttribute | null;

  if (customFieldType === 'value') {
    primaryInput = getSyntheticFieldBoundInput(
      directive,
      'value',
      'value',
      fieldBinding,
      customFieldType,
    );
  } else if (customFieldType === 'checkbox') {
    primaryInput = getSyntheticFieldBoundInput(
      directive,
      'checked',
      'value',
      fieldBinding,
      customFieldType,
    );
  } else {
    primaryInput = null;
  }

  if (primaryInput !== null) {
    boundInputs ??= [];
    boundInputs.push(primaryInput);
  }

  for (const name of formControlInputFields) {
    const input = getSyntheticFieldBoundInput(directive, name, name, fieldBinding, customFieldType);

    if (input !== null) {
      boundInputs ??= [];
      boundInputs.push(input);
    }
  }

  return boundInputs;
}

export function isFieldDirective(meta: TypeCheckableDirectiveMeta): boolean {
  if (meta.name !== 'Field') {
    return false;
  }

  // Fast path, relevant for all external users.
  if (meta.ref.bestGuessOwningModule?.specifier === '@angular/forms/signals') {
    return true;
  }

  // Slightly slower, but more accurate path.
  return (
    ts.isClassDeclaration(meta.ref.node) &&
    meta.ref.node.members.some(
      (member) =>
        ts.isPropertyDeclaration(member) &&
        ts.isComputedPropertyName(member.name) &&
        ts.isIdentifier(member.name.expression) &&
        member.name.expression.text === 'ɵCONTROL',
    )
  );
}

function getSyntheticFieldBoundInput(
  dir: TypeCheckableDirectiveMeta,
  inputName: string,
  fieldPropertyName: string,
  fieldBinding: TmplAstBoundAttribute,
  customFieldType: CustomFieldType,
): TcbBoundAttribute | null {
  const inputs = dir.inputs.getByBindingPropertyName(inputName);

  if (inputs === null || inputs.length === 0) {
    return null;
  }

  const {span, sourceSpan} = fieldBinding.value;
  const outerCall = new Call(span, sourceSpan, fieldBinding.value, [], sourceSpan);
  const read = new PropertyRead(span, sourceSpan, sourceSpan, outerCall, fieldPropertyName);
  const isTwoWayBinding =
    (customFieldType === 'value' && inputName === 'value') ||
    (customFieldType === 'checkbox' && inputName === 'checked');

  let value: AST;

  if (isTwoWayBinding) {
    value = read;
  } else if (formControlOptionalFields.has(fieldPropertyName)) {
    // Some fields can be optional so we need to invoke them using a `SafeCall`.
    value = new SafeCall(span, sourceSpan, read, [], sourceSpan);
  } else {
    value = new Call(span, sourceSpan, read, [], sourceSpan);
  }

  return {
    value,
    sourceSpan: fieldBinding.sourceSpan,
    keySpan: fieldBinding.keySpan ?? null,
    inputs: inputs.map((input) => ({
      fieldName: input.classPropertyName,
      required: input.required,
      transformType: input.transform?.type || null,
      isSignal: input.isSignal,
      isTwoWayBinding,
    })),
  };
}

/** Determines if a directive is a custom field and its type. */
export function getCustomFieldDirectiveType(
  meta: TypeCheckableDirectiveMeta,
): CustomFieldType | null {
  if (hasModelInput('value', meta)) {
    return 'value';
  } else if (hasModelInput('checked', meta)) {
    return 'checkbox';
  }
  return null;
}

/** Determines if a directive usage is on a native field. */
export function isNativeField(
  dir: TypeCheckableDirectiveMeta,
  node: TmplAstNode,
  allDirectiveMatches: TypeCheckableDirectiveMeta[],
): node is TmplAstElement & {name: 'input' | 'select' | 'textarea'} {
  // Only applies to the `Field` directive.
  if (!isFieldDirective(dir)) {
    return false;
  }

  // Only applies to input, select and textarea elements.
  if (
    !(node instanceof TmplAstElement) ||
    (node.name !== 'input' && node.name !== 'select' && node.name !== 'textarea')
  ) {
    return false;
  }

  // Only applies if there are no custom fields or ControlValueAccessors.
  return allDirectiveMatches.every((meta) => {
    return getCustomFieldDirectiveType(meta) === null && !isControlValueAccessorLike(meta);
  });
}

/**
 * Determines if a directive is shaped like a `ControlValueAccessor`. Note that this isn't
 * 100% reliable, because we don't know if the directive was actually provided at runtime.
 */
function isControlValueAccessorLike(meta: TypeCheckableDirectiveMeta): boolean {
  return (
    meta.publicMethods.has('writeValue') &&
    meta.publicMethods.has('registerOnChange') &&
    meta.publicMethods.has('registerOnTouched')
  );
}

/** Checks whether a node has bindings that aren't supported on fields. */
export function checkUnsupportedFieldBindings(
  node: DirectiveOwner,
  unsupportedBindingFields: Set<string>,
  tcb: Context,
) {
  const inputs = node instanceof TmplAstHostElement ? node.bindings : node.inputs;

  for (const input of inputs) {
    if (input.type === BindingType.Property && unsupportedBindingFields.has(input.name)) {
      tcb.oobRecorder.formFieldUnsupportedBinding(tcb.id, input);
    } else if (
      input.type === BindingType.Attribute &&
      unsupportedBindingFields.has(input.name.toLowerCase())
    ) {
      tcb.oobRecorder.formFieldUnsupportedBinding(tcb.id, input);
    }
  }

  if (!(node instanceof TmplAstHostElement)) {
    for (const attr of node.attributes) {
      if (unsupportedBindingFields.has(attr.name.toLowerCase())) {
        tcb.oobRecorder.formFieldUnsupportedBinding(tcb.id, attr);
      }
    }
  }
}

/**
 * Gets an expression that extracts the value of a field binding.
 */
function extractFieldValue(expression: AST, tcb: Context, scope: Scope): ts.Expression {
  // Unwraps the field, e.g. `[field]="f"` turns into `f()`.
  const innerCall = ts.factory.createCallExpression(
    tcbExpression(expression, tcb, scope),
    undefined,
    undefined,
  );

  // Note: we ignore diagnostics on this call, because it might not be callable
  // (e.g. `undefined` is passed in). Whether the value conforms to `FieldTree` is
  // checked using the common inputs op.
  markIgnoreDiagnostics(innerCall);

  // Extract the value from the field, e.g. `f().value()`.
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(innerCall, 'value'),
    undefined,
    undefined,
  );
}

/** Checks whether a directive has a model input with a specific name. */
function hasModelInput(name: string, meta: TypeCheckableDirectiveMeta): boolean {
  return (
    !!meta.inputs.getByBindingPropertyName(name)?.some((v) => v.isSignal) &&
    meta.outputs.hasBindingPropertyName(name + 'Change')
  );
}
