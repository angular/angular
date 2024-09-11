# Suffix not supported

This diagnostic detects when the `.px`, `.%`, and `.em` suffixes are used with an attribute
binding.

<docs-code language="html">

<img [attr.width.px]="5">

</docs-code>

## What's wrong with that?

These suffixes are only available for style bindings. They do not have any meaning when binding to an attribute.

## What should I do instead?

Rather than using the `.px`, `.%`, or `.em` suffixes that are only supported in style bindings,
move this to the value assignment of the binding.

<docs-code language="html">

<img [attr.width]="'5px'">

</docs-code>

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`suffixNotSupported` has no additional requirements beyond `strictTemplates`.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "suffixNotSupported": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
