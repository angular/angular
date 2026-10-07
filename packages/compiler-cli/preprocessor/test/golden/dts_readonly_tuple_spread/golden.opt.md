# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
  }
}

```

# /out/app.ts
```ts
import { Component } from '@angular/core';
import { READONLY_DEPS, DirA, DirB } from './directives';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './directives';

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
    decls: 3,
    vars: 0,
    consts: [['dirA', '', 'dirB', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0)(1, 'h1');
        i0.ɵɵtext(2, 'Hello');
        i0.ɵɵelementEnd()();
      }
    },
    dependencies: [i1.DirA, i1.DirB],
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
                imports: [...READONLY_DEPS],
                template: '<div dirA dirB><h1>Hello</h1></div>',
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
      filePath: 'app.ts',
      lineNumber: 10,
    });
})();

```