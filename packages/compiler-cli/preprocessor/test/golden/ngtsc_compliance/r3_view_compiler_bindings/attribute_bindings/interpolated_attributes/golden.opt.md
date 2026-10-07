# /out/interpolated_attributes.ngtypecheck.ts
```ts
/**
 * TCB for /interpolated_attributes.ts
 * @generated
 */

import * as i0 from './interpolated_attributes';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' +
      this.one /*129,132*/ /*129,132*/ +
      this.two /*137,140*/ /*137,140*/ +
      this.three /*145,150*/ /*145,150*/ +
      this.four /*155,159*/ /*155,159*/ +
      this.five /*164,168*/ /*164,168*/ +
      this.six /*173,176*/ /*173,176*/ +
      this.seven /*181,186*/ /*181,186*/ +
      this.eight /*191,196*/ /*191,196*/ +
      this.nine /*201,205*/ /*201,205*/;
    '' +
      this.one /*241,244*/ /*241,244*/ +
      this.two /*249,252*/ /*249,252*/ +
      this.three /*257,262*/ /*257,262*/ +
      this.four /*267,271*/ /*267,271*/ +
      this.five /*276,280*/ /*276,280*/ +
      this.six /*285,288*/ /*285,288*/ +
      this.seven /*293,298*/ /*293,298*/ +
      this.eight /*303,308*/ /*303,308*/;
    '' +
      this.one /*344,347*/ /*344,347*/ +
      this.two /*352,355*/ /*352,355*/ +
      this.three /*360,365*/ /*360,365*/ +
      this.four /*370,374*/ /*370,374*/ +
      this.five /*379,383*/ /*379,383*/ +
      this.six /*388,391*/ /*388,391*/ +
      this.seven /*396,401*/ /*396,401*/;
    '' +
      this.one /*437,440*/ /*437,440*/ +
      this.two /*445,448*/ /*445,448*/ +
      this.three /*453,458*/ /*453,458*/ +
      this.four /*463,467*/ /*463,467*/ +
      this.five /*472,476*/ /*472,476*/ +
      this.six /*481,484*/ /*481,484*/;
    '' +
      this.one /*520,523*/ /*520,523*/ +
      this.two /*528,531*/ /*528,531*/ +
      this.three /*536,541*/ /*536,541*/ +
      this.four /*546,550*/ /*546,550*/ +
      this.five /*555,559*/ /*555,559*/;
    '' +
      this.one /*595,598*/ /*595,598*/ +
      this.two /*603,606*/ /*603,606*/ +
      this.three /*611,616*/ /*611,616*/ +
      this.four /*621,625*/ /*621,625*/;
    '' +
      this.one /*661,664*/ /*661,664*/ +
      this.two /*669,672*/ /*669,672*/ +
      this.three /*677,682*/ /*677,682*/;
    '' + this.one /*718,721*/ /*718,721*/ + this.two /*726,729*/ /*726,729*/;
    '' + this.one /*765,768*/ /*765,768*/;
    '' + this.one /*803,806*/ /*803,806*/;
  }
}

```

# /out/interpolated_attributes.ts
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
    vars: 55,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div')(1, 'div')(2, 'div')(3, 'div')(4, 'div')(5, 'div')(6, 'div')(
          7,
          'div',
        )(8, 'div')(9, 'div');
      }
      if (rf & 2) {
        i0.ɵɵattribute(
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
        i0.ɵɵattribute(
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
        i0.ɵɵattribute(
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
        i0.ɵɵattribute(
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
        i0.ɵɵattribute(
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
        i0.ɵɵattribute(
          'title',
          i0.ɵɵinterpolate4('a', ctx.one, 'b', ctx.two, 'c', ctx.three, 'd', ctx.four, 'e'),
        );
        i0.ɵɵadvance();
        i0.ɵɵattribute('title', i0.ɵɵinterpolate3('a', ctx.one, 'b', ctx.two, 'c', ctx.three, 'd'));
        i0.ɵɵadvance();
        i0.ɵɵattribute('title', i0.ɵɵinterpolate2('a', ctx.one, 'b', ctx.two, 'c'));
        i0.ɵɵadvance();
        i0.ɵɵattribute('title', i0.ɵɵinterpolate1('a', ctx.one, 'b'));
        i0.ɵɵadvance();
        i0.ɵɵattribute('title', ctx.one);
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
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
        <div attr.title="a{{one}}b{{two}}c{{three}}d"></div>
        <div attr.title="a{{one}}b{{two}}c"></div>
        <div attr.title="a{{one}}b"></div>
        <div attr.title="{{one}}"></div>
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
      filePath: 'interpolated_attributes.ts',
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