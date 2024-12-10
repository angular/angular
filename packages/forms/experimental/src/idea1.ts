import {signal, Signal, WritableSignal} from '@angular/core';

// No-op implementation that demonstrates the API shape.

/**
 * A node in the Form where we can get the value, validity, etc. This could be:
 * - The root form itself
 * - A nested sub-form
 * - A leaf input field
 */
interface FormNode<T> {
  $: FormField<T>;
}

/**
 * A data object that can be wrapped in a form.
 */
type FormableObject = Record<PropertyKey, any> & {[K in keyof FormNode<any>]?: never};

/**
 * Represents a complete form with the ability to access the value, validity, etc. at any sub-field.
 */
type Form<T> = T extends FormableObject
  ? {[K in keyof Omit<T, keyof FormNode<any>>]: Form<T[K]> & FormNode<T[K]>} & FormNode<T>
  : FormNode<T>;

/**
 * Represents a field in a Form and gives access to the value, validity, etc. of that field. This
 * could be a leaf-field, or some grouping field within the form.
 */
interface FormField<T> extends WritableSignal<T> {
  valid: Signal<boolean>;
  errors: Signal<string[] | null>;
  required: Signal<boolean>;
  disabled: Signal<false | {reason: string}>;
  readonly: Signal<false | {reason: string}>;
  hidden: Signal<boolean>;
}

/**
 * A schema used to define the logic for a Form.
 */
type FormSchema<T extends FormableObject, F extends Form<any> = Form<T>> = FormFieldSchema<T, F> & {
  [K in keyof Omit<T, keyof FormNode<any>>]: T[K] extends FormableObject
    ? FormSchema<T[K], F>
    : FormFieldSchema<T[K], F>;
};

/**
 * A schema used to define the logic for a field in a Form.
 */
interface FormFieldSchema<T, F extends Form<any>> {
  logic: Partial<FormLogic<T, F>>[];
}

/**
 * Defines the logic for determing a field's value, validity, etc.
 */
interface FormLogic<T, F extends Form<any>> {
  value: (form: F) => T;
  errors: (form: F) => string[] | boolean | null;
  required: (form: F) => boolean;
  disabled: (form: F) => string | boolean | null;
  readonly: (form: F) => string | boolean | null;
  hidden: (form: F) => boolean;
}

/**
 * Functions to define pieces of FormSchema.
 */
function form<T extends FormableObject, F extends Form<any> = Form<T>>(
  ...args: [...FormLogic<T, F>[], Omit<FormSchema<T, F>, 'logic'>]
): FormSchema<T, F> {
  return undefined!;
}
function field<T, F extends Form<any>>(
  ...logic: Partial<FormLogic<T, F>>[]
): FormFieldSchema<T, F> {
  return undefined!;
}
function value<T, F extends Form<any>>(v: T | ((form: F) => T)): FormLogic<T, F> {
  return undefined!;
}
function valid<T, F extends Form<any>>(
  v: string | boolean | ((form: F) => string | boolean | null),
): FormLogic<T, F> {
  return undefined!;
}
function required<T, F extends Form<any>>(
  v: string | boolean | ((form: F) => string | boolean | null),
): FormLogic<T, F> {
  return undefined!;
}
function hidden<T, F extends Form<any>>(
  v: boolean | ((form: F) => boolean | null),
): FormLogic<T, F> {
  return undefined!;
}

/**
 * Includes a separately defined FormSchema into another FormSchema.
 */
function include<T extends FormableObject, F extends Form<any>>(
  schema: FormSchema<T, Form<T>>,
): FormSchema<T, F>;
function include<T extends FormableObject, F extends Form<any>>(
  schema: FormSchema<T, Form<T>>,
  // TODO: should optionally take form-level logic & `Partial<>` should be deep.
  augmentSchema: Partial<Omit<FormSchema<T, F>, 'logic'>>,
): FormSchema<T, F>;
function include(...args: any[]) {
  return undefined!;
}

/**
 * Creates a Form from a FormSchema.
 */
function create<T extends FormableObject>(schema: FormSchema<T, Form<T>>): Form<T> {
  return undefined!;
}

// Example usage:

const nameSchema = form<{first: string; last: string}>({
  first: field(),
  last: field(),
});

const dateSchema = form<{year: number; month: number; day: number}>({
  year: field(),
  month: field(
    valid((m) => (m.month.$() < 1 || m.month.$() > 12 ? 'Month must be between 1 and 12' : null)),
  ),
  day: field(
    valid((m) =>
      m.day.$() < 1 || m.day.$() > (m.month.$() === 2 ? 29 : 31)
        ? 'Date must be between 1 and 31'
        : null,
    ),
  ),
});

const shouldCollectPhoneNum = signal(true);

const userSchema = form<{
  name: {first: string; last: string};
  birthdate: {year: number; month: number; day: number};
  phone: {area: string; prefix: string; line: string};
}>({
  name: include(nameSchema),
  birthdate: include(dateSchema, {
    year: field(
      value(1990),
      required('Year is required'),
      valid((m) =>
        m.birthdate.year.$() > new Date().getFullYear() - 18 ? 'Must be 18 or older' : null,
      ),
    ),
    month: field(required('Month is required')),
  }),
  phone: form(
    hidden(() => !shouldCollectPhoneNum()),
    {
      area: field(),
      prefix: field(),
      line: field(),
    },
  ),
});

const userForm = create(userSchema);
userForm.birthdate.year.$() === 2000;
userForm.$.valid() === true;
userForm.name.$.set({first: 'Bob', last: 'Loblaw'});
userForm.phone.line.$.hidden() === true;
