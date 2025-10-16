/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {bindingUpdated} from '../bindings';
import {ɵCONTROL, ɵControl} from '../interfaces/control';
import {ComponentDef} from '../interfaces/definition';
import {InputFlags} from '../interfaces/input_flags';
import {TElementNode, TNode, TNodeFlags, TNodeType} from '../interfaces/node';
import {Renderer} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {isComponentHost} from '../interfaces/type_checks';
import {LView, RENDERER, TView} from '../interfaces/view';
import {getCurrentTNode, getLView, getSelectedTNode, getTView, nextBindingIndex} from '../state';
import {isNameOnlyAttributeMarker} from '../util/attrs_utils';
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
  } else {
    listenToNativeControl(lView, tNode, control);
  }

  control.register();
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
    } else {
      updateNativeControl(tNode, lView, control);
    }
  }
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
      control.state().value.set(newValue);
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
    const value = control.state().value;
    value.set(getNativeControlValue(element, value));
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
    // TODO: https://github.com/orgs/angular/projects/60/views/1?pane=issue&itemId=131860538
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
  // This means that if we set the value to an arbitrary string *before* the corresponding option
  // has been created, the `<select>` will ignore it.
  //
  // This means that we need to know when an `<option>` is created, destroyed, or has its `value`
  // changed so that we can re-sync the `<select>` to the field's value. We implement this using a
  // `MutationObserer` that we create to observe `<option>` changes.
  const element = getNativeByTNode(tNode, lView);
  if (element instanceof HTMLSelectElement) {
    const observer = observeSelectMutations(element, lView, tNode);
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
  lView: LView<{} | null>,
  tNode: TNode,
): MutationObserver {
  const observer = new MutationObserver((mutations) => maybeResyncSelect(mutations, lView, tNode));
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
 * Re-syncs the value of the `<select>` to the value from the `FieldState`
 * if there were relevant mutations to the DOM.
 *
 * @param mutations The list of observed mutations
 * @param lView The `LView` that contains the native form control.
 * @param tNode The `TNode` of the native form control.
 */
function maybeResyncSelect(mutations: MutationRecord[], lView: LView<{} | null>, tNode: TNode) {
  if (mutations.some((m) => isRelevantSelectMutation(m))) {
    // TODO: Can I just pass in the element from the surrounding closure, or do I need to re-get it?
    // It kind of seemed like the rest of the code was avoiding using the closure, so I did it this
    // way.
    const select = getNativeByTNode(tNode, lView) as HTMLSelectElement;
    // TODO(https://github.com/orgs/angular/projects/60/views/1?pane=issue&itemId=131712274)
    // * cache the field directive index or instance for reuse.
    const control = getControlDirective(tNode, lView)!;
    // TODO: https://github.com/orgs/angular/projects/60/views/1?pane=issue&itemId=131711472
    // * check if bindings changed before writing.
    setNativeControlValue(select, control.state().value());
  }
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
  // TODO: https://github.com/orgs/angular/projects/60/views/1?pane=issue&itemId=131711472
  // * check if bindings changed before writing.
  // * cache which inputs exist.
  writeToDirectiveInput(componentDef, component, modelName, state.value());
  maybeWriteToDirectiveInput(componentDef, component, 'errors', state.errors);
  maybeWriteToDirectiveInput(componentDef, component, 'disabled', state.disabled);
  maybeWriteToDirectiveInput(componentDef, component, 'disabledReasons', state.disabledReasons);
  maybeWriteToDirectiveInput(componentDef, component, 'max', state.max);
  maybeWriteToDirectiveInput(componentDef, component, 'maxLength', state.maxLength);
  maybeWriteToDirectiveInput(componentDef, component, 'min', state.min);
  maybeWriteToDirectiveInput(componentDef, component, 'minLength', state.minLength);
  maybeWriteToDirectiveInput(componentDef, component, 'name', state.name);
  maybeWriteToDirectiveInput(componentDef, component, 'pattern', state.pattern);
  maybeWriteToDirectiveInput(componentDef, component, 'readonly', state.readonly);
  maybeWriteToDirectiveInput(componentDef, component, 'required', state.required);
  maybeWriteToDirectiveInput(componentDef, component, 'touched', state.touched);
}

/**
 * Writes the specified value to a directive input if the input exists.
 *
 * @param componentDef The definition of the component that owns the input.
 * @param component The component instance.
 * @param inputName The name of the input to write to.
 * @param source A function that returns the value to write.
 */
function maybeWriteToDirectiveInput(
  componentDef: ComponentDef<unknown>,
  component: unknown,
  inputName: string,
  source: () => unknown,
) {
  if (inputName in componentDef.inputs) {
    writeToDirectiveInput(componentDef, component, inputName, source());
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
  const input = getNativeByTNode(tNode, lView) as NativeControlElement;
  const renderer = lView[RENDERER];
  const state = control.state();

  // TODO: https://github.com/orgs/angular/projects/60/views/1?pane=issue&itemId=131711472
  // * check if bindings changed before writing.
  setNativeControlValue(input, state.value());
  renderer.setAttribute(input, 'name', state.name());
  setBooleanAttribute(renderer, input, 'disabled', state.disabled());
  setBooleanAttribute(renderer, input, 'readonly', state.readonly());
  setBooleanAttribute(renderer, input, 'required', state.required());

  if (tNode.flags & TNodeFlags.isNativeNumericControl) {
    setOptionalAttribute(renderer, input, 'max', state.max());
    setOptionalAttribute(renderer, input, 'min', state.min());
  }

  if (tNode.flags & TNodeFlags.isNativeTextControl) {
    setOptionalAttribute(renderer, input, 'maxLength', state.maxLength());
    setOptionalAttribute(renderer, input, 'minLength', state.minLength());
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
