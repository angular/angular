import { computed, type Signal, type WritableSignal } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { INTERNAL } from './internal';
import { FormLogicImpl, type FormValidationError } from './logic';
import { createOnAccessProxy } from './proxy';
import { ruleInternal, type FormEachRule, type FormRule, type FormSchema } from './schema';
import {
  getTypeErrorTree,
  mergeTypeErrorTree,
  type TypeValidationErrorTree,
} from './type-validator';

export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export type Keys<T> = keyof T &
  (any[] extends T
    ? T extends Record<PropertyKey, unknown>
      ? keyof T
      : number
    : T extends readonly unknown[]
      ? Exclude<keyof T, keyof unknown[]>
      : T extends Record<PropertyKey, unknown>
        ? keyof T
        : never);

export type Form<T> = FormNode<T> &
  (T extends Record<PropertyKey, unknown>
    ? { readonly [K in Keys<T>]: Form<T[K]> }
    : T extends readonly unknown[]
      ? readonly Form<T[Keys<T>]>[]
      : unknown);

export type FormField<T> = WritableSignal<T> & {
  readonly valid: Signal<boolean>;
  readonly disabled: Signal<boolean | { reason: string }>;
  readonly errors: Signal<readonly FormValidationError[]>;
};

export type FormNode<T> = {
  $: FormField<T>;
  [INTERNAL]: {
    logic: FormLogicImpl<T>;
    childRules: FormEachRule<T>[];
    typeErrorTree?: TypeValidationErrorTree;
  };
};

export type FormBacking<T> = { data: WritableSignal<T>; schema?: FormSchema<T> };

export type FormDataType<T> =
  T extends Form<infer U> ? U : T extends FormSchema<infer U> ? U : never;

export function form<T>(data: WritableSignal<T>, schema?: FormSchema<T>): Form<T> {
  const clonedData = Object.assign(data, {});
  clonedData[SIGNAL] = data[SIGNAL];
  return makeForm(clonedData, schema);
}

function makeForm<T>(data: WritableSignal<T>, schema?: FormSchema<T>): Form<T> {
  return createOnAccessProxy<T, FormBacking<T>, FormNode<T>>(
    { data, schema },
    {
      wrap: ({ data, schema }, parent, propertyInParent) => ({
        $: data as FormField<T>,
        [INTERNAL]: {
          logic: new FormLogicImpl(),
          childRules: [] as FormEachRule<T>[],
          typeErrorTree: mergeTypeErrorTree(
            parent?.[INTERNAL].typeErrorTree?.property(propertyInParent!),
            getTypeErrorTree(schema?.[INTERNAL].typeValidator, data),
          ),
        },
      }),
      descend: ({ data, schema }, property) => {
        // Descend into the specified properyt on both the data and the schema.
        const childData = computed(() => data()[property]) as WritableSignal<T[keyof T]>;
        childData.set = (value) => data.update((old) => ({ ...old, [property]: value }));
        childData.update = (fn) =>
          data.update((old) => ({ ...old, [property]: fn(old[property]) }));
        const childSchema =
          schema !== undefined && schema[INTERNAL].hasProperty(property)
            ? schema[INTERNAL].getProperty(property)
            : undefined;
        return { data: childData, schema: childSchema };
      },
      configure: (form, { data, schema }, parent, propertyInParent) => {
        // Add any child rules from the parent. They apply to all properties on the parent.
        for (let newRule of parent?.[INTERNAL].childRules ?? []) {
          newRule =
            typeof newRule === 'function'
              ? newRule(form as Form<T[Keys<T>]>, propertyInParent as Keys<T>)
              : newRule;
          ruleInternal(form as Form<T>, newRule as FormRule<T>);
        }
        // Add the logic from our schema.
        for (const instantiateLogic of schema?.[INTERNAL].logic ?? []) {
          instantiateLogic(form as Form<T>);
        }
        // Compute the field states.
        const logic = form[INTERNAL].logic;
        const $ = form.$ as Writable<FormField<T>>;
        $.errors = computed(
          () => [...(form[INTERNAL].typeErrorTree?.own() ?? []), ...(logic.validate?.(data) ?? [])],
          { equal: errorsEquality },
        );
        $.valid = computed(() => {
          if ($.errors().length > 0) {
            return false;
          }
          const value = data();
          if (isObjectOrArray(value)) {
            for (const key of Object.keys(value)) {
              if (!((form as Form<T>)[key as keyof Form<T>] as Form<T[keyof T]>).$.valid()) {
                return false;
              }
            }
          }
          return true;
        });
        $.disabled = computed(() => parent?.$.disabled() || (logic.disabled(data) ?? false), {
          equal: booleanReasonEquality,
        });
      },
    },
  ) as Form<T>;
}

function errorsEquality(a: FormValidationError[], b: FormValidationError[]) {
  return (
    a.length === b.length && a.every((e, i) => e.type === b[i].type && e.message === b[i].message)
  );
}

function booleanReasonEquality(a: boolean | { reason: string }, b: boolean | { reason: string }) {
  return a === b || (typeof a === 'object' && typeof b === 'object' && a.reason === b.reason);
}

function isObjectOrArray(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null;
}
