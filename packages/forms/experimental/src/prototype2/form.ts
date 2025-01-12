import {computed, type Signal, type WritableSignal} from '@angular/core';
import {SIGNAL} from '@angular/core/primitives/signals';
import {FormLogic} from './logic';
import {createOnAccessProxy} from './proxy';
import {
  addLogic,
  isFormSchema,
  type FormLogicSchema,
  type FormSchema,
  type FormValidationError,
} from './schema';

const LOGIC = Symbol('LOGIC');

export type Writable<T> = {-readonly [P in keyof T]: T[P]};

export type FormField<T> = WritableSignal<T> & {
  readonly valid: Signal<boolean>;
  readonly disabled: Signal<boolean | {reason: string}>;
  readonly errors: Signal<readonly FormValidationError[]>;
};

export type Form<T> = {
  $: FormField<T>;
  [LOGIC]: FormLogic<T>;
} & (T extends Record<PropertyKey, unknown> ? {[K in keyof T]: Form<T[K]>} : {});

export type FormDataType<T> =
  T extends Form<infer U> ? U : T extends FormSchema<infer U> ? U : never;

export function form<T>(data: WritableSignal<T>, schema?: FormSchema<T>): Form<T> {
  const clonedData = Object.assign(data, {});
  clonedData[SIGNAL] = data[SIGNAL];
  return makeForm(clonedData, schema);
}

export function logic<T>(form: Form<T>, schema: Partial<FormLogicSchema<T>> | FormSchema<T>) {
  if (isFormSchema(schema)) {
    addLogic(schema as FormSchema<T>, form);
    for (const property of Object.keys(schema)) {
      const childForm = form[property as keyof Form<T>] as Form<T[keyof T]>;
      const childSchema = schema[property as keyof typeof schema] as FormSchema<T[keyof T]>;
      logic(childForm, childSchema);
    }
  } else {
    form[LOGIC].add(schema as Partial<FormLogicSchema<T>>);
  }
}

function makeForm<T, K extends keyof T>(
  data: WritableSignal<T>,
  schema?: FormSchema<T>,
  parentDisabled?: Signal<boolean | {reason: string}>,
  parentProperty?: K,
): Form<T> {
  // Tear off the child data and schema from the parent if needed.
  if (parentProperty !== undefined) {
    const childData = computed(() => data()[parentProperty]) as WritableSignal<T>;
    childData.set = (value) => data.update((old) => ({...old, [parentProperty]: value}));
    childData.update = (fn) =>
      data.update((old) => ({...old, [parentProperty]: fn(old[parentProperty] as T)}));
    const childSchema =
      schema === undefined || !(parentProperty in schema)
        ? undefined
        : (schema[parentProperty as keyof FormSchema<T>] as FormSchema<T>);
    return makeForm(childData, childSchema, parentDisabled);
  }
  // Set up the proxy
  const $ = data as unknown as Writable<FormField<T>>;
  const formProxy = createOnAccessProxy(
    {$, [LOGIC]: new FormLogic()},
    (_, property) => makeForm(data, schema, $.disabled, property as keyof T) as Form<T>,
  );
  // Add logic from the schema
  addLogic(schema, formProxy);
  const logic = formProxy[LOGIC];
  // Tack on statuses
  $.errors = computed(() => logic.validate?.(data) ?? [], {equal: errorsEquality});
  $.valid = computed(() => {
    if ($.errors().length > 0) {
      return false;
    }
    const value = data();
    if (isObject(value)) {
      for (const key of Object.keys(value)) {
        if (!(formProxy[key as keyof Form<T>] as Form<unknown>).$.valid()) {
          return false;
        }
      }
    }
    return true;
  });
  $.disabled = computed(() => parentDisabled?.() || (logic.disabled(data) ?? false), {
    equal: booleanReasonEquality,
  });
  return formProxy;
}

function errorsEquality(a: FormValidationError[], b: FormValidationError[]) {
  return a.length === b.length && a.every((e, i) => e.equals(b[i]));
}

function booleanReasonEquality(a: boolean | {reason: string}, b: boolean | {reason: string}) {
  return a === b || (typeof a === 'object' && typeof b === 'object' && a.reason === b.reason);
}

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
