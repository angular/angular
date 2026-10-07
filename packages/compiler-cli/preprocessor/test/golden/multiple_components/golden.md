# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (): any => ({ a: true, b: false });
const _c1 = (): any => ({ c: true, d: false });

export class ComponentOne {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ComponentOne, never> = function ComponentOne_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ComponentOne)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ComponentOne,
    'app-one',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ComponentOne,
    selectors: [['app-one']],
    decls: 2,
    vars: 2,
    consts: [[3, 'ngClass']],
    template: function ComponentOne_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵtext(1, 'Component One');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngClass', i0.ɵɵpureFunction0(1, _c0));
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(ComponentOne, [CommonModule]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ComponentOne,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-one',
                template: '<div [ngClass]="{a: true, b: false}">Component One</div>',
                standalone: true,
                imports: [CommonModule],
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
    i0.ɵsetClassDebugInfo(ComponentOne, {
      className: 'ComponentOne',
      filePath: 'app.component.ts',
      lineNumber: 10,
    });
})();

export class ComponentTwo {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ComponentTwo, never> = function ComponentTwo_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ComponentTwo)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ComponentTwo,
    'app-two',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ComponentTwo,
    selectors: [['app-two']],
    decls: 2,
    vars: 2,
    consts: [[3, 'ngClass']],
    template: function ComponentTwo_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵtext(1, 'Component Two');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngClass', i0.ɵɵpureFunction0(1, _c1));
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(ComponentTwo, [CommonModule]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ComponentTwo,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-two',
                template: '<div [ngClass]="{c: true, d: false}">Component Two</div>',
                standalone: true,
                imports: [CommonModule],
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
    i0.ɵsetClassDebugInfo(ComponentTwo, {
      className: 'ComponentTwo',
      filePath: 'app.component.ts',
      lineNumber: 18,
    });
})();

```