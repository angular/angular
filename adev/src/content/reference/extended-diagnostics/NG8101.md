# Invalid Banana-in-Box

This diagnostic detects a backwards "banana-in-box" syntax for [two-way bindings](guide/templates/two-way-binding).

<docs-code language="html">

<user-viewer ([user])="loggedInUser" />

</docs-code>

## What's wrong with that?

As it stands, `([var])` is actually an [event binding](guide/templates/event-listeners) with the name `[var]`.
The author likely intended this as a two-way binding to a variable named `var` but, as written, this binding has no effect.

## What should I do instead?

Fix the typo.
As the name suggests, the banana `(` should go _inside_ the box `[]`.
In this case:

<docs-code language="html">

<user-viewer [(user)]="loggedInUser" />

</docs-code>

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`invalidBananaInBox` has no additional requirements beyond `strictTemplates`.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "invalidBananaInBox": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
