# /out/bindings.component.ngtypecheck.ts
```ts
/**
 * TCB for /bindings.component.ts
 * @generated
 */

import * as i0 from './bindings.component';

/*tcb1*/
function _tcb1(this: i0.BindingsComponent) {
  if (true) {
    this.role; /*342,346*/ /*342,346*/
    this.custom; /*360,366*/ /*360,366*/
    var _t1 /*291,368*/ = document.createElement('FancyButton'); /*291,368*/ /*291,368*/
    _t1.addEventListener(/*305,310*/ 'click', ($event /*T:EP*/): any => {
      this
        .onClick /*313,320*/
        (); /*313,322*/
    }); /*304,323*/
  }
}

```

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

# /out/content-blocks.component.ngtypecheck.ts
```ts
/**
 * TCB for /content-blocks.component.ts
 * @generated
 */

import * as i0 from './content-blocks.component';

/*tcb1*/
function _tcb1(this: i0.ContentBlocksComponent) {
  if (true) {
    this.title; /*316,321*/ /*316,321*/
  }
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
        "start": 291,
        "end": 391
      }
    },
    {
      "filePath": "/bindings.component.ts",
      "category": "error",
      "code": 8025,
      "messageText": "Foreign components do not support references.",
      "span": {
        "start": 291,
        "end": 391
      }
    },
    {
      "filePath": "/bindings.component.ts",
      "category": "error",
      "code": 8025,
      "messageText": "Foreign components only support static attributes and property bindings.",
      "span": {
        "start": 291,
        "end": 391
      }
    },
    {
      "filePath": "/bindings.component.ts",
      "category": "error",
      "code": 8029,
      "messageText": "A foreign component cannot have both a 'children' property and child nodes.",
      "span": {
        "start": 348,
        "end": 367
      },
      "relatedInformation": [
        {
          "messageText": "Child nodes are defined here.",
          "filePath": "/bindings.component.ts",
          "span": {
            "start": 368,
            "end": 377
          }
        }
      ]
    },
    {
      "filePath": "/content-blocks.component.ts",
      "category": "error",
      "code": 8028,
      "messageText": "A @content block with the name 'header' has already been defined for this component.",
      "span": {
        "start": 369,
        "end": 402
      },
      "relatedInformation": [
        {
          "messageText": "The @content block 'header' was first defined here.",
          "filePath": "/content-blocks.component.ts",
          "span": {
            "start": 330,
            "end": 362
          }
        }
      ]
    },
    {
      "filePath": "/content-blocks.component.ts",
      "category": "error",
      "code": 8029,
      "messageText": "A @content block with the name 'label' conflicts with a property on the parent component.",
      "span": {
        "start": 409,
        "end": 461
      },
      "relatedInformation": [
        {
          "messageText": "The property 'label' is defined here.",
          "filePath": "/content-blocks.component.ts",
          "span": {
            "start": 307,
            "end": 322
          }
        }
      ]
    },
    {
      "filePath": "/content-blocks.component.ts",
      "category": "error",
      "code": 8027,
      "messageText": "Defining a @content (children) block with no parameters is unnecessary. Pass children as direct nested content of the foreign component instead.",
      "span": {
        "start": 468,
        "end": 514
      }
    },
    {
      "filePath": "/content-blocks.component.ts",
      "category": "error",
      "code": 8026,
      "messageText": "@content blocks are only valid as direct children of foreign components.",
      "span": {
        "start": 541,
        "end": 583
      }
    }
  ]
}

```