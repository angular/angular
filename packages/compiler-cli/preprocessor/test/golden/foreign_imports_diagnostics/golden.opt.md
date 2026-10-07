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

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export function FancyButton() {}
export function GoodButton() {}
declare const Extra: unknown;
declare const other: { Cmp: unknown };
declare const framework: { import(component: {}): Function };

// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component: {}, ...rest: unknown[]): Function {
  return () => {};
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
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'Hello');
        i0.ɵɵdomElementEnd();
      }
    },
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
                standalone: true,
                template: '<div>Hello</div>',
                // @ts-ignore: @angular/core does not expose the `foreignImports` property.
                foreignImports: [
                  // Not a call expression.
                  FancyButton,
                  // Wrong arity.
                  frameworkImport(FancyButton, Extra),
                  // Callee is not a simple identifier.
                  framework.import(FancyButton),
                  // Argument is not a simple identifier.
                  frameworkImport(other.Cmp),
                  // Well-formed: still extracted despite the malformed siblings.
                  frameworkImport(GoodButton),
                ],
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
      lineNumber: 32,
    });
})();

```

# /out/legacy.component.ngtypecheck.ts
```ts
/**
 * TCB for /legacy.component.ts
 * @generated
 */

import * as i0 from './legacy.component';

/*tcb1*/
function _tcb1(this: i0.LegacyComponent) {
  if (true) {
  }
}

```

# /out/legacy.component.ts
```ts
import { Component } from '@angular/core';
import { AppComponent } from './app.component';
// @ts-ignore
import * as i0 from '@angular/core';

export class LegacyComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyComponent, never> = function LegacyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LegacyComponent,
    'app-legacy',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LegacyComponent,
    selectors: [['app-legacy']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function LegacyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Legacy');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-legacy',
                standalone: false,
                template: '<div>Legacy</div>',
                imports: [AppComponent],
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
    i0.ɵsetClassDebugInfo(LegacyComponent, {
      className: 'LegacyComponent',
      filePath: 'legacy.component.ts',
      lineNumber: 10,
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
      "code": 1010,
      "messageText": "Each foreign import must be a call expression, e.g. 'myImport(MyComponent)'.",
      "span": {
        "start": 637,
        "end": 648
      }
    },
    {
      "filePath": "/app.component.ts",
      "category": "error",
      "code": 1010,
      "messageText": "Foreign import calls must receive exactly one argument, e.g. 'myImport(MyComponent)'.",
      "span": {
        "start": 674,
        "end": 709
      }
    },
    {
      "filePath": "/app.component.ts",
      "category": "error",
      "code": 1010,
      "messageText": "The foreign import function must be a simple identifier, e.g. 'myImport(MyComponent)'.",
      "span": {
        "start": 757,
        "end": 773
      }
    },
    {
      "filePath": "/app.component.ts",
      "category": "error",
      "code": 1010,
      "messageText": "The component reference passed to the foreign import must be a simple identifier, e.g. 'myImport(MyComponent)'.",
      "span": {
        "start": 852,
        "end": 861
      }
    },
    {
      "filePath": "/legacy.component.ts",
      "category": "error",
      "code": 2010,
      "messageText": "'imports' is only valid on a component that is standalone.",
      "span": {
        "start": 196,
        "end": 210
      }
    }
  ]
}

```