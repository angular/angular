# /out/output_directive.ngtypecheck.ts
```ts
/**
 * TCB for /output_directive.ts
 * @generated
 */

import * as i0 from './output_directive';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*290,320*/ = null! as i0.SomeDirective; /*T:VAE*/
    _t1['someDirective'] /*296,309*/
      .subscribe(($event /*T:EP*/): any => {
        this
          .noop /*312,316*/
          () /*312,318*/;
      }) /*295,319*/;
  }
}

```

# /out/output_directive.ts
```ts
import { Component, Directive, EventEmitter, NgModule, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SomeDirective {
  someDirective = new EventEmitter();
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
    {},
    { 'someDirective': 'someDirective' },
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SomeDirective,
    selectors: [['', 'someDirective', '']],
    outputs: { someDirective: 'someDirective' },
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
        { someDirective: [{ type: Output }] },
      );
  }
}

export class MyComponent {
  noop() {}
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
    consts: [[3, 'someDirective']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵlistener(
          'someDirective',
          function MyComponent_Template_div_someDirective_0_listener(): any {
            return ctx.noop();
          },
        );
        i0.ɵɵelementEnd();
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
                template: '<div (someDirective)="noop()"></div>',
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
      filePath: 'output_directive.ts',
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