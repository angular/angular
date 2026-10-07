# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { CmpA } from './cmp-a';
import { CmpB } from './cmp-b';
import { CmpNested } from './cmp-nested';
import { PipeA } from './pipe-a';
import { PipeB } from './pipe-b';
import { PipeNested } from './pipe-nested';
// @ts-ignore
import * as i0 from '@angular/core';

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
    i0.ɵɵdefer(6, 5);
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
        i0.ɵɵdefer(1, 0);
        i0.ɵɵdeferOnIdle();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [
      CmpA,
      CmpB,
      CmpNested,
      PipeA,
      PipeB,
      PipeNested,
    ]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
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