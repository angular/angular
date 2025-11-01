/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {getClosureSafeProperty} from '../../util/property';
import {bindingUpdated} from '../bindings';
import {ɵCONTROL, ɵControl, ɵFieldState} from '../interfaces/control';
import {ComponentDef} from '../interfaces/definition';
import {InputFlags} from '../interfaces/input_flags';
import {TElementNode, TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {Renderer} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {isComponentHost} from '../interfaces/type_checks';
import {LView, RENDERER, TView} from '../interfaces/view';
import {Signal} from '../reactivity/api';
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

  maybeUpdateInput(componentDef, component, bindings, state, VALUE, modelName);

  for (const key of CONTROL_BINDING_KEYS) {
    const inputName = CONTROL_BINDING_NAMES[key];
    maybeUpdateInput(componentDef, component, bindings, state, key, inputName);
  }
}

/**
 * Binds a value source, if defined, to an input, if it exists.
 *
 * @param componentDef The component definition used to check for the input.
 * @param component The component instance to update.
 * @param oldValue The previously bound value to check for changes.
 * @param inputName The name of the input to update.
 * @param source The source of the value to bind.
 */
function maybeUpdateInput(
  componentDef: ComponentDef<unknown>,
  component: unknown,
  bindings: ControlBindings,
  state: ɵFieldState<unknown>,
  key: ControlBindingKeys,
  inputName: string,
): void {
  if (inputName in componentDef.inputs) {
    const value = state[key]?.();
    if (controlBindingUpdated(bindings, key, value)) {
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
  if (controlBindingUpdated(bindings, VALUE, value)) {
    setNativeControlValue(element, value);
  }

  const name = state.name();
  if (controlBindingUpdated(bindings, NAME, name)) {
    renderer.setAttribute(element, 'name', name);
  }

  updateBooleanAttribute(renderer, element, bindings, state, DISABLED);
  updateBooleanAttribute(renderer, element, bindings, state, READONLY);
  updateBooleanAttribute(renderer, element, bindings, state, REQUIRED);

  if (tNode.flags & TNodeFlags.isNativeNumericControl) {
    updateOptionalAttribute(renderer, element, bindings, state, MAX);
    updateOptionalAttribute(renderer, element, bindings, state, MIN);
  }

  if (tNode.flags & TNodeFlags.isNativeTextControl) {
    updateOptionalAttribute(renderer, element, bindings, state, MAX_LENGTH);
    updateOptionalAttribute(renderer, element, bindings, state, MIN_LENGTH);
  }
}

/**
 * Binds a boolean property to a DOM attribute.
 *
 * @param renderer The renderer used to update the DOM.
 * @param element The element to update.
 * @param bindings The control bindings to check for changes.
 * @param state The control's field state.
 * @param key The key of the boolean property in the `ɵFieldState`.
 */
function updateBooleanAttribute(
  renderer: Renderer,
  element: HTMLElement,
  bindings: ControlBindings,
  state: ɵFieldState<unknown>,
  key: typeof DISABLED | typeof READONLY | typeof REQUIRED,
) {
  const value = state[key]();
  if (controlBindingUpdated(bindings, key, value)) {
    const name = CONTROL_BINDING_NAMES[key];
    setBooleanAttribute(renderer, element, name, value);
  }
}

/**
 * Binds a value source, if it exists, to an optional DOM attribute.
 *
 * An optional DOM attribute will be added, if defined, or removed, if undefined.
 *
 * @param renderer The renderer used to update the DOM.
 * @param element The element to update.
 * @param bindings The control bindings to check for changes.
 * @param state The control's field state.
 * @param key The key of the optional property in the `ɵFieldState`.
 */
function updateOptionalAttribute(
  renderer: Renderer,
  element: HTMLElement,
  bindings: ControlBindings,
  state: ɵFieldState<unknown>,
  key: typeof MAX | typeof MAX_LENGTH | typeof MIN | typeof MIN_LENGTH,
): void {
  const value = state[key]?.();
  if (controlBindingUpdated(bindings, key, value)) {
    const name = CONTROL_BINDING_NAMES[key];
    setOptionalAttribute(renderer, element, name, value);
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
 * Returns whether `tNode` represents a text-based input.
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

/** A property-renaming safe reference to a property named 'disabled'. */
const DISABLED = getClosureSafeProperty({
  disabled: getClosureSafeProperty,
}) as 'disabled';

/** A property-renaming safe reference to a property named 'max'. */
const MAX = getClosureSafeProperty({max: getClosureSafeProperty}) as 'max';

/** A property-renaming safe reference to a property named 'maxLength'. */
const MAX_LENGTH = getClosureSafeProperty({
  maxLength: getClosureSafeProperty,
}) as 'maxLength';

/** A property-renaming safe reference to a property named 'min'. */
const MIN = getClosureSafeProperty({min: getClosureSafeProperty}) as 'min';

/** A property-renaming safe reference to a property named 'minLength'. */
const MIN_LENGTH = getClosureSafeProperty({
  minLength: getClosureSafeProperty,
}) as 'minLength';

/** A property-renaming safe reference to a property named 'name'. */
const NAME = getClosureSafeProperty({name: getClosureSafeProperty}) as 'name';

/** A property-renaming safe reference to a property named 'readonly'. */
const READONLY = getClosureSafeProperty({
  readonly: getClosureSafeProperty,
}) as 'readonly';

/** A property-renaming safe reference to a property named 'required'. */
const REQUIRED = getClosureSafeProperty({
  required: getClosureSafeProperty,
}) as 'required';

/** A property-renaming safe reference to a property named 'value'. */
const VALUE = getClosureSafeProperty({value: getClosureSafeProperty}) as 'value';

/**
 * A utility type that extracts the keys from `T` where the value type matches `TCondition`.
 * @template T The object type to extract keys from.
 * @template TCondition The condition to match the value type against.
 */
type KeysWithValueType<T, TCondition> = keyof {
  [K in keyof T as T[K] extends TCondition ? K : never]: never;
};

/**
 * The keys of `ɵFieldState` that can be bound to a control.
 * These are the properties of `ɵFieldState` that are signals or undefined.
 */
type ControlBindingKeys = KeysWithValueType<ɵFieldState<unknown>, Signal<any> | undefined>;

/**
 * A map of control binding keys to their values.
 * Used to store the last seen values of bound control properties to check for changes.
 */
type ControlBindings = {
  [K in ControlBindingKeys]?: unknown;
};

/**
 * A map of field state properties to control binding name.
 *
 * The control binding name can be used for for inputs or attributes (since DOM attributes are case
 * insensitive).
 */
const CONTROL_BINDING_NAMES = {
  disabled: 'disabled',
  disabledReasons: 'disabledReasons',
  errors: 'errors',
  invalid: 'invalid',
  max: 'max',
  maxLength: 'maxLength',
  min: 'min',
  minLength: 'minLength',
  name: 'name',
  pattern: 'pattern',
  readonly: 'readonly',
  required: 'required',
  touched: 'touched',
} as const;

/** The keys of {@link CONTROL_BINDING_NAMES} */
const CONTROL_BINDING_KEYS = (() => Object.keys(CONTROL_BINDING_NAMES))() as Array<
  keyof typeof CONTROL_BINDING_NAMES
>;

/**
 * Returns the values of field state properties bound to a control.
 */
function getControlBindings(lView: LView): ControlBindings {
  const bindingIndex = getBindingIndex();
  let bindings = lView[bindingIndex];
  if (bindings === NO_CHANGE) {
    bindings = lView[bindingIndex] = {};
  }
  return bindings;
}

/**
 * Updates a control binding if changed, then returns whether it was updated.
 *
 * @param bindings The control bindings to check.
 * @param key The key of the binding to check.
 * @param value The new value to check against.
 * @returns `true` if the binding has changed.
 */
function controlBindingUpdated(
  bindings: ControlBindings,
  key: ControlBindingKeys,
  value: unknown,
): boolean {
  const oldValue = bindings[key];
  if (Object.is(oldValue, value)) {
    return false;
  }
  bindings[key] = value;
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
