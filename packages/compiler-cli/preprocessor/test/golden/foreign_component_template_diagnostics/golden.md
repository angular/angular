# /out/bindings.component.ts
```ts
import { Component } from '@angular/core';

export function FancyButton() {}

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}): Function {
  return () => {};
}

export class BindingsComponent {
  role = 'button';
  custom = 'value';
  onClick() {}
}

```

# /out/content-blocks.component.ts
```ts
import { Component } from '@angular/core';

export function FancyCard() {}

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}): Function {
  return () => {};
}

export class ContentBlocksComponent {
  title = 'Card';
}

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/bindings.component.ts",
      "category": "error",
      "code": 8025,
      "messageText": "Foreign components do not support event bindings.",
      "span": {
        "start": 311,
        "end": 411
      }
    },
    {
      "filePath": "/bindings.component.ts",
      "category": "error",
      "code": 8025,
      "messageText": "Foreign components do not support references.",
      "span": {
        "start": 311,
        "end": 411
      }
    },
    {
      "filePath": "/bindings.component.ts",
      "category": "error",
      "code": 8025,
      "messageText": "Foreign components only support static attributes and property bindings.",
      "span": {
        "start": 311,
        "end": 411
      }
    },
    {
      "filePath": "/bindings.component.ts",
      "category": "error",
      "code": 8029,
      "messageText": "A foreign component cannot have both a 'children' property and child nodes.",
      "span": {
        "start": 368,
        "end": 387
      }
    },
    {
      "filePath": "/content-blocks.component.ts",
      "category": "error",
      "code": 8028,
      "messageText": "A @content block with the name 'header' has already been defined for this component.",
      "span": {
        "start": 389,
        "end": 422
      }
    },
    {
      "filePath": "/content-blocks.component.ts",
      "category": "error",
      "code": 8029,
      "messageText": "A @content block with the name 'label' conflicts with a property on the parent component.",
      "span": {
        "start": 429,
        "end": 481
      }
    },
    {
      "filePath": "/content-blocks.component.ts",
      "category": "error",
      "code": 8027,
      "messageText": "Defining a @content (children) block with no parameters is unnecessary. Pass children as direct nested content of the foreign component instead.",
      "span": {
        "start": 488,
        "end": 534
      }
    },
    {
      "filePath": "/content-blocks.component.ts",
      "category": "error",
      "code": 8026,
      "messageText": "@content blocks are only valid as direct children of foreign components.",
      "span": {
        "start": 561,
        "end": 603
      }
    }
  ]
}

```