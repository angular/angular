# /out/interpolated_properties.ngtypecheck.ts
```ts
/**
 * TCB for /interpolated_properties.ts
 * @generated
 */

import * as i0 from './interpolated_properties';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' +
      this.one /*124,127*/ /*124,127*/ +
      this.two /*132,135*/ /*132,135*/ +
      this.three /*140,145*/ /*140,145*/ +
      this.four /*150,154*/ /*150,154*/ +
      this.five /*159,163*/ /*159,163*/ +
      this.six /*168,171*/ /*168,171*/ +
      this.seven /*176,181*/ /*176,181*/ +
      this.eight /*186,191*/ /*186,191*/ +
      this.nine /*196,200*/ /*196,200*/;
    '' +
      this.one /*231,234*/ /*231,234*/ +
      this.two /*239,242*/ /*239,242*/ +
      this.three /*247,252*/ /*247,252*/ +
      this.four /*257,261*/ /*257,261*/ +
      this.five /*266,270*/ /*266,270*/ +
      this.six /*275,278*/ /*275,278*/ +
      this.seven /*283,288*/ /*283,288*/ +
      this.eight /*293,298*/ /*293,298*/;
    '' +
      this.one /*329,332*/ /*329,332*/ +
      this.two /*337,340*/ /*337,340*/ +
      this.three /*345,350*/ /*345,350*/ +
      this.four /*355,359*/ /*355,359*/ +
      this.five /*364,368*/ /*364,368*/ +
      this.six /*373,376*/ /*373,376*/ +
      this.seven /*381,386*/ /*381,386*/;
    '' +
      this.one /*417,420*/ /*417,420*/ +
      this.two /*425,428*/ /*425,428*/ +
      this.three /*433,438*/ /*433,438*/ +
      this.four /*443,447*/ /*443,447*/ +
      this.five /*452,456*/ /*452,456*/ +
      this.six /*461,464*/ /*461,464*/;
    '' +
      this.one /*495,498*/ /*495,498*/ +
      this.two /*503,506*/ /*503,506*/ +
      this.three /*511,516*/ /*511,516*/ +
      this.four /*521,525*/ /*521,525*/ +
      this.five /*530,534*/ /*530,534*/;
    '' +
      this.one /*565,568*/ /*565,568*/ +
      this.two /*573,576*/ /*573,576*/ +
      this.three /*581,586*/ /*581,586*/ +
      this.four /*591,595*/ /*591,595*/;
    '' +
      this.one /*626,629*/ /*626,629*/ +
      this.two /*634,637*/ /*634,637*/ +
      this.three /*642,647*/ /*642,647*/;
    '' + this.one /*678,681*/ /*678,681*/ + this.two /*686,689*/ /*686,689*/;
    '' + this.one /*720,723*/ /*720,723*/;
    '' + this.one /*753,756*/ /*753,756*/;
  }
}

```

# /out/interpolated_properties.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  name = 'John Doe';
  one!: any;
  two!: any;
  three!: any;
  four!: any;
  five!: any;
  six!: any;
  seven!: any;
  eight!: any;
  nine!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-app']],
    standalone: false,
    decls: 10,
    vars: 56,
    consts: [[3, 'title']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0)(1, 'div', 0)(2, 'div', 0)(3, 'div', 0)(4, 'div', 0)(5, 'div', 0)(
          6,
          'div',
          0,
        )(7, 'div', 0)(8, 'div', 0)(9, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty(
          'title',
          i0.ɵɵinterpolateV([
            'a',
            ctx.one,
            'b',
            ctx.two,
            'c',
            ctx.three,
            'd',
            ctx.four,
            'e',
            ctx.five,
            'f',
            ctx.six,
            'g',
            ctx.seven,
            'h',
            ctx.eight,
            'i',
            ctx.nine,
            'j',
          ]),
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          'title',
          i0.ɵɵinterpolate8(
            'a',
            ctx.one,
            'b',
            ctx.two,
            'c',
            ctx.three,
            'd',
            ctx.four,
            'e',
            ctx.five,
            'f',
            ctx.six,
            'g',
            ctx.seven,
            'h',
            ctx.eight,
            'i',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          'title',
          i0.ɵɵinterpolate7(
            'a',
            ctx.one,
            'b',
            ctx.two,
            'c',
            ctx.three,
            'd',
            ctx.four,
            'e',
            ctx.five,
            'f',
            ctx.six,
            'g',
            ctx.seven,
            'h',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          'title',
          i0.ɵɵinterpolate6(
            'a',
            ctx.one,
            'b',
            ctx.two,
            'c',
            ctx.three,
            'd',
            ctx.four,
            'e',
            ctx.five,
            'f',
            ctx.six,
            'g',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          'title',
          i0.ɵɵinterpolate5(
            'a',
            ctx.one,
            'b',
            ctx.two,
            'c',
            ctx.three,
            'd',
            ctx.four,
            'e',
            ctx.five,
            'f',
          ),
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          'title',
          i0.ɵɵinterpolate4('a', ctx.one, 'b', ctx.two, 'c', ctx.three, 'd', ctx.four, 'e'),
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty('title', i0.ɵɵinterpolate3('a', ctx.one, 'b', ctx.two, 'c', ctx.three, 'd'));
        i0.ɵɵadvance();
        i0.ɵɵproperty('title', i0.ɵɵinterpolate2('a', ctx.one, 'b', ctx.two, 'c'));
        i0.ɵɵadvance();
        i0.ɵɵproperty('title', i0.ɵɵinterpolate1('a', ctx.one, 'b'));
        i0.ɵɵadvance();
        i0.ɵɵproperty('title', i0.ɵɵinterpolate(ctx.one));
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
                selector: 'my-app',
                template: `
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
        <div title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
        <div title="a{{one}}b{{two}}c{{three}}d"></div>
        <div title="a{{one}}b{{two}}c"></div>
        <div title="a{{one}}b"></div>
        <div title="{{one}}"></div>
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
      filePath: 'interpolated_properties.ts',
      lineNumber: 19,
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