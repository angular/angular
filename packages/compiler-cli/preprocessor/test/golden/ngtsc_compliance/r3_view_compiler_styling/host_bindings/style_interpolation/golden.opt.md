# /out/style_interpolation.ngtypecheck.ts
```ts
/**
 * TCB for /style_interpolation.ts
 * @generated
 */

import * as i0 from './style_interpolation';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.p1 /*132,134*/ /*132,134*/;
    '' + this.p1 /*167,169*/ /*167,169*/ + this.p2 /*177,179*/ /*177,179*/;
    '' +
      this.p1 /*212,214*/ /*212,214*/ +
      this.p2 /*222,224*/ /*222,224*/ +
      this.p3 /*232,234*/ /*232,234*/;
    '' +
      this.p1 /*267,269*/ /*267,269*/ +
      this.p2 /*277,279*/ /*277,279*/ +
      this.p3 /*287,289*/ /*287,289*/ +
      this.p4 /*297,299*/ /*297,299*/;
    '' +
      this.p1 /*332,334*/ /*332,334*/ +
      this.p2 /*342,344*/ /*342,344*/ +
      this.p3 /*352,354*/ /*352,354*/ +
      this.p4 /*362,364*/ /*362,364*/ +
      this.p5 /*372,374*/ /*372,374*/;
    '' +
      this.p1 /*407,409*/ /*407,409*/ +
      this.p2 /*417,419*/ /*417,419*/ +
      this.p3 /*427,429*/ /*427,429*/ +
      this.p4 /*437,439*/ /*437,439*/ +
      this.p5 /*447,449*/ /*447,449*/ +
      this.p6 /*457,459*/ /*457,459*/;
    '' +
      this.p1 /*492,494*/ /*492,494*/ +
      this.p2 /*502,504*/ /*502,504*/ +
      this.p3 /*512,514*/ /*512,514*/ +
      this.p4 /*522,524*/ /*522,524*/ +
      this.p5 /*532,534*/ /*532,534*/ +
      this.p6 /*542,544*/ /*542,544*/ +
      this.p7 /*552,554*/ /*552,554*/;
    '' +
      this.p1 /*587,589*/ /*587,589*/ +
      this.p2 /*597,599*/ /*597,599*/ +
      this.p3 /*607,609*/ /*607,609*/ +
      this.p4 /*617,619*/ /*617,619*/ +
      this.p5 /*627,629*/ /*627,629*/ +
      this.p6 /*637,639*/ /*637,639*/ +
      this.p7 /*647,649*/ /*647,649*/ +
      this.p8 /*657,659*/ /*657,659*/;
    '' +
      this.p1 /*692,694*/ /*692,694*/ +
      this.p2 /*702,704*/ /*702,704*/ +
      this.p3 /*712,714*/ /*712,714*/ +
      this.p4 /*722,724*/ /*722,724*/ +
      this.p5 /*732,734*/ /*732,734*/ +
      this.p6 /*742,744*/ /*742,744*/ +
      this.p7 /*752,754*/ /*752,754*/ +
      this.p8 /*762,764*/ /*762,764*/ +
      this.p9 /*772,774*/ /*772,774*/;
  }
}

```

# /out/style_interpolation.ts
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
        i0.ɵɵstyleMap(i0.ɵɵinterpolate1('p1:', ctx.p1, ';'));
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(i0.ɵɵinterpolate2('p1:', ctx.p1, ';p2:', ctx.p2, ';'));
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(i0.ɵɵinterpolate3('p1:', ctx.p1, ';p2:', ctx.p2, ';p3:', ctx.p3, ';'));
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolate4('p1:', ctx.p1, ';p2:', ctx.p2, ';p3:', ctx.p3, ';p4:', ctx.p4, ';'),
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolate5(
            'p1:',
            ctx.p1,
            ';p2:',
            ctx.p2,
            ';p3:',
            ctx.p3,
            ';p4:',
            ctx.p4,
            ';p5:',
            ctx.p5,
            ';',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolate6(
            'p1:',
            ctx.p1,
            ';p2:',
            ctx.p2,
            ';p3:',
            ctx.p3,
            ';p4:',
            ctx.p4,
            ';p5:',
            ctx.p5,
            ';p6:',
            ctx.p6,
            ';',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolate7(
            'p1:',
            ctx.p1,
            ';p2:',
            ctx.p2,
            ';p3:',
            ctx.p3,
            ';p4:',
            ctx.p4,
            ';p5:',
            ctx.p5,
            ';p6:',
            ctx.p6,
            ';p7:',
            ctx.p7,
            ';',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolate8(
            'p1:',
            ctx.p1,
            ';p2:',
            ctx.p2,
            ';p3:',
            ctx.p3,
            ';p4:',
            ctx.p4,
            ';p5:',
            ctx.p5,
            ';p6:',
            ctx.p6,
            ';p7:',
            ctx.p7,
            ';p8:',
            ctx.p8,
            ';',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleMap(
          i0.ɵɵinterpolateV([
            'p1:',
            ctx.p1,
            ';p2:',
            ctx.p2,
            ';p3:',
            ctx.p3,
            ';p4:',
            ctx.p4,
            ';p5:',
            ctx.p5,
            ';p6:',
            ctx.p6,
            ';p7:',
            ctx.p7,
            ';p8:',
            ctx.p8,
            ';p9:',
            ctx.p9,
            ';',
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
        <div style="p1:{{p1}};"></div>
        <div style="p1:{{p1}};p2:{{p2}};"></div>
        <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};"></div>
        <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};"></div>
        <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};"></div>
        <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};"></div>
        <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};"></div>
        <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};p8:{{p8}};"></div>
        <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};p8:{{p8}};p9:{{p9}};"></div>
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
      filePath: 'style_interpolation.ts',
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