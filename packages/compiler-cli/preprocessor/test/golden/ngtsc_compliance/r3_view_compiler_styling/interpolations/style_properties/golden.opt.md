# /out/style_properties.ngtypecheck.ts
```ts
/**
 * TCB for /style_properties.ts
 * @generated
 */

import * as i0 from './style_properties';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' +
      this.one /*96,99*/ /*96,99*/ +
      this.two /*104,107*/ /*104,107*/ +
      this.three /*112,117*/ /*112,117*/ +
      this.four /*122,126*/ /*122,126*/ +
      this.five /*131,135*/ /*131,135*/ +
      this.six /*140,143*/ /*140,143*/ +
      this.seven /*148,153*/ /*148,153*/ +
      this.eight /*158,163*/ /*158,163*/ +
      this.nine /*168,172*/ /*168,172*/;
    '' +
      this.one /*209,212*/ /*209,212*/ +
      this.two /*217,220*/ /*217,220*/ +
      this.three /*225,230*/ /*225,230*/ +
      this.four /*235,239*/ /*235,239*/ +
      this.five /*244,248*/ /*244,248*/ +
      this.six /*253,256*/ /*253,256*/ +
      this.seven /*261,266*/ /*261,266*/ +
      this.eight /*271,276*/ /*271,276*/;
    '' +
      this.one /*313,316*/ /*313,316*/ +
      this.two /*321,324*/ /*321,324*/ +
      this.three /*329,334*/ /*329,334*/ +
      this.four /*339,343*/ /*339,343*/ +
      this.five /*348,352*/ /*348,352*/ +
      this.six /*357,360*/ /*357,360*/ +
      this.seven /*365,370*/ /*365,370*/;
    '' +
      this.one /*407,410*/ /*407,410*/ +
      this.two /*415,418*/ /*415,418*/ +
      this.three /*423,428*/ /*423,428*/ +
      this.four /*433,437*/ /*433,437*/ +
      this.five /*442,446*/ /*442,446*/ +
      this.six /*451,454*/ /*451,454*/;
    '' +
      this.one /*491,494*/ /*491,494*/ +
      this.two /*499,502*/ /*499,502*/ +
      this.three /*507,512*/ /*507,512*/ +
      this.four /*517,521*/ /*517,521*/ +
      this.five /*526,530*/ /*526,530*/;
    '' +
      this.one /*567,570*/ /*567,570*/ +
      this.two /*575,578*/ /*575,578*/ +
      this.three /*583,588*/ /*583,588*/ +
      this.four /*593,597*/ /*593,597*/;
    '' +
      this.one /*634,637*/ /*634,637*/ +
      this.two /*642,645*/ /*642,645*/ +
      this.three /*650,655*/ /*650,655*/;
    '' + this.one /*692,695*/ /*692,695*/ + this.two /*700,703*/ /*700,703*/;
    '' + this.one /*740,743*/ /*740,743*/;
    '' + this.one /*779,782*/ /*779,782*/;
  }
}

```

# /out/style_properties.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  one = '';
  two = '';
  three = '';
  four = '';
  five = '';
  six = '';
  seven = '';
  eight = '';
  nine = '';
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
    decls: 10,
    vars: 65,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div')(1, 'div')(2, 'div')(3, 'div')(4, 'div')(5, 'div')(6, 'div')(
          7,
          'div',
        )(8, 'div')(9, 'div');
      }
      if (rf & 2) {
        i0.ɵɵstyleProp(
          'color',
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
        i0.ɵɵstyleProp(
          'color',
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
        i0.ɵɵstyleProp(
          'color',
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
        i0.ɵɵstyleProp(
          'color',
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
        i0.ɵɵstyleProp(
          'color',
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
        i0.ɵɵstyleProp(
          'color',
          i0.ɵɵinterpolate4('a', ctx.one, 'b', ctx.two, 'c', ctx.three, 'd', ctx.four, 'e'),
        );
        i0.ɵɵadvance();
        i0.ɵɵstyleProp('color', i0.ɵɵinterpolate3('a', ctx.one, 'b', ctx.two, 'c', ctx.three, 'd'));
        i0.ɵɵadvance();
        i0.ɵɵstyleProp('color', i0.ɵɵinterpolate2('a', ctx.one, 'b', ctx.two, 'c'));
        i0.ɵɵadvance();
        i0.ɵɵstyleProp('color', i0.ɵɵinterpolate1('a', ctx.one, 'b'));
        i0.ɵɵadvance();
        i0.ɵɵstyleProp('color', ctx.one);
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
                template: `
        <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
        <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
        <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
        <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
        <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
        <div style.color="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
        <div style.color="a{{one}}b{{two}}c{{three}}d"></div>
        <div style.color="a{{one}}b{{two}}c"></div>
        <div style.color="a{{one}}b"></div>
        <div style.color="{{one}}"></div>
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
      filePath: 'style_properties.ts',
      lineNumber: 18,
    });
})();

```