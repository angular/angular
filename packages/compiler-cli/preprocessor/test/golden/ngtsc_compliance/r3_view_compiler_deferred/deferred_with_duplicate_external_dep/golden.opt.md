# /out/deferred_with_duplicate_external_dep_lazy.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DuplicateLazyDep {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DuplicateLazyDep, never> = function DuplicateLazyDep_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DuplicateLazyDep)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DuplicateLazyDep,
    'duplicate-lazy-dep',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DuplicateLazyDep,
    selectors: [['duplicate-lazy-dep']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DuplicateLazyDep,
        [{ type: Directive, args: [{ selector: 'duplicate-lazy-dep' }] }],
        null,
        null,
      );
  }
}

```

# /out/deferred_with_duplicate_external_dep_other.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class OtherLazyDep {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OtherLazyDep, never> = function OtherLazyDep_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || OtherLazyDep)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    OtherLazyDep,
    'other-lazy-dep',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: OtherLazyDep, selectors: [['other-lazy-dep']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        OtherLazyDep,
        [{ type: Directive, args: [{ selector: 'other-lazy-dep' }] }],
        null,
        null,
      );
  }
}

```

# /out/deferred_with_duplicate_external_dep.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_with_duplicate_external_dep.ts
 * @generated
 */

import * as i0 from './deferred_with_duplicate_external_dep';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
  }
}

```

# /out/deferred_with_duplicate_external_dep.ts
```ts
import { Component } from '@angular/core';

// @ts-ignore
import * as i0 from '@angular/core';

const MyApp_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./deferred_with_duplicate_external_dep_lazy').then((m: any): any => m.DuplicateLazyDep),
];
const MyApp_Defer_7_DepsFn = (): any => [
  /* @ts-ignore */
  import('./deferred_with_duplicate_external_dep_other').then((m: any): any => m.OtherLazyDep),
];
function MyApp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'duplicate-lazy-dep');
  }
}
function MyApp_Defer_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'duplicate-lazy-dep');
  }
}
function MyApp_Defer_6_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'other-lazy-dep');
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
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    decls: 9,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, MyApp_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(3, MyApp_Defer_3_Template, 1, 0);
        i0.ɵɵdefer(4, 3, MyApp_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(6, MyApp_Defer_6_Template, 1, 0);
        i0.ɵɵdefer(7, 6, MyApp_Defer_7_DepsFn);
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
          import('./deferred_with_duplicate_external_dep_lazy').then(
            (m: any): any => m.DuplicateLazyDep,
          ),
          /* @ts-ignore */
          import('./deferred_with_duplicate_external_dep_other').then(
            (m: any): any => m.OtherLazyDep,
          ),
        ],
        (DuplicateLazyDep: any, OtherLazyDep: any): any => {
          i0.ɵsetClassMetadata(
            MyApp,
            [
              {
                type: Component,
                args: [
                  {
                    template: `
        @defer {
          <duplicate-lazy-dep/>
        }

        @defer {
          <duplicate-lazy-dep/>
        }

        @defer {
          <other-lazy-dep/>
        }
      `,
                    imports: [DuplicateLazyDep, OtherLazyDep],
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
      filePath: 'deferred_with_duplicate_external_dep.ts',
      lineNumber: 21,
    });
})();

```