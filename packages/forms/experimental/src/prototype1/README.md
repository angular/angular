# Notes

## Overview

- Build up a schema to represent our form by calling `group()` and `field()`. For example:

  ```ts
  const nameSchema = group({
    first: field(''),
    last: field('')
  })
  ```

- Each piece of the schema produced by `group()` and `field()` has methods to specify logic for that
  part of the schema, e.g. `disabled()`, `validate()`, etc. These generally take the form of a
  function that accepts the current value as a signal and produces a result. When the form is
  created these functions are wrapped inside `computed()` calls, so it is reactive based on any
  signal reads (either the passed in value signal, or external signals)

  ```ts
  field(0).validate(value => value() > 9 ? 'too big' : null)
  ```

- The schema pieces have a speical method called `xlink()` that allows defining reactive logic that
  crosslinks fields in that schema.

  ```ts
  const nameSchema = group({
    first: field(''),
    last: field('')
  }).xlink({
    last: (schema, form) => schema
      .validate(value => form.first.$() === value() ? 'cannot be the same as your first name' : '')
  })
  ```

- Pieces of pre-defined schema can be combined into a bigger schema.

  ```ts
  const userSchema = group({
    name: nameSchema,
    address: group({
      street: field(''),
      city: field(''),
      state: field(''),
      zip: field('')
    })
  })
  ```

- Create a form from a schema by calling `form()` and optionally passing values to bind in.

  ```ts
  const nameForm = form(nameSchema, {first: 'John', last: 'Doe'});
  ```

- The form mimics the structure of the data and has a special property (`$`), to access the data at
  that point in the form as a signal.

  ```ts
  const nameSignal = nameForm.$;
  const firstNameSignal = nameForm.first.$;
  nameSignal() // => {first: 'John', last: 'Doe'}
  nameSignal.set({first: 'Bob', last: 'Loblaw'});
  firstNameSignal() // => 'Bob'
  ```

- In addition to itself being a signal to get/set the value of the field, the `$` object also has
  properties representing metadata about the field as (readonly?) signals.

  ```ts
  const firstNameDisabledSignal = nameForm.first.$.disabled;
  firstNameDisabledSignal() // => false
  ```

## Open questions

- What about...
  - Dynamic arrays
  - Dynamic groups
  - Static arrays? (aka tuples)
- What should be included in the schema? Other fws & libraries I've looked at so far seem to use the
  schema for just the validation, but we could include more. Which of these would be useful?
  - Validation
  - Disabled/readonly
  - Hidden/shown
  - Initial value
  - Label
  - Placeholder
  - Options (e.g. for select / chips)
- What is the best way to handle metadata that is associated with a validator, but needed even when
  the validator is not in an error state. (e.g. if there is a required validator I may want to show
  a `*` next to the field even when its valid)
- How do we handle an optional group (i.e. making the value of the group `undefined` rather than an
  object full of empty string properties.) - more generally how do we handle union types
- Do we care that people could call something like `.min()` on a string field even though it really
  only makes sense for a number field.
- Is `xlink` useful or just going to cause people to introduce cycles into their reactivity graph
- Is it worth it to offer zod / yup / ... as options for building the schema, and how exactly would
  that work considering that our schema captures more than just the type and validity of the field?
- Probably would want a pipelined api rather than a fluent one so that people only need to load the
  bits they're using.
- Lots more I'm sure
