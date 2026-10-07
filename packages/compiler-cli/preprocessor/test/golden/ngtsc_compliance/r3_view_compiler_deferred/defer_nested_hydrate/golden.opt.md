# /out/defer_nested_hydrate_inner.ngtypecheck.ts
```ts
/**
 * TCB for /defer_nested_hydrate_inner.ts
 * @generated
 */

import * as i0 from './defer_nested_hydrate_inner';

/*tcb1*/
function _tcb1(this: i0.InnerCmp) {
  if (true) {
  }
}

```

# /out/defer_nested_hydrate_inner.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function InnerCmp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' hello ');
  }
}

export class InnerCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InnerCmp, never> = function InnerCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || InnerCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    InnerCmp,
    'inner-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: InnerCmp,
    selectors: [['inner-cmp']],
    decls: 3,
    vars: 0,
    template: function InnerCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, InnerCmp_Defer_0_Template, 1, 0);
        i0.ɵɵenableIncrementalHydrationRuntime();
        i0.ɵɵdefer(1, 0, null, null, null, null, null, null, null, 1);
        i0.ɵɵdeferHydrateOnIdle();
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InnerCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'inner-cmp',
                template: `
        @defer (hydrate on idle) {
          hello
        }
      `,
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
    i0.ɵsetClassDebugInfo(InnerCmp, {
      className: 'InnerCmp',
      filePath: 'defer_nested_hydrate_inner.ts',
      lineNumber: 11,
    });
})();

```

# /out/defer_nested_hydrate.ngtypecheck.ts
```ts
/**
 * TCB for /defer_nested_hydrate.ts
 * @generated
 */

import * as i0 from './defer_nested_hydrate';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
  }
}

```

# /out/defer_nested_hydrate.ts
```ts
import { Component } from '@angular/core';

// @ts-ignore
import * as i0 from '@angular/core';

const MyApp_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./defer_nested_hydrate_inner').then((m: any): any => m.InnerCmp),
];
function MyApp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'inner-cmp');
  }
}

export class MyApp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    decls: 3,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, MyApp_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        MyApp,
        (): any => [
          /* @ts-ignore */
          import('./defer_nested_hydrate_inner').then((m: any): any => m.InnerCmp),
        ],
        (InnerCmp: any): any => {
          i0.ɵsetClassMetadata(
            MyApp,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'my-app',
                    imports: [InnerCmp],
                    template: `
        @defer (on idle) {
          <inner-cmp />
        }
      `,
                  },
                ],
              },
            ],
            null,
            null,
          );
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'defer_nested_hydrate.ts',
      lineNumber: 14,
    });
})();

```