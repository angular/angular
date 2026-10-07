# /out/class_interpolation.ngtypecheck.ts
```ts
/**
 * TCB for /class_interpolation.ts
 * @generated
 */

import * as i0 from './class_interpolation';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.p1 /*130,132*/ /*130,132*/;
    '' + this.p1 /*163,165*/ /*163,165*/ + this.p2 /*170,172*/ /*170,172*/;
    '' +
      this.p1 /*203,205*/ /*203,205*/ +
      this.p2 /*210,212*/ /*210,212*/ +
      this.p3 /*217,219*/ /*217,219*/;
    '' +
      this.p1 /*250,252*/ /*250,252*/ +
      this.p2 /*257,259*/ /*257,259*/ +
      this.p3 /*264,266*/ /*264,266*/ +
      this.p4 /*271,273*/ /*271,273*/;
    '' +
      this.p1 /*304,306*/ /*304,306*/ +
      this.p2 /*311,313*/ /*311,313*/ +
      this.p3 /*318,320*/ /*318,320*/ +
      this.p4 /*325,327*/ /*325,327*/ +
      this.p5 /*332,334*/ /*332,334*/;
    '' +
      this.p1 /*365,367*/ /*365,367*/ +
      this.p2 /*372,374*/ /*372,374*/ +
      this.p3 /*379,381*/ /*379,381*/ +
      this.p4 /*386,388*/ /*386,388*/ +
      this.p5 /*393,395*/ /*393,395*/ +
      this.p6 /*400,402*/ /*400,402*/;
    '' +
      this.p1 /*433,435*/ /*433,435*/ +
      this.p2 /*440,442*/ /*440,442*/ +
      this.p3 /*447,449*/ /*447,449*/ +
      this.p4 /*454,456*/ /*454,456*/ +
      this.p5 /*461,463*/ /*461,463*/ +
      this.p6 /*468,470*/ /*468,470*/ +
      this.p7 /*475,477*/ /*475,477*/;
    '' +
      this.p1 /*508,510*/ /*508,510*/ +
      this.p2 /*515,517*/ /*515,517*/ +
      this.p3 /*522,524*/ /*522,524*/ +
      this.p4 /*529,531*/ /*529,531*/ +
      this.p5 /*536,538*/ /*536,538*/ +
      this.p6 /*543,545*/ /*543,545*/ +
      this.p7 /*550,552*/ /*550,552*/ +
      this.p8 /*557,559*/ /*557,559*/;
    '' +
      this.p1 /*590,592*/ /*590,592*/ +
      this.p2 /*597,599*/ /*597,599*/ +
      this.p3 /*604,606*/ /*604,606*/ +
      this.p4 /*611,613*/ /*611,613*/ +
      this.p5 /*618,620*/ /*618,620*/ +
      this.p6 /*625,627*/ /*625,627*/ +
      this.p7 /*632,634*/ /*632,634*/ +
      this.p8 /*639,641*/ /*639,641*/ +
      this.p9 /*646,648*/ /*646,648*/;
  }
}

```

# /out/class_interpolation.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  p1 = 100;
  p2 = 100;
  p3 = 100;
  p4 = 100;
  p5 = 100;
  p6 = 100;
  p7 = 100;
  p8 = 100;
  p9 = 100;
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
    decls: 9,
    vars: 63,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div')(1, 'div')(2, 'div')(3, 'div')(4, 'div')(5, 'div')(6, 'div')(
          7,
          'div',
        )(8, 'div');
      }
      if (rf & 2) {
        i0.ɵɵclassMap(i0.ɵɵinterpolate1('A', ctx.p1, 'B'));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(i0.ɵɵinterpolate2('A', ctx.p1, 'B', ctx.p2, 'C'));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(i0.ɵɵinterpolate3('A', ctx.p1, 'B', ctx.p2, 'C', ctx.p3, 'D'));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(i0.ɵɵinterpolate4('A', ctx.p1, 'B', ctx.p2, 'C', ctx.p3, 'D', ctx.p4, 'E'));
        i0.ɵɵadvance();
        i0.ɵɵclassMap(
          i0.ɵɵinterpolate5('A', ctx.p1, 'B', ctx.p2, 'C', ctx.p3, 'D', ctx.p4, 'E', ctx.p5, 'F'),
        );
        i0.ɵɵadvance();
        i0.ɵɵclassMap(
          i0.ɵɵinterpolate6(
            'A',
            ctx.p1,
            'B',
            ctx.p2,
            'C',
            ctx.p3,
            'D',
            ctx.p4,
            'E',
            ctx.p5,
            'F',
            ctx.p6,
            'G',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵclassMap(
          i0.ɵɵinterpolate7(
            'A',
            ctx.p1,
            'B',
            ctx.p2,
            'C',
            ctx.p3,
            'D',
            ctx.p4,
            'E',
            ctx.p5,
            'F',
            ctx.p6,
            'G',
            ctx.p7,
            'H',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵclassMap(
          i0.ɵɵinterpolate8(
            'A',
            ctx.p1,
            'B',
            ctx.p2,
            'C',
            ctx.p3,
            'D',
            ctx.p4,
            'E',
            ctx.p5,
            'F',
            ctx.p6,
            'G',
            ctx.p7,
            'H',
            ctx.p8,
            'I',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵclassMap(
          i0.ɵɵinterpolateV([
            'A',
            ctx.p1,
            'B',
            ctx.p2,
            'C',
            ctx.p3,
            'D',
            ctx.p4,
            'E',
            ctx.p5,
            'F',
            ctx.p6,
            'G',
            ctx.p7,
            'H',
            ctx.p8,
            'I',
            ctx.p9,
            'J',
          ]),
        );
      }
    },
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
                template: `
        <div class="A{{p1}}B"></div>
        <div class="A{{p1}}B{{p2}}C"></div>
        <div class="A{{p1}}B{{p2}}C{{p3}}D"></div>
        <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E"></div>
        <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F"></div>
        <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G"></div>
        <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H"></div>
        <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I"></div>
        <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I{{p9}}J"></div>
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
      filePath: 'class_interpolation.ts',
      lineNumber: 18,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

```