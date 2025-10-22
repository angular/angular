/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {assertLessThanOrEqual} from '../../util/assert';
import {bindingUpdated} from '../bindings';
import {ɵCONTROL, ɵControl} from '../interfaces/control';
import {ComponentDef} from '../interfaces/definition';
import {InputFlags} from '../interfaces/input_flags';
import {TElementNode, TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {Renderer} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {isComponentHost} from '../interfaces/type_checks';
import {LView, RENDERER, TView} from '../interfaces/view';
import {
  getBindingIndex,
  getCurrentTNode,
  getLView,
  getSelectedTNode,
  getTView,
  nextBindingIndex,
} from '../state';
import {NO_CHANGE} from '../tokens';
import {isNameOnlyAttributeMarker} from '../util/attrs_utils';
import {getNativeByTNode} from '../util/view_utils';
import {listenToOutput} from '../view/directive_outputs';
import {listenToDomEvent, wrapListener} from '../view/listeners';
import {setPropertyAndInputs, storePropertyBindingMetadata} from './shared';
import {writeToDirectiveInput} from './write_to_directive_input';

/**
 * Possibly sets up a {@link ɵControl} to manage a native or custom form control.
 *
 * Setup occurs if a `field` input is bound to a {@link ɵControl} directive on the current node,
 * but not to a component. If a `field` input is bound to a component, we assume the component
 * will manage the control in its own template.
 *
 * @codeGenApi
 */
export function ɵɵcontrolCreate(): void {
  const lView = getLView<{} | null>();
  const tView = getTView();
  const tNode = getCurrentTNode()!;
  const control = tView.firstCreatePass
    ? getControlDirectiveFirstCreatePass(tView, tNode, lView)
    : getControlDirective(tNode, lView);

  if (!control) {
    return;
  }

  if (tNode.flags & TNodeFlags.isFormValueControl) {
    listenToCustomControl(lView, tNode, control, 'value');
  } else if (tNode.flags & TNodeFlags.isFormCheckboxControl) {
    listenToCustomControl(lView, tNode, control, 'checked');
  } else if (tNode.flags & TNodeFlags.isInteropControl) {
    control.ɵinteropControlCreate();
  } else {
    listenToNativeControl(lView, tNode, control);
  }

  control.ɵregister();
}

/**
 * Updates a `field` property, and possibly other form control properties, on the current element.
 *
 * This is a specialized version of the `ɵɵproperty` instruction that handles updating additional
 * form control properties, if set up to do so by {@link ɵɵcontrolCreate} during creation.
 *
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 *
 * @codeGenApi
 */
export function ɵɵcontrol<T>(value: T, sanitizer?: SanitizerFn | null): void {
  const lView = getLView();
  const tNode = getSelectedTNode();
  const bindingIndex = nextBindingIndex();

  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    setPropertyAndInputs(tNode, lView, 'field', value, lView[RENDERER], sanitizer);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, 'field', bindingIndex);

    // Reset control bindings when the [field] itself changes, since the new field may expose a
    // different set of field state properties than the old field.
    resetControlBindings(lView);
  }

  const control = getControlDirective(tNode, lView);
  if (control) {
    if (tNode.flags & TNodeFlags.isFormValueControl) {
      updateCustomControl(tNode, lView, control, 'value');
    } else if (tNode.flags & TNodeFlags.isFormCheckboxControl) {
      updateCustomControl(tNode, lView, control, 'checked');
    } else if (tNode.flags & TNodeFlags.isInteropControl) {
      control.ɵinteropControlUpdate();
    } else {
      updateNativeControl(tNode, lView, control);
    }
  }

  // This instruction requires an additional variable slot to store control property bindings, but
  // may not use them if the `control` is undefined, so we increment the index here rather than when
  // used to ensure it happens unconditionally. Otherwise, the next instruction could begin with the
  // wrong binding index.
  nextBindingIndex();
}

function getControlDirectiveFirstCreatePass<T>(
  tView: TView,
  tNode: TNode,
  lView: LView,
): ɵControl<T> | undefined {
  const directiveIndices = tNode.inputs?.['field'];
  if (!directiveIndices) {
    // There are no matching inputs for the `[field]` property binding.
    return;
  }

  let componentIndex!: number;
  if (isComponentHost(tNode)) {
    componentIndex = tNode.directiveStart + tNode.componentOffset;
    if (directiveIndices.includes(componentIndex)) {
      // If component has a `field` input, we assume that it will handle binding the field to the
      // appropriate native/custom control in its template, so we do not attempt to bind any inputs
      // on this component.
      return;
    }
  }

  // Search for the `ɵControl` directive.
  const control = findControlDirective<T>(lView, directiveIndices);
  if (!control) {
    // The `ɵControl` directive was not imported by this component.
    return;
  }

  tNode.flags |= TNodeFlags.isFormControl;

  if (isComponentHost(tNode)) {
    const componentDef = tView.data[componentIndex] as ComponentDef<unknown>;
    // TODO: should we check that any additional field state inputs are signal based?
    if (hasModelInput(componentDef, 'value')) {
      tNode.flags |= TNodeFlags.isFormValueControl;
      return control;
    } else if (hasModelInput(componentDef, 'checked')) {
      tNode.flags |= TNodeFlags.isFormCheckboxControl;
      return control;
    }
  }

  if (control.ɵhasInteropControl) {
    tNode.flags |= TNodeFlags.isInteropControl;
    return control;
  }

  if (isNativeControl(tNode)) {
    if (isNumericInput(tNode)) {
      tNode.flags |= TNodeFlags.isNativeNumericControl;
    }
    if (isTextControl(tNode)) {
      tNode.flags |= TNodeFlags.isNativeTextControl;
    }
    return control;
  }

  const tagName = tNode.value;
  throw new RuntimeError(
    RuntimeErrorCode.INVALID_FIELD_DIRECTIVE_HOST,
    `'<${tagName}>' is an invalid [field] directive host. The host must be a native form control ` +
      `(such as <input>', '<select>', or '<textarea>') or a custom form control component with a ` +
      `'value' or 'checked' model.`,
  );
}

/**
 * Returns the {@link ɵControl} directive on the specified node, if one is present and a `field`
 * input is bound to it, but not to a component. If a `field` input is bound to a component, we
 * assume the component will manage the control in its own template and return nothing to indicate
 * that the directive should not be set up.
 *
 * @param tNode The `TNode` of the element to check.
 * @param lView The `LView` that contains the element.
 */
function getControlDirective<T>(tNode: TNode, lView: LView): ɵControl<T> | undefined {
  return tNode.flags & TNodeFlags.isFormControl
    ? findControlDirective(lView, tNode.inputs!['field'])
    : undefined;
}

function findControlDirective<T>(
  lView: LView,
  directiveIndices: number[],
): ɵControl<T> | undefined {
  for (let index of directiveIndices) {
    const directive = lView[index];
    if (ɵCONTROL in directive) {
      return directive;
    }
  }

  // The `Field` directive was not imported by this component.
  return;
}

/** Returns whether the specified `componentDef` has a model input named `name`. */
function hasModelInput(componentDef: ComponentDef<unknown>, name: string): boolean {
  return hasSignalInput(componentDef, name) && hasOutput(componentDef, name + 'Change');
}

/** Returns whether the specified `componentDef` has a signal-based input named `name`.*/
function hasSignalInput(componentDef: ComponentDef<unknown>, name: string): boolean {
  const input = componentDef.inputs[name];
  return input && (input[1] & InputFlags.SignalBased) !== 0;
}

/** Returns whether the specified `componentDef` has an output named `name`. */
function hasOutput(componentDef: ComponentDef<unknown>, name: string): boolean {
  return name in componentDef.outputs;
}

/**
 * Adds event listeners to a custom form control component to notify the `field` of changes.
 *
 * @param lView The `LView` that contains the custom form control.
 * @param tNode The `TNode` of the custom form control.
 * @param control The `ɵControl` directive instance.
 * @param componentIndex The index of the custom form control component in the `LView`.
 * @param modelName The name of the model property on the custom form control.
 */
function listenToCustomControl(
  lView: LView<{} | null>,
  tNode: TNode,
  control: ɵControl<unknown>,
  modelName: string,
) {
  const componentIndex = tNode.directiveStart + tNode.componentOffset;
  const outputName = modelName + 'Change';
  listenToOutput(
    tNode,
    lView,
    componentIndex,
    outputName,
    outputName,
    wrapListener(tNode, lView, (newValue: unknown) => {
      const state = control.state();
      state.value.set(newValue);
      state.markAsDirty();
    }),
  );

  const tView = getTView();
  const componentDef = tView.data[componentIndex] as ComponentDef<unknown>;
  const touchedOutputName = 'touchedChange';
  if (hasOutput(componentDef, touchedOutputName)) {
    listenToOutput(
      tNode,
      lView,
      componentIndex,
      touchedOutputName,
      touchedOutputName,
      wrapListener(tNode, lView, () => {
        control.state().markAsTouched();
      }),
    );
  }
}

/**
 * A type for {@link HTMLTextAreaElement} that can be narrowed by its `type` property.
 *
 * The `type` property of a {@link HTMLTextAreaElement} should always be 'textarea', but the
 * TypeScript DOM API type definition lacks this detail.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement/type
 */
interface HTMLTextAreaElementNarrowed extends HTMLTextAreaElement {
  readonly type: 'textarea';
}

/**
 * Supported native control element types.
 */
type NativeControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElementNarrowed;

function isNativeControl(tNode: TNode): tNode is TElementNode {
  if (tNode.type !== TNodeType.Element) {
    return false;
  }
  const tagName = tNode.value;
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
}

/**
 * Adds event listeners to a native form control element to notify the `field` of changes.
 *
 * @param lView The `LView` that contains the native form control.
 * @param tNode The `TNode` of the native form control.
 * @param control The `ɵControl` directive instance.
 */
function listenToNativeControl(lView: LView<{} | null>, tNode: TNode, control: ɵControl<unknown>) {
  const tView = getTView();
  const renderer = lView[RENDERER];
  const inputListener = () => {
    const element = getNativeByTNode(tNode, lView) as NativeControlElement;
    const state = control.state();
    state.value.set(getNativeControlValue(element, state.value));
    state.markAsDirty();
  };
  listenToDomEvent(
    tNode,
    tView,
    lView,
    undefined,
    renderer,
    'input',
    inputListener,
    wrapListener(tNode, lView, inputListener),
  );

  const blurListener = () => {
    control.state().markAsTouched();
  };
  listenToDomEvent(
    tNode,
    tView,
    lView,
    undefined,
    renderer,
    'blur',
    blurListener,
    wrapListener(tNode, lView, blurListener),
  );
}

/**
 * Updates the inputs of a custom form control component with the latest state from the `field`.
 *
 * @param lView The `LView` that contains the custom form control.
 * @param componentIndex The index of the custom form control component in the `LView`.
 * @param modelName The name of the model property on the custom form control.
 * @param control The `ɵControl` directive instance.
 */
function updateCustomControl(
  tNode: TNode,
  lView: LView,
  control: ɵControl<unknown>,
  modelName: string,
) {
  const tView = getTView();
  const componentIndex = tNode.directiveStart + tNode.componentOffset;
  const component = lView[componentIndex];
  const componentDef = tView.data[componentIndex] as ComponentDef<{}>;
  const state = control.state();
  const bindings = getControlBindings(lView);

  // We know for certain that the value input exists already.
  const value = state.value();
  if (controlBindingUpdated(bindings, value)) {
    writeToDirectiveInput(componentDef, component, modelName, value);
  }

  // The remaining inputs are all optional.
  maybeUpdateInput(componentDef, component, bindings, 'name', state.name);
  maybeUpdateInput(componentDef, component, bindings, 'disabled', state.disabled);
  maybeUpdateInput(componentDef, component, bindings, 'readonly', state.readonly);
  maybeUpdateInput(componentDef, component, bindings, 'required', state.required);
  maybeUpdateInput(componentDef, component, bindings, 'max', state.max);
  maybeUpdateInput(componentDef, component, bindings, 'min', state.min);
  maybeUpdateInput(componentDef, component, bindings, 'maxLength', state.maxLength);
  maybeUpdateInput(componentDef, component, bindings, 'minLength', state.minLength);
  maybeUpdateInput(componentDef, component, bindings, 'errors', state.errors);
  maybeUpdateInput(componentDef, component, bindings, 'disabledReasons', state.disabledReasons);
  maybeUpdateInput(componentDef, component, bindings, 'invalid', state.invalid);
  maybeUpdateInput(componentDef, component, bindings, 'pattern', state.pattern);
  maybeUpdateInput(componentDef, component, bindings, 'touched', state.touched);
}

/**
 * Binds a value source, if defined, to an input, if it exists.
 *
 * @param componentDef The component definition used to check for the input.
 * @param component The component instance to update.
 * @param bindings The control bindings array to check for changes.
 * @param inputName The name of the input to update.
 * @param source The source of the value to bind.
 */
function maybeUpdateInput(
  componentDef: ComponentDef<unknown>,
  component: unknown,
  bindings: unknown[],
  inputName: string,
  source?: () => unknown,
): void {
  if (source && inputName in componentDef.inputs) {
    const value = source();
    if (controlBindingUpdated(bindings, value)) {
      writeToDirectiveInput(componentDef, component, inputName, value);
    }
  }
}

/**
 * Updates the properties of a native form control element with the latest state from the `field`.
 *
 * @param tNode The `TNode` of the native form control.
 * @param lView The `LView` that contains the native form control.
 * @param control The `ɵControl` directive instance.
 */
function updateNativeControl(tNode: TNode, lView: LView, control: ɵControl<unknown>): void {
  const element = getNativeByTNode(tNode, lView) as NativeControlElement;
  const renderer = lView[RENDERER];
  const state = control.state();
  const bindings = getControlBindings(lView);

  const value = state.value();
  if (controlBindingUpdated(bindings, value)) {
    setNativeControlValue(element, value);
  }

  const name = state.name();
  if (controlBindingUpdated(bindings, name)) {
    renderer.setAttribute(element, 'name', name);
  }

  const disabled = state.disabled();
  if (controlBindingUpdated(bindings, disabled)) {
    setBooleanAttribute(renderer, element, 'disabled', disabled);
  }

  const readonly = state.readonly();
  if (controlBindingUpdated(bindings, readonly)) {
    setBooleanAttribute(renderer, element, 'readonly', readonly);
  }

  if (state.required) {
    const required = state.required();
    if (controlBindingUpdated(bindings, required)) {
      setBooleanAttribute(renderer, element, 'required', required);
    }
  }

  if (tNode.flags & TNodeFlags.isNativeNumericControl) {
    maybeUpdateOptionalAttribute(renderer, element, bindings, 'max', state.max);
    maybeUpdateOptionalAttribute(renderer, element, bindings, 'min', state.min);
  }

  if (tNode.flags & TNodeFlags.isNativeTextControl) {
    maybeUpdateOptionalAttribute(renderer, element, bindings, 'maxlength', state.maxLength);
    maybeUpdateOptionalAttribute(renderer, element, bindings, 'minlength', state.minLength);
  }
}

/**
 * Binds a value source, if it exists, to an optional DOM attribute.
 *
 * An optional DOM attribute will be added, if defined, or removed, if undefined.
 *
 * @param renderer The renderer used to update the DOM.
 * @param element The element to update.
 * @param bindings The control bindings array to check for changes.
 * @param attrName The name of the attribute to update.
 * @param source The source of the value to bind.
 */
function maybeUpdateOptionalAttribute(
  renderer: Renderer,
  element: HTMLElement,
  bindings: unknown[],
  attrName: string,
  source?: () => {toString(): string} | undefined,
): void {
  if (source) {
    const value = source();
    if (controlBindingUpdated(bindings, value)) {
      setOptionalAttribute(renderer, element, attrName, value);
    }
  }
}

/** Checks if a given value is a Date or null */
function isDateOrNull(value: unknown): value is Date | null {
  return value === null || value instanceof Date;
}

/** Returns whether `control` has a numeric input type. */
function isNumericInput(tNode: TElementNode): boolean {
  if (!tNode.attrs || tNode.value !== 'input') {
    return false;
  }

  for (let i = 0; i < tNode.attrs.length; i += 2) {
    const name = tNode.attrs[i];

    if (isNameOnlyAttributeMarker(name)) {
      break;
    }

    if (name === 'type') {
      const value = tNode.attrs[i + 1];

      return (
        value === 'date' ||
        value === 'datetime-local' ||
        value === 'month' ||
        value === 'number' ||
        value === 'range' ||
        value === 'time' ||
        value === 'week'
      );
    }
  }

  return false;
}

/**
 * Returns whether `control` is a text-based input.
 *
 * This is not the same as an input with `type="text"`, but rather any input that accepts
 * text-based input which includes numeric types.
 */
function isTextControl(tNode: TElementNode): boolean {
  return tNode.value !== 'select';
}

/**
 * Returns the value from a native control element.
 *
 * @param element The native control element.
 * @param currentValue A function that returns the current value from the control's corresponding
 *   field state.
 *
 * The type of the returned value depends on the `type` property of the control, and will attempt to
 * match the current value's type. For example, the value of `<input type="number">` can be read as
 * a `string` or a `number`. If the current value is a `number`, then this will return a `number`.
 * Otherwise, this will return the value as a `string`.
 */
function getNativeControlValue(
  element: NativeControlElement,
  currentValue: () => unknown,
): unknown {
  // Special cases for specific input types.
  switch (element.type) {
    case 'checkbox':
      return element.checked;
    case 'number':
    case 'range':
    case 'datetime-local':
      // We can read a `number` or a `string` from this input type. Prefer whichever is consistent
      // with the current type.
      if (typeof currentValue() === 'number') {
        return element.valueAsNumber;
      }
      break;
    case 'date':
    case 'month':
    case 'time':
    case 'week':
      // We can read a `Date | null`, `number`, or `string` from this input type. Prefer whichever
      // is consistent with the current type.
      const value = currentValue();
      if (isDateOrNull(value)) {
        return element.valueAsDate;
      } else if (typeof value === 'number') {
        return element.valueAsNumber;
      }
      break;
  }

  // Default to reading the value as a string.
  return element.value;
}

/**
 * Sets a native control element's value.
 *
 * @param element The native control element.
 * @param value The new value to set.
 */
function setNativeControlValue(element: NativeControlElement, value: unknown) {
  // Special cases for specific input types.
  switch (element.type) {
    case 'checkbox':
      element.checked = value as boolean;
      return;
    case 'radio':
      // Although HTML behavior is to clear the input already, we do this just in case. It seems
      // like it might be necessary in certain environments (e.g. Domino).
      element.checked = value === element.value;
      return;
    case 'number':
    case 'range':
    case 'datetime-local':
      // This input type can receive a `number` or a `string`.
      if (typeof value === 'number') {
        element.valueAsNumber = value;
        return;
      }
      break;
    case 'date':
    case 'month':
    case 'time':
    case 'week':
      // This input type can receive a `Date | null` or a `number` or a `string`.
      if (isDateOrNull(value)) {
        element.valueAsDate = value;
        return;
      } else if (typeof value === 'number') {
        element.valueAsNumber = value;
        return;
      }
  }

  // Default to setting the value as a string.
  element.value = value as string;
}

/** The index of the next binding that will be checked by {@link controlBindingUpdated}. */
let controlBindingIndex = 0;

/**
 * Returns the values of field state properties bound to a control.
 *
 * This resets {@link nextControlBindingIndex} to point at the start of the returned array.
 *
 * The returned array will be empty if properties from the current field have not yet been bound to
 * the control.
 */
function getControlBindings(lView: LView): unknown[] {
  const bindingIndex = getBindingIndex();
  let bindings = lView[bindingIndex];
  if (bindings === NO_CHANGE) {
    bindings = lView[bindingIndex] = [];
  }
  // Reset the control binding index so that subsequent calls to `nextControlBindingIndex` begin at
  // the start of the returned `bindings` array.
  controlBindingIndex = 0;
  return bindings;
}

/** Returns the next control binding index to use for {@link controlBindingUpdated}. */
function nextControlBindingIndex(): number {
  return controlBindingIndex++;
}

/**
 * Resets the array of values returned by {@link getControlBindings}.
 *
 * This will cause the next update to apply to all available field state properties.
 */
function resetControlBindings(lView: LView): void {
  const bindingIndex = getBindingIndex();
  const bindings = lView[bindingIndex];
  // Do nothing if the bindings array was not initialized.
  if (bindings !== NO_CHANGE) {
    // Truncate the control bindings array, leaving only the first element for the control value
    // since this is the only field state property guaranteed to exists for all fields and will
    // always be first.
    (bindings as unknown[]).length = 1;
  }
}

/**
 * Updates binding if changed, then returns whether it was updated.
 *
 * This is a variant of {@link bindingUpdated} that checks against a specified array of bindings
 * rather than an `LView`. Unlike an `LView` whose bindings have fixed length and are initialized
 * with a sentinel value, we don't know ahead of time how many field state properties will be
 * bound to a control. Consequently, this function will grow the `bindings` array as needed to
 * adjust for a variable number of bindings. This assumes that the number and relative position of
 * these bindings remain unchanged for subsequent updates.
 *
 * The caller must first call {@link resetControlBindings} if the number or relative position of
 * bindings may have changed since the last update.
 *
 * @param bindings The array of bindings.
 * @param value The current value to compare.
 * @returns whether the binding has changed.
 */
function controlBindingUpdated(bindings: unknown[], value: unknown): boolean {
  const index = nextControlBindingIndex();
  ngDevMode && assertLessThanOrEqual(index, bindings.length, 'Control binding index out of range');

  // If index is out of range, this is the first time we're checking the field state property and
  // want to mark it as changed.
  if (index < bindings.length && Object.is(value, bindings[index])) {
    return false;
  }

  bindings[index] = value;
  return true;
}

/**
 * Sets a boolean attribute on an element.
 *
 * @param renderer The `Renderer` instance to use.
 * @param element The element to set the attribute on.
 * @param name The name of the attribute.
 * @param value The boolean value of the attribute. If `true`, the attribute is added. If `false`,
 *   the attribute is removed.
 */
function setBooleanAttribute(
  renderer: Renderer,
  element: HTMLElement,
  name: string,
  value: boolean,
) {
  if (value) {
    renderer.setAttribute(element, name, '');
  } else {
    renderer.removeAttribute(element, name);
  }
}

/**
 * Sets an attribute on an element if the value is not `undefined`.
 *
 * @param renderer The `Renderer` instance to use.
 * @param element The element to set the attribute on.
 * @param name The name of the attribute.
 * @param value The value of the attribute. If `undefined`, the attribute is removed.
 */
function setOptionalAttribute(
  renderer: Renderer,
  element: HTMLElement,
  name: string,
  value?: {toString(): string},
) {
  if (value !== undefined) {
    renderer.setAttribute(element, name, value.toString());
  } else {
    renderer.removeAttribute(element, name);
  }
}
