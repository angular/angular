# Signal inputs

Signal inputs allow values to be bound from parent components.
Those values are exposed using a `Signal` and can change during the lifecycle of your component.

HELPFUL: Signal inputs are currently in [developer preview](/reference/releases#developer-preview).

Angular supports two variants of inputs:

**Optional inputs**
Inputs are optional by default, unless you use `input.required`.
You can specify an explicit initial value, or Angular will use `undefined` implicitly.

**Required inputs**
Required inputs always have a value of the given input type.
They are declared using the `input.required` function.

```typescript
import {Component, input} from '@angular/core';

@Component({...})
export class MyComp {
  // optional
  firstName = input<string>();         // InputSignal<string|undefined>
  age = input(0);                      // InputSignal<number>

  // required
  lastName = input.required<string>(); // InputSignal<string>
}
```

An input is automatically recognized by Angular whenever you use the `input` or `input.required` functions as initializer of class members.

## Aliasing an input

Angular uses the class member name as the name of the input.
You can alias inputs to change their public name to be different.

```typescript
class StudentDirective {
  age = input(0, {alias: 'studentAge'});
}
```

This allows users to bind to your input using `[studentAge]`, while inside your component you can access the input values using `this.age`.

## Using in templates

Signal inputs are read-only signals.
As with signals declared via `signal()`, you access the current value of the input by calling the input signal.

```angular-html
<p>First name: {{firstName()}}</p>
<p>Last name: {{lastName()}}</p>
```

This access to the value is captured in reactive contexts and can notify active consumers, like Angular itself, whenever the input value changes.

Using a signal to pass a value to your component you have to access the value in the same way.
```angular-html
<my-component [firstName]="firstName()"/>
```

IMPORTANT: If you use a signal in combination with the @if controlflow, make sure to also add the parentheses to the signal. `@if(mySignal)` will
just check if the signal is defined and will show accordingly (even if the value might be false).
Calling the signal `@if(mySignal())` will look at the value inside of the signal.

An input signal in practice is a trivial extension of signals that you know from [the signals guide](guide/signals).

```typescript
export class InputSignal<T> extends Signal<T> { ... }`.
```

## Deriving values

As with signals, you can derive values from inputs using `computed`.

```typescript
import {Component, input, computed} from '@angular/core';

@Component({...})
export class MyComp {
  age = input(0);

  // age multiplied by two.
  ageMultiplied = computed(() => this.age() * 2);
}
```

Computed signals memoize values.
See more details in the [dedicated section for computed](guide/signals#computed-signals).

## Monitoring changes

With signal inputs, users can leverage the `effect` function.
The function will execute whenever the input changes.

Consider the following example.
The new value is printed to the console whenever the `firstName` input changes.

```typescript
import {input, effect} from '@angular/core';

class MyComp {
  firstName = input.required<string>();

  constructor() {
    effect(() => {
      console.log(this.firstName());
    });
  }
}
```

The `console.log` function is invoked every time the `firstName` input changes.
This will happen as soon as `firstName` is available, and for subsequent changes during the lifetime of `MyComp`.

## Value transforms

You may want to coerce or parse input values without changing the meaning of the input.
Transforms convert the raw value from parent templates to the expected input type.
Transforms should be [pure functions](https://en.wikipedia.org/wiki/Pure_function).

```typescript
class MyComp {
  disabled = input(false, {
    transform: (value: boolean|string) => typeof value === 'string' ? value === '' : value,
  });
}
```

In the example above, you are declaring an input named `disabled` that is accepting values of type `boolean` and `string`.
This is captured by the explicit parameter type of `value` in the `transform` option.
These values are then parsed to a `boolean` with the transform, resulting in booleans.

That way, you are only dealing with `boolean` inside your component when calling `this.disabled()`, while users of your component can pass an empty string as a shorthand to mark your component as disabled.

```angular-html
<my-custom-comp disabled>
```

IMPORTANT: Do not use transforms if they change the meaning of the input, or if they are [impure](https://en.wikipedia.org/wiki/Pure_function#Impure_functions).
Instead, use `computed` for transformations with different meaning, or an `effect` for impure code that should run whenever the input changes.

## Why should we use signal inputs and not `@Input()`?

Signal inputs are a reactive alternative to decorator-based `@Input()`.

In comparison to decorator-based `@Input`, signal inputs provide numerous benefits:

1. Signal inputs are more **type safe**:
  <br/>• Required inputs do not require initial values, or tricks to tell TypeScript that an input _always_ has a value.
  <br/>• Transforms are automatically checked to match the accepted input values.
2. Signal inputs, when used in templates, will **automatically** mark `OnPush` components as dirty.
3. Values can be easily **derived** whenever an input changes using `computed`.
4. Easier and more local monitoring of inputs using `effect` instead of `ngOnChanges` or setters.
