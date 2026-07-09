/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, BindingType, Call, PropertyRead, SafeCall} from '../../expression_parser/ast';
import {DirectiveOwner} from '../../render3/view/t2_api';
import {
  BoundAttribute,
  Component,
  Directive,
  Element,
  HostElement,
  Node,
  Template,
} from '../../render3/r3_ast';

import {TcbDirectiveMetadata, TcbInputMapping} from '../api';
import {TcbOp} from './base';
import {declareVariable, TcbExpr} from './codegen';
import {TcbBoundAttribute} from './bindings';
import type {Context} from './context';
import {tcbExpression} from './expression';
import type {Scope} from './scope';

/** Possible types of custom form control directives. */
export type CustomFormControlType = 'value' | 'checkbox';

/** Names of the input fields on custom controls. */
const formControlInputFields = [
  // Should be kept in sync with the `FormUiControl` bindings,
  // defined in `packages/forms/signals/src/api/control.ts`.
  'errors',
  'dirty',
  'disabled',
  'disabledReasons',
  'hidden',
  'invalid',
  'name',
  'pending',
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
 * A `TcbOp` which constructs an instance of the signal forms `FormField` directive on a native element.
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

  /**
   * Whether the host element has a dynamic `type` binding, meaning we cannot
   * statically determine the input type.
   */
  private readonly hasDynamicType: boolean;

  override get optional() {
    return false;
  }

  constructor(
    protected tcb: Context,
    protected scope: Scope,
    protected node: Element,
    private inputType: string | null,
  ) {
    super();

    this.hasDynamicType =
      this.inputType === null &&
      this.node.inputs.some(
        (input) =>
          (input.type === BindingType.Property || input.type === BindingType.Attribute) &&
          input.name === 'type',
      );

    const isPossiblyDateOrTime =
      this.hasDynamicType ||
      this.inputType === 'date' ||
      this.inputType === 'time' ||
      this.inputType === 'month' ||
      this.inputType === 'week' ||
      this.inputType === 'datetime-local';

    if (isPossiblyDateOrTime) {
      this.unsupportedBindingFields.delete('min');
      this.unsupportedBindingFields.delete('max');
    }
  }

  override execute(): null {
    const inputs = this.node instanceof HostElement ? this.node.bindings : this.node.inputs;
    const fieldBinding =
      inputs.find((input) => input.type === BindingType.Property && input.name === 'formField') ??
      null;

    // This should only happen if there's something like `<input formField="static"/>`
    // which will be caught by the input type checking of the `FormField` directive.
    if (fieldBinding === null) {
      return null;
    }

    checkUnsupportedFieldBindings(this.node, this.unsupportedBindingFields, this.tcb);

    const rawExpectedType = this.getExpectedTypeFromDomNode(this.node);

    if (rawExpectedType === null) {
      // For text-like <input> elements, use an invariant check on the value signal.
      // WritableSignal<T> is invariant in T, so assigning it to a union of structural types
      // gives us exact type matching: only Field<string> or Field<number|null> are accepted.
      const signal = extractFieldValueSignal(fieldBinding.value, this.tcb, this.scope);
      const id = new TcbExpr(this.tcb.allocateId());
      const unionType = new TcbExpr(
        '{ (): string; set: (v: string) => void; } | { (): number | null; set: (v: number | null) => void; }',
      );
      const assignment = new TcbExpr(`${id.print()} = ${signal.print()}`);
      assignment.addParseSpanInfo(fieldBinding.valueSpan ?? fieldBinding.sourceSpan);

      this.scope.addStatement(declareVariable(id, unionType));
      this.scope.addStatement(assignment);
    } else {
      const expectedType = new TcbExpr(rawExpectedType);
      const value = extractFieldValue(fieldBinding.value, this.tcb, this.scope);

      // Create a variable with the expected type and check that the field value is assignable, e.g.
      // var t1 = null! as string | number; t1 = f().value()`.
      const id = new TcbExpr(this.tcb.allocateId());
      const assignment = new TcbExpr(`${id.print()} = ${value.print()}`);
      assignment.addParseSpanInfo(fieldBinding.valueSpan ?? fieldBinding.sourceSpan);

      this.scope.addStatement(declareVariable(id, expectedType));
      this.scope.addStatement(assignment);
    }

    return null;
  }

  private getExpectedTypeFromDomNode(node: Element): string | null {
    if (node.name === 'textarea' || node.name === 'select') {
      // `<textarea>` and `<select>` are always strings.
      return 'string';
    }

    if (node.name !== 'input') {
      return this.getUnsupportedType();
    }

    switch (this.inputType) {
      case 'checkbox':
        return 'boolean';

      case 'radio':
        return 'string';

      case 'number':
      case 'range':
      case 'datetime-local':
        return 'string | number | null';

      case 'date':
      case 'month':
      case 'time':
      case 'week':
        return 'string | number | Date | null';
    }

    // If the type is dynamic, check it as if it can be any of the types above.
    if (this.hasDynamicType) {
      return 'string | number | boolean | Date | null';
    }

    if (this.inputType === 'text' || this.inputType === null) {
      // Return null to signal the invariant check for text-like inputs.
      return null;
    }

    return 'string';
  }

  private getUnsupportedType(): string {
    return 'never';
  }
}

/**
 * A variation of the `TcbNativeFieldOp` with specific logic for radio buttons.
 */
export class TcbNativeRadioButtonFieldOp extends TcbNativeFieldOp {
  constructor(tcb: Context, scope: Scope, node: Element) {
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
      const id = new TcbExpr(this.tcb.allocateId());
      const value = tcbExpression(valueBinding.value, this.tcb, this.scope);
      const assignment = new TcbExpr(`${id.print()} = ${value.print()}`);
      assignment.addParseSpanInfo(valueBinding.sourceSpan);
      this.scope.addStatement(declareVariable(id, new TcbExpr('string')));
      this.scope.addStatement(assignment);
    }

    return null;
  }
}

/** Expands the set of bound inputs with the ones from custom field directives. */
export function expandBoundAttributesForField(
  directive: TcbDirectiveMetadata,
  node: Template | Element | Component | Directive,
  customFormControlType: CustomFormControlType | null,
): TcbBoundAttribute[] | null {
  const fieldBinding = node.inputs.find(
    (input) => input.type === BindingType.Property && input.name === 'formField',
  );

  if (!fieldBinding) {
    return null;
  }

  let boundInputs: TcbBoundAttribute[] | null = null;
  let primaryInput: TcbBoundAttribute | null;

  if (customFormControlType === 'value') {
    primaryInput = getSyntheticFieldBoundInput(
      directive,
      'value',
      'value',
      fieldBinding,
      customFormControlType,
    );
  } else if (customFormControlType === 'checkbox') {
    primaryInput = getSyntheticFieldBoundInput(
      directive,
      'checked',
      'value',
      fieldBinding,
      customFormControlType,
    );
  } else {
    primaryInput = null;
  }

  if (primaryInput !== null) {
    boundInputs ??= [];
    boundInputs.push(primaryInput);
  }

  for (const name of formControlInputFields) {
    const input = getSyntheticFieldBoundInput(
      directive,
      name,
      name,
      fieldBinding,
      customFormControlType,
    );

    if (input !== null) {
      boundInputs ??= [];
      boundInputs.push(input);
    }
  }

  return boundInputs;
}

export function isFieldDirective(meta: TcbDirectiveMetadata): boolean {
  if (meta.name !== 'FormField') {
    return false;
  }

  // Fast path, relevant for all external users.
  if (meta.ref.moduleName === '@angular/forms/signals') {
    return true;
  }

  // Slightly slower, but more accurate path. Fallback for internal / local compilation where we don't have the exact module.
  return meta.hasNgFieldDirective;
}

function getSyntheticFieldBoundInput(
  dir: TcbDirectiveMetadata,
  inputName: string,
  fieldPropertyName: string,
  fieldBinding: BoundAttribute,
  customFieldType: CustomFormControlType | null,
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
    inputs: inputs.map((input: TcbInputMapping) => ({
      fieldName: input.classPropertyName,
      required: input.required,
      transformType: input.transformType,
      isSignal: input.isSignal,
      isTwoWayBinding,
    })),
  };
}

/** Determines if a directive is a custom field and its type. */
export function getCustomFieldDirectiveType(
  meta: TcbDirectiveMetadata,
): CustomFormControlType | null {
  if (hasModelInput('value', meta)) {
    return 'value';
  } else if (hasModelInput('checked', meta)) {
    return 'checkbox';
  }
  return null;
}

/** Determines if a directive usage is on a native field. */
export function isNativeField(
  dir: TcbDirectiveMetadata,
  node: Node,
  allDirectiveMatches: TcbDirectiveMetadata[],
): node is Element & {name: 'input' | 'select' | 'textarea'} {
  // Only applies to the `FormField` directive.
  if (!isFieldDirective(dir)) {
    return false;
  }

  // Only applies to input, select and textarea elements.
  if (
    !(node instanceof Element) ||
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
function isControlValueAccessorLike(meta: TcbDirectiveMetadata): boolean {
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
  const inputs = node instanceof HostElement ? node.bindings : node.inputs;

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

  if (!(node instanceof HostElement)) {
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
function extractFieldValue(expression: AST, tcb: Context, scope: Scope): TcbExpr {
  // Unwraps the field, e.g. `[field]="f"` turns into `f()`.
  const innerCall = new TcbExpr(tcbExpression(expression, tcb, scope).print() + '()');

  // Note: we ignore diagnostics on this call, because it might not be callable
  // (e.g. `undefined` is passed in). Whether the value conforms to `FieldTree` is
  // checked using the common inputs op.
  innerCall.markIgnoreDiagnostics();

  // Extract the value from the field, e.g. `f().value()`.
  return new TcbExpr(`${innerCall.print()}.value()`);
}

/**
 * Gets an expression that extracts the value signal of a field binding (without calling it).
 */
function extractFieldValueSignal(expression: AST, tcb: Context, scope: Scope): TcbExpr {
  // Unwraps the field, e.g. `[field]="f"` turns into `f()`.
  const innerCall = new TcbExpr(tcbExpression(expression, tcb, scope).print() + '()');
  innerCall.markIgnoreDiagnostics();

  // Extract the value signal from the field, e.g. `f().value` (not called).
  return new TcbExpr(`${innerCall.print()}.value`);
}

/** Checks whether a directive has a model-like input with a specific name. */
function hasModelInput(name: string, meta: TcbDirectiveMetadata): boolean {
  return (
    meta.inputs.hasBindingPropertyName(name) && meta.outputs.hasBindingPropertyName(name + 'Change')
  );
}

/**
 * Determines whether a node is a form control based on its matching directives.
 *
 * A node is a form control if it has a matching `FormField` directive, and no other directives match
 * the `field` input.
 */
export function isFormControl(allDirectiveMatches: TcbDirectiveMetadata[]): boolean {
  let result = false;
  for (const match of allDirectiveMatches) {
    if (match.inputs.hasBindingPropertyName('formField')) {
      if (!isFieldDirective(match)) {
        return false;
      }
      result = true;
    }
  }
  return result;
}
