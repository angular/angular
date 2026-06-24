The `@switch` block is inspired by the JavaScript `switch` statement:

## Syntax

```angular-html
@switch (condition) {
  @case (caseA) {
    Case A.
  }
  @case (caseB) {
    Case B.
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

**`@switch` does not have fallthrough**, so you do not need an equivalent to a `break` or `return`
statement.
