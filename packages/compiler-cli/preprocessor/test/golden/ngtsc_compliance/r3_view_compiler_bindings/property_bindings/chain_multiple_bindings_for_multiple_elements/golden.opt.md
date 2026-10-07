# /out/chain_multiple_bindings_for_multiple_elements.ngtypecheck.ts
```ts
/**
 * TCB for /chain_multiple_bindings_for_multiple_elements.ts
 * @generated
 */

import * as i0 from './chain_multiple_bindings_for_multiple_elements';

/*tcb1*/
function _tcb1(this: i0.CustomEl) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.MyComponent) {
  if (true) {
    this.myTitle /*395,402*/ /*395,402*/;
    this.buttonId /*410,418*/ /*410,418*/;
    1 /*432,433*/;
    var _t1 /*T:DIR:0*/ /*449,501*/ = null! as i0.SpanDir; /*T:VAE*/
    _t1.someProp /*483,491*/ = 1 /*494,495*/ + 2 /*498,499*/ /*494,499*/ /*482,500*/;
    1 /*461,462*/;
    ('hello') /*473,480*/;
    var _t2 /*T:DIR:0*/ /*513,560*/ = null! as i0.CustomEl; /*T:VAE*/
    _t2.prop /*530,534*/ = 'one' /*537,542*/ /*529,543*/;
    _t2.otherProp /*545,554*/ = 2 /*557,558*/ /*544,559*/;
  }
}

```

# /out/chain_multiple_bindings_for_multiple_elements.ts
```ts
import { Component, Directive, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SpanDir {
  someProp!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SpanDir, never> = function SpanDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SpanDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    SpanDir,
    'span',
    never,
    { 'someProp': { 'alias': 'someProp'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SpanDir,
    selectors: [['span']],
    inputs: { someProp: 'someProp' },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SpanDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'span',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { someProp: [{ type: Input }] },
      );
  }
}

export class CustomEl {
  prop!: any;
  otherProp!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CustomEl, never> = function CustomEl_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CustomEl)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CustomEl,
    'custom-element',
    never,
    {
      'prop': { 'alias': 'prop'; 'required': false };
      'otherProp': { 'alias': 'otherProp'; 'required': false };
    },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CustomEl,
    selectors: [['custom-element']],
    inputs: { prop: 'prop', otherProp: 'otherProp' },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function CustomEl_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CustomEl,
        [
          {
            type: Component,
            args: [
              {
                selector: 'custom-element',
                template: '',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { prop: [{ type: Input }], otherProp: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CustomEl, {
      className: 'CustomEl',
      filePath: 'chain_multiple_bindings_for_multiple_elements.ts',
      lineNumber: 15,
    });
})();

export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
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
    decls: 3,
    vars: 8,
    consts: [
      [3, 'title', 'id', 'tabindex'],
      [3, 'id', 'title', 'someProp'],
      [3, 'prop', 'otherProp'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'button', 0)(1, 'span', 1)(2, 'custom-element', 2);
      }
      if (rf & 2) {
        i0.ɵɵproperty('title', ctx.myTitle)('id', ctx.buttonId)('tabindex', 1);
        i0.ɵɵadvance();
        i0.ɵɵproperty('id', 1)('title', 'hello')('someProp', 1 + 2);
        i0.ɵɵadvance();
        i0.ɵɵproperty('prop', 'one')('otherProp', 2);
      }
    },
    dependencies: [CustomEl, SpanDir],
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
                template: `
        <button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>
        <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
        <custom-element [prop]="'one'" [otherProp]="2"></custom-element>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'chain_multiple_bindings_for_multiple_elements.ts',
      lineNumber: 28,
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
    [typeof MyComponent, typeof CustomEl, typeof SpanDir],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyMod> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyMod,
        [{ type: NgModule, args: [{ declarations: [MyComponent, CustomEl, SpanDir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [MyComponent, CustomEl, SpanDir] });
})();

```