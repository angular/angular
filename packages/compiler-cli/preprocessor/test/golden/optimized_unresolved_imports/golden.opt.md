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
 - (230, 244) 'app-external' is not a known element:
1. If 'app-external' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'app-external' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.
*/

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { LocalComponent } from './local.component';
import { ExternalComponent } from '@third-party/components';
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
        i0.ɵɵelement(0, 'app-local')(1, 'app-external');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [LocalComponent, ExternalComponent]),
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
                template: '<app-local></app-local><app-external></app-external>',
                standalone: true,
                imports: [LocalComponent, ExternalComponent],
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
      lineNumber: 11,
    });
})();

```

# /out/local.component.ngtypecheck.ts
```ts
/**
 * TCB for /local.component.ts
 * @generated
 */

import * as i0 from './local.component';

/*tcb1*/
function _tcb1(this: i0.LocalComponent) {
  if (true) {
  }
}

```

# /out/local.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class LocalComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalComponent, never> = function LocalComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalComponent,
    'app-local',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalComponent,
    selectors: [['app-local']],
    decls: 2,
    vars: 0,
    template: function LocalComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'span');
        i0.ɵɵtext(1, 'Local');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-local',
                template: '<span>Local</span>',
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
    i0.ɵsetClassDebugInfo(LocalComponent, {
      className: 'LocalComponent',
      filePath: 'local.component.ts',
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
      "filePath": "/app.component.ts",
      "category": "error",
      "code": 8001,
      "messageText": "'app-external' is not a known element:\n1. If 'app-external' is an Angular component, then verify that it is included in the '@Component.imports' of this component.\n2. If 'app-external' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.",
      "span": {
        "start": 230,
        "end": 244
      }
    }
  ]
}

```