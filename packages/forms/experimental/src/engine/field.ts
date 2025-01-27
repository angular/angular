import {computed, signal, Signal, untracked, WritableSignal} from '@angular/core';
import {FormField, FormNode} from './types';
import {deepSignal} from './deep_signal';

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
    for (const [_, child] of this.childMap()) {
      if (!child.valid()) {
        return false;
      }
    }

    // Otherwise, we are valid.
    return true;
  });

  locallyDisabled = DISABLED_NEVER;
  locallyValid = VALID_ALWAYS;

  // Probably should be a `computed` of the value()
  readonly childMap = signal(new Map<PropertyKey, FormField<unknown>>(), {equal: () => false});

  getChild(key: PropertyKey): FormField<unknown> {
    const childMap = untracked(this.childMap);
    if (!childMap.has(key)) {
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
      onChild(child);
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
