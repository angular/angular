The `@if` block conditionally displays its content when its condition expression is truthy. 

## Syntax

```angular-html
@if (a > b) {
  {{a}} is greater than {{b}}
} @else if (b > a) {
  {{a}} is less than {{b}}
} @else {
  {{a}} is equal to {{b}}
}
```

## Description

Content is added and removed from the DOM based on the evaluation of conditional expressions in
the `@if` and `@else` blocks.

The built-in `@if` supports referencing of expression results to keep a solution for common coding
patterns:

```angular-html
@if (users$ | async; as users) {
  {{ users.length }}
}
```
