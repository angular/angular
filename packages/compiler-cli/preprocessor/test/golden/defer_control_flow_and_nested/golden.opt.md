# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from './pipe-a';
import * as i2 from './pipe-b';
import * as i3 from './pipe-nested';

var _pipe1 = null! as i1.PipeA;
var _pipe2 = null! as i2.PipeB;
var _pipe3 = null! as i3.PipeNested;

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    if (_pipe1.transform(/*344,349*/ this.show /*337,341*/ /*337,341*/) /*337,349*/) {
    }
    for (const _t1 /*390,394*/ of _pipe2.transform(
      /*406,411*/ this.items /*398,403*/ /*398,403*/,
    ) /*398,411*/! /*398,411*/) {
      _t1 /*419,423*/;
    }
    '' + _pipe3.transform(/*516,526*/ 'inner' /*506,513*/) /*506,526*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';

// @ts-ignore
import * as i0 from '@angular/core';

const AppComponent_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./cmp-a').then((m: any): any => m.CmpA),
  /* @ts-ignore */
  import('./cmp-b').then((m: any): any => m.CmpB),
  /* @ts-ignore */
  import('./pipe-a').then((m: any): any => m.PipeA),
  /* @ts-ignore */
  import('./pipe-b').then((m: any): any => m.PipeB),
];
const AppComponent_Defer_0_Defer_6_DepsFn = (): any => [
  /* @ts-ignore */
  import('./cmp-nested').then((m: any): any => m.CmpNested),
  /* @ts-ignore */
  import('./pipe-nested').then((m: any): any => m.PipeNested),
];
function AppComponent_Defer_0_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'cmp-a');
  }
}
function AppComponent_Defer_0_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'cmp-b');
  }
}
function AppComponent_Defer_0_Defer_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'cmp-nested');
    i0.ɵɵelementStart(1, 'span');
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, 'pipeNested');
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, 'inner'));
  }
}
function AppComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AppComponent_Defer_0_Conditional_0_Template, 1, 0, 'cmp-a');
    i0.ɵɵpipe(1, 'pipeA');
    i0.ɵɵrepeaterCreate(
      2,
      AppComponent_Defer_0_For_3_Template,
      1,
      0,
      'cmp-b',
      null,
      i0.ɵɵrepeaterTrackByIdentity,
    );
    i0.ɵɵpipe(4, 'pipeB');
    i0.ɵɵdomTemplate(5, AppComponent_Defer_0_Defer_5_Template, 4, 3);
    i0.ɵɵdefer(6, 5, AppComponent_Defer_0_Defer_6_DepsFn);
    i0.ɵɵdeferOnIdle();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵconditional(i0.ɵɵpipeBind1(1, 1, ctx_r0.show) ? 0 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(i0.ɵɵpipeBind1(4, 3, ctx_r0.items));
  }
}

export class AppComponent {
  show = true;
  items = ['one', 'two'];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 3,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, AppComponent_Defer_0_Template, 8, 5);
        i0.ɵɵdefer(1, 0, AppComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
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
          import('./cmp-a').then((m: any): any => m.CmpA),
          /* @ts-ignore */
          import('./cmp-b').then((m: any): any => m.CmpB),
          /* @ts-ignore */
          import('./pipe-a').then((m: any): any => m.PipeA),
          /* @ts-ignore */
          import('./pipe-b').then((m: any): any => m.PipeB),
          /* @ts-ignore */
          import('./cmp-nested').then((m: any): any => m.CmpNested),
          /* @ts-ignore */
          import('./pipe-nested').then((m: any): any => m.PipeNested),
        ],
        (CmpA: any, CmpB: any, PipeA: any, PipeB: any, CmpNested: any, PipeNested: any): any => {
          i0.ɵsetClassMetadata(
            AppComponent,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'app-root',
                    template: `
        @defer {
          @if (show | pipeA) {
            <cmp-a/>
          }
          @for (item of items | pipeB; track item) {
            <cmp-b/>
          }
          @defer {
            <cmp-nested/>
            <span>{{ 'inner' | pipeNested }}</span>
          }
        }
      `,
                    standalone: true,
                    imports: [CmpA, CmpB, CmpNested, PipeA, PipeB, PipeNested],
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 28,
    });
})();

```

# /out/cmp-a.ngtypecheck.ts
```ts
/**
 * TCB for /cmp-a.ts
 * @generated
 */

import * as i0 from './cmp-a';

/*tcb1*/
function _tcb1(this: i0.CmpA) {
  if (true) {
  }
}

```

# /out/cmp-a.ts
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
          i0.ɵɵtext(0, 'A');
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpA,
        [
          {
            type: Component,
            args: [
              {
                selector: 'cmp-a',
                template: 'A',
                standalone: true,
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
    i0.ɵsetClassDebugInfo(CmpA, { className: 'CmpA', filePath: 'cmp-a.ts', lineNumber: 8 });
})();

```

# /out/cmp-b.ngtypecheck.ts
```ts
/**
 * TCB for /cmp-b.ts
 * @generated
 */

import * as i0 from './cmp-b';

/*tcb1*/
function _tcb1(this: i0.CmpB) {
  if (true) {
  }
}

```

# /out/cmp-b.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class CmpB {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpB, never> = function CmpB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpB)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<CmpB, 'cmp-b', never, {}, {}, never, never, true, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: CmpB,
      selectors: [['cmp-b']],
      decls: 1,
      vars: 0,
      template: function CmpB_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵtext(0, 'B');
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpB,
        [
          {
            type: Component,
            args: [
              {
                selector: 'cmp-b',
                template: 'B',
                standalone: true,
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
    i0.ɵsetClassDebugInfo(CmpB, { className: 'CmpB', filePath: 'cmp-b.ts', lineNumber: 8 });
})();

```

# /out/cmp-nested.ngtypecheck.ts
```ts
/**
 * TCB for /cmp-nested.ts
 * @generated
 */

import * as i0 from './cmp-nested';

/*tcb1*/
function _tcb1(this: i0.CmpNested) {
  if (true) {
  }
}

```

# /out/cmp-nested.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class CmpNested {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpNested, never> = function CmpNested_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpNested)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CmpNested,
    'cmp-nested',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CmpNested,
    selectors: [['cmp-nested']],
    decls: 1,
    vars: 0,
    template: function CmpNested_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Nested');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpNested,
        [
          {
            type: Component,
            args: [
              {
                selector: 'cmp-nested',
                template: 'Nested',
                standalone: true,
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
    i0.ɵsetClassDebugInfo(CmpNested, {
      className: 'CmpNested',
      filePath: 'cmp-nested.ts',
      lineNumber: 8,
    });
})();

```

# /out/pipe-a.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class PipeA implements PipeTransform {
  transform(v: any): boolean {
    return !!v;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipeA, never> = function PipeA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipeA)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PipeA, 'pipeA', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'pipeA',
    type: PipeA,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PipeA,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'pipeA',
                standalone: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```

# /out/pipe-b.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class PipeB implements PipeTransform {
  transform(v: string[]): string[] {
    return v;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipeB, never> = function PipeB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipeB)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PipeB, 'pipeB', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'pipeB',
    type: PipeB,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PipeB,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'pipeB',
                standalone: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```

# /out/pipe-nested.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class PipeNested implements PipeTransform {
  transform(v: any): string {
    return String(v);
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipeNested, never> = function PipeNested_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipeNested)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PipeNested, 'pipeNested', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'pipeNested', type: PipeNested, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PipeNested,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'pipeNested',
                standalone: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```