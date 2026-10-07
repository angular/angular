# /out/comp-a.ngtypecheck.ts
```ts
/**
 * TCB for /comp-a.ts
 * @generated
 */

import * as i0 from './comp-a';

/*tcb1*/
function _tcb1(this: i0.CompA) {
  if (true) {
  }
}

```

# /out/comp-a.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class CompA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CompA, never> = function CompA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CompA)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CompA,
    'comp-a',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CompA,
    selectors: [['comp-a']],
    decls: 1,
    vars: 0,
    template: function CompA_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Component A');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CompA,
        [
          {
            type: Component,
            args: [
              {
                selector: 'comp-a',
                template: 'Component A',
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
    i0.ɵsetClassDebugInfo(CompA, { className: 'CompA', filePath: 'comp-a.ts', lineNumber: 7 });
})();

```

# /out/comp-b.ngtypecheck.ts
```ts
/**
 * TCB for /comp-b.ts
 * @generated
 */

import * as i0 from './comp-b';

/*tcb1*/
function _tcb1(this: i0.CompB) {
  if (true) {
  }
}

```

# /out/comp-b.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class CompB {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CompB, never> = function CompB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CompB)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CompB,
    'comp-b',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CompB,
    selectors: [['comp-b']],
    decls: 1,
    vars: 0,
    template: function CompB_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Component B');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CompB,
        [
          {
            type: Component,
            args: [
              {
                selector: 'comp-b',
                template: 'Component B',
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
    i0.ɵsetClassDebugInfo(CompB, { className: 'CompB', filePath: 'comp-b.ts', lineNumber: 7 });
})();

```

# /out/explicit.component.ngtypecheck.ts
```ts
/**
 * TCB for /explicit.component.ts
 * @generated
 */

import * as i0 from './explicit.component';

/*tcb1*/
function _tcb1(this: i0.ExplicitComponent) {
  if (true) {
  }
}

```

# /out/explicit.component.ts
```ts
import { Component } from '@angular/core';

// @ts-ignore
import * as i0 from '@angular/core';

const ExplicitComponent_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./comp-b').then((m: any): any => m.CompB),
];
function ExplicitComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'comp-b');
  }
}

// `CompB` is listed in `deferredImports`, so it is still defer-loaded under the flag.
export class ExplicitComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExplicitComponent, never> =
    function ExplicitComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ExplicitComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ExplicitComponent,
    'explicit-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ExplicitComponent,
    selectors: [['explicit-comp']],
    decls: 3,
    vars: 0,
    template: function ExplicitComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, ExplicitComponent_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, ExplicitComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        ExplicitComponent,
        (): any => [
          /* @ts-ignore */
          import('./comp-b').then((m: any): any => m.CompB),
        ],
        (CompB: any): any => {
          i0.ɵsetClassMetadata(
            ExplicitComponent,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'explicit-comp',
                    deferredImports: {
                      blockB: [CompB],
                    },
                    template: `
        @defer (name blockB) {
          <comp-b />
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
    i0.ɵsetClassDebugInfo(ExplicitComponent, {
      className: 'ExplicitComponent',
      filePath: 'explicit.component.ts',
      lineNumber: 16,
    });
})();

```

# /out/implicit.component.ngtypecheck.ts
```ts
/**
 * TCB for /implicit.component.ts
 * @generated
 */

import * as i0 from './implicit.component';

/*tcb1*/
function _tcb1(this: i0.ImplicitComponent) {
  if (true) {
  }
}

```

# /out/implicit.component.ts
```ts
import { Component } from '@angular/core';
import { CompA } from './comp-a';
// @ts-ignore
import * as i0 from '@angular/core';

const ImplicitComponent_Defer_1_DepsFn = (): any => [CompA];
function ImplicitComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'comp-a');
  }
}

// `CompA` is only used inside `@defer`, but reaches the component through `imports`. With
// `onlyExplicitDeferDependencyImports` it must not be defer-loaded: the static import stays and,
// under full compilation, the `@defer` dependency function references it directly.
export class ImplicitComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImplicitComponent, never> =
    function ImplicitComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ImplicitComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ImplicitComponent,
    'implicit-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ImplicitComponent,
    selectors: [['implicit-comp']],
    decls: 3,
    vars: 0,
    template: function ImplicitComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, ImplicitComponent_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, ImplicitComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImplicitComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'implicit-comp',
                imports: [CompA],
                template: `
        @defer {
          <comp-a />
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
    i0.ɵsetClassDebugInfo(ImplicitComponent, {
      className: 'ImplicitComponent',
      filePath: 'implicit.component.ts',
      lineNumber: 16,
    });
})();

```