import {computed, WritableSignal} from '@angular/core';
import {FormFieldImpl, formNode} from '../engine/field';
import {FormField, FormNode} from '../engine/types';

export type FormSchema<T> = (form: FormNode<T>) => void;
export type FormRule<T> = (field: FormFieldImpl<T>) => void;

export function schema<T>(fn: (form: FormNode<T>) => void): FormSchema<T> {
  return fn;
}

export function rule<T>(node: FormNode<T>, rules: ReadonlyArray<FormRule<T>>): void {
  for (const rule of rules) {
    rule(node.$ as FormFieldImpl<T>);
  }
}

export function validate<T>(fn: (field: FormField<T>) => boolean): FormRule<T> {
  return (field) => {
    // TODO: merging
    field.locallyValid = computed(() => fn(field));
  };
}

export function disable<T>(fn: (field: FormField<T>) => boolean): FormRule<T> {
  return (field) => {
    // TODO: merging
    field.locallyDisabled = computed(() => fn(field));
  };
}

export function mount<C>(f: FormNode<C>, schema: FormSchema<C>): void {
  schema(f);
}

export function each<T>(f: FormNode<readonly T[]>, schema: FormSchema<T>): void {
  const field = f.$ as FormFieldImpl<readonly T[]>;
  field.setOnChild((child) => schema(formNode(child) as FormNode<T>));
}

export function form<T>(value: WritableSignal<T>, schema: FormSchema<T>): FormNode<T> {
  // Create the root FormField & FormNode.
  const root = new FormFieldImpl<T>(value, undefined);
  const node = formNode(root);

  // Apply logic.
  schema(node);

  // Return the form structure.
  return node;
}
