import { type Form, type Keys } from './form';
import { INTERNAL } from './internal';
import { FormLogic } from './logic';
import { type TypeValidator } from './type-validator';

let isInSchemaContext = false;

export type FormRule<T> =
  | Partial<FormLogic<T>>
  | FormSchema<T>
  | ((form: Form<T>) => Partial<FormLogic<T>> | FormSchema<T>);

export type FormEachRule<T> =
  | Partial<FormLogic<T[Keys<T>]>>
  | FormSchema<T[Keys<T>]>
  | ((
      form: Form<T[Keys<T>]>,
      key: Keys<T>,
    ) => Partial<FormLogic<T[Keys<T>]>> | FormSchema<T[Keys<T>]>);

export class FormSchema<T> {
  private properties = {} as T extends Record<PropertyKey, unknown>
    ? { [K in Keys<T>]: FormSchema<T[K]> }
    : {};

  constructor(
    private typeValidator?: TypeValidator<T>,
    private base?: FormSchema<T>,
  ) {
    this[INTERNAL].typeValidator = typeValidator;
    this[INTERNAL].logic = [...(base?.[INTERNAL].logic ?? [])];
  }

  extend(definition: (root: Form<T>) => void) {
    const s = new FormSchema(this.typeValidator, this);
    s[INTERNAL].addLogic(definition);
    return s;
  }

  [INTERNAL] = {
    typeValidator: undefined as TypeValidator<T> | undefined,

    logic: [] as ((from: Form<T>) => void)[],

    addLogic: (definition?: (root: Form<T>) => void) => {
      if (definition === undefined) {
        return;
      }
      this[INTERNAL].logic.push((f) => {
        isInSchemaContext = true;
        definition(f);
        isInSchemaContext = false;
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
export function schema<T>(definition: (root: Form<T>) => void): FormSchema<T>;
export function schema<T>(
  typeValidator: TypeValidator<T>,
  definition: (root: Form<T>) => void,
): FormSchema<T>;
export function schema<T>(
  typeValidatorOrDefinition?: TypeValidator<T> | ((root: Form<T>) => void),
  definition?: (root: Form<T>) => void,
): FormSchema<T> {
  const typeValidator: TypeValidator<T> | undefined =
    typeof typeValidatorOrDefinition === 'function' ? undefined : typeValidatorOrDefinition;
  definition =
    typeof typeValidatorOrDefinition === 'function' ? typeValidatorOrDefinition : definition;
  const s = new FormSchema<T>(typeValidator);
  s[INTERNAL].addLogic(definition);
  return s;
}

export function rule<T>(form: Form<T>, newRule: FormRule<T> | FormRule<T>[]) {
  checkSchemaContext('rule');
  ruleInternal(form, newRule);
}

export function each<T>(form: Form<T>, newRule: FormEachRule<T> | FormEachRule<T>[]) {
  checkSchemaContext('each');
  eachInternal(form, newRule);
}

export function ruleInternal<T>(form: Form<T>, newRule: FormRule<T> | FormRule<T>[]) {
  if (Array.isArray(newRule)) {
    for (const r of newRule) {
      ruleInternal(form, r);
    }
  } else if (typeof newRule === 'function') {
    newRule = newRule(form);
  } else if (newRule instanceof FormSchema) {
    // If the rule is itself a full schema, run the schema's logic instantiation functions.
    for (const instantiateLogic of newRule[INTERNAL].logic) {
      instantiateLogic(form);
    }
    // Then apply any child schemas as rules to their respective child forms.
    for (const property of newRule[INTERNAL].propertyKeys()) {
      const childForm = form[property as keyof Form<T>] as Form<T[keyof T]>;
      const childRule = newRule[INTERNAL].getProperty(property);
      ruleInternal(childForm, childRule);
    }
  } else {
    form[INTERNAL].logic.add(newRule);
  }
}

function eachInternal<T>(form: Form<T>, newRule: FormEachRule<T> | FormEachRule<T>[]) {
  if (Array.isArray(newRule)) {
    for (const r of newRule) {
      eachInternal(form, r);
    }
  } else {
    // Add the child rule to the form so the form ca add it to new child forms that it creates.
    form[INTERNAL].childRules.push(newRule);
    // Then apply the rule to all existing child forms.
    // TODO: why doesn't `Object.keys` work here? probably nuking some well-known symbol on the proxy.
    for (const property of Reflect.ownKeys(form)) {
      const childForm = form[property as keyof Form<T>] as Form<T[Keys<T>]>;
      if (typeof newRule === 'function') {
        newRule = newRule(childForm, property as Keys<T>);
      }
      ruleInternal(childForm, newRule);
    }
  }
}

function checkSchemaContext(name: string) {
  if (!isInSchemaContext) {
    throw Error(`\`${name}\` can only be called inside \`schema\``);
  }
}
