# /out/app.ts
```ts
import { Component } from '@angular/core';
import { MyDtsDirective, MyDtsComponent } from './my-dir';
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
    decls: 5,
    vars: 4,
    consts: [
      ['ref1', 'myDir1'],
      ['ref2', 'myCmp'],
      ['my-dir', '', 3, 'myProp'],
      [3, 'myProp'],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 2, 0)(2, 'my-cmp', 3, 1);
        i0.ɵɵtext(4);
      }
      if (rf & 2) {
        const ref1_r1: any = i0.ɵɵreference(1);
        const ref2_r2: any = i0.ɵɵreference(3);
        i0.ɵɵproperty('myProp', 'test');
        i0.ɵɵadvance(2);
        i0.ɵɵproperty('myProp', 'test');
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate2(' ', ref1_r1.myProp, ' - ', ref2_r2.myProp, ' ');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [MyDtsDirective, MyDtsComponent]),
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
                imports: [MyDtsDirective, MyDtsComponent],
                template: `
        <div my-dir #ref1="myDir1" [myProp]="'test'"></div>
        <my-cmp #ref2="myCmp" [myProp]="'test'"></my-cmp>
        {{ref1.myProp}} - {{ref2.myProp}}
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
      filePath: 'app.ts',
      lineNumber: 14,
    });
})();

```