Validators?

- function that makes errors
- "expectation object"
- boolean function + separate error function
- short circuiting?

Error?

- error message? (i18n)
- id?
- typed?
- priority? order?

{message: 'error'}

- errors are objects

form<ErrorT = ?>(

)

```ts

interface FormError {
  kind: string;
  message?: string;
}
validate(p.field, (v) => v.length == 0 ? {key: 'not_long_enough'} : false);
validate(p.field, (v) => v.length == 0 ? new MyFormError(...) : undefined);
validate(p.field, (v) => FormError|FormError[]|undefined);
error(p.field, () => ..., 'err!')

required(p.field); // i'm required yo
required(p.field, 'message')
```

```html

@if (field.hasError('required')) {
  ...
}

@switch (error.kind) {
  @case ('required') {
    This thing is required!
  }
  @case ('not_long_enough') {
    <fancy-error>'<span>{{ value() }}</span>' is not long enough</fancy-error>
  }
}

<mat-form-field>
  @for (let error of field.errors()) {
    <mat-error>{{ error() }}
  }
</mat-form-field>

<mat-form-field [field]="f.address.street">
  <ng-template let-error matFormFieldError>
    {{ error.whatever }}
  </ng-template>
</mat-form-field>

```

```ts

validate(p.field, (v) => v.length === 0, (v) => `${v} is error`);

validate(p.field, (v) => v.length > 0 | {... err});

range(p.field, 5, 10);
  // sets a validator, AND sets <input min, max>

min(p.field, 5, ...);
required(p.field, (v) => v.length > 0);  // If I don't care about an error message
validate(p.field, (v) => {
  if (v.oneThing) {
    return '...';
  }
  if (v.twoThings) {
    if (v.thirdThing) {
      return ['...', '...'];
    }
    return '...';
  }
  // okay
});

validate(p.field, {
  id: 'required',
  check: (v) => v.length > 0,
  because: (v) => `${v} is not valid`,
});

disabled(p.field, {
  check: (v) => v.length > 0,
  message: (v) => `${v} is not enabled`,
});

disabled(p.field, (v) => bool, 'message');

validate(p.field, (v) => v.length === 0 ? FAIL : undefined);

f.valid() // Signal<what is this?>
f.errors() // Signal<?>

f.expectations() // what am i being checked against?

```
