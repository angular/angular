/**
 * This file just has some high level types needed for the demo.
 * All the interesting stuff is in demo.ts
 */

export type ValidatorResult = null | string | Record<string, any>;
export type Validator<T> = (formItem: T) => ValidatorResult;

export type DisabledResult<T> =
  | boolean
  | {
      [K in keyof T]?: T[K] extends FormField<any>
        ? boolean
        : T[K] extends FormGroup<any>
          ? DisabledResult<T[K]['controls']>
          : never;
    };

export type DisabledValidator<T> = (
  formItem: T,
) => DisabledResult<T extends FormGroup<any> ? T['controls'] : never>;

export interface FormFieldConfig<T> {
  initialValue?: T;
  validators?: Validator<FormField<T>> | Array<Validator<FormField<T>>>;
}

export interface FormField<T> {
  config: FormFieldConfig<T>;
  value: T;
  dirty: boolean;
  withConfig: (c: FormFieldConfig<T>) => FormField<T>;
  addValidator: (v: Validator<FormField<T>>) => FormField<T>;
}

export type FormItem<T> = FormField<T> | FormGroup<any>;

export interface FormGroup<T extends FormGroupControls = FormGroupControls> {
  controls: T;
  config: FormGroupConfig<T>;
  readonly dirty: boolean;

  withConfig(config: FormGroupConfig<T>): FormGroup<T>;

  addValidator: (v: Validator<FormField<T>>) => FormField<T>;
  readonly value: {
    [K in keyof T]: T[K] extends FormField<infer V>
      ? V
      : T[K] extends FormGroup<any>
        ? T[K]['value']
        : never;
  };
}

export type FormGroupControls = Record<string, FormItem<any>>;

export type FormGroupFields = Record<string, FormItem<any>>;

export type FormGroupConfig<T extends Record<string, FormItem<any>>> = {
  validators?: Validator<FormGroup<T>>[] | Validator<FormGroup<T>>;
  disabled?: DisabledValidator<FormGroup<T>>;
};

export const validators = {
  maxLength: (length: number, message = 'Too long!'): Validator<FormField<string>> => {
    return (field) => {
      return field.value.length <= length ? null : message;
    };
  },

  required(message = 'This field is required'): Validator<FormField<any>> {
    return (field) => {
      return field.value !== undefined && field.value !== undefined ? null : {required: message};
    };
  },

  minLength: (length: number, message = 'Too short!'): Validator<FormField<string>> => {
    return (field) => {
      return field.value.length >= length ? null : message;
    };
  },
};

function formField<T>(initialValue: T, config: FormFieldConfig<T>): FormField<T> {
  return {
    config,
    value: initialValue,
    dirty: true,
    withConfig: (c) => formField(initialValue, c),
    addValidator(c) {
      // We don't actually add a validator hehe
      return formField(initialValue, config);
    },
  };
}

export const form = {
  group<T extends FormGroupControls>(controls: T, config?: FormGroupConfig<T>): FormGroup<T> {
    throw new Error('not implemented');
  },
  number(initialValue = 0, config?: FormFieldConfig<number>): FormField<number> {
    throw new Error('not implemented');
  },
  text(initialValue = '', config?: FormFieldConfig<string>): FormField<string> {
    throw new Error('not implemented');
  },
  checkbox(initialValue = false, config?: FormFieldConfig<boolean>): FormField<boolean> {
    throw new Error('not implemented');
  },
  password(initialValue = '', config: FormFieldConfig<string> = {}): FormField<string> {
    throw new Error('not implemented');
  },
};
