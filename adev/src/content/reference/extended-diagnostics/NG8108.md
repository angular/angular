# `ngSkipHydration` should be a static attribute

`ngSkipHydration` is a special attribute which indicates to Angular that a particular component should be opted-out of [hydration](guide/hydration).
This diagnostic ensures that this attribute `ngSkipHydration` is set statically and the value is either set to `"true"` or an empty value.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  template: `<user-viewer ngSkipHydration="hasUser" />`,
})
class MyComponent {
  hasUser = true;
}

</docs-code>

## What's wrong with that?

As a special attribute implemented by Angular, `ngSkipHydration` needs to be statically analyzable so Angular knows at compile-time whether or not hydration is needed for a component.

## What should I do instead?

When using the `ngSkipHydration`, ensure that it's set as a static attribute (i.e. you do not use the Angular template binding syntax).

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  template: `
    <user-viewer ngSkipHydration />
    <user-viewer ngSkipHydration="true" />
  `,
})
class MyComponent {}

</docs-code>

If a conditional is necessary, you can wrap the component in an `*ngIf`.

<docs-code language="html">

import {Component} from '@angular/core';

@Component({
  template: `
    <div *ngIf="hasUser; else noUser">
      <user-viewer ngSkipHydration />
    </div>

    <ng-template #noUser>
      <user-viewer />
    </ng-template>
  `,
})
class MyComponent {}

</docs-code>

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`skipHydrationNotStatic` has no additional requirements beyond `strictTemplates`.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "skipHydrationNotStatic": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
