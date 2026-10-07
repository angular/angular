# /out/chain_multiple_bindings_with_child_elements.ngtypecheck.ts
```ts
/**
 * TCB for /chain_multiple_bindings_with_child_elements.ts
 * @generated
 */

import * as i0 from './chain_multiple_bindings_with_child_elements';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.myTitle /*233,240*/ /*233,240*/;
    this.buttonId /*248,256*/ /*248,256*/;
    1 /*270,271*/;
    var _t1 /*T:DIR:0*/ /*280,332*/ = null! as i0.SpanDir; /*T:VAE*/
    _t1.someProp /*314,322*/ = 1 /*325,326*/ + 2 /*329,330*/ /*325,330*/ /*313,331*/;
    1 /*292,293*/;
    ('hello') /*304,311*/;
  }
}

```

# /out/chain_multiple_bindings_with_child_elements.ts
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
    decls: 2,
    vars: 6,
    consts: [
      [3, 'title', 'id', 'tabindex'],
      [3, 'id', 'title', 'someProp'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'button', 0);
        i0.ɵɵelement(1, 'span', 1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('title', ctx.myTitle)('id', ctx.buttonId)('tabindex', 1);
        i0.ɵɵadvance();
        i0.ɵɵproperty('id', 1)('title', 'hello')('someProp', 1 + 2);
      }
    },
    dependencies: [SpanDir],
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
        <button [title]="myTitle" [id]="buttonId" [tabindex]="1">
          <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
        </button>`,
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
      filePath: 'chain_multiple_bindings_with_child_elements.ts',
      lineNumber: 18,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof MyComponent, typeof SpanDir], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyMod> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyMod,
        [{ type: NgModule, args: [{ declarations: [MyComponent, SpanDir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [MyComponent, SpanDir] });
})();

```