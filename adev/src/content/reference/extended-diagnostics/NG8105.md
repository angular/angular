# Missing `let` keyword in an `*ngFor` expression

This diagnostic is emitted when an expression used in `*ngFor` is missing the `let` keyword.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // The `let` keyword is missing in the `*ngFor` expression.
  template: `<div *ngFor="item of items">{{ item }}</div>`,
})
class MyComponent {
  items = [1, 2, 3];
}

</docs-code>

## What's wrong with that?

A missing `let` is indicative of a syntax error in the `*ngFor` string. It also means that `item` will not be properly pulled into scope and `{{ item }}` will not resolve correctly.

## What should I do instead?

Add the missing `let` keyword.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // The `let` keyword is now present in the `*ngFor` expression,
  // no diagnostic messages are emitted in this case.
  template: `<div *ngFor="let item of items">{{ item }}</div>`,
})
class MyComponent {
  items = [1, 2, 3];
}

</docs-code>

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`missingNgForOfLet` has no additional requirements beyond `strictTemplates`.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "missingNgForOfLet": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
