import {type Form, type Keys} from './form';
import {INTERNAL} from './internal';
import {FormLogicDefinition} from './logic';
import {type TypeValidator} from './type-validator';

let isInSchemaContext = false;

export type FormRule<T> = (form: Form<T>) => void;

export type FormEachRule<T> = (form: Form<T[Keys<T>]>, key: Keys<T>) => void;

export type FormRuleDefinition<T> =
  | Partial<FormLogicDefinition<T>>
  | ((form: Form<T>) => Partial<FormLogicDefinition<T>>);

export type FormEachRuleArg<T> =
  | Partial<FormLogicDefinition<T[Keys<T>]>>
  | ((form: Form<T[Keys<T>]>, key: Keys<T>) => Partial<FormLogicDefinition<T[Keys<T>]>>);

export class FormSchema<T> {
  private properties = {} as T extends Record<PropertyKey, unknown>
    ? {[K in Keys<T>]: FormSchema<T[K]>}
    : {};

  constructor(
    private typeValidator?: TypeValidator<T>,
    private base?: FormSchema<T>,
  ) {
    this[INTERNAL].typeValidator = typeValidator;
    this[INTERNAL].rules = [...(base?.[INTERNAL].rules ?? [])];
  }

  extend(ruleFn: FormRule<T>) {
    const s = new FormSchema(this.typeValidator, this);
    s[INTERNAL].addRule(ruleFn);
    return s;
  }

  [INTERNAL] = {
    typeValidator: undefined as TypeValidator<T> | undefined,

    rules: [] as FormRule<T>[],

    addRule: (ruleFn?: FormRule<T>) => {
      if (ruleFn === undefined) {
        return;
      }
      this[INTERNAL].rules.push((f) => {
        //isInSchemaContext = true;
        ruleFn(f);
        //isInSchemaContext = false;
      });
    },

    getProperty: <K extends keyof T>(property: K): FormSchema<T[K]> => {
      // Retreive the cached schema for the given property.
      const ownProperties = this.properties as unknown as Record<K, FormSchema<T[K]>>;
      if (ownProperties.hasOwnProperty(property)) {
        return ownProperties[property];
      }
      // If there was no cached schema, create a new one, cache it, and return it.
      const childSchema = new FormSchema(
        undefined,
        this.base !== undefined && this.base.properties.hasOwnProperty(property)
          ? (this.base.properties as unknown as Record<K, FormSchema<T[K]>>)[property]
          : undefined,
      );
      ownProperties[property] = childSchema;
      return childSchema;
    },

    hasProperty: (property: keyof T) => this.properties.hasOwnProperty(property),

    propertyKeys: () => Object.keys(this.properties) as (keyof T)[],
  };
}

export function schema<T>(): FormSchema<T>;
export function schema<T>(typeValidator: TypeValidator<T>): FormSchema<T>;
export function schema<T>(ruleFn: FormRule<T>): FormSchema<T>;
export function schema<T>(typeValidator: TypeValidator<T>, ruleFn: FormRule<T>): FormSchema<T>;
export function schema<T>(
  typeValidatorOrDefinition?: TypeValidator<T> | FormRule<T>,
  ruleFn?: FormRule<T>,
): FormSchema<T> {
  const typeValidator: TypeValidator<T> | undefined =
    typeof typeValidatorOrDefinition === 'function' ? undefined : typeValidatorOrDefinition;
  ruleFn = typeof typeValidatorOrDefinition === 'function' ? typeValidatorOrDefinition : ruleFn;
  const s = new FormSchema<T>(typeValidator);
  s[INTERNAL].addRule(ruleFn);
  return s;
}

export function include<T>(form: Form<T>, schema: FormSchema<T>) {
  checkSchemaContext('include');
  includeInternal(form, schema);
}

export function rule<T>(
  form: Form<T>,
  definition: FormRuleDefinition<T> | FormRuleDefinition<T>[],
) {
  checkSchemaContext('rule');
  ruleInternal(form, definition);
}

export function each<T>(form: Form<T>, ruleFn: FormEachRule<T>) {
  checkSchemaContext('each');
  eachInternal(form, (...args) => {
    //isInSchemaContext = true;
    ruleFn(...args);
  });
}

export function runInSchemaContext(fn: () => unknown) {
  const origIsInSchemaContext = isInSchemaContext;
  isInSchemaContext = true;
  try {
    return fn();
  } finally {
    isInSchemaContext = origIsInSchemaContext;
  }
}

function includeInternal<T>(
  form: Form<T>,
  schema: FormSchema<T> | ((form: Form<T>) => FormSchema<T>),
) {
  schema = typeof schema === 'function' ? schema(form) : schema;
  // Run the schema's rule functions.
  for (const ruleFn of schema[INTERNAL].rules) {
    ruleFn(form);
  }
  // Then apply any child schemas as rules to their respective child forms.
  for (const property of schema[INTERNAL].propertyKeys()) {
    const childForm = form[property as keyof Form<T>] as Form<T[keyof T]>;
    const childSchema = schema[INTERNAL].getProperty(property);
    includeInternal(childForm, childSchema);
  }
}

function ruleInternal<T>(
  form: Form<T>,
  definition: FormRuleDefinition<T> | FormRuleDefinition<T>[],
) {
  for (const def of Array.isArray(definition) ? definition : [definition]) {
    form[INTERNAL].logic.add(typeof def === 'function' ? def(form) : def);
  }
}

function eachInternal<T>(form: Form<T>, ruleFn: FormEachRule<T>) {
  // Add the child rule to the form so the form ca add it to new child forms that it creates.
  form[INTERNAL].childRules.push(ruleFn);
  // Then apply the rule to all existing child forms.
  // TODO: why doesn't `Object.keys` work here? probably nuking some well-known symbol on the proxy.
  for (const property of Reflect.ownKeys(form)) {
    const childForm = form[property as keyof Form<T>] as Form<T[Keys<T>]>;
    ruleFn(childForm, property as Keys<T>);
  }
}

function checkSchemaContext(name: string) {
  if (!isInSchemaContext) {
    throw Error(`\`${name}\` can only be called inside \`schema\``);
  }
}
