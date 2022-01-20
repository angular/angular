@name Invalid Banana-in-Box

@description

This diagnostic detects a backwards "banana-in-box" syntax for
[two-way bindings](guide/two-way-binding).

```html
<div ([var])="otherVar"></div>
```

## What's wrong with that?

As it stands, `([var])` is actually an [event binding](guide/event-binding) with
the name `[var]`. The author likely intended this as a two-way binding to a variable named
`var` but as written this binding has no effect.

## What should I do instead?

Fix the typo. As the name suggests, the banana `(` should go *inside* the box `[]`. In this case:

```html
<div [(var)]="otherVar"></div>
```

## Configuration requirements

[`strictTemplates`](/guide/template-typecheck#strict-mode) must be enabled for any extended
diagnostic to emit. `invalidBananaInBox` has no additional requirements beyond `strictTemplates`.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

```json
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "invalidBananaInBox": "suppress"
      }
    }
  }
}
```

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
