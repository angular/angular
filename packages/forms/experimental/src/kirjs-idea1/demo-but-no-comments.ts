import {form, FormField, FormGroup} from './forms';
import {validators} from './forms';

function password() {
  return form.password('', {
    validators: [validators.maxLength(20), validators.minLength(8), noKevinValidator],
  });
}

function passwords() {
  return form.group(
    {
      password: password(),
      confirmationPassword: password(),
    },
    {
      validators: passwordsShouldMatchValidator,
    },
  );
}

function address() {
  return form.group({
    address1: form.text(),
    address2: form.text(),
    zip: form.number(),
  });
}

function billingAddress() {
  const isSameAsBilling = form.checkbox();

  return form.group({
    isSameAsBilling,
    address: address().withConfig({
      disabled: () => isSameAsBilling.value,
    }),
  });
}

const userForm = form.group({
  username: form.text(),
  passwords: passwords(),
  shippingAddress: address(),
  billingAddress: billingAddress(),
});

// Validators
function noKevinValidator(password: FormField<string>) {
  return password.value === 'kevin' ? {nokevin: 'password can not be kevin'} : null;
}

function passwordsShouldMatchValidator({
  value,
}: FormGroup<{
  password: FormField<string>;
  confirmationPassword: FormField<string>;
}>) {
  const {password, confirmationPassword} = value;

  return password.length > 1 && confirmationPassword.length > 1 && password === confirmationPassword
    ? null
    : {match: 'passwords do not match'};
}
