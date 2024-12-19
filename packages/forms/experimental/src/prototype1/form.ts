import {computed, signal, type Signal, type WritableSignal} from '@angular/core';
import {
  FormFieldSchema,
  FormGroupSchema,
  type FormSchema,
  type FormValidationError,
  mergeLogic,
  type UnwrapSchema,
} from './schema';

export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type FormField<T> = WritableSignal<T> & {
  readonly valid: Signal<boolean>;
  readonly errors: Signal<FormValidationError[]>;
  readonly disabled: Signal<boolean | {reason: string}>;
};

export type Form<S extends FormSchema<any>> = {
  readonly $: FormField<UnwrapSchema<S>>;
} & (S extends FormGroupSchema<infer T> ? {[K in keyof T]: Form<S['fields'][K]>} : {});

export interface FormNodeOptions<T> {
  parentDisabled?: Signal<boolean | {reason: string}>;
  value?: [DeepPartial<T>];
}

export type DeepPartial<T> =
  T extends Record<PropertyKey, any>
    ? {
        [K in keyof T]?: DeepPartial<T[K]>;
      }
    : T;

export class FormFieldNode<T> {
  readonly $: FormField<T>;

  constructor(schema: FormFieldSchema<T>, options?: FormNodeOptions<T>) {
    // Merge the schema's logic array into a single logic object
    let logic = mergeLogic(schema.logic);
    // If the logic has an xlink function, run it to get the updated schema and logic function
    if (logic.xlink) {
      schema = logic.xlink(schema, this as any) as any;
      logic = mergeLogic(schema.logic);
    }
    // If a value was provided when creating the form, add that to our schema and logic function.
    if (options?.value) {
      schema = schema.value(options.value[0] as T);
      logic = mergeLogic(schema.logic);
    }
    // Generate the signals and computeds for this form field.
    const $ = signal(logic.value ? logic.value() : schema.defaultValue) as WritableSignal<T> &
      Writable<FormField<T>>;
    $.errors = computed(() => logic.validator?.($) ?? [], {equal: errorsEquality});
    $.valid = computed(() => $.errors().length === 0);
    $.disabled = computed(() => options?.parentDisabled?.() || (logic.disabled?.($) ?? false), {
      equal: booleanReasonEquality,
    });
    this.$ = $;
  }
}

export class FormGroupNode<T extends Record<PropertyKey, any>> {
  readonly $: FormField<T>;

  constructor(
    schema: FormGroupSchema<{[K in keyof T]: FormSchema<T[K]>}>,
    options?: FormNodeOptions<T>,
  ) {
    // Merge the schema's logic array into a single logic object
    let logic = mergeLogic(schema.logic);
    // If the logic has an xlink function, run it to get the updated schema and logic function
    if (logic.xlink) {
      schema = logic.xlink(schema, this as any) as any;
      logic = mergeLogic(schema.logic);
    }
    // Create our disabled signal first, as we need it to pass to our child fields
    const disabled = computed(() => options?.parentDisabled?.() || (logic.disabled?.($) ?? false), {
      equal: booleanReasonEquality,
    });
    // Convert the child field schemas into form nodes.
    const fields = Object.fromEntries(
      Object.entries(schema.fields).map(([key, field]) => [
        key,
        formInternal(field, {
          parentDisabled: disabled,
          value: options?.value && key in options.value[0] ? [options.value[0][key]] : undefined,
        }),
      ]),
    );
    // Create the value signal for the form group. The value is derived from the child field values,
    // and when someone sets it, it actually needs to set the values in the child fields
    const $ = computed(() =>
      Object.fromEntries(Object.entries(fields).map(([field, node]) => [field, node.$()])),
    ) as WritableSignal<T> & Writable<FormField<T>>;
    // TODO: add `update` & whatever other WritableSignal methods.
    $.set = (value) => {
      for (const key of Object.keys(fields)) {
        fields[key].$.set(value[key]);
      }
    };
    // Add on the rest of the field's metadata
    $.errors = computed(() => logic.validator?.($) ?? [], {equal: errorsEquality});
    $.valid = computed(
      () => $.errors().length === 0 && Object.values(fields).every((field) => field.$.valid()),
    );
    $.disabled = disabled;
    // Add references to the child fields as properties on the form group
    Object.assign(this, fields);
    this.$ = $;
  }
}

export function form<S extends FormSchema<any>>(
  schema: S,
  // TODO: allow passing signal wrapped values as well
  value?: DeepPartial<UnwrapSchema<S>>,
): Form<S> {
  return formInternal(schema, {value: value ? [value] : undefined});
}

function formInternal<S extends FormSchema<any>>(
  schema: S,
  options?: FormNodeOptions<UnwrapSchema<S>>,
): Form<S> {
  if (schema instanceof FormFieldSchema) {
    return new FormFieldNode<UnwrapSchema<S>>(schema, options) as Form<S>;
  }
  if (schema instanceof FormGroupSchema) {
    return new FormGroupNode<UnwrapSchema<S>>(schema, options) as Form<S>;
  }
  throw new Error('Invalid schema');
}

function booleanReasonEquality(a: boolean | {reason: string}, b: boolean | {reason: string}) {
  return a === b || (typeof a === 'object' && typeof b === 'object' && a.reason === b.reason);
}

function errorsEquality(a: FormValidationError[], b: FormValidationError[]) {
  return a.length === b.length && a.every((e, i) => e.equals(b[i]));
}
