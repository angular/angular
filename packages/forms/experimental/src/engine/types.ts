import {Signal, WritableSignal} from '@angular/core';

export interface FormField<T> {
  readonly value: WritableSignal<T>;
  readonly touched: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly dirty: Signal<boolean>;
  readonly valid: Signal<boolean>;

  // errors
  // metadata
}

// in the user's namespace
export type FormNode<T> = {
  $: FormField<T>;
} & (T extends Record<PropertyKey, any>
  ? {
      [K in keyof T]: FormNode<T[K]>;
    }
  : {});
