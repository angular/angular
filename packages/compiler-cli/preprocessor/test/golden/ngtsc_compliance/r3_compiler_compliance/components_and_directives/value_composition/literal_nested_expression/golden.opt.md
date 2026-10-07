# /out/literal_nested_expression.ngtypecheck.ts
```ts
/**
 * TCB for /literal_nested_expression.ts
 * @generated
 */

import * as i0 from './literal_nested_expression';

/*tcb1*/
function _tcb1(this: i0.NestedComp) {
  if (true) {
    '' + this.config /*128,134*/ /*128,134*/.animation /*135,144*/ /*128,144*/;
    '' +
      this.config /*163,169*/ /*163,169*/.actions /*170,177*/ /*163,177*/[0 /*178,179*/] /*163,180*/
        .opacity /*181,188*/ /*163,188*/;
    '' +
      this.config /*207,213*/ /*207,213*/.actions /*214,221*/ /*207,221*/[1 /*222,223*/] /*207,224*/
        .duration /*225,233*/ /*207,233*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.MyApp) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*398,514*/ = null! as i0.NestedComp; /*T:VAE*/
    _t1.config /*412,418*/ = {
      'animation' /*422,431*/: this.name /*433,437*/ /*433,437*/,
      'actions' /*439,446*/: [
        { 'opacity' /*451,458*/: 0 /*460,461*/, 'duration' /*463,471*/: 0 /*473,474*/ } /*449,475*/,
        {
          'opacity' /*478,485*/: 1 /*487,488*/,
          'duration' /*490,498*/: this.duration /*500,508*/ /*500,508*/,
        } /*477,510*/,
      ] /*448,511*/,
    } /*421,512*/ /*411,513*/;
  }
}

```

# /out/literal_nested_expression.ts
```ts
import { Component, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (): any => ({ opacity: 0, duration: 0 });
const _c1 = (a0: any): any => ({ opacity: 1, duration: a0 });
const _c2 = (a0: any, a1: any): any => [a0, a1];
const _c3 = (a0: any, a1: any): any => ({ animation: a0, actions: a1 });

export class NestedComp {
  config!: { [key: string]: any };
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NestedComp, never> = function NestedComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NestedComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    NestedComp,
    'nested-comp',
    never,
    { 'config': { 'alias': 'config'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: NestedComp,
    selectors: [['nested-comp']],
    inputs: { config: 'config' },
    standalone: false,
    decls: 6,
    vars: 3,
    template: function NestedComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'p');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'p');
        i0.ɵɵtext(3);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, 'p');
        i0.ɵɵtext(5);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.config.animation, ' ');
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(' ', ctx.config.actions[0].opacity, ' ');
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(' ', ctx.config.actions[1].duration, ' ');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NestedComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'nested-comp',
                template: `
        <p> {{ config.animation }} </p>
        <p> {{config.actions[0].opacity }} </p>
        <p> {{config.actions[1].duration }} </p>
      `,
                standalone: false,
              },
            ],
          },
        ],
        null,
        { config: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(NestedComp, {
      className: 'NestedComp',
      filePath: 'literal_nested_expression.ts',
      lineNumber: 12,
    });
})();

export class MyApp {
  name = 'slide';
  duration = 100;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    standalone: false,
    decls: 1,
    vars: 10,
    consts: [[3, 'config']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'nested-comp', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty(
          'config',
          i0.ɵɵpureFunction2(
            7,
            _c3,
            ctx.name,
            i0.ɵɵpureFunction2(
              4,
              _c2,
              i0.ɵɵpureFunction0(1, _c0),
              i0.ɵɵpureFunction1(2, _c1, ctx.duration),
            ),
          ),
        );
      }
    },
    dependencies: [NestedComp],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                template: `
      <nested-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1, duration: duration }]}">
      </nested-comp>
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'literal_nested_expression.ts',
      lineNumber: 24,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof NestedComp, typeof MyApp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [NestedComp, MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [NestedComp, MyApp] });
})();

```