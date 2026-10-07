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
    this.role /*362,366*/ /*362,366*/;
    this.custom /*380,386*/ /*380,386*/;
    var _t1 /*311,388*/ = document.createElement('FancyButton'); /*311,388*/ /*311,388*/
    _t1.addEventListener(/*325,330*/ 'click', ($event /*T:EP*/): any => {
      this
        .onClick /*333,340*/
        () /*333,342*/;
    }) /*324,343*/;
  }
}

/* Diagnostics:
 - (311, 388) 'FancyButton' is not a known element:
1. If 'FancyButton' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component.
 - (368, 387) Can't bind to 'children' since it isn't a known property of 'FancyButton'.
*/

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
    this.title /*336,341*/ /*336,341*/;
  }
}

/* Diagnostics:
 - (316, 343) 'FancyCard' is not a known element:
1. If 'FancyCard' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component.
 - (327, 342) Can't bind to 'label' since it isn't a known property of 'FancyCard'.
*/

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
      "code": 8001,
      "messageText": "'FancyButton' is not a known element:\n1. If 'FancyButton' is an Angular component, then verify that it is included in the '@Component.imports' of this component.\n2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component.",
      "span": {
        "start": 311,
        "end": 388
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
      "filePath": "/bindings.component.ts",
      "category": "error",
      "code": 8002,
      "messageText": "Can't bind to 'children' since it isn't a known property of 'FancyButton'.",
      "span": {
        "start": 368,
        "end": 387
      }
    },
    {
      "filePath": "/content-blocks.component.ts",
      "category": "error",
      "code": 8001,
      "messageText": "'FancyCard' is not a known element:\n1. If 'FancyCard' is an Angular component, then verify that it is included in the '@Component.imports' of this component.\n2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component.",
      "span": {
        "start": 316,
        "end": 343
      }
    },
    {
      "filePath": "/content-blocks.component.ts",
      "category": "error",
      "code": 8002,
      "messageText": "Can't bind to 'label' since it isn't a known property of 'FancyCard'.",
      "span": {
        "start": 327,
        "end": 342
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