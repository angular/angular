# Functions should be invoked in event bindings. 

This diagnostic detects uninvoked functions in event bindings.

<docs-code language="typescript">

import {Component, signal, Signal} from '@angular/core';

@Component({
  template: `<button (click)="onClick">Click me</button>`,
})
class MyComponent {
  onClick() {
    console.log('clicked');
  }
}

</docs-code>

## What's wrong with that?

Functions in event bindings should be invoked when the event is triggered. 
If the function is not invoked, it will not execute when the event is triggered.

## What should I do instead?

Ensure to invoke the function when you use it in an event binding to execute the function when the event is triggered.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  template: `<button (click)="onClick()">Click me</button>`,
})
class MyComponent {
  onClick() {
    console.log('clicked');
  }
}

</docs-code>

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`uninvokedFunctionInEventBinding` has no additional requirements beyond `strictTemplates`.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "uninvokedFunctionInEventBinding": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
