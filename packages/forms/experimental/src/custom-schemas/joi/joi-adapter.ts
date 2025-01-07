import * as Joi from 'joi';
import {FormControl, FormGroup, AbstractControl, FormArray, ValidationErrors} from '@angular/forms';

export function convertJoiToForm(schema: Joi.Schema, value: any = null): AbstractControl {
  if (schema.type === 'object') {
    const group: {[key: string]: AbstractControl} = {};
    const keys = (schema as any).$_terms.keys || [];

    for (const keyObj of keys) {
      const key = keyObj.key;
      const propSchema = keyObj.schema;
      const propValue = value?.[key] ?? null;
      group[key] = convertJoiToForm(propSchema, propValue);
    }

    return new FormGroup(group);
  }

  if (schema.type === 'array') {
    const formArray = new FormArray<AbstractControl>([]);
    if (value) {
      for (const item of value) {
        const itemSchema = (schema as any).$_terms.items[0];
        formArray.push(convertJoiToForm(itemSchema, item));
      }
    }
    return formArray;
  }

  return new FormControl(value ?? null);
}

const joiValidator =
  (schema: Joi.Schema) =>
  (control: AbstractControl): ValidationErrors | null => {
    try {
      const {error} = schema.validate(control.value, {abortEarly: false});

      if (!error) {
        if (control instanceof FormGroup) {
          for (const [, childControl] of Object.entries(control.controls)) {
            childControl.setErrors(null);
          }
        }
        return null;
      }

      const errors: ValidationErrors = {};

      for (const detail of error.details) {
        const path = detail.path;
        if (path.length > 0 && control instanceof FormGroup) {
          const pathStr = path.join('.');
          const childControl = control.get(pathStr);

          if (childControl) {
            childControl.setErrors({[detail.type]: detail.message});
          }
        }
        errors[detail.type] = detail.message;
      }

      return errors;
    } catch (error: any) {
      return {joiError: error.message};
    }
  };

export function joiToFormGroup(schema: Joi.Schema, value: any = null): AbstractControl {
  const result = convertJoiToForm(schema, value);
  result.setValue(value);
  result.setValidators(joiValidator(schema));
  result.updateValueAndValidity();
  return result;
}
