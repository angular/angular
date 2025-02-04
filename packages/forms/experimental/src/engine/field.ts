import {computed, linkedSignal, signal, Signal, untracked, WritableSignal} from '@angular/core';
import {deepSignal} from './deep_signal';
import {FormField, FormNode} from './types';

const DISABLED_NEVER = computed(() => false);
const VALID_ALWAYS = computed(() => true);

/**
 * Internal implementation of `FormField`.
 *
 * Responsibilities:
 *  - holds a `WritableSignal` that can write to this field
 *  - tracks state associated with this field (touched, dirty)
 *  - holds logic associated with this field & derives final states
 *  - holds child `FormFieldImpl` instances associated with each field
 *
 * Todos:
 *  - how do we clean up child `FormFieldImpl`s that are no longer referenced?
 *  - something around array tracking
 */
export class FormFieldImpl<T> implements FormField<T> {
  constructor(
    readonly value: WritableSignal<T>,
    readonly parent: FormFieldImpl<unknown> | undefined,
  ) {}

  private _touched = signal(false);
  private _dirty = signal(false);
  private _onChild: ((child: FormField<unknown>) => void) | undefined = undefined;
  readonly dirty = this._dirty.asReadonly();
  readonly touched = this._touched.asReadonly();
  readonly disabled: Signal<boolean> = computed(
    () => this.parent?.disabled() || this.locallyDisabled(),
  );
  readonly valid: Signal<boolean> = computed(() => {
    if (!this.locallyValid()) {
      return false;
    }

    // We might still be invalid if any children are.
    for (const [key, child] of this.childMap()) {
      if (child !== undefined && !child.valid()) {
        return false;
      }
    }

    // Otherwise, we are valid.
    return true;
  });

  locallyDisabled = DISABLED_NEVER;
  locallyValid = VALID_ALWAYS;

  // What is childMap?
  //
  // Field of a particular value
  //   based on the value, there might be child fields
  //   the value can change, which affects the set of child fields
  //     things can be added or removed at any time

  childMap = linkedSignal<T, Map<PropertyKey, FormField<unknown> | undefined>>({
    source: () => this.value(),
    computation: (value, previous) => {
      const map = previous?.value ?? new Map<PropertyKey, FormField<unknown>>();

      if (typeof value !== 'object' || !value) {
        return map;
      }

      // Clear all fields when the value switches between primitive, object, and array type.
      if (typeof value !== typeof previous || Array.isArray(value) !== Array.isArray(previous)) {
        map.clear();
      }

      // Delete all the fields that no longer exist.
      for (const key of map.keys()) {
        if (!(value as {}).hasOwnProperty(key)) {
          map.delete(key);
        }
      }

      // Add all keys that are missing fields.
      for (const key of Object.keys(value as any)) {
        if (!map.has(key)) {
          map.set(key, undefined);
        }
      }

      return map;
    },
    equal: () => false,
  });

  getChild(key: PropertyKey): FormField<unknown> {
    const childMap = untracked(this.childMap);
    if (childMap.get(key) === undefined) {
      const childValue = deepSignal(this.value, key as keyof T);
      const child = new FormFieldImpl<unknown>(childValue, this);
      childMap.set(key, child);
      this._onChild?.(child);
    }
    return childMap.get(key)!;
  }

  setOnChild(onChild: (child: FormField<unknown>) => void): void {
    this._onChild = onChild;
    for (const child of untracked(this.childMap).values()) {
      if (child !== undefined) {
        onChild(child);
      }
    }
  }
}

const FORM_NODE_HANDLER: ProxyHandler<FormNode<unknown>> = {
  get(tgt: unknown, p: string | symbol) {
    const field = tgt as FormFieldImpl<unknown>;
    if (p === '$') {
      return field;
    } else {
      return formNode(field.getChild(p));
    }
  },
};

export function formNode<T>(root: FormField<T>): FormNode<T> {
  return new Proxy(root as unknown as FormNode<T>, FORM_NODE_HANDLER as ProxyHandler<FormNode<T>>);
}
