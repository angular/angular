# /out/property_pure_functions.ngtypecheck.ts
```ts
/**
 * TCB for /property_pure_functions.ts
 * @generated
 */

import * as i0 from './property_pure_functions';

var _pipe1 = null! as i0.PipePipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*428,546*/ = null! as i0.DivDir; /*T:VAE*/
    _t1.ternary /*438,445*/ = this.cond /*448,452*/ /*448,452*/
      ? [this.a /*456,457*/ /*456,457*/] /*455,458*/
      : [0 /*462,463*/] /*461,464*/ /*448,464*/ /*437,465*/;
    _t1.pipe /*471,475*/ = _pipe1.transform(
      /*486,490*/ this.value /*478,483*/ /*478,483*/,
      1 /*491,492*/,
      2 /*493,494*/,
    ) /*478,494*/ /*470,495*/;
    _t1.and /*501,504*/ = this.cond /*507,511*/ /*507,511*/ && [
      this.b /*516,517*/ /*516,517*/,
    ] /*515,518*/ /*507,518*/ /*500,519*/;
    _t1.or /*525,527*/ = this.cond /*530,534*/ /*530,534*/ || [
      this.c /*539,540*/ /*539,540*/,
    ] /*538,541*/ /*530,541*/ /*524,542*/;
  }
}

```

# /out/property_pure_functions.ts
```ts
import { Component, Directive, Input, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any): any => [a0];
const _c1 = (): any => [0];

export class DivDir {
  ternary!: any;
  pipe!: any;
  and!: any;
  or!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DivDir, never> = function DivDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DivDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DivDir,
    'div',
    never,
    {
      'ternary': { 'alias': 'ternary'; 'required': false };
      'pipe': { 'alias': 'pipe'; 'required': false };
      'and': { 'alias': 'and'; 'required': false };
      'or': { 'alias': 'or'; 'required': false };
    },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DivDir,
    selectors: [['div']],
    inputs: { ternary: 'ternary', pipe: 'pipe', and: 'and', or: 'or' },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DivDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'div',
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          ternary: [{ type: Input }],
          pipe: [{ type: Input }],
          and: [{ type: Input }],
          or: [{ type: Input }],
        },
      );
  }
}

export class PipePipe {
  transform(v: any, a: any, a2: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipePipe, never> = function PipePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PipePipe, 'pipe', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'pipe',
    type: PipePipe,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PipePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'pipe',
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

export class MyComponent {
  id = 'one';
  cond = '';
  value = '';
  a = '';
  b = '';
  c = '';
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
    decls: 2,
    vars: 15,
    consts: [[3, 'ternary', 'pipe', 'and', 'or']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
        i0.ɵɵpipe(1, 'pipe');
      }
      if (rf & 2) {
        i0.ɵɵproperty(
          'ternary',
          ctx.cond ? i0.ɵɵpureFunction1(8, _c0, ctx.a) : i0.ɵɵpureFunction0(10, _c1),
        )('pipe', i0.ɵɵpipeBind3(1, 4, ctx.value, 1, 2))(
          'and',
          ctx.cond && i0.ɵɵpureFunction1(11, _c0, ctx.b),
        )('or', ctx.cond || i0.ɵɵpureFunction1(13, _c0, ctx.c));
      }
    },
    dependencies: [DivDir, PipePipe],
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
                template: `<div
        [ternary]="cond ? [a] : [0]"
        [pipe]="value | pipe:1:2"
        [and]="cond && [b]"
        [or]="cond || [c]"
      ></div>`,
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
      filePath: 'property_pure_functions.ts',
      lineNumber: 32,
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
    [typeof MyComponent, typeof DivDir, typeof PipePipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, DivDir, PipePipe] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, DivDir, PipePipe] });
})();

```