import {FormControl, FormGroup, AbstractControl, FormArray} from '@angular/forms';
import Ajv, {JSONSchemaType, ValidateFunction} from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import {ToFormGroup} from '../types';

const ajv = new Ajv({allErrors: true});
addFormats(ajv);
addErrors(ajv);

type FormGroupType = {[key: string]: AbstractControl<any>};

interface ObjectSchema {
  type: 'object';
  properties: Record<string, JSONSchemaType<any>>;
}

interface ArraySchema {
  type: 'array';
  items: JSONSchemaType<any>;
}

export type AjvToForm<T> = FormGroup<ToFormGroup<T>>;

export function convertAjvToForm<T>(
  schema: JSONSchemaType<T>,
  value: unknown = null,
): AjvToForm<T> {
  if (schema.type === 'object' && 'properties' in schema) {
    const group: FormGroupType = {};

    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const propValue = value && typeof value === 'object' ? (value as any)[key] : null;
      group[key] = convertAjvToForm(propSchema as JSONSchemaType<any>, propValue);
    }

    return new FormGroup(group) as any;
  }

  if (schema.type === 'array' && 'items' in schema) {
    const formArray = new FormArray<AbstractControl>([]);
    if (Array.isArray(value)) {
      for (const item of value) {
        formArray.push(convertAjvToForm(schema.items as JSONSchemaType<any>, item));
      }
    }
    return formArray as any;
  }

  return new FormControl(value ?? null) as any;
}

export function ajvToFormGroup<T>(schema: JSONSchemaType<T>, value: unknown = null): AjvToForm<T> {
  const validate: ValidateFunction = ajv.compile(schema);
  const result = convertAjvToForm(schema, value);

  if (!(result instanceof FormGroup)) {
    throw new Error('Root schema must be an object type');
  }

  if (value && typeof value === 'object') {
    (result as FormGroup).patchValue(value);
  }

  result.setValidators(() => {
    const valid = validate(result.value);
    if (valid) {
      return null;
    }

    if (validate.errors) {
      for (const error of validate.errors) {
        const path = error.instancePath.split('/').filter(Boolean);
        if (path.length > 0) {
          const control = result.get(path.join('.'));
          if (control) {
            control.setErrors({[error.keyword]: error.message});
          }
        }
      }
    }

    return {validation: validate.errors?.[0]?.message || 'Validation failed'};
  });

  return result as AjvToForm<T>;
}
