# Missing control flow directive

This diagnostics ensures that a standalone component which uses known control flow directives
(such as `*ngIf`, `*ngFor`, or `*ngSwitch`) in a template, also imports those directives either
individually or by importing the `CommonModule`.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Template uses `*ngIf`, but no corresponding directive imported.
  imports: [],
  template: `<div *ngIf="visible">Hi</div>`,
})
class MyComponent {}

</docs-code>

## What's wrong with that?

Using a control flow directive without importing it will fail at runtime, as Angular attempts to bind to an `ngIf` property of the HTML element, which does not exist.

## What should I do instead?

Make sure that a corresponding control flow directive is imported.

A directive can be imported individually:

<docs-code language="typescript">

import {Component} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  imports: [NgIf],
  template: `<div *ngIf="visible">Hi</div>`,
})
class MyComponent {}

</docs-code>

or you could import the entire `CommonModule`, which contains all control flow directives:

<docs-code language="typescript">

import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  imports: [CommonModule],
  template: `<div *ngIf="visible">Hi</div>`,
})
class MyComponent {}

</docs-code>

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`missingControlFlowDirective` has no additional requirements beyond `strictTemplates`.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "missingControlFlowDirective": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
