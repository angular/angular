import {type Signal} from '@angular/core';
import {type Form} from './form';

export type UnwrapSchema<S extends FormSchema<any>> =
  S extends FormGroupSchema<infer G>
    ? G extends Record<PropertyKey, FormSchema<any>>
      ? UnwrapSchemaRecord<G>
      : never
    : S extends FormFieldSchema<infer T>
      ? T
      : never;

export type UnwrapSchemaRecord<G extends Record<PropertyKey, FormSchema<any>>> = {
  [K in keyof G]: UnwrapSchema<G[K]>;
};

export type FormGroupableObject = {[K in keyof Form<FormSchema<unknown>>]?: never};

export interface FormLogic<T> {
  readonly value?: () => T;
  readonly validator?: (value: Signal<T>) => FormValidationError[];
  readonly disabled?: (value: Signal<T>) => boolean | {reason: string} | undefined;
  readonly xlink?: (schema: FormSchema<T>, form: Form<any>) => FormSchema<T>;
}

export type XLinkFunction<S extends FormSchema<any>, F extends FormSchema<any>> = (
  schema: S,
  form: Form<F>,
) => S;

export type FormGroupXLinkArgs<
  S extends FormGroupSchema<any>,
  G extends Record<PropertyKey, FormSchema<any>>,
> = Exclude<
  [...([XLinkFunction<S, S>] | []), ...([{[K in keyof G]?: XLinkFunction<G[K], S>}] | [])],
  []
>;

export class FormValidationError {
  constructor(readonly message: string) {}

  equals(other: FormValidationError) {
    return this.constructor === other.constructor && this.message === other.message;
  }
}

export abstract class FormSchema<T> {
  constructor(readonly logic: readonly FormLogic<T>[]) {}

  /**
   * Adds a validator to the field.
   * @param computation Function that computes the current validation error, may return:
   * - `FormValidationError` instance to represent an error, potentially with a custom class
   * - `string` to represent an error (auto-wrapped in a `FormValidationError`)
   * - `null` to represent no error
   */
  validate(computation: (value: Signal<T>) => FormValidationError | string | null): this {
    return this.addLogic({
      validator: (value) => {
        const result = computation(value);
        return result === null
          ? []
          : [typeof result === 'string' ? new FormValidationError(result) : result];
      },
    });
  }

  /**
   * Adds a disabled status check to the field.
   * @param computation The current disabled status, may be:
   * - `false` to represent unconditionally enabled
   * - `true` to represent unconditionally disabled (reason unspecified)
   * - `string` to represent unconditionally disabled (with reason)
   * - A function to conditionally determine the disabled state. The function may return:
   *   - Any of the above values (same meaning as unconditional context)
   *   - `undefined` to pass on making a decision
   *     (will fall back to previously added `disabled` clauses)
   * @returns
   */
  disabled(
    computation: boolean | string | ((value: Signal<T>) => boolean | string | undefined),
  ): this {
    return this.addLogic({
      disabled:
        typeof computation === 'function'
          ? (value) => {
              const result = computation(value);
              return typeof result === 'string' ? {reason: result} : result;
            }
          : () => (typeof computation === 'string' ? {reason: computation} : computation),
    });
  }

  protected addLogic(logic: FormLogic<T>): this {
    return this.setLogic([logic, ...this.logic]);
  }

  protected abstract setLogic(logic?: FormLogic<T>[]): this;
}

export class FormFieldSchema<T> extends FormSchema<T> {
  constructor(
    readonly defaultValue: T,
    logic: readonly FormLogic<T>[] = [],
  ) {
    super(logic);
  }

  /**
   * Sets the value for this field. Note: this differs from the `defaultValue` because reactive
   * changes in the value will overwrite the current value of the field (potentially a value
   * inputted by the user).
   * @param computation The value, or a function that returns the value
   */
  value(computation: T | (() => T)): this {
    return this.addLogic({
      value: typeof computation === 'function' ? (computation as () => T) : () => computation,
    });
  }

  /**
   * Crosslinks statuses within this field (e.g. to create a disabled state that depends on the
   * validation state).
   * @param fn A function that takes the current schema and the form (rooted at the same node as
   * the schema) and returns an updated schema.
   * @returns
   */
  xlink(fn: XLinkFunction<this, this>) {
    return this.addLogic({
      xlink: (schema, form) => fn(schema as this, form as unknown as Form<this>),
    });
  }

  protected override setLogic(logic?: FormLogic<T>[]): this {
    return new FormFieldSchema(this.defaultValue, logic ?? this.logic) as this;
  }
}

export class FormGroupSchema<G extends Record<PropertyKey, FormSchema<any>>> extends FormSchema<
  UnwrapSchemaRecord<G>
> {
  constructor(
    readonly fields: G,
    logic: readonly FormLogic<UnwrapSchemaRecord<G>>[] = [],
  ) {
    super(logic);
  }

  /**
   * Crosslinks statuses within this group (e.g. to create child validation state that depends on
   * sibling value).
   * @param args May be:
   * 1. A function that takes the current schema and the form (rooted at the same node as
   *   the schema) and returns an updated schema.
   * 2. An object mapping each child field to a function that takes the child field schema and the
   *   form (rooted at this group's node) and returns an updated schema.
   * 3. Both of the avove
   * @returns
   */
  xlink(...args: FormGroupXLinkArgs<this, G>): this {
    let fn: XLinkFunction<this, this> | undefined;
    let fieldFns: {[K in keyof G]?: XLinkFunction<G[K], this>} | undefined;
    if (args.length === 2) {
      fn = args[0];
      fieldFns = args[1];
    } else if (typeof args[0] === 'function') {
      fn = args[0];
    } else {
      fieldFns = args[0];
    }
    return this.addLogic({
      xlink: (schema, form) => {
        if (fieldFns) {
          let fields = {...(schema as this).fields};
          for (const key of Object.keys(fieldFns)) {
            const fieldFn = fieldFns[key];
            if (fieldFn) {
              (fields as Record<PropertyKey, FormSchema<any>>)[key] = fieldFn(
                fields[key] as G[string],
                form as unknown as Form<this>,
              );
            }
          }
          schema = new FormGroupSchema(fields, schema.logic) as this;
        }
        if (fn) {
          schema = fn(schema as this, form as unknown as Form<this>);
        }
        return schema;
      },
    });
  }

  protected override setLogic(logic: FormLogic<UnwrapSchemaRecord<G>>[]): this {
    return new FormGroupSchema(this.fields, logic ?? this.logic) as this;
  }
}

export function mergeLogic<T>(logics: readonly FormLogic<T>[]): FormLogic<T> {
  return {
    value: logics.find((l) => l.value)?.value,
    validator: (value) => logics.flatMap((l) => l.validator?.(value) ?? []),
    disabled: (value) => logics.find((l) => l.disabled?.(value) !== undefined)?.disabled?.(value),
    xlink: logics.reduce<((schema: FormSchema<T>, form: Form<any>) => FormSchema<T>) | undefined>(
      (acc, l) =>
        acc && l.xlink ? (schema, form) => acc(l.xlink!(schema, form), form) : (l.xlink ?? acc),
      undefined,
    ),
  };
}

export function field(): FormFieldSchema<unknown>;
export function field<T>(): FormFieldSchema<T | undefined>;
export function field<T>(defaultValue: T): FormFieldSchema<T>;
export function field<T>(defaultValue?: T): FormFieldSchema<T | undefined> {
  return new FormFieldSchema<T | undefined>(defaultValue);
}

export function group<G extends Record<PropertyKey, FormSchema<any>>>(
  fields: G & FormGroupableObject,
): FormGroupSchema<G> {
  return new FormGroupSchema(fields);
}
