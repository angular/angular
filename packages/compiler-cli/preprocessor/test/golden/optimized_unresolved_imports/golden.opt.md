# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    i1.ɵassertCustomElement('app-external', true) /*230,244*/;
  }
}

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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
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
      lineNumber: 10,
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
import * as i1 from '@angular/core';

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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
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
      lineNumber: 7,
    });
})();

```