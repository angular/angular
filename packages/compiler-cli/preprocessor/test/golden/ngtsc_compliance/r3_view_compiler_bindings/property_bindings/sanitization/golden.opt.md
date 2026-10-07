# /out/sanitization.ngtypecheck.ts
```ts
/**
 * TCB for /sanitization.ts
 * @generated
 */

import * as i0 from './sanitization';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.evil; /*119,123*/ /*119,123*/
    this.evil; /*150,154*/ /*150,154*/
    this.evil; /*182,186*/ /*182,186*/
    this.nonEvil; /*211,218*/ /*211,218*/
    this.evil; /*246,250*/ /*246,250*/
    '' + this.evil /*277,281*/ /*277,281*/ + this.evil /*285,289*/ /*285,289*/;
    '' + this.evil /*321,325*/ /*321,325*/ + this.evil /*329,333*/ /*329,333*/;
    this.evil; /*368,372*/ /*368,372*/
    var _t1 /*348,374*/ = document.createElement('div'); /*348,374*/ /*348,374*/
    _t1.addEventListener(/*355,364*/ 'innerHTMLChange', ($event /*T:EP*/): any => {
      this.evil; /*368,372*/ /*368,372*/
    }); /*353,373*/
    this.evil; /*408,412*/ /*408,412*/
    var _t2 /*385,414*/ = document.createElement('div'); /*385,414*/ /*385,414*/
    _t2.addEventListener(/*397,406*/ 'innerHTMLChange', ($event /*T:EP*/): any => {
      this.evil; /*408,412*/ /*408,412*/
    }); /*390,413*/
    this.evil; /*445,449*/ /*445,449*/
    var _t3 /*425,451*/ = document.createElement('iframe'); /*425,451*/ /*425,451*/
    _t3.addEventListener(/*435,441*/ 'srcdocChange', ($event /*T:EP*/): any => {
      this.evil; /*445,449*/ /*445,449*/
    }); /*433,450*/
    this.evil; /*488,492*/ /*488,492*/
    var _t4 /*465,494*/ = document.createElement('iframe'); /*465,494*/ /*465,494*/
    _t4.addEventListener(/*480,486*/ 'srcdocChange', ($event /*T:EP*/): any => {
      this.evil; /*488,492*/ /*488,492*/
    }); /*473,493*/
    this.evil; /*522,526*/ /*522,526*/
    var _t5 /*508,530*/ = document.createElement('img'); /*508,530*/ /*508,530*/
    _t5.addEventListener(/*515,518*/ 'srcChange', ($event /*T:EP*/): any => {
      i1.ɵassertType<typeof _t5>($event.target);
      this.evil; /*522,526*/ /*522,526*/
    }); /*513,527*/
    this.evil; /*552,556*/ /*552,556*/
    var _t6 /*535,558*/ = document.createElement('iframe'); /*535,558*/ /*535,558*/
    _t6.addEventListener(/*545,548*/ 'srcChange', ($event /*T:EP*/): any => {
      this.evil; /*552,556*/ /*552,556*/
    }); /*543,557*/
    this.evil; /*590,594*/ /*590,594*/
    var _t7 /*572,596*/ = document.createElement('object'); /*572,596*/ /*572,596*/
    _t7.addEventListener(/*582,586*/ 'dataChange', ($event /*T:EP*/): any => {
      this.evil; /*590,594*/ /*590,594*/
    }); /*580,595*/
    this.evil; /*626,630*/ /*626,630*/
    var _t8 /*610,634*/ = document.createElement('link'); /*610,634*/ /*610,634*/
    _t8.addEventListener(/*618,622*/ 'hrefChange', ($event /*T:EP*/): any => {
      i1.ɵassertType<typeof _t8>($event.target);
      this.evil; /*626,630*/ /*626,630*/
    }); /*616,631*/
    this.evil; /*660,664*/ /*660,664*/
    var _t9 /*639,666*/ = document.createElement('iframe'); /*639,666*/ /*639,666*/
    _t9.addEventListener(/*649,656*/ 'sandboxChange', ($event /*T:EP*/): any => {
      this.evil; /*660,664*/ /*660,664*/
    }); /*647,665*/
  }
}

```

# /out/sanitization.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  evil = 'evil';
  nonEvil = 'nonEvil';
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
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    decls: 16,
    vars: 20,
    consts: [
      [3, 'innerHtml'],
      [3, 'href'],
      [3, 'src'],
      [3, 'sandbox'],
      [3, 'innerHTMLChange', 'innerHTML'],
      [3, 'srcdocChange', 'srcdoc'],
      [3, 'srcChange', 'src'],
      [3, 'dataChange', 'data'],
      [3, 'hrefChange', 'href'],
      [3, 'sandboxChange', 'sandbox'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'div', 0)(1, 'link', 1)(2, 'div')(3, 'img', 2)(4, 'iframe', 3)(
          5,
          'a',
          1,
        )(6, 'div');
        i0.ɵɵdomElementStart(7, 'div', 4);
        i0.ɵɵtwoWayListener(
          'innerHTMLChange',
          function MyComponent_Template_div_innerHTMLChange_7_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          },
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(8, 'div', 4);
        i0.ɵɵtwoWayListener(
          'innerHTMLChange',
          function MyComponent_Template_div_innerHTMLChange_8_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          },
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(9, 'iframe', 5);
        i0.ɵɵtwoWayListener(
          'srcdocChange',
          function MyComponent_Template_iframe_srcdocChange_9_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          },
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(10, 'iframe', 5);
        i0.ɵɵtwoWayListener(
          'srcdocChange',
          function MyComponent_Template_iframe_srcdocChange_10_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          },
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(11, 'img', 6);
        i0.ɵɵtwoWayListener(
          'srcChange',
          function MyComponent_Template_img_srcChange_11_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          },
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(12, 'iframe', 6);
        i0.ɵɵtwoWayListener(
          'srcChange',
          function MyComponent_Template_iframe_srcChange_12_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          },
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(13, 'object', 7);
        i0.ɵɵtwoWayListener(
          'dataChange',
          function MyComponent_Template_object_dataChange_13_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          },
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(14, 'link', 8);
        i0.ɵɵtwoWayListener(
          'hrefChange',
          function MyComponent_Template_link_hrefChange_14_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          },
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(15, 'iframe', 9);
        i0.ɵɵtwoWayListener(
          'sandboxChange',
          function MyComponent_Template_iframe_sandboxChange_15_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          },
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵdomProperty('innerHTML', ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty('href', ctx.evil, i0.ɵɵsanitizeResourceUrl);
        i0.ɵɵadvance();
        i0.ɵɵattribute('style', ctx.evil, i0.ɵɵsanitizeStyle);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty('src', ctx.nonEvil);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty('sandbox', ctx.evil, i0.ɵɵvalidateAttribute);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty('href', i0.ɵɵinterpolate2('', ctx.evil, '', ctx.evil), i0.ɵɵsanitizeUrl);
        i0.ɵɵadvance();
        i0.ɵɵattribute('style', i0.ɵɵinterpolate2('', ctx.evil, '', ctx.evil), i0.ɵɵsanitizeStyle);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('innerHTML', ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('innerHTML', ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('srcdoc', ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('srcdoc', ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('src', ctx.evil);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('src', ctx.evil, i0.ɵɵsanitizeResourceUrl);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('data', ctx.evil, i0.ɵɵsanitizeResourceUrl);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('href', ctx.evil, i0.ɵɵsanitizeResourceUrl);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('sandbox', ctx.evil, i0.ɵɵvalidateAttribute);
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
        <div [innerHtml]="evil"></div>
        <link [href]="evil" />
        <div [attr.style]="evil"></div>
        <img [src]="nonEvil" />
        <iframe [sandbox]="evil"></iframe>
        <a href="{{evil}}{{evil}}"></a>
        <div attr.style="{{evil}}{{evil}}"></div>
        <div [(innerHTML)]="evil"></div>
        <div bindon-innerHTML="evil"></div>
        <iframe [(srcdoc)]="evil"></iframe>
        <iframe bindon-srcdoc="evil"></iframe>
        <img [(src)]="evil" />
        <iframe [(src)]="evil"></iframe>
        <object [(data)]="evil"></object>
        <link [(href)]="evil" />
        <iframe [(sandbox)]="evil"></iframe>
      `,
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
      filePath: 'sanitization.ts',
      lineNumber: 24,
    });
})();

```