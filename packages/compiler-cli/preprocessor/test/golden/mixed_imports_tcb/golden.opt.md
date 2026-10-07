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
  }
}

/* Diagnostics:
 - (247, 262) 'external-comp' is not a known element:
1. If 'external-comp' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'external-comp' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.
*/

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { LocalComp } from './local';
import { ExternalComp } from './external';
// @ts-ignore
import * as i0 from '@angular/core';

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
    decls: 2,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'local-comp')(1, 'external-comp');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [LocalComp, ExternalComp]),
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
                imports: [LocalComp, ExternalComp],
                template: `
        <local-comp></local-comp>
        <external-comp></external-comp>
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
      lineNumber: 13,
    });
})();

```

# /out/local.ngtypecheck.ts
```ts
/**
 * TCB for /local.ts
 * @generated
 */

import * as i0 from './local';

/*tcb1*/
function _tcb1(this: i0.LocalComp) {
  if (true) {
  }
}

```

# /out/local.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class LocalComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalComp, never> = function LocalComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalComp,
    'local-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalComp,
    selectors: [['local-comp']],
    decls: 1,
    vars: 0,
    template: function LocalComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Local');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'local-comp',
                template: 'Local',
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
    i0.ɵsetClassDebugInfo(LocalComp, {
      className: 'LocalComp',
      filePath: 'local.ts',
      lineNumber: 7,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/app.component.ts",
      "category": "error",
      "code": 8001,
      "messageText": "'external-comp' is not a known element:\n1. If 'external-comp' is an Angular component, then verify that it is included in the '@Component.imports' of this component.\n2. If 'external-comp' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.",
      "span": {
        "start": 247,
        "end": 262
      }
    }
  ]
}

```