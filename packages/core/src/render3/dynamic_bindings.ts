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
import {setDirectiveInput, storePropertyBindingMetadata} from './instructions/shared';
import {DirectiveDef} from './interfaces/definition';
import {getLView, getSelectedTNode, getTView, nextBindingIndex} from './state';

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

// This is constant between all the bindings so we can reuse the object.
const INPUT_BINDING_METADATA: Binding[typeof BINDING] = {kind: 'input', requiredVars: 1};

class InputBinding<T> implements Binding {
  readonly target!: DirectiveDef<T>;
  readonly [BINDING] = INPUT_BINDING_METADATA;

  constructor(
    private readonly publicName: string,
    private readonly value: () => unknown,
  ) {}

  update(): void {
    const lView = getLView();
    const bindingIndex = nextBindingIndex();
    const value = this.value();
    if (bindingUpdated(lView, bindingIndex, value)) {
      const tView = getTView();
      const tNode = getSelectedTNode();

      if (!this.target && ngDevMode) {
        throw new RuntimeError(
          RuntimeErrorCode.NO_BINDING_TARGET,
          `Input binding to property "${this.publicName}" does not have a target.`,
        );
      }

      const hasSet = setDirectiveInput(tNode, tView, lView, this.target, this.publicName, value);

      if (ngDevMode) {
        if (!hasSet) {
          throw new RuntimeError(
            RuntimeErrorCode.NO_BINDING_TARGET,
            `${this.target.type.name} does not have an input with a public name of "${this.publicName}".`,
          );
        }
        storePropertyBindingMetadata(tView.data, tNode, this.publicName, bindingIndex);
      }
    }
  }
}

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
export function inputBinding<T>(publicName: string, value: () => unknown): Binding {
  return new InputBinding<T>(publicName, value);
}
