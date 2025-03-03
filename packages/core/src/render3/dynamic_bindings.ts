/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {Type} from '../interface/type';
import {bindingUpdated} from './bindings';
import {listenToDirectiveOutput, wrapListener} from './instructions/listener';
import {setDirectiveInput, storePropertyBindingMetadata} from './instructions/shared';
import {DirectiveDef} from './interfaces/definition';
import {CONTEXT} from './interfaces/view';
import {getCurrentTNode, getLView, getSelectedTNode, getTView, nextBindingIndex} from './state';
import {stringifyForError} from './util/stringify_utils';

/** Symbol used to store and retrieve metadata about a binding. */
export const BINDING = /* @__PURE__ */ Symbol('BINDING');

/**
 * A dynamically-defined binding targeting.
 * For example, `inputBinding('value', () => 123)` creates an input binding.
 */
export interface Binding {
  readonly [BINDING]: {
    readonly kind: string;
    readonly requiredVars: number;
  };

  /** Target to which to apply the binding. */
  readonly target?: unknown;

  /** Callback that will be invoked during creation. */
  create?(): void;

  /** Callback that will be invoked during updates. */
  update?(): void;
}

/**
 * Represents a dynamically-created directive with bindings targeting it specifically.
 */
export interface DirectiveWithBindings<T> {
  /** Directive type that should be created. */
  type: Type<T>;

  /** Bindings that should be applied to the specific directive. */
  bindings: Binding[];
}

// These are constant between all the bindings so we can reuse the objects.
const INPUT_BINDING_METADATA: Binding[typeof BINDING] = {kind: 'input', requiredVars: 1};
const OUTPUT_BINDING_METADATA: Binding[typeof BINDING] = {kind: 'output', requiredVars: 0};

/**
 * Creates an input binding.
 * @param publicName Public name of the input to bind to.
 * @param value Callback that returns the current value for the binding. Can be either a signal or
 *   a plain getter function.
 *
 * ### Usage Example
 * In this example we create an instance of the `MyButton` component and bind the value of
 * the `isDisabled` signal to its `disabled` input.
 *
 * ```
 * const isDisabled = signal(false);
 *
 * createComponent(MyButton, {
 *   bindings: [inputBinding('disabled', isDisabled)]
 * });
 * ```
 */
export function inputBinding(publicName: string, value: () => unknown): Binding {
  // Note: ideally we would use a class here, but it seems like they
  // don't get tree shaken when constructed by a function like this.
  const binding: Binding = {
    [BINDING]: INPUT_BINDING_METADATA,
    target: null,
    update: () => {
      const target = binding.target as DirectiveDef<unknown>;
      const lView = getLView();
      const bindingIndex = nextBindingIndex();
      const resolvedValue = value();
      if (bindingUpdated(lView, bindingIndex, resolvedValue)) {
        const tView = getTView();
        const tNode = getSelectedTNode();

        if (!target && ngDevMode) {
          throw new RuntimeError(
            RuntimeErrorCode.NO_BINDING_TARGET,
            `Input binding to property "${publicName}" does not have a target.`,
          );
        }

        const hasSet = setDirectiveInput(tNode, tView, lView, target, publicName, resolvedValue);

        if (ngDevMode) {
          if (!hasSet) {
            throw new RuntimeError(
              RuntimeErrorCode.NO_BINDING_TARGET,
              `${stringifyForError(target.type)} does not have an input with a public name of "${publicName}".`,
            );
          }
          storePropertyBindingMetadata(tView.data, tNode, publicName, bindingIndex);
        }
      }
    },
  };

  return binding;
}

/**
 * Creates an output binding.
 * @param eventName Public name of the output to listen to.
 * @param listener Function to be called when the output emits.
 *
 * ### Usage example
 * In this example we create an instance of the `MyCheckbox` component and listen
 * to its `onChange` event.
 *
 * ```
 * interface CheckboxChange {
 *   value: string;
 * }
 *
 * createComponent(MyCheckbox, {
 *   bindings: [
 *    outputBinding<CheckboxChange>('onChange', event => console.log(event.value))
 *   ],
 * });
 * ```
 */
export function outputBinding<T>(eventName: string, listener: (event: T) => unknown): Binding {
  // Note: ideally we would use a class here, but it seems like they
  // don't get tree shaken when constructed by a function like this.
  const binding: Binding = {
    [BINDING]: OUTPUT_BINDING_METADATA,
    target: null,
    create: () => {
      const target = binding.target as DirectiveDef<unknown>;

      if (!target && ngDevMode) {
        throw new RuntimeError(
          RuntimeErrorCode.NO_BINDING_TARGET,
          `Output binding to "${eventName}" does not have a target.`,
        );
      }

      const lView = getLView<{} | null>();
      const tView = getTView();
      const tNode = getCurrentTNode()!;
      const context = lView[CONTEXT];
      const wrappedListener = wrapListener(tNode, lView, context, listener);
      const hasBound = listenToDirectiveOutput(
        tNode,
        tView,
        lView,
        target,
        eventName,
        wrappedListener,
      );

      if (!hasBound && ngDevMode) {
        throw new RuntimeError(
          RuntimeErrorCode.INVALID_BINDING_TARGET,
          `${stringifyForError(target.type)} does not have an output with a public name of "${eventName}".`,
        );
      }
    },
  };

  return binding;
}
