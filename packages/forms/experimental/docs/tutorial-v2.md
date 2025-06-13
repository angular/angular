# Signal Form Version 2 Tutorial

## 🚧🚧 This design is still work in progress

> This tutorial assumes you are familiar with the previous iteration of forms
> and takes it from there.

We're still in early stages but wanted to get feedback as early as possible.

## Changes to existing APIs

### `.$state` is now `()`

```typescript
const cat = signal({
  name: 'pirojok the cat',
  age: 5
})

const f = form(cat)

// Before
console.log(f.name.$state.errors())
console.log(f.$state.valid())
// Now
console.log(f.name().errors())
console.log(f().valid())
console.log(f.a.b.c.d.e().errors())
```

### `resolve()` is now `fieldOf`/`stateOf`/`valueOf`

We got rid of `resolve` and introduced new ways of accessing a field and its
state.

```typescript
const cat = signal({
  name: 'pirojok the cat',
  age: 5
});

// Before
validate(p.name, ({value, resolve}) => {
  value();                                // string, 'pirojok the cat'
  resolve(p.name).$state.disabled();      // boolean
  resolve(p.age);                         // Field<number>
  resolve(p.age).$state;                  // FieldState<number>
  resolve(p.age).$state.value();          // number, 5
});

// Now
validate(p.name, ({value, state, field, valueOf, stateOf, fieldOf}) => {
  value();                                // string, 'pirojok the cat'
  state().disabled();                     // boolean
  fieldOf(p.age);                         // Field<number>
  stateOf(p.age);                         // FieldState<number>
  valueOf(p.age);                         // number, 5
});
```

### `Schema<T>` type is now `schema<T>()` function

This would allow us to have more control:

```typescript
// Before
export const newCatSchema: Schema<Cat> = (cat) => {
  required(cat.name);
}

// Now
export const catSchema = schema<Cat>((cat) => {
  required(cat.name);
});
```

### [field] directive is now [control]

```typescript
// Before
import {FieldDirective} from '@angular/forms/experimental';

@Component({
  imports: [FieldDirective],
  template: `<input [field]="cat.name" matInput>`
})
class CatComponent {
}

// After
import {Control} from '@angular/forms/experimental';

@Component({
  imports: [Control],
  template: `<input [control]="cat.name" matInput>`
})
class CatComponent {
}
```

### New validation statuses

```typescript
// Existing API. Note: its value can now be false while async validators are running.
form.name().valid();

// New: True when all sync validators produced no errors.
form.name().syncValid();
// New: True when async validation is running.
form.name().pending();
// New: True when at least one validator failed.
form.name().invalid();
```

### Form must be created in Injection Context

Creating a form now requires an injection context. This allows for injecting
services directly within the schema.

```typescript
const catSchema = schema<Cat>(c => {
  const service = inject(CatService);
});
```

You can also pass injector to the form:

```typescript
const f = form(
    data,
    schema,
    {injector: TestBed.inject(Injector)},
);
```

## Built-in validators

We added the same set of built-in validations as in current forms.

```typescript
// feedback.ts
/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    /* ... */
    required(path.password);
    minLength(path.password, 8);
    maxLength(path.password, 16);
    min(path.amount, 0);
    max(path.amount, 25);
    pattern(path.username, '\w+');
    email(path.email);
  });
}
```

## Dirty state

You can check dirty state for the form (`form().dirty()`) or any of its
children (`form.name().dirty()`).

> A field is considered dirty if its value has ever been changed by a user.

With this, we can make this component usable in a `canDeactivate` guard.

```typescript
export interface HasUnsavedChanges {
  isDirty: () => boolean;
}

/* ... */
export class FeedbackComponent implements HasUnsavedChanges {
  /* ... */
  isDirty(): boolean {
    return this.form().dirty();
  }
}
```

We'll leave adding `canDeactivate` as an exercise to the reader.

> There is no pristine state; let us know if it might be useful.

## Async validation

There are several different options available for async validation.

### validateHttp

If we have an HTTP endpoint, we can use `validateHttp` which uses httpResource
under the hood.

```typescript
validateHttp(p.username, {
  request: ({value}) => `/api/usernameTaken?${value()}`,
  errors: (result) => {
    return result ? [{kind: 'notUnique'}] : undefined;
  },
});
```

### validateAsync

> This is a lower-level primitive for most cases `validateHttp` should be
> enough.  
> We're also working on adding `validateGrpc`

Let's create an async function that validates the name asynchronously:

```typescript
function validateName(name: string) {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(name === 'sundar');
    }, 1000);
  });
}
```

Now we can use the new `validateAsync` rule.

```typescript
validateAsync(path.name, {
  // Reactive params
  params: ({value}) => value(),
  // Factory creating a resource
  factory: (params) =>
      resource({
        params,
        loader: async ({params}) => {
          return new Promise<boolean>((resolve) => {
            setTimeout(() => {
              resolve(params === 'sundar');
            }, 1000);
          });
        },
      }),
  // Maps resource to error
  errors: (result) => {
    return result ? [{kind: 'notUnique'}] : undefined;
  },
});
```

### Fetching dynamic data

Sometimes we need to fetch data based on the value of a field.

In our case, we can have the user select a product, and then fetch the list of
versions
based on selected product:
[Product] [Version]

First we create and export a global `DataKey` which we can later attach to a
field.

```typescript
// product.service.ts
import {ResourceRef} from '@angular/core';
import {DataKey} from '@angular/forms/experimental';

// Each product would have a list of available versions, e.g. [1, 2, 3]
export const VERSIONS_KEY = new DataKey<ResourceRef<number[]>>();
```

Then, let's create a separate schema for a product.

```typescript
// product.service.ts
import {ResourceRef} from '@angular/core';
import {schema} from '@angular/forms/experimental';

export const VERSIONS_KEY = new DataKey<ResourceRef<number[]>>();

export interface Product {
  name: string;
  version: number;
}

export const productSchema = schema<Product>((path) => {
  required(path.name);
  required(path.version);
});
```

Since forms must be created in an injection context, we can now inject a
service:

```typescript
// product.service.ts
import {ResourceRef, inject} from '@angular/core';
import {schema, required} from '@angular/forms/experimental';

export const VERSIONS_KEY = new DataKey<ResourceRef<number[]>>();

export const productSchema = schema<Product>((path) => {
  const service = inject(ProductService); // You can create this service yourself.

  required(path.name);
  required(path.version);
});
```

Now we can use `define` rule to attach a resource to the `product.name` field.

```typescript
// product.service.ts
import {ResourceRef, inject, resource} from '@angular/core';
import {schema, required, define} from '@angular/forms/experimental';

export const VERSIONS_KEY = new DataKey<ResourceRef<number[]>>();

export const productSchema = schema<Product>((path) => {
  const service = inject(ProductService);
  required(path.name);
  required(path.version);

  define(
      // We attach the data to name
      path.name,
      // Here we create a regular resource
      ({value}) => {
        return resource({
          params: () => value(),
          loader: ({params}) => service.getVersions(params),
        });
      },
      // This allows us to get the data outside the schema.
      {asKey: VERSIONS_KEY},
  );
});
```

Now we can get this data in the component using the `data()` method.

```typescript
// feedback.ts
import {VERSIONS_KEY} from './product.service';

/* ... */
export class FeedbackComponent {
  /* ... */
  form = form(this.data, (path) => {
    /* ... */
    // We also have to wire up the schema using apply.
    apply(path.product, productSchema);
  })

  readonly versions = this.form.product.name().data(VERSIONS_KEY); // This is ResourceRef<number[]>

}
```

Now we can use the resulting resource in the template.

```html

<mat-select [control]="form.product.version">
  @if (versions?.isLoading()) {
  <mat-option disabled>Loading...</mat-option>
  }
  @if (versions?.hasValue()) {
  @for (version of versions.value(); track version) {
  <mat-option [value]="version">{{ version }}</mat-option>
  }
  }
</mat-select>
```

## Disabled reason

When we disable a field, we can now return a string explaining why the field is
disabled:

```typescript
disabled(path.feedback, ({valueOf}) => {
  const rating = valueOf(path.rating);
  // Instead of a boolean, you can now return a `string` reason
  return rating > 4 ? false : 'Please provide a better rating to enable feedback';
});
```

Now we can access `disabledReasons` from the field using
`form.feedback().disabledReasons()`.

```html
<mat-form-field appearance="outline">
  <mat-label>Feedback</mat-label>
  <input [control]="form.feedback" matInput>
  @if( form.feedback().disabled() ) {
  <mat-hint>
  {{ form.feedback().disabledReasons()[0].reason }}
  </mat-hint>
  }
</mat-form-field>
```

> The disabled reason propagates down to its children in the same way the
> disabled state does.

## validateTree

`validateTree` allows running validation on a group field and attaching the
errors to specific child fields. Let's rewrite our matching password validation
to display the error on both fields.

```typescript
export function confirmationPasswordValidator(
    path: FieldPath<{ password: string; confirmationPassword: string }>,
): TreeValidator<{ password: string; confirmationPassword: string }> {
  return ({valueOf, fieldOf}) => {
    return valueOf(path.confirmationPassword) === valueOf(path.password)
        ? []
        : [
          {
            field: fieldOf(path.confirmationPassword),
            kind: 'confirmationPassword',
          },
          {
            field: fieldOf(path.password),
            kind: 'confirmationPassword',
          },
        ];
  };
}
```

Then we can use the new `validateTree` rule:

```typescript
// Before
validate(path, confirmationPasswordValidator(path));
// Now
validateTree(path, confirmationPasswordValidator(path));
```

Now both fields will have the `confirmationPassword` error.

## Readonly

The new `readonly` rule is very similar to `disabled`:

```typescript
import {
  /* ... */
  readonly,
} from '@angular/forms/experimental';

/* ... */
export class FeedbackComponent {
  /* ... */
  readonly form = form(this.data, (path) => {
    /* ... */
    readonly(path.feedback, ({valueOf}) => {
      return valueOf(path.rating) > 4;
    });
  });
}
```

> There is currently no `readonly reason`; let us know if there's a use case for
> having it.

### Tracking in array

We need to `track` items in an array to preserve `touched` status when they are
moved around.

We can't use item instance, because updating a property (using a spread
operator) would create a new instance change it.

We added basic array tracking by attaching a speaci to objects  