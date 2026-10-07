# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { CompA } from './comp-a';
import { CompB } from './comp-b';
import { PipeA } from './pipe-a';
// @ts-ignore
import * as i0 from '@angular/core';

const AppComponent_Defer_1_DepsFn = (): any => [CompA];
const AppComponent_Defer_4_DepsFn = (): any => [CompB, PipeA];
function AppComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'comp-a');
  }
}
function AppComponent_Defer_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'comp-b');
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, 'pipeA');
  }
  if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(' ', i0.ɵɵpipeBind1(2, 1, 123), ' ');
  }
}

export class AppComponent {
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
    decls: 6,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, AppComponent_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, AppComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(3, AppComponent_Defer_3_Template, 3, 3);
        i0.ɵɵdefer(4, 3, AppComponent_Defer_4_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [CompA, CompB, PipeA]),
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
                selector: 'app-comp',
                standalone: true,
                imports: [CompA, CompB, PipeA],
                deferredImports: {
                  blockA: [CompA],
                  blockB: [CompB, PipeA],
                },
                template: `
        @defer (name blockA) {
          <comp-a />
        }
        @defer (name blockB) {
          <comp-b />
          {{ 123 | pipeA }}
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 24,
    });
})();

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
    i0.ɵsetClassDebugInfo(CompA, { className: 'CompA', filePath: 'comp-a.ts', lineNumber: 8 });
})();

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
    i0.ɵsetClassDebugInfo(CompB, { className: 'CompB', filePath: 'comp-b.ts', lineNumber: 8 });
})();

```

# /out/pipe-a.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class PipeA implements PipeTransform {
  transform(val: any) {
    return val;
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

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/app.component.ts",
      "category": "error",
      "code": 8014,
      "messageText": "This import contains symbols that are used both inside and outside of the `@Component.deferredImports` fields in the file. This renders all these defer imports useless as this import remains and its module is eagerly loaded. To fix this, make sure that all symbols from the import are *only* used within `@Component.deferredImports` arrays and there are no other references to those symbols present in this file.",
      "span": {
        "start": 43,
        "end": 76
      }
    },
    {
      "filePath": "/app.component.ts",
      "category": "error",
      "code": 8014,
      "messageText": "This import contains symbols that are used both inside and outside of the `@Component.deferredImports` fields in the file. This renders all these defer imports useless as this import remains and its module is eagerly loaded. To fix this, make sure that all symbols from the import are *only* used within `@Component.deferredImports` arrays and there are no other references to those symbols present in this file.",
      "span": {
        "start": 77,
        "end": 110
      }
    },
    {
      "filePath": "/app.component.ts",
      "category": "error",
      "code": 8014,
      "messageText": "This import contains symbols that are used both inside and outside of the `@Component.deferredImports` fields in the file. This renders all these defer imports useless as this import remains and its module is eagerly loaded. To fix this, make sure that all symbols from the import are *only* used within `@Component.deferredImports` arrays and there are no other references to those symbols present in this file.",
      "span": {
        "start": 111,
        "end": 144
      }
    }
  ]
}

```