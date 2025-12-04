import {InjectionToken} from '@angular/core';

type ErrorMessageFn = (error: any) => string;
type FormErrors = Record<string, ErrorMessageFn>;

export const defaultErrors: FormErrors = {
  required: () => 'This field is required',
  minlength: ({requiredLength}: {requiredLength: number}) => `Minimum length is ${requiredLength}`,
  maxlength: ({requiredLength}: {requiredLength: number}) => `Maximum length is ${requiredLength}`,
  email: () => 'Invalid email address',
};

// Define error messages mapping
export const FORM_ERRORS = new InjectionToken<FormErrors>('FORM_ERRORS', {
  factory: () => defaultErrors,
});
