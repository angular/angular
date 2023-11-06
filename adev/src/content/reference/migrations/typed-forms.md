# Typed Forms Migration

As of Angular 14, reactive forms are strictly typed by default.

## Overview of Typed Forms

<docs-video src="https://www.youtube.com/embed/L-odCf4MfJc" title="Angular Typed Forms"/>

With Angular reactive forms, you explicitly specify a *form model*. As a simple example, consider this basic user login form:

```ts
const login = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
});
```

Angular provides many APIs for interacting with this `FormGroup`. For example, you may call `login.value`, `login.controls`, `login.patchValue`, etc. (For a full API reference, see the [API documentation](api/forms/FormGroup).)

In previous Angular versions, most of these APIs included `any` somewhere in their types, and interacting with the structure of the controls, or the values themselves, was not type-safe. For example: you could write the following invalid code:

```ts
const emailDomain = login.value.email.domain;
```

With strictly typed reactive forms, the above code does not compile, because there is no `domain` property on `email`.

In addition to the added safety, the types enable a variety of other improvements, such as better autocomplete in IDEs, and an explicit way to specify form structure.

These improvements currently apply only to *reactive* forms (not [*template-driven* forms](guide/forms/template-driven-forms)).

## Automated Untyped Forms Migration

When upgrading to Angular 14, an included migration will automatically replace all the forms classes in your code with corresponding untyped versions. For example, the snippet from above would become:

```ts
const login = new UntypedFormGroup({
    email: new UntypedFormControl(''),
    password: new UntypedFormControl(''),
});
```

Each `Untyped` symbol has exactly the same semantics as in previous Angular versions, so your application should continue to compile as before. By removing the `Untyped` prefixes, you can incrementally enable the types.
