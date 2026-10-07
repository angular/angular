# /out/chain_bindings_with_interpolations.ngtypecheck.ts
```ts
/**
 * TCB for /chain_bindings_with_interpolations.ts
 * @generated
 */

import * as i0 from './chain_bindings_with_interpolations';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*211,295*/ = null! as i0.ButtonDir; /*T:VAE*/
    _t1.label /*261,266*/ =
      '' +
      (1 /*276,277*/ + 3 /*280,281*/) /*276,281*/ +
      (2 /*286,287*/ + 3 /*290,291*/) /*286,291*/ /*261,294*/;
    1 /*228,229*/;
    2 /*237,238*/;
    '' + (0 /*252,253*/ + 3 /*256,257*/) /*252,257*/;
  }
}

```

# /out/chain_bindings_with_interpolations.ts
```ts
import { Component, Directive, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ButtonDir {
  label!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ButtonDir, never> = function ButtonDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ButtonDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ButtonDir,
    'button',
    never,
    { 'label': { 'alias': 'label'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ButtonDir,
    selectors: [['button']],
    inputs: { label: 'label' },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ButtonDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'button',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { label: [{ type: Input }] },
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
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['ng-component']],
    standalone: false,
    decls: 1,
    vars: 7,
    consts: [[3, 'title', 'id', 'tabindex', 'label']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'button', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('tabindex', i0.ɵɵinterpolate(0 + 3))(
          'label',
          i0.ɵɵinterpolate2('hello-', 1 + 3, '-', 2 + 3),
        )('title', 1)('id', 2);
      }
    },
    dependencies: [ButtonDir],
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
                template:
                  '<button [title]="1" [id]="2" tabindex="{{0 + 3}}" label="hello-{{1 + 3}}-{{2 + 3}}"></button>',
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
      filePath: 'chain_bindings_with_interpolations.ts',
      lineNumber: 16,
    });
})();

export class MyMod {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never> = function MyMod_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyMod)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyMod,
    [typeof ButtonDir, typeof MyComponent],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyMod> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyMod,
        [{ type: NgModule, args: [{ declarations: [ButtonDir, MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [ButtonDir, MyComponent] });
})();

```