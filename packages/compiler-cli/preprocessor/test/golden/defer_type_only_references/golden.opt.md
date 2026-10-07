# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    if (this.isReady /*374,381*/ /*374,381*/) {
    }
  }
}

```

# /out/app.component.ts
```ts
import { Component, ViewChild } from '@angular/core';
import { type CompA, type CompA as CompAType } from './comp-a';
import { type CompB } from './comp-b';
import type CompD from './comp-d';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['compA'];
const _c1 = ['compB'];
const _c2 = ['compD'];
const AppComponent_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./comp-a').then((m: any): any => m.CompA),
  /* @ts-ignore */
  import('./comp-b').then((m: any): any => m.CompB),
  /* @ts-ignore */
  import('./comp-c').then((m: any): any => m.CompC),
  /* @ts-ignore */
  import('./comp-d').then((m: any): any => m.default),
];
function AppComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'comp-a', null, 0)(2, 'comp-b', null, 1)(4, 'comp-c')(5, 'comp-d', null, 2);
  }
}

export class AppComponent {
  isReady = true;
  compA?: CompAType;
  compB?: CompB;
  compD?: CompD;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-comp']],
    viewQuery: function AppComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuery(_c0, 5)(_c1, 5)(_c2, 5);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.compA = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.compB = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.compD = _t.first);
      }
    },
    decls: 3,
    vars: 1,
    consts: [
      ['compA', ''],
      ['compB', ''],
      ['compD', ''],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, AppComponent_Defer_0_Template, 7, 0);
        i0.ɵɵdefer(1, 0, AppComponent_Defer_1_DepsFn);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵdeferWhen(ctx.isReady);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        AppComponent,
        (): any => [
          /* @ts-ignore */
          import('./comp-a').then((m: any): any => m.CompA),
          /* @ts-ignore */
          import('./comp-b').then((m: any): any => m.CompB),
          /* @ts-ignore */
          import('./comp-c').then((m: any): any => m.CompC),
          /* @ts-ignore */
          import('./comp-d').then((m: any): any => m.default),
        ],
        (CompA: any, CompB: any, CompC: any, CompD: any): any => {
          i0.ɵsetClassMetadata(
            AppComponent,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'app-comp',
                    deferredImports: {
                      blockA: [CompA, CompB, CompC, CompD],
                    },
                    template: `
        @defer (when isReady; name blockA) {
          <comp-a #compA />
          <comp-b #compB />
          <comp-c />
          <comp-d #compD />
        }
      `,
                  },
                ],
              },
            ],
            null,
            {
              compA: [{ type: ViewChild, args: ['compA'] }],
              compB: [{ type: ViewChild, args: ['compB'] }],
              compD: [{ type: ViewChild, args: ['compD'] }],
            },
          );
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 21,
    });
})();

```

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

# /out/comp-c.ngtypecheck.ts
```ts
/**
 * TCB for /comp-c.ts
 * @generated
 */

import * as i0 from './comp-c';

/*tcb1*/
function _tcb1(this: i0.CompC) {
  if (true) {
  }
}

```

# /out/comp-c.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class CompC {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CompC, never> = function CompC_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CompC)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CompC,
    'comp-c',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CompC,
    selectors: [['comp-c']],
    decls: 1,
    vars: 0,
    template: function CompC_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Component C');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CompC,
        [
          {
            type: Component,
            args: [
              {
                selector: 'comp-c',
                template: 'Component C',
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
    i0.ɵsetClassDebugInfo(CompC, { className: 'CompC', filePath: 'comp-c.ts', lineNumber: 7 });
})();

```

# /out/comp-d.ngtypecheck.ts
```ts
/**
 * TCB for /comp-d.ts
 * @generated
 */

import { Component } from '@angular/core';

@Component({
  selector: 'comp-d',
  template: 'Component D',
})
export default class CompD {}

/*tcb1*/
function _tcb1(this: CompD) {
  if (true) {
  }
}

```

# /out/comp-d.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export default class CompD {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CompD, never> = function CompD_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CompD)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CompD,
    'comp-d',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CompD,
    selectors: [['comp-d']],
    decls: 1,
    vars: 0,
    template: function CompD_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Component D');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CompD,
        [
          {
            type: Component,
            args: [
              {
                selector: 'comp-d',
                template: 'Component D',
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
    i0.ɵsetClassDebugInfo(CompD, { className: 'CompD', filePath: 'comp-d.ts', lineNumber: 7 });
})();

```