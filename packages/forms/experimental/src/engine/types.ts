import {Signal, WritableSignal} from '@angular/core';
import {FormError} from './logic';

export interface FormField<T> {
  readonly value: WritableSignal<T>;
  readonly touched: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly dirty: Signal<boolean>;
  readonly errors: Signal<FormError[]>;
  readonly valid: Signal<boolean>;

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
