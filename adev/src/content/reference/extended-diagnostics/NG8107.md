# Optional chain not nullable

This diagnostic detects when the left side of an optional chain operation (`.?`) does not include `null` or `undefined` in its type in Angular templates.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Print the user's name safely, even if `user` is `null` or `undefined`.
  template: `<div>User name: {{ user?.name }}</div>`,
})
class MyComponent {
  // `user` is declared as an object which *cannot* be `null` or `undefined`.
  user: { name: string } = { name: 'Angelino' };
}

</docs-code>

## What's wrong with that?

Using the optional chain operator with a non-nullable input has no effect and is indicative of a discrepancy between the allowed type of a value and how it is presented in the template.
A developer might reasonably assume that the output of the optional chain operator is could be `null` or `undefined`, but it will never actually be either of those values.
This can lead to confusion about the expected output of the program.

## What should I do instead?

Update the template and declared type to be in sync.
Double-check the type of the input and confirm whether it is actually expected to be nullable.

If the input should be nullable, add `null` or `undefined` to its type to indicate this.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // If `user` is nullish, `name` won't be evaluated and the expression will
  // return the nullish value (`null` or `undefined`).
  template: `<div>{{ user?.name }}</div>`,
})
class MyComponent {
  user: { name: string } | null = { name: 'Angelino' };
}

</docs-code>

If the input should not be nullable, delete the `?` operator.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Template always displays `name` as `user` is guaranteed to never be `null`
  // or `undefined`.
  template: `<div>{{ foo.bar }}</div>`,
})
class MyComponent {
  user: { name: string } = { name: 'Angelino' };
}

</docs-code>

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
[`strictNullChecks`](tools/cli/template-typecheck#strict-null-checks) must also be enabled to emit `optionalChainNotNullable` diagnostics.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "optionalChainNotNullable": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
