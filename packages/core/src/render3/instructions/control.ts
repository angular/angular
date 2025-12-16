/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {performanceMarkFeature} from '../../util/performance';
import {getClosureSafeProperty} from '../../util/property';
import {assertFirstCreatePass} from '../assert';
import {bindingUpdated} from '../bindings';
import {ɵCONTROL, ɵControl, ɵFieldState} from '../interfaces/control';
import {DirectiveDef} from '../interfaces/definition';
import {TElementNode, TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {Renderer} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {isComponentHost} from '../interfaces/type_checks';
import {LView, RENDERER, TView} from '../interfaces/view';
import {Signal} from '../reactivity/api';
import {untracked} from '../reactivity/untracked';
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
import {debugStringifyTypeForError} from '../util/stringify_utils';
import {getNativeByTNode, storeCleanupWithContext} from '../util/view_utils';
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

  if (tView.firstCreatePass) {
    initializeControlFirstCreatePass(tView, tNode, lView);
  }

  const control = getControlDirective(tNode, lView);
  if (!control) {
    return;
  }

  performanceMarkFeature('NgSignalForms');

  if (tNode.flags & TNodeFlags.isFormValueControl) {
    listenToCustomControl(lView, tNode, control, 'value');
  } else if (tNode.flags & TNodeFlags.isFormCheckboxControl) {
    listenToCustomControl(lView, tNode, control, 'checked');
  } else if (tNode.flags & TNodeFlags.isInteropControl) {
    listenToInteropControl(control);
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
export function ɵɵcontrol<T>(value: T, name: string, sanitizer?: SanitizerFn | null): void {
  const lView = getLView();
  const tNode = getSelectedTNode();
  const bindingIndex = nextBindingIndex();

  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    setPropertyAndInputs(tNode, lView, name, value, lView[RENDERER], sanitizer);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, name, bindingIndex);
  }

  updateControl(lView, tNode);
}

/**
 * Calls {@link updateControl} with the current `LView` and selected `TNode`.
 *
 * NOTE: This instruction exists solely to accommodate tree-shakeable, dynamic control bindings.
 * It's intended to be referenced exclusively by the Signal Forms `Field` directive and should not
 * be referenced by any other means.
 */
export function ɵcontrolUpdate(): void {
  const lView = getLView();
  const tNode = getSelectedTNode();
  updateControl(lView, tNode);
}

/**
 * Updates the form control properties of a `field` bound form control.
 *
 * Does nothing if the current node is not a `field` bound form control.
 *
 * @param lView The `LView` that contains the control.
 * @param tNode The `TNode` of the control.
 */
function updateControl<T>(lView: LView, tNode: TNode): void {
  const control = getControlDirective(tNode, lView);
  if (control) {
    updateControlClasses(lView, tNode, control);

    if (tNode.flags & TNodeFlags.isFormValueControl) {
      updateCustomControl(tNode, lView, control, 'value');
    } else if (tNode.flags & TNodeFlags.isFormCheckboxControl) {
      updateCustomControl(tNode, lView, control, 'checked');
    } else if (tNode.flags & TNodeFlags.isInteropControl) {
      updateInteropControl(tNode, lView, control);
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

function initializeControlFirstCreatePass<T>(tView: TView, tNode: TNode, lView: LView): void {
  ngDevMode && assertFirstCreatePass(tView);

  const directiveIndices = tNode.inputs?.['field'] ?? tNode.inputs?.['formField'];
  if (!directiveIndices) {
    return; // There are no matching inputs for the `[field]` property binding.
  }

  // If component has a `field` input, we assume that it will handle binding the field to the
  // appropriate native/custom control in its template, so we do not attempt to bind any inputs
  // on this component.
  if (
    isComponentHost(tNode) &&
    directiveIndices.includes(tNode.directiveStart + tNode.componentOffset)
  ) {
    return;
  }

  // Check if the `Field` directive is present.
  const controlIndex = directiveIndices.find((index) => ɵCONTROL in lView[index]);
  if (controlIndex === undefined) {
    return;
  }

  // Cache the index of the `Field` directive.
  tNode.fieldIndex = controlIndex;

  // First check if the `Field` directive is bound to an interop control (e.g. a Reactive Forms
  // control using `ControlValueAccessor`). If not, look for a custom control.
  const foundControl =
    isInteropControlFirstCreatePass(tNode, lView) || isCustomControlFirstCreatePass(tView, tNode);

  // We check for a native control, even if we found a custom or interop one, to determine whether
  // we can set native properties as a fallback on the custom or interop control.
  if (isNativeControlFirstCreatePass(tNode) || foundControl) {
    return;
  }

  const host = describeElement(tView, tNode);
  throw new RuntimeError(
    RuntimeErrorCode.INVALID_FIELD_DIRECTIVE_HOST,
    `${host} is an invalid [field] directive host. The host must be a native form control ` +
      `(such as <input>', '<select>', or '<textarea>') or a custom form control with a 'value' or ` +
      `'checked' model.`,
  );
}

/**
 * Returns a string description of element that the `TNode` represents.
 *
 * @param tView The `TView` of the current view.
 * @param tNode The `TNode` to describe.
 * @returns A string description of the element.
 */
function describeElement(tView: TView, tNode: TNode): string {
  if (ngDevMode && isComponentHost(tNode)) {
    const componentIndex = tNode.directiveStart + tNode.componentOffset;
    const componentDef = tView.data[componentIndex] as DirectiveDef<unknown>;
    return `Component ${debugStringifyTypeForError(componentDef.type)}`;
  }
  return `<${tNode.value}>`;
}

/**
 * Determines whether an interop control (with a `value` or `checked` model input) is present
 * on the current `TNode` during the first creation pass.
 *
 * If an interop control is found, the function sets the appropriate `TNodeFlags`.
 *
 * @param tNode The `TNode` to inspect for an interop control.
 * @param lView The `LView` of the current view.
 * @returns `true` if an interop control is found, `false` otherwise.
 */
function isInteropControlFirstCreatePass(tNode: TNode, lView: LView): boolean {
  const control = lView[tNode.fieldIndex] as ɵControl<unknown>;
  if (control.ɵinteropControl) {
    tNode.flags |= TNodeFlags.isInteropControl;
    return true;
  }
  return false;
}

/**
 * Determines whether a custom form control (with a `value` or `checked` model input) is present
 * on the current `TNode` during the first creation pass.
 *
 * If a custom control is found, the function sets the appropriate `TNodeFlags` and stores its
 * index.
 *
 * @param tView The `TView` of the current view.
 * @param tNode The `TNode` to inspect for a custom control.
 * @returns `true` if a custom control is found, `false` otherwise.
 */
function isCustomControlFirstCreatePass(tView: TView, tNode: TNode): boolean {
  for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
    const directiveDef = tView.data[i] as DirectiveDef<unknown>;
    if (hasModelInput(directiveDef, 'value')) {
      tNode.flags |= TNodeFlags.isFormValueControl;
      tNode.customControlIndex = i;
      return true;
    }
    if (hasModelInput(directiveDef, 'checked')) {
      tNode.flags |= TNodeFlags.isFormCheckboxControl;
      tNode.customControlIndex = i;
      return true;
    }
  }
  return false;
}

/**
 * Determines whether the current `TNode` represents a native form control (e.g., `<input>`,
 * `<select>`, `<textarea>`) during the first creation pass.
 *
 * If a native control is found, the function sets the appropriate `TNodeFlags` to indicate
 * its type (e.g., numeric, text).
 *
 * @param tNode The `TNode` to inspect for a native control.
 * @returns `true` if the `TNode` is a native control, `false` otherwise.
 */
function isNativeControlFirstCreatePass(tNode: TNode): boolean {
  if (!isNativeControl(tNode)) {
    return false;
  }
  tNode.flags |= TNodeFlags.isNativeControl;
  if (isNumericInput(tNode)) {
    tNode.flags |= TNodeFlags.isNativeNumericControl;
  }
  if (isTextControl(tNode)) {
    tNode.flags |= TNodeFlags.isNativeTextControl;
  }
  return true;
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
function getControlDirective<T>(tNode: TNode, lView: LView): ɵControl<T> | null {
  const index = tNode.fieldIndex;
  return index === -1 ? null : lView[index];
}

/**
 * Returns whether the specified `directiveDef` has a model-like input named `name`.
 *
 * A model-like input is an input-output pair where the input is named `name` and the output is
 * named `name + 'Change'`.
 */
function hasModelInput(directiveDef: DirectiveDef<unknown>, name: string): boolean {
  return hasInput(directiveDef, name) && hasOutput(directiveDef, name + 'Change');
}

/** Returns whether the specified `directiveDef` has an input named `name`.*/
function hasInput(directiveDef: DirectiveDef<unknown>, name: string): boolean {
  return name in directiveDef.inputs;
}

/** Returns whether the specified `directiveDef` has an output named `name`. */
function hasOutput(directiveDef: DirectiveDef<unknown>, name: string): boolean {
  return name in directiveDef.outputs;
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
  const tView = getTView();
  const directiveIndex = tNode.customControlIndex;
  const outputName = modelName + 'Change';
  listenToOutput(
    tNode,
    lView,
    directiveIndex,
    outputName,
    outputName,
    wrapListener(tNode, lView, (value: unknown) => control.state().setControlValue(value)),
  );

  const directiveDef = tView.data[directiveIndex] as DirectiveDef<unknown>;
  const touchedOutputName = 'touchedChange';
  if (hasOutput(directiveDef, touchedOutputName)) {
    listenToOutput(
      tNode,
      lView,
      directiveIndex,
      touchedOutputName,
      touchedOutputName,
      wrapListener(tNode, lView, () => control.state().markAsTouched()),
    );
  }
}

/**
 * Adds event listeners to an interoperable form control to notify the `field` of changes.
 *
 * @param control The `ɵControl` directive instance.
 */
function listenToInteropControl(control: ɵControl<unknown>): void {
  const interopControl = control.ɵinteropControl!;
  interopControl.registerOnChange((value: unknown) => control.state().setControlValue(value));
  interopControl.registerOnTouched(() => control.state().markAsTouched());
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
  const element = getNativeByTNode(tNode, lView) as NativeControlElement;

  const inputListener = () => {
    const state = control.state();
    state.setControlValue(getNativeControlValue(element, state.value));
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

  // The native `<select>` tracks its `value` by keeping track of the selected `<option>`.
  // Therefore if we set the value to an arbitrary string *before* the corresponding option has been
  // created, the `<select>` will ignore it.
  //
  // This means that we need to know when an `<option>` is created, destroyed, or has its `value`
  // changed so that we can re-sync the `<select>` to the field state's value. We implement this
  // using a `MutationObserver` that we create to observe `<option>` changes.
  if (
    tNode.type === TNodeType.Element &&
    tNode.value === 'select' &&
    typeof MutationObserver === 'function'
  ) {
    const observer = observeSelectMutations(
      element as HTMLSelectElement,
      control as ɵControl<string>,
    );

    storeCleanupWithContext(tView, lView, observer, observer.disconnect);
  }
}

/**
 * Creates a `MutationObserver` to observe changes to the available `<option>`s for this select.
 *
 * @param select The native `<select>` element to observe.
 * @param lView The `LView` that contains the native form control.
 * @param tNode The `TNode` of the native form control.
 * @returns The newly created `MutationObserver`.
 */
function observeSelectMutations(
  select: HTMLSelectElement,
  controlDirective: ɵControl<string>,
): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => isRelevantSelectMutation(m))) {
      select.value = controlDirective.state().value();
    }
  });
  observer.observe(select, {
    attributes: true,
    attributeFilter: ['value'],
    // We watch the character data, because an `<option>` with no explicit `value` property set uses
    // its text content as its value.
    // (See https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement/value)
    characterData: true,
    childList: true,
    subtree: true,
  });
  return observer;
}

/**
 * Checks if a given mutation record is relevant for resyncing a <select>.
 * In general its relevant if:
 * - Non comment content of the select changed
 * - The value attribute of an option changed.
 */
function isRelevantSelectMutation(mutation: MutationRecord) {
  // Consider changes that may add / remove options, or change their text content.
  if (mutation.type === 'childList' || mutation.type === 'characterData') {
    // If the target element is a comment its not relevant.
    if (mutation.target instanceof Comment) {
      return false;
    }
    // Otherwise if any non-comment nodes were added / removed it is relevant.
    for (const node of mutation.addedNodes) {
      if (!(node instanceof Comment)) {
        return true;
      }
    }
    for (const node of mutation.removedNodes) {
      if (!(node instanceof Comment)) {
        return true;
      }
    }
    // Otherwise its not relevant.
    return false;
  }
  // If the value attribute of an option changed, its relevant.
  if (mutation.type === 'attributes' && mutation.target instanceof HTMLOptionElement) {
    return true;
  }
  // Everything else is not relevant.
  return false;
}

/**
 * Updates the configured classes for the control.
 *
 * @param lView The `LView` that contains the control.
 * @param tNode The `TNode` of the control.
 * @param control The `ɵControl` directive instance.
 */
function updateControlClasses(lView: LView, tNode: TNode, control: ɵControl<unknown>) {
  if (control.classes) {
    const bindings = getControlBindings(lView);
    bindings.classes ??= {};
    const state = control.state();
    const renderer = lView[RENDERER];
    const element = getNativeByTNode(tNode, lView) as HTMLElement;

    for (const [className, enabled] of control.classes) {
      const isEnabled = enabled();
      if (controlClassBindingUpdated(bindings.classes, className, isEnabled)) {
        if (isEnabled) {
          renderer.addClass(element, className);
        } else {
          renderer.removeClass(element, className);
        }
      }
    }
  }
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
  const directiveIndex = tNode.customControlIndex;
  const directive = lView[directiveIndex];
  const directiveDef = tView.data[directiveIndex] as DirectiveDef<{}>;
  const state = control.state();
  const bindings = getControlBindings(lView);

  // Bind custom form control model ('value' or 'checked').
  const controlValue = state.controlValue();
  if (controlBindingUpdated(bindings, CONTROL_VALUE, controlValue)) {
    writeToDirectiveInput(directiveDef, directive, modelName, controlValue);
  }

  const isNative = (tNode.flags & TNodeFlags.isNativeControl) !== 0;
  const element = isNative ? (getNativeByTNode(tNode, lView) as NativeControlElement) : null;
  const renderer = lView[RENDERER];

  // Bind remaining field state properties.
  for (const key of CONTROL_BINDING_KEYS) {
    const value = state[key]?.();
    if (controlBindingUpdated(bindings, key, value)) {
      const inputName = CONTROL_BINDING_NAMES[key];
      updateDirectiveInputs(tNode, lView, inputName, value);

      // If the host node is a native control, we can bind field state properties to native
      // properties for any that weren't defined as inputs on the custom control.
      if (isNative && !(inputName in directiveDef.inputs)) {
        updateNativeProperty(tNode, renderer, element!, key, value, inputName);
      }
    }
  }
}

/**
 * Updates the properties of an interop form control with the latest state from the `field`.
 *
 * @param tNode The `TNode` of the form control.
 * @param lView The `LView` that contains the native form control.
 * @param control The `ɵControl` directive instance.
 */
function updateInteropControl(tNode: TNode, lView: LView, control: ɵControl<unknown>): void {
  const interopControl = control.ɵinteropControl!;
  const bindings = getControlBindings(lView);
  const state = control.state();

  const isNative = (tNode.flags & TNodeFlags.isNativeControl) !== 0;
  const element = isNative ? (getNativeByTNode(tNode, lView) as NativeControlElement) : null;
  const renderer = lView[RENDERER];

  const value = state.value();
  if (controlBindingUpdated(bindings, CONTROL_VALUE, value)) {
    // We don't know if the interop control has underlying signals, so we must use `untracked` to
    // prevent writing to a signal in a reactive context.
    untracked(() => interopControl.writeValue(value));
  }

  for (const key of CONTROL_BINDING_KEYS) {
    const value = state[key]?.();
    if (controlBindingUpdated(bindings, key, value)) {
      const inputName = CONTROL_BINDING_NAMES[key];
      const didUpdateInput = updateDirectiveInputs(tNode, lView, inputName, value);

      // We never fallback to the native property for `disabled` since it's handled directly by
      // `ControlValueAccessor`.
      if (key === DISABLED) {
        if (interopControl.setDisabledState) {
          untracked(() => interopControl.setDisabledState!(value as boolean));
        }
      } else if (isNative && !didUpdateInput) {
        // If the host node is a native control, we can bind field state properties to native
        // properties for any that aren't managed by `ControlValueAccessor`.
        updateNativeProperty(tNode, renderer, element!, key, value, inputName);
      }
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

  const controlValue = state.controlValue();
  if (controlBindingUpdated(bindings, CONTROL_VALUE, controlValue)) {
    setNativeControlValue(element, controlValue);
  }

  for (const key of CONTROL_BINDING_KEYS) {
    const value = state[key]?.();
    if (controlBindingUpdated(bindings, key, value)) {
      const inputName = CONTROL_BINDING_NAMES[key];
      updateNativeProperty(tNode, renderer, element, key, value, inputName);
      updateDirectiveInputs(tNode, lView, inputName, value);
    }
  }
}

/**
 * Updates all directive inputs with the given name on the given node.
 *
 * @param tNode The node on which the directives are hosted.
 * @param lView The current LView.
 * @param inputName The public name of the input to update.
 * @param value The value to write to the input.
 */
function updateDirectiveInputs(
  tNode: TNode,
  lView: LView,
  inputName: string,
  value: unknown,
): boolean {
  const directiveIndices = tNode.inputs?.[inputName];
  if (directiveIndices) {
    const tView = getTView();
    for (const index of directiveIndices) {
      const directiveDef = tView.data[index] as DirectiveDef<unknown>;
      const directive = lView[index];
      writeToDirectiveInput(directiveDef, directive, inputName, value);
    }
    return true;
  }
  return false;
}

/**
 * Updates the native DOM property on the given node.
 *
 * @param tNode The node corresponding to the native control.
 * @param renderer The renderer to use for DOM updates.
 * @param element The native control element.
 * @param key The control binding key (identifies the property type, e.g. disabled, required).
 * @param value The new value for the property.
 * @param name The DOM attribute/property name.
 */
function updateNativeProperty(
  tNode: TNode,
  renderer: Renderer,
  element: NativeControlElement,
  key: ControlBindingKeys,
  value: any,
  name: string,
) {
  switch (key) {
    case NAME:
      renderer.setAttribute(element, name, value);
      break;
    case DISABLED:
    case READONLY:
    case REQUIRED:
      setBooleanAttribute(renderer, element, name, value);
      break;
    case MAX:
    case MIN:
      if (tNode.flags & TNodeFlags.isNativeNumericControl) {
        setOptionalAttribute(renderer, element, name, value);
      }
      break;
    case MAX_LENGTH:
    case MIN_LENGTH:
      if (tNode.flags & TNodeFlags.isNativeTextControl) {
        setOptionalAttribute(renderer, element, name, value);
      }
      break;
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
        setNativeNumberControlValue(element, value);
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
        setNativeNumberControlValue(element, value);
        return;
      }
  }

  // Default to setting the value as a string.
  element.value = value as string;
}

/** Writes a value to a native <input type="number">. */
function setNativeNumberControlValue(element: HTMLInputElement, value: number) {
  // Writing `NaN` causes a warning in the console, so we instead write `''`.
  // This allows the user to safely use `NaN` as a number value that means "clear the input".
  if (isNaN(value)) {
    element.value = '';
  } else {
    element.valueAsNumber = value;
  }
}

/** A property-renaming safe reference to a property named 'disabled'. */
const DISABLED = /* @__PURE__ */ getClosureSafeProperty({
  disabled: getClosureSafeProperty,
}) as 'disabled';

/** A property-renaming safe reference to a property named 'max'. */
const MAX = /* @__PURE__ */ getClosureSafeProperty({max: getClosureSafeProperty}) as 'max';

/** A property-renaming safe reference to a property named 'maxLength'. */
const MAX_LENGTH = /* @__PURE__ */ getClosureSafeProperty({
  maxLength: getClosureSafeProperty,
}) as 'maxLength';

/** A property-renaming safe reference to a property named 'min'. */
const MIN = /* @__PURE__ */ getClosureSafeProperty({min: getClosureSafeProperty}) as 'min';

/** A property-renaming safe reference to a property named 'minLength'. */
const MIN_LENGTH = /* @__PURE__ */ getClosureSafeProperty({
  minLength: getClosureSafeProperty,
}) as 'minLength';

/** A property-renaming safe reference to a property named 'name'. */
const NAME = /* @__PURE__ */ getClosureSafeProperty({name: getClosureSafeProperty}) as 'name';

/** A property-renaming safe reference to a property named 'readonly'. */
const READONLY = /* @__PURE__ */ getClosureSafeProperty({
  readonly: getClosureSafeProperty,
}) as 'readonly';

/** A property-renaming safe reference to a property named 'required'. */
const REQUIRED = /* @__PURE__ */ getClosureSafeProperty({
  required: getClosureSafeProperty,
}) as 'required';

/** A property-renaming safe reference to a property named 'controlValue'. */
const CONTROL_VALUE = /* @__PURE__ */ getClosureSafeProperty({
  controlValue: getClosureSafeProperty,
}) as 'controlValue';

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
 * These are the properties of `ɵFieldState` that are signals or undefined, except for `value`
 * which is not bound directly, but updated indirectly through the `controlValue` binding.
 */
type ControlBindingKeys = Exclude<
  KeysWithValueType<ɵFieldState<unknown>, Signal<any> | undefined>,
  'value'
>;

/**
 * A map of control binding keys to their values.
 * Used to store the last seen values of bound control properties to check for changes.
 */
type ControlBindings = {
  [K in ControlBindingKeys]?: unknown;
} & {
  classes: {[className: string]: boolean};
};

/**
 * A map of field state properties to control binding name.
 *
 * This excludes `controlValue` whose corresponding control binding name differs between control
 * types.
 *
 * The control binding name can be used for inputs or attributes (since DOM attributes are case
 * insensitive).
 */
const CONTROL_BINDING_NAMES = {
  disabled: 'disabled',
  disabledReasons: 'disabledReasons',
  dirty: 'dirty',
  errors: 'errors',
  hidden: 'hidden',
  invalid: 'invalid',
  max: 'max',
  maxLength: 'maxLength',
  min: 'min',
  minLength: 'minLength',
  name: 'name',
  pattern: 'pattern',
  pending: 'pending',
  readonly: 'readonly',
  required: 'required',
  touched: 'touched',
} as const satisfies Record<Exclude<ControlBindingKeys, 'controlValue'>, string>;

/** The keys of {@link CONTROL_BINDING_NAMES} */
const CONTROL_BINDING_KEYS = /* @__PURE__ */ (() => Object.keys(CONTROL_BINDING_NAMES))() as Array<
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
  key: Exclude<ControlBindingKeys, 'classes'>,
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
 * Updates a control class binding if changed, then returns whether it was updated.
 *
 * @param bindings The control class bindings to check.
 * @param className The class name to check.
 * @param value The new value to check against.
 * @returns `true` if the class binding has changed.
 */
function controlClassBindingUpdated(
  bindings: {[className: string]: boolean},
  className: string,
  value: boolean,
): boolean {
  const oldValue = bindings[className];
  if (Object.is(oldValue, value)) {
    return false;
  }
  bindings[className] = value;
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
