# Signals must be invoked in template interpolations. 

This diagnostic detects uninvoked signals in template interpolations.

<docs-code language="typescript">

import {Component, signal, Signal} from '@angular/core';

@Component({
  template: `<div>{{ mySignal }}/div>`,
})
class MyComponent {
    mySignal: Signal<number> = signal(0);
}

</docs-code>

## What's wrong with that?

Angular Signals are zero-argument functions (`() => T`). When executed, they return the current value of the signal.
This means they are meant to be invoked when used in template interpolations to render their value.

## What should I do instead?

Ensure to invoke the signal when you use it within a template interpolation to render its value.

<docs-code language="typescript">

import {Component, signal, Signal} from '@angular/core';

@Component({
  template: `<div>{{ mySignal() }}/div>`,
})
class MyComponent {
  mySignal: Signal<number> = signal(0)
}

</docs-code>

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`interpolatedSignalNotInvoked` has no additional requirements beyond `strictTemplates`.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "interpolatedSignalNotInvoked": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
