# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from 'test-lib';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    var _t1 = null! as typeof i1.TestComponent.ngAcceptInputType_width; /*T:VAE*/
    _t1 /*158,163*/ = '100' /*158,169*/;
    var _t2 = null! as typeof i1.TestComponent.ngAcceptInputType_height; /*T:VAE*/
    _t2 /*177,183*/ = '200' /*177,189*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { TestComponent } from 'test-lib';
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
    decls: 1,
    vars: 0,
    consts: [['width', '100', 'height', '200']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'test-cmp', 0);
      }
    },
    dependencies: [TestComponent],
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
        <test-cmp 
          width="100" 
          height="200"
        ></test-cmp>
      `,
                standalone: true,
                imports: [TestComponent],
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
      lineNumber: 15,
    });
})();

```