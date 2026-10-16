# /out/foreign-host.component.ngtypecheck.ts
```ts
/**
 * TCB for /foreign-host.component.ts
 * @generated
 */

import * as i0 from './foreign-host.component';

/*tcb1*/
function _tcb1(this: i0.ForeignHostComponent) {
  if (true) {
    this.size; /*390,394*/ /*390,394*/
    this.label; /*405,410*/ /*405,410*/
  }
}

```

# /out/foreign-host.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export function Widget() {}

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}): Function {
  return () => {};
}

// `Widget` is matched as a foreign component, so it reports neither NG8001 nor NG8002.
export class ForeignHostComponent {
  size = 'medium';
  label = 'Hello';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForeignHostComponent, never> =
    function ForeignHostComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ForeignHostComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ForeignHostComponent,
    'app-foreign-host',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ForeignHostComponent,
    selectors: [['app-foreign-host']],
    decls: 1,
    vars: 0,
    consts: [frameworkImport(Widget)],
    template: function ForeignHostComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵforeignComponent(0, 0, (): any => ({ size: ctx.size, label: ctx.label }));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForeignHostComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-foreign-host',
                template: `<Widget [size]="size" [label]="label" />`,
                // @ts-ignore: @angular/core does not expose the `foreignImports` property.
                foreignImports: [frameworkImport(Widget)],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ForeignHostComponent, {
      className: 'ForeignHostComponent',
      filePath: 'foreign-host.component.ts',
      lineNumber: 17,
    });
})();

```

# /out/misplaced-content.component.ngtypecheck.ts
```ts
/**
 * TCB for /misplaced-content.component.ts
 * @generated
 */

import * as i0 from './misplaced-content.component';

/*tcb1*/
function _tcb1(this: i0.MisplacedContentComponent) {
  if (true) {
    this.label; /*408,413*/ /*408,413*/
  }
}

```

# /out/misplaced-content.component.ts
```ts
import { Component } from '@angular/core';

export function Widget() {}

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}): Function {
  return () => {};
}

// The foreign component feature analysis still reports a misplaced `@content` block (NG8026).
export class MisplacedContentComponent {
  label = 'Hello';
}

```

# /out/missing-foreign-imports.component.ngtypecheck.ts
```ts
/**
 * TCB for /missing-foreign-imports.component.ts
 * @generated
 */

import * as i0 from './missing-foreign-imports.component';

/*tcb1*/
function _tcb1(this: i0.MissingForeignImportsComponent) {
  if (true) {
    this.size; /*222,226*/ /*222,226*/
  }
}

/* Diagnostics:
 - (206, 230) 'Widget' is not a known element:
1. If 'Widget' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component.
 - (214, 227) Can't bind to 'size' since it isn't a known property of 'Widget'.
*/

```

# /out/missing-foreign-imports.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

// Without `foreignImports`, `Widget` is an unknown element: NG8001 and NG8002 are reported.
export class MissingForeignImportsComponent {
  size = 'medium';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MissingForeignImportsComponent, never> =
    function MissingForeignImportsComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MissingForeignImportsComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MissingForeignImportsComponent,
    'app-missing-foreign-imports',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MissingForeignImportsComponent,
    selectors: [['app-missing-foreign-imports']],
    decls: 1,
    vars: 1,
    consts: [[3, 'size']],
    template: function MissingForeignImportsComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'Widget', 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty('size', ctx.size);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MissingForeignImportsComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-missing-foreign-imports',
                template: `<Widget [size]="size" />`,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MissingForeignImportsComponent, {
      className: 'MissingForeignImportsComponent',
      filePath: 'missing-foreign-imports.component.ts',
      lineNumber: 8,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/misplaced-content.component.ts",
      "category": "error",
      "code": 8026,
      "messageText": "@content blocks are only valid as direct children of foreign components.",
      "span": {
        "start": 427,
        "end": 469
      }
    },
    {
      "filePath": "/missing-foreign-imports.component.ts",
      "category": "error",
      "code": 8001,
      "messageText": "'Widget' is not a known element:\n1. If 'Widget' is an Angular component, then verify that it is included in the '@Component.imports' of this component.\n2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component. Find more at https://next.angular.dev/errors/NG8001",
      "span": {
        "start": 206,
        "end": 230
      }
    },
    {
      "filePath": "/missing-foreign-imports.component.ts",
      "category": "error",
      "code": 8002,
      "messageText": "Can't bind to 'size' since it isn't a known property of 'Widget'. Find more at https://next.angular.dev/errors/NG8002",
      "span": {
        "start": 214,
        "end": 227
      }
    }
  ]
}

```