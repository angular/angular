# Signal inputs

Signal inputs are an alternative approach to `@Input()`.

<div class="alert is-helpful">

Signal inputs are currently in [developer preview](/guide/releases#developer-preview).
API might change without deprecation.

</div>

## What are signal inputs?

Signal inputs are an alternative to decorator-based `@Input()` directive inputs.
They are tightly integrated with the [signals library](/guide/signals) and provide numerous benefits:

1. Signal inputs are more **type safe**:
  <br/>• Required inputs do not require initial values, or tricks to tell TypeScript that an input _always_ has a value.
  <br/>• Transforms are automatically checked to match the accepted input values.
2. Signal inputs, when used in templates, will **automatically** mark `OnPush` components as dirty.
3. Values can be easily **derived** whenever an input changes using `computed`.

## Overview

Conceptually, signal inputs are similar to the inputs you already know with `@Input`.

The difference is that you no longer use a decorator to declare an input, but instead the input is automatically recognized by Angular whenever you use the `input` or `input.required` functions as initializer of class members.

```typescript
import {Component, input} from '@angular/core';

@Component({...})
export class MyComp {
  firstName = input<string>();         // InputSignal<string|undefined>
  lastName = input.required<string>(); // InputSignal<string>

  age = input(0);                      // InputSignal<number>
}
```

## Types of inputs

With signal inputs we have a more clear distinction of possible input variants.
Angular supports:

* Optional inputs that _can_ have an initial value (see `age` above).
* Required inputs that always have a value of the given type.

These two variants are available by the `input` and `input.required` functions exposed by `@angular/core`.

## Using in templates

Signal inputs are non-writable signals.
As with signals declared via `signal()`, you access the current value of the input by calling the input signal.

This access to the the value is captured in reactive contexts and can notify active consumers, like Angular itself, whenever the input value changes.

```html
<p>First name: {{firstName()}}</p>
<p>Last name: {{lastName()}}</p>
```

An input signal in practice is a trivial extension of signals that were mentioned in [the signals library guide](/guide/signals).

```typescript
export class InputSignal<T> extends Signal<T> { ... }`.
```

## Deriving values

Similar to normal signals, you can derive values from inputs using `computed`.
Computed signals memoize values.
See more details in the [dedicated section for computed](/guide/signals#computed-signals).

```typescript
import {Component, input, computed} from '@angular/core';

@Component({...})
export class MyComp {
  age = input(0);

  // age multiplied by two.
  ageMultiplied = computed(() => this.age() * 2);
}
```

## Monitoring changes

Previously, with `@Input` it was rather difficult to monitor whenever an is input changing.
Users monitored inputs using the `ngOnChanges` lifecycle hook, or making use of setters to perform logic whenever the input changes.

With signal inputs, users can make use of the `effect` function to run logic whenever the input changes.
For example, issuing HTTP requests whenever the first name, or last name inputs change.

```typescript
import {input, effect} from '@angular/core';

class MyComp {
  firstName = input.required<string>();

  constructor() {
    effect(() => {
      this.fetchUserFromDatabase(this.firstName());
    });
  }
}
```

The `fetchUserFromDatabase` function is invoked every time the `firstName` input changes.
This will happen as soon as `firstName` is available, and for subsequent changes during the lifetime of `MyComp`.

## Aliasing an input

Inputs can be aliased in case the name of the input cannot match the class member name.

```typescript
class MyComp {
  _rawAge = input(0, {alias: 'age'});
}
```

With the example above, you will use `this._rawAge` inside your component or template.
Consumers of `MyComp` can bind to `[age]` using Angular's input binding syntax.

## Value transforms

You may want to coerce or parse input values without changing the meaning of the input.
Transforms convert the raw value from parent templates to the expected input type.
Transforms should be [pure functions](https://en.wikipedia.org/wiki/Pure_function).

<div class="alert is-important">

Do not use transforms if they change the meaning of the input, or if they are [impure](https://en.wikipedia.org/wiki/Pure_function).

Instead, consider using a `computed` for transformations with different meaning, or an `effect` for impure code that should run whenever the input changes.

</div>

In some cases though, value transforms are a good fit for input.
Consider an input for `disabled` that is accepting `boolean` values.

```typescript
class MyCustomComp {
  disabled = input(false); // InputSignal<boolean>
}
```

Inside your component, you expected `disabled` to be either `true` or `false`.
On the other hand though, users of your component may pass an empty string in templates, as a shorthand, and expect that to be treated as `true`.

```html
<my-custom-comp disabled>
```

This will **fail** type checking because an empty string is not assignable to a `boolean`.
As a component author, you can decide to explicitly support this shorthand by adding a value transform, or by [deriving](#deriving-values) a boolean using `computed`.

```typescript
class MyComp {
  disabled = input(false, {
    transform: (v: boolean|string) => v === '' || v,
  });

  // or alternatively:
  disabledRaw = input<string|boolean>(false, {alias: 'disabled'});
  disabled = computed(() => this.disabled() === '' || !!this.disabled());
}
```

The first approach is more concise and transforms are built exactly for such use-cases.

An import note is that the `disabled` input with a `transform` will automatically accept `boolean` and `string` values based on the transform `v: boolean|string` parameter.
