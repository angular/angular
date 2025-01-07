import {FormControl, FormGroup, AbstractControl, FormArray} from '@angular/forms';
import * as yup from 'yup';
import {ToFormGroup} from '../types';

type FormGroupType = {[key: string]: AbstractControl<any>};

export type YupToForm<T> = FormGroup<ToFormGroup<T>>;
export function convertYupToForm<T extends yup.Schema<any>>(
  schema: T,
  value: unknown = null,
): YupToForm<T> {
  if (isObjectSchema(schema)) {
    const fields = schema.fields;
    const group: FormGroupType = {};

    for (const [key, fieldSchema] of Object.entries(fields)) {
      if (fieldSchema && typeof fieldSchema === 'object') {
        const propValue = value && typeof value === 'object' ? (value as any)[key] : null;
        group[key] = convertYupToForm(fieldSchema as yup.Schema<any>, propValue);
      }
    }

    return new FormGroup(group) as any;
  }

  if (isArraySchema(schema)) {
    const formArray = new FormArray<AbstractControl>([]);
    if (Array.isArray(value)) {
      const innerSchema = schema.innerType as yup.Schema<any>;
      for (const item of value) {
        formArray.push(convertYupToForm(innerSchema, item));
      }
    }
    return formArray as any;
  }

  return new FormControl(value ?? null) as any;
}

export function yupToFormGroup<T, E>(schema: yup.Schema<T>, value: any): YupToForm<T> {
  const result = convertYupToForm(schema, value);
  result.setValue(value);

  result.setValidators(() => {
    try {
      schema.validateSync(result.value, {abortEarly: false});
      return null;
    } catch (error: unknown) {
      if (error instanceof yup.ValidationError) {
        console.log(error);

        if (result instanceof FormGroup) {
          for (const err of error.inner) {
            if (err.path) {
              const control = result.get(err.path);
              if (control) {
                control.setErrors({[err.type ?? 'validation']: err.message});
              }
            }
          }
        }
        return {validation: error.message};
      }
      return null;
    }
  });

  return result as any;
}

function isObjectSchema(schema: yup.Schema<any>): schema is yup.ObjectSchema<any> {
  return schema.type === 'object';
}

function isArraySchema(schema: yup.Schema<any>): schema is yup.ArraySchema<any, any> {
  return schema.type === 'array';
}
