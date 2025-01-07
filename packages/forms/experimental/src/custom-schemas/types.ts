export interface Address {
  address1: string;
  address2?: string;
  zip: number;
}

export interface Passwords {
  password: string;
  confirmationPassword: string;
}

export interface BillingAddress {
  isSameAsBilling: boolean;
  address: Address;
}

export interface UserFormData {
  username: string;
  passwords: Passwords;
  shippingAddress: Address;
  billingAddress: BillingAddress;
  languages: string[];
}

import {FormGroup, FormControl, FormArray} from '@angular/forms';

// Helper type to handle optional fields
type OptionalToNullable<T> = T extends undefined ? never : T extends object ? T : T | null;

// Recursive type to convert any type to its corresponding Form type
export type ToFormGroup<T> = {
  [K in keyof T]-?: T[K] extends Array<infer U>
    ? FormArray<FormControl<U>>
    : T[K] extends Record<string, any>
      ? FormGroup<ToFormGroup<T[K]>>
      : FormControl<OptionalToNullable<T[K]>>;
};

// The final UserFormGroup type using the recursive ToFormGroup type
export interface UserFormGroup extends FormGroup<ToFormGroup<UserFormData>> {}
