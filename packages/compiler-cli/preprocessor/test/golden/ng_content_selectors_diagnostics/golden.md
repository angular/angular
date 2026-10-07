# /out/ng_content_selectors_diagnostics.ts
```ts
import { Component } from '@angular/core';
import { HasContent } from 'test-lib';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'div')(1, 'div');
  }
}

export class MyApp {
  show = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    decls: 2,
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'has-content');
        i0.ɵɵconditionalCreate(1, MyApp_Conditional_1_Template, 2, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵconditional(ctx.show ? 1 : -1);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(MyApp, [HasContent]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                imports: [HasContent],
                template: `
        <has-content>
          @if (show) {
            <div></div>
            <div></div>
          }
        </has-content>
      `,
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'ng_content_selectors_diagnostics.ts',
      lineNumber: 17,
    });
})();

```