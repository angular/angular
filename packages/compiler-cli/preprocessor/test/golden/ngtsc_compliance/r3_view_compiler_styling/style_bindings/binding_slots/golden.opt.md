# /out/binding_slots.ngtypecheck.ts
```ts
/**
 * TCB for /binding_slots.ts
 * @generated
 */

import * as i0 from './binding_slots';

/*tcb1*/
function _tcb1(this: i0.MyComponentWithInterpolation) {
  if (true) {
    '' + this.fooId /*157,162*/ /*157,162*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.MyComponentWithMuchosInterpolation) {
  if (true) {
    '' + this.fooId /*380,385*/ /*380,385*/ + this.fooUsername /*392,403*/ /*392,403*/;
  }
}

/*tcb3*/
function _tcb3(this: i0.MyComponentWithoutInterpolation) {
  if (true) {
    this.exp /*642,645*/ /*642,645*/;
  }
}

```

# /out/binding_slots.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponentWithInterpolation {
  fooId = '123';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponentWithInterpolation, never> =
    function MyComponentWithInterpolation_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MyComponentWithInterpolation)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponentWithInterpolation,
    'my-component-with-interpolation',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponentWithInterpolation,
    selectors: [['my-component-with-interpolation']],
    standalone: false,
    decls: 1,
    vars: 3,
    template: function MyComponentWithInterpolation_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵclassMap(i0.ɵɵinterpolate1('foo foo-', ctx.fooId));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponentWithInterpolation,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-component-with-interpolation',
                template: `
        <div class="foo foo-{{ fooId }}"></div>
      `,
                standalone: false,
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
    i0.ɵsetClassDebugInfo(MyComponentWithInterpolation, {
      className: 'MyComponentWithInterpolation',
      filePath: 'binding_slots.ts',
      lineNumber: 10,
    });
})();

export class MyComponentWithMuchosInterpolation {
  fooId = '123';
  fooUsername = 'superfoo';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponentWithMuchosInterpolation, never> =
    function MyComponentWithMuchosInterpolation_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MyComponentWithMuchosInterpolation)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponentWithMuchosInterpolation,
    'my-component-with-muchos-interpolation',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponentWithMuchosInterpolation,
    selectors: [['my-component-with-muchos-interpolation']],
    standalone: false,
    decls: 1,
    vars: 4,
    template: function MyComponentWithMuchosInterpolation_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵclassMap(i0.ɵɵinterpolate2('foo foo-', ctx.fooId, '-', ctx.fooUsername));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponentWithMuchosInterpolation,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-component-with-muchos-interpolation',
                template: `
        <div class="foo foo-{{ fooId }}-{{ fooUsername }}"></div>
      `,
                standalone: false,
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
    i0.ɵsetClassDebugInfo(MyComponentWithMuchosInterpolation, {
      className: 'MyComponentWithMuchosInterpolation',
      filePath: 'binding_slots.ts',
      lineNumber: 21,
    });
})();

export class MyComponentWithoutInterpolation {
  exp = 'bar';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponentWithoutInterpolation, never> =
    function MyComponentWithoutInterpolation_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MyComponentWithoutInterpolation)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponentWithoutInterpolation,
    'my-component-without-interpolation',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponentWithoutInterpolation,
    selectors: [['my-component-without-interpolation']],
    standalone: false,
    decls: 1,
    vars: 2,
    template: function MyComponentWithoutInterpolation_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵclassMap(ctx.exp);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponentWithoutInterpolation,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-component-without-interpolation',
                template: `
        <div [class]="exp"></div>
      `,
                standalone: false,
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
    i0.ɵsetClassDebugInfo(MyComponentWithoutInterpolation, {
      className: 'MyComponentWithoutInterpolation',
      filePath: 'binding_slots.ts',
      lineNumber: 33,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [
      typeof MyComponentWithInterpolation,
      typeof MyComponentWithMuchosInterpolation,
      typeof MyComponentWithoutInterpolation,
    ],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [
                  MyComponentWithInterpolation,
                  MyComponentWithMuchosInterpolation,
                  MyComponentWithoutInterpolation,
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
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, {
      declarations: [
        MyComponentWithInterpolation,
        MyComponentWithMuchosInterpolation,
        MyComponentWithoutInterpolation,
      ],
    });
})();

```