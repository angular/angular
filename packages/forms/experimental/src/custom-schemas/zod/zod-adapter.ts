import {ZodArray, ZodEffects, ZodObject, ZodOptional, ZodTypeAny} from 'zod';
import {FormControl, FormGroup, AbstractControl, FormArray, ValidationErrors} from '@angular/forms';

export type ZodToForm<T extends ZodTypeAny> =
  T extends ZodObject<infer Shape>
    ? FormGroup<{[K in keyof Shape]: ZodToForm<Shape[K]>}>
    : T extends ZodArray<infer Element>
      ? FormArray<ZodToForm<Element>>
      : T extends ZodEffects<infer Element>
        ? ZodToForm<Element>
        : FormControl<any>;

export function convertZodToForm<T extends ZodTypeAny>(schema: T, value: any = null): ZodToForm<T> {
  // If it's an object schema, create a FormGroup
  if (schema instanceof ZodObject) {
    const shape = schema.shape;
    const group: {
      [key: string]: FormGroup<any> | FormControl<unknown> | FormArray<any>;
    } = {};

    for (const key of Object.keys(shape)) {
      const propSchema = shape[key];
      const propValue = value?.[key] ?? null;
      group[key] = convertZodToForm(propSchema, propValue);
    }

    const formGroup = new FormGroup<any>(group);

    return formGroup as ZodToForm<T>;
  }
  if (schema instanceof ZodEffects) {
    return convertZodToForm(schema.innerType(), value) as ZodToForm<T>;
  }

  if (schema instanceof ZodArray) {
    const formArray = new FormArray<AbstractControl>([]);
    if (value) {
      for (const item of value) {
        formArray.push(convertZodToForm(schema.element, item));
      }
    }
    return formArray as unknown as ZodToForm<T>;
  }

  if (schema instanceof ZodOptional) {
    return convertZodToForm(schema.unwrap(), value) as ZodToForm<T>;
  }

  return new FormControl(value ?? null) as ZodToForm<T>;
}

const zodValidator =
  (schema: ZodTypeAny) =>
  (control: AbstractControl): ValidationErrors | null => {
    try {
      schema.parse(control.value);
      if (control instanceof FormGroup) {
        for (const [key, childControl] of Object.entries(control.controls)) {
          childControl.setErrors(null);
        }
      }
      return null;
    } catch (error: any) {
      if (error.errors) {
        for (const err of error.errors) {
          const path = err.path;
          if (path.length > 0 && control instanceof FormGroup) {
            const pathStr = path.join('.');
            const childControl = control.get(pathStr);

            if (childControl) {
              const code = err.code === 'custom' ? err.params?.code : err.code;
              childControl.setErrors({[code]: err.message});
            }
          }
        }
      }
      return {zodError: error.errors};
    }
  };
export function zodToFormGroup<T extends ZodTypeAny>(schema: T, value: any = null): ZodToForm<T> {
  const result = convertZodToForm(schema, value);
  result.setValue(value);
  result.setValidators(zodValidator(schema));
  result.updateValueAndValidity();
  return result;
}
