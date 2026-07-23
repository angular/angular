# Uninvoked Track Function

This diagnostic detects when a track function is not invoked in `@for` blocks.

```angular-ts
import {Component} from '@angular/core';

@Component({
  template: `@for (item of items; track trackByName) {}`,
})
class Items {
  protected trackByName(item) {
    return item.name;
  }
}
```

## What's wrong with that?

`@for` blocks need to uniquely identify items in the iterable to correctly perform DOM updates when items in the iterable are reordered, new items are added, or existing items are removed.
When you don't invoke the function, the reconcialiation algorithm will use the function reference instead of returned value to compare items.

## What should I do instead?

Ensure to invoke the track function when you use it in a `@for` block to execute the function so the loop can uniquely identify items.

```angular-ts
import {Component} from '@angular/core';

@Component({
  template: `@for (item of items; track trackByName(item)) {}`,
})
class Items {
  protected trackByName(item) {
    return item.name;
  }
}
```

## Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`uninvokedTrackFunction` has no additional requirements beyond `strictTemplates`.

## What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

```json
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "uninvokedTrackFunction": "suppress"
      }
    }
  }
}
```

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.
