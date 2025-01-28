import {type Signal} from '@angular/core';

export type BooleanWithReason = boolean | {reason: string};

export type NonFunction<T> = T extends (...args: any[]) => any ? never : T;

export type FormValidationError = Record<PropertyKey, unknown> & {
  type: string;
  message: string;
};

export type FormMetadata = Record<PropertyKey, unknown>;

export type MetadataValue<T, V> = V extends (...args: any[]) => any
  ? V & ((value: Signal<T>, previousMetadataValue: unknown) => unknown)
  : V;

export interface FormLogicDefinition<T> {
  readonly metadata: (value: Signal<T>, previousMetadata: FormMetadata) => FormMetadata;
  readonly validate: (
    value: Signal<T>,
    previousErrors: FormValidationError[],
    previousMetadata: FormMetadata,
  ) => FormValidationError[];
  readonly disabled: (
    value: Signal<T>,
    previousDisabled: BooleanWithReason,
    previousMetadata: FormMetadata,
  ) => BooleanWithReason;
}

export class FormLogic<T> {
  metadata: (value: Signal<T>) => FormMetadata;
  validate: (value: Signal<T>) => FormValidationError[];
  disabled: (value: Signal<T>) => BooleanWithReason;

  constructor(base?: FormLogicDefinition<T>) {
    this.metadata = (value) => base?.metadata(value, {}) ?? {};
    this.validate = (value) => base?.validate(value, [], this.metadata(value)) ?? [];
    this.disabled = (value) => base?.disabled(value, false, this.metadata(value)) ?? false;
  }

  add({disabled, validate, metadata}: Partial<FormLogicDefinition<T>>) {
    if (metadata !== undefined) {
      const oldMetadata = this.metadata;
      this.metadata = (value) => metadata(value, oldMetadata(value));
    }
    if (disabled !== undefined) {
      const oldDisabled = this.disabled;
      this.disabled = (value) => disabled(value, oldDisabled(value), this.metadata(value));
    }
    if (validate !== undefined) {
      const oldValidate = this.validate;
      this.validate = (value) => validate(value, oldValidate(value), this.metadata(value));
    }
  }
}

export function error<T>(
  validator?:
    | string
    | FormValidationError
    | FormValidationError[]
    | ((
        value: Signal<T>,
        previousErrors: FormValidationError[],
      ) => null | string | FormValidationError | FormValidationError[]),
): Partial<FormLogicDefinition<T>> {
  return {
    validate: (value: Signal<T>, previousErrors: FormValidationError[]) =>
      normalizeErrors(
        typeof validator === 'function'
          ? (validator(value, previousErrors) ?? [])
          : (validator ?? {type: 'custom', message: ''}),
      ),
  };
}

export function disable<T>(
  disabled?:
    | BooleanWithReason
    | string
    | ((value: Signal<T>, previousDisabled: BooleanWithReason) => BooleanWithReason | string),
): Partial<FormLogicDefinition<T>> {
  return {
    disabled: (value: Signal<T>, previousDisabled: BooleanWithReason) => {
      return normalizeDisabled(
        typeof disabled === 'function' ? disabled(value, previousDisabled) : (disabled ?? true),
      );
    },
  };
}

export function metadata<T>(
  metadataKey: PropertyKey,
  metadataValue: (value: Signal<T>, previousMetadataValue: unknown) => unknown,
): Partial<FormLogicDefinition<T>>;
export function metadata<T, V>(
  metadataKey: PropertyKey,
  metadataValue: MetadataValue<T, V>,
): Partial<FormLogicDefinition<T>>;
export function metadata<T>(
  metadataKey: PropertyKey,
  metadataValue: unknown | ((value: Signal<T>, previousMetadataValue: unknown) => unknown),
): Partial<FormLogicDefinition<T>> {
  return {
    metadata: (value: Signal<T>, previousMetadata: FormMetadata) => ({
      ...previousMetadata,
      [metadataKey]:
        typeof metadataValue === 'function'
          ? metadataValue(value, previousMetadata[metadataKey])
          : metadataValue,
    }),
  };
}

export function required<T>(
  isRequired?:
    | boolean
    | string
    | ((value: Signal<T>, previousRequired: boolean) => boolean | string),
): Partial<FormLogicDefinition<T>> {
  return {
    validate: (
      value: Signal<T>,
      previousErrors: FormValidationError[],
      previousMetadata: FormMetadata,
    ) => {
      const result =
        typeof isRequired === 'function'
          ? isRequired(value, (previousMetadata['required'] as boolean | undefined) ?? false)
          : (isRequired ?? true);
      return result !== false && (value() == null || value() === '')
        ? [
            ...previousErrors.filter((e) => e.type !== 'required'),
            {type: 'required', message: typeof result === 'string' ? result : ''},
          ]
        : previousErrors.filter((e) => e.type !== 'required');
    },
    metadata: (value: Signal<T>, previousMetadata: FormMetadata) => {
      const result =
        typeof isRequired === 'function'
          ? isRequired(value, (previousMetadata['required'] as boolean | undefined) ?? false)
          : (isRequired ?? true);
      return {...previousMetadata, ['required']: result !== false};
    },
  };
}

export function when<T>(
  condition: (value: Signal<T>) => boolean,
  logic: Partial<FormLogicDefinition<T>>,
): Partial<FormLogicDefinition<T>> {
  const result: Partial<FormLogicDefinition<T>> = {
    metadata:
      logic.metadata &&
      ((value, previous) => (condition(value) ? logic.metadata!(value, previous) : previous)),
    disabled:
      logic.disabled &&
      ((value, previous, meta) =>
        condition(value) ? logic.disabled!(value, previous, meta) : previous),
    validate:
      logic.validate &&
      ((value, previous, meta) =>
        condition(value) ? logic.validate!(value, previous, meta) : previous),
  };
  return result;
}

function normalizeErrors(value: string | FormValidationError | FormValidationError[]) {
  const errorObjs = typeof value === 'string' ? {type: 'custom', message: value} : value;
  return Array.isArray(errorObjs) ? errorObjs : [errorObjs];
}

function normalizeDisabled(value: BooleanWithReason | string) {
  return typeof value === 'string' ? {reason: value} : value;
}
