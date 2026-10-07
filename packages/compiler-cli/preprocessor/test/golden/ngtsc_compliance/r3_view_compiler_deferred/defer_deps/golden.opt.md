# /out/defer_deps_ext.ngtypecheck.ts
```ts
/**
 * TCB for /defer_deps_ext.ts
 * @generated
 */

import * as i0 from './defer_deps_ext';

/*tcb1*/
function _tcb1(this: i0.CmpA) {
  if (true) {
  }
}

```

# /out/defer_deps_ext.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class CmpA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpA, never> = function CmpA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpA)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<CmpA, 'cmp-a', never, {}, {}, never, never, true, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: CmpA,
      selectors: [['cmp-a']],
      decls: 1,
      vars: 0,
      template: function CmpA_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵtext(0, 'CmpA!');
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpA,
        [{ type: Component, args: [{ selector: 'cmp-a', template: 'CmpA!' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CmpA, {
      className: 'CmpA',
      filePath: 'defer_deps_ext.ts',
      lineNumber: 4,
    });
})();

```

# /out/defer_deps.ngtypecheck.ts
```ts
/**
 * TCB for /defer_deps.ts
 * @generated
 */

import * as i0 from './defer_deps';

/*tcb1*/
function _tcb1(this: i0.LocalDep) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.TestCmp) {
  if (true) {
  }
}

```

# /out/defer_deps.ts
```ts
import { Component } from '@angular/core';

// @ts-ignore
import * as i0 from '@angular/core';

const TestCmp_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./defer_deps_ext').then((m: any): any => m.CmpA),
  LocalDep,
];
function TestCmp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'cmp-a')(1, 'local-dep');
  }
}

export class LocalDep {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalDep, never> = function LocalDep_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalDep)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalDep,
    'local-dep',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalDep,
    selectors: [['local-dep']],
    decls: 1,
    vars: 0,
    template: function LocalDep_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Local dependency');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalDep,
        [
          {
            type: Component,
            args: [
              {
                selector: 'local-dep',
                template: 'Local dependency',
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
    i0.ɵsetClassDebugInfo(LocalDep, {
      className: 'LocalDep',
      filePath: 'defer_deps.ts',
      lineNumber: 9,
    });
})();

export class TestCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    decls: 3,
    vars: 0,
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, TestCmp_Defer_0_Template, 2, 0);
        i0.ɵɵdefer(1, 0, TestCmp_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        TestCmp,
        (): any => [
          /* @ts-ignore */
          import('./defer_deps_ext').then((m: any): any => m.CmpA),
        ],
        (CmpA: any): any => {
          i0.ɵsetClassMetadata(
            TestCmp,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'test-cmp',
                    imports: [CmpA, LocalDep],
                    template: `
    	@defer {
    	<cmp-a />
    	<local-dep />
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'defer_deps.ts',
      lineNumber: 22,
    });
})();

```