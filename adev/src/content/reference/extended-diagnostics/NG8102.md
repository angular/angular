# Nullish coalescing not nullable

This diagnostic detects a useless nullish coalescing operator \(`??`\) characters in Angular templates.
Specifically, it looks for operations where the input is not "nullable", meaning its type does not include `null` or `undefined`.
For such values, the right side of the `??` will never be used.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Template displays `username` if present, falls back to 'root' if it is
  // `null` or `undefined`.
  template: `<div>{{ username ?? 'root' }}</div>`,
})
class MyComponent {
  // `username` is declared as a `string` which *cannot* be `null` or
  // `undefined`.
  username: string = 'Angelino';
}

</docs-code>

## What's wrong with that?

Using the nullish coalescing operator with a non-nullable input has no effect and is indicative of a discrepancy between the allowed type of a value and how it is presented in the template.
A developer might reasonably assume that the right side of the nullish coalescing operator is displayed in some case, but it will never actually be displayed.
This can lead to confusion about the expected output of the program.

## What should I do instead?

Update the template and declared type to be in sync.
Double-check the type of the input and confirm whether it is actually expected to be nullable.

If the input should be nullable, add `null` or `undefined` to its type to indicate this.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  template: `<div>{{ username ?? 'root' }}</div>`,
})
class MyComponent {
  // `username` is now nullable. If it is ever set to `null`, 'root' will be
  // displayed.
  username: string | null = 'Angelino';
}

</docs-code>

If the input should *not* be nullable, delete the `??` operator and its right operand, since the value is guaranteed by TypeScript to always be non-nullable.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Template always displays `username`, which is guaranteed to never be `null`
  // or `undefined`.
  template: `<div>{{ username }}</div>`,
})
class MyComponent {
  username: string = 'Angelino';
}

</docs-code>

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
[`strictNullChecks`](tools/cli/template-typecheck#strict-null-checks) must also be enabled to emit `nullishCoalescingNotNullable` diagnostics.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "nullishCoalescingNotNullable": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
