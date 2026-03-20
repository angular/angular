The `@switch` block is inspired by the JavaScript `switch` statement:

## Syntax

```angular-html
@switch (condition) {
  @case (caseA) {
    Case A.
  }
  @case (caseB)
  @case (caseC) {
    Case B or C.
  }
  @default {
    Default case.
  }
}
```

## Description

The `@switch` blocks displays content selected by one of the cases matching against the conditional
expression. The value of the conditional expression is compared to the case expression using
the `===` operator.

The `@default` block is optional and can be omitted. If no `@case` matches the expression and there
is no `@default` block, nothing is shown.

You can specify multiple conditions for a single block by having consecutive `@case(...)` statements.

**`@switch` does not have fallthrough**, so you do not need an equivalent to a `break` or `return`
statement.

### Exhaustive type checking

`@switch` supports exhaustive type checking, allowing Angular to verify at compile time that all possible values of a union type are handled.

By using `@default never;`, you explicitly declare that no remaining cases should exist. If the union type is later extended and a new case is not covered by an @case, Angular’s template type checker will report an error, helping you catch missing branches early.

```angular-html
@Component({
  template: `
    @switch (state) {
      @case ('loggedOut') {
        <button>Login</button>
      }

      @case ('loggedIn') {
        <p>Welcome back!</p>
      }

      @default never; // throws because `@case ('loading')` is missing
    }
  `,
})
export class AppComponent {
  state: 'loggedOut' | 'loading' | 'loggedIn' = 'loggedOut';
}
```
