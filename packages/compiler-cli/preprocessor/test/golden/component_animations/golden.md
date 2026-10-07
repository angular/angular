# /out/app.component.ts
```ts
import { Component, trigger } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const myAnimations = [trigger('spreadTrigger', [])];

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
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵproperty('@myTrigger', undefined)('@nestedTrigger', undefined)(
          '@spreadTrigger',
          undefined,
        );
      }
    },
    encapsulation: 2,
    data: {
      animation: [trigger('myTrigger', []), [trigger('nestedTrigger', [])], ...myAnimations],
    },
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
                template: '<div @myTrigger @nestedTrigger @spreadTrigger></div>',
                standalone: true,
                animations: [
                  trigger('myTrigger', []),
                  [trigger('nestedTrigger', [])],
                  ...myAnimations,
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
      lineNumber: 15,
    });
})();

const variableAnimations = [trigger('varTrigger', [])];

export class VarComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<VarComponent, never> = function VarComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || VarComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    VarComponent,
    'app-var',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: VarComponent,
    selectors: [['app-var']],
    decls: 1,
    vars: 1,
    template: function VarComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵproperty('@varTrigger', undefined);
      }
    },
    encapsulation: 2,
    data: { animation: variableAnimations },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        VarComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-var',
                template: '<div @varTrigger></div>',
                standalone: true,
                animations: variableAnimations,
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
    i0.ɵsetClassDebugInfo(VarComponent, {
      className: 'VarComponent',
      filePath: 'app.component.ts',
      lineNumber: 25,
    });
})();

export class BoundAndInvalidComponent {
  ctxValue = 'someValue';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BoundAndInvalidComponent, never> =
    function BoundAndInvalidComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || BoundAndInvalidComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    BoundAndInvalidComponent,
    'app-bound-invalid',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: BoundAndInvalidComponent,
    selectors: [['app-bound-invalid']],
    decls: 1,
    vars: 2,
    template: function BoundAndInvalidComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵproperty('@myTrigger', ctx.ctxValue)('@invalidTrigger', undefined);
      }
    },
    encapsulation: 2,
    data: { animation: [trigger('myTrigger', [])] },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BoundAndInvalidComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-bound-invalid',
                template: '<div [@myTrigger]="ctxValue" @invalidTrigger></div>',
                standalone: true,
                animations: [trigger('myTrigger', [])],
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
    i0.ɵsetClassDebugInfo(BoundAndInvalidComponent, {
      className: 'BoundAndInvalidComponent',
      filePath: 'app.component.ts',
      lineNumber: 33,
    });
})();

```