# /out/chain_multiple_bindings_mixed.ngtypecheck.ts
```ts
/**
 * TCB for /chain_multiple_bindings_mixed.ts
 * @generated
 */

import * as i0 from './chain_multiple_bindings_mixed';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*207,274*/ = null! as i0.ButtonDir; /*T:VAE*/
    _t1.label /*256,261*/ = '' + (1 /*265,266*/ + 3 /*269,270*/) /*265,270*/ /*256,273*/;
    1 /*224,225*/;
    2 /*238,239*/;
    3 /*253,254*/;
  }
}

```

# /out/chain_multiple_bindings_mixed.ts
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
    vars: 5,
    consts: [[3, 'title', 'tabindex', 'label']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'button', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('label', i0.ɵɵinterpolate(1 + 3))('title', 1)('tabindex', 3);
        i0.ɵɵattribute('id', 2);
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
                  '<button [title]="1" [attr.id]="2" [tabindex]="3" label="{{1 + 3}}"></button>',
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
      filePath: 'chain_multiple_bindings_mixed.ts',
      lineNumber: 15,
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