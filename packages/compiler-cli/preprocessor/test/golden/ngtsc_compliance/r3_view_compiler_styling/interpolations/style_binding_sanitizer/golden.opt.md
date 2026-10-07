# /out/style_binding_sanitizer.ngtypecheck.ts
```ts
/**
 * TCB for /style_binding_sanitizer.ts
 * @generated
 */

import * as i0 from './style_binding_sanitizer';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.myUrl1 /*105,111*/ /*105,111*/;
    '' + this.myUrl2 /*152,158*/ /*152,158*/ + this.myRepeat /*166,174*/ /*166,174*/;
    '' +
      this.myBoxX /*213,219*/ /*213,219*/ +
      this.myBoxY /*226,232*/ /*226,232*/ +
      this.myBoxWidth /*239,249*/ /*239,249*/;
  }
}

```

# /out/style_binding_sanitizer.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  myUrl1 = '...';
  myUrl2 = '...';
  myBoxX = '0px';
  myBoxY = '0px';
  myBoxWidth = '100px';
  myRepeat = 'no-repeat';
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
    decls: 1,
    vars: 12,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('background', i0.ɵɵinterpolate1('url(', ctx.myUrl1, ')'))(
          'border-image',
          i0.ɵɵinterpolate2('url(', ctx.myUrl2, ') ', ctx.myRepeat, ' auto'),
        )(
          'box-shadow',
          i0.ɵɵinterpolate3('', ctx.myBoxX, ' ', ctx.myBoxY, ' ', ctx.myBoxWidth, ' black'),
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
                template: `
        <div style.background="url({{ myUrl1 }})"
             style.borderImage="url({{ myUrl2 }}) {{ myRepeat }} auto"
             style.boxShadow="{{ myBoxX }} {{ myBoxY }} {{ myBoxWidth }} black"></div>
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
      filePath: 'style_binding_sanitizer.ts',
      lineNumber: 11,
    });
})();

```