import {validators, form, FormGroup, FormField} from './forms';

/**
 * Here's a fictional form.
 *
 * My focus here is to explore a way to create a form that would be
 * 1. Simple, intuitive
 * 2. Type safe
 * 3. Composable
 * 4. Declarative
 * 5. Familiar to Angular forms users
 *
 * In this file I'll try to use a simple user + password + address form with the following twists:
 * 1. User form with username, password, confirm password, and two addresses: shipping and billing.
 * 2. Passwords must match (we'll need a validator for that)
 * 3. There should be a checkbox, 'Billing address is the same'
 *
 * I'll focus on the dev API, and not the actual implementation.

 */

// Let's start with a simple form
const userForm1 = form.group({
  // Instead of just control and group, i want to play with an idea of having typed fields
  // With fields matching input types (text, password, checkbox, date, etc) + other for drowdowns, etc.
  // This might be good for
  // - typings
  // - dynamic form generation.
  // - Integrating with native form elements (e.g. allowing min and max on a number field)
  username: form.text(),
  password: form.password(''),
  // I like the idea of taking value, and a separate config.
  // It's consistent with the current forms, also less typing for simple forms.
});

// Since we're going to have two password fields (password + confirmationPassword)
// it's time to look at composability.
function password() {
  // This is just a simple password field, with some validators.
  return form.password('', {
    validators: [
      // We can use some build-in validators, which are also type aware.
      // e.g. you can't use maxLength on a number field.
      validators.required(),
      validators.maxLength(20),
      validators.minLength(8),
      // And here's a custom one
      // I think Angular forms validators pretty much got it right.
      // Ideally It should be possible to drop in existing validators.
      (field) => {
        return field.value === 'kevin'
          ? {nokevin: 'password can not be kevin (sorry Kevin)'}
          : null;
      },
    ],
  });
}

// Now let's group two password fields in one.
// The interesting part is the validator which disallows the same password.
// There are 2 approaches we could take.
function passwords() {
  // We can have one password field in a var, and just access it directly.
  const passwordField = password();

  // So with a regular field, we could just pass validators as a second argument.
  // But we want to use custom password field to keep all the validation
  const confirmationPasswordField_ = form.password('', {
    validators: (confirm) => null,
  });

  // But here we want to use custom field.
  // We could just make it take the same args, as form.password, but here
  // I want to play with ability to clone+extends fields, using withConfig method.
  const confirmationPasswordField = password()
    // Name can be better here, but basically here we can provide custom config
    // which would normally be passed as a second argument to the field.
    // Then the field would merge it
    .withConfig({
      validators: (confirm) =>
        confirm.value.length > 1 &&
        // Here access the original password var, it's a bit awkward, but ok.
        passwordField.value?.length > 1 &&
        confirm.value === passwordField.value
          ? null
          : 'passwords do not match',
    });

  // 💡 Alternatively we can go very specific here,
  // And use addValidator (instead of withConfig)
  const confirmationPasswordFieldAlternative = password().addValidator((confirm) =>
    confirm.value.length > 1 &&
    passwordField.value?.length > 1 &&
    confirm.value === passwordField.value
      ? null
      : 'passwords do not match',
  );

  return form.group({
    password: passwordField,
    confirmationPassword: confirmationPasswordField,
  });
}

// 💡here's an alternative way, with inline validation
//
function passwords2() {
  return form.group(
    {
      password: password(),
      confirmationPassword: password(),
    },
    {
      validators: (group) => {
        const {password, confirmationPassword} = group.value;

        return password.length > 1 &&
          confirmationPassword.length > 1 &&
          password === confirmationPassword
          ? null
          : {match: 'passwords do not match'};
        /** 💡 Alternatively: we could return {confirmationPassword: { {match: 'passwords do not match'}  }}
         *  and smartly merge is somehow.
         *
         */
      },
    },
  );
}

// Here's the new form, now it's time to add addresses
const userForm2 = form.group({
  username: form.text(),
  passwords: passwords(),
});

// This is pretty straightforward: we'll use address in 2 places.
function address() {
  return form.group({
    address1: form.text(),
    address2: form.text(),
    // This is an interesting case to think about
    // Zip code is probably more of a string with a pattern validator, than a number
    zip: form.number(),
  });
}

// Billing address would group address with a "same as" which would disable it.
function billingAddress() {
  const isSameAsBilling = form.checkbox();

  const billingAddress = form.group({
    isSameAsBilling,
    address: address().withConfig({
      // Eventually value and disabled both probably be a signal, but i'm not going there now.
      disabled: () => isSameAsBilling.value,
    }),
  });

  return form.group({
    isSameAsBilling,
    address: billingAddress,
  });
}

// 💡Alternatively we can have a disabled function on the group level
// Which would return matching structure, which would be cascaded up/down.
// This is a bit scary, because merging might get confusing fast.
function billingAddress2() {
  const billingAddress = form.group(
    {
      isSameAsBilling: form.checkbox(),
      address: address(),
    },
    {
      // Imperative isDisabeld ? c.disable() : c.enable() in ReactiveForms
      // made me sad LOL
      disabled: (group) =>
        group.value.isSameAsBilling
          ? {
              address: true,
            }
          : false,
    },
  );
}

// We can move out the validator, it'd take some work
// For the typing to be nice.
function isAddressDisabled(
  group: FormGroup<{
    // I'm not super sure if there's an easy way to create a validation
    // For only part of a group.
    isSameAsBilling: FormField<boolean>;
    address: ReturnType<typeof address>;
  }>,
) {
  return {
    address: group.value.isSameAsBilling,
  };
}

function billingAddress3() {
  return form.group(
    {
      isSameAsBilling: form.checkbox(),
      address: address(),
    },
    {
      disabled: isAddressDisabled,
    },
  );
}

// Here's the final form, with all the fields.
const userForm = form.group({
  username: form.text(),
  passwords: passwords(),
  shippingAddress: address(),
  billingAddress: billingAddress(),
});

// This is to hide unused var warning, without polluting the doc with tsignores
console.log(userForm, userForm1, userForm2, billingAddress2, billingAddress3);
