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
    vars: 3,
    consts: [[3, 'privateInput', 'protectedInput', 'readonlyInput']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'test-cmp', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('privateInput', 'val1')('protectedInput', 'val2')('readonlyInput', 'val3');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [TestComponent]),
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
          [privateInput]="'val1'" 
          [protectedInput]="'val2'" 
          [readonlyInput]="'val3'"
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
      lineNumber: 16,
    });
})();

```