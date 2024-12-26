import {FormBuilder, Validators, AbstractControl, ValidationErrors} from '@angular/forms';

const fb = new FormBuilder();

function noKevinValidator(control: AbstractControl): ValidationErrors | null {
  return control.value === 'kevin' ? {nokevin: 'password can not be kevin'} : null;
}

function createPassword() {
  return ['', [Validators.maxLength(20), Validators.minLength(8), noKevinValidator]];
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmationPassword')?.value;

  return password?.length > 1 && confirmPassword?.length > 1 && password === confirmPassword
    ? null
    : {passwordsMatch: 'Passwords do not match'};
}

function createPasswordsGroup() {
  return fb.group(
    {
      password: createPassword(),
      confirmationPassword: createPassword(),
    },
    {validators: passwordsMatchValidator},
  );
}

function createAddress() {
  return fb.group({
    address1: [''],
    address2: [''],
    zip: [null],
  });
}

export function createUserForm() {
  return fb.group({
    username: [''],
    passwords: createPasswordsGroup(),
    shippingAddress: createAddress(),
    billingAddress: fb.group({
      isSameAsBilling: [false],
      address: createAddress(),
    }),
  });
}

// Also somewhere in constructor
userForm.get('billingAddress.isSameAsBilling')?.valueChanges.subscribe((isChecked) => {
  const address = userForm.get('billingAddress.address');
  isChecked ? address?.disable() : address?.enable();
});
