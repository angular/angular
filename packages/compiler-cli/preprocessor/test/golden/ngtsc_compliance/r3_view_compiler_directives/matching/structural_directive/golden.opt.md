# /out/structural_directive.ngtypecheck.ts
```ts
/**
 * TCB for /structural_directive.ts
 * @generated
 */

import * as i0 from './structural_directive';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*258,278*/ = null! as i0.SomeDirective; /*T:VAE*/
    _t1.someDirective /*264,277*/ = '' /*264,277*/;
  }
}

```

# /out/structural_directive.ts
```ts
import { Component, Directive, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'div');
  }
}

export class SomeDirective {
  someDirective: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never> = function SomeDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SomeDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    SomeDirective,
    '[someDirective]',
    never,
    { 'someDirective': { 'alias': 'someDirective'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SomeDirective,
    selectors: [['', 'someDirective', '']],
    inputs: { someDirective: 'someDirective' },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SomeDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[someDirective]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { someDirective: [{ type: Input }] },
      );
  }
}

export class MyComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [[4, 'someDirective']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 0, 'div', 0);
      }
    },
    dependencies: [SomeDirective],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-component',
                template: '<div *someDirective></div>',
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'structural_directive.ts',
      lineNumber: 15,
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
    [typeof SomeDirective, typeof MyComponent],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [SomeDirective, MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, MyComponent] });
})();

```