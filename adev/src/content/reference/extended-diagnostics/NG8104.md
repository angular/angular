# Text attribute not binding

This diagnostic ensures that attributes which have the "special" Angular binding prefix (`attr.`, `style.`, and
`class.`) are interpreted as bindings.

<docs-code language="html">

<div attr.id="my-id"></div>

</docs-code>

## What's wrong with that?

In this example, `attr.id` is interpreted as a regular attribute and will appear
as-is in the final HTML (`<div attr.id="my-id"></div>`). This is likely not the intent of the developer.
Instead, the intent is likely to set the `id` attribute (`<div id="my-id"></div>`).

## What should I do instead?

When binding to `attr.`, `class.`, or `style.`, ensure you use the Angular template binding syntax (`[]`).

<docs-code language="html">

<div [attr.id]="my-id"></div>
<div [style.color]="red"></div>
<div [class.large]="true"></div>

</docs-code>

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`textAttributeNotBinding` has no additional requirements beyond `strictTemplates`.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">

{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "textAttributeNotBinding": "suppress"
      }
    }
  }
}

</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
