# /out/foreign_object.ngtypecheck.ts
```ts
/**
 * TCB for /foreign_object.ts
 * @generated
 */

import * as i0 from './foreign_object';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/foreign_object.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
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
    decls: 5,
    vars: 0,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8448806415640562150$$_FOREIGN_OBJECT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$startTagXhtmlDiv} Count: {$startTagXhtmlSpan}5{$closeTagXhtmlSpan}{$closeTagXhtmlDiv}',
            {
              'closeTagXhtmlDiv': '�/#3�',
              'closeTagXhtmlSpan': '�/#4�',
              'startTagXhtmlDiv': '�#3�',
              'startTagXhtmlSpan': '�#4�',
            },
            {
              original_code: {
                'closeTagXhtmlDiv': '</xhtml:div>',
                'closeTagXhtmlSpan': '</span>',
                'startTagXhtmlDiv': '<xhtml:div xmlns="http://www.w3.org/1999/xhtml">',
                'startTagXhtmlSpan': '<span>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_8448806415640562150$$_FOREIGN_OBJECT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'�#3�'}:START_TAG__XHTML_DIV: Count: ${'�#4�'}:START_TAG__XHTML_SPAN:5${'�/#4�'}:CLOSE_TAG__XHTML_SPAN:${'�/#3�'}:CLOSE_TAG__XHTML_DIV:`;
      }
      return [
        i18n_0,
        ['xmlns', 'http://www.w3.org/2000/svg'],
        ['xmlns', 'http://www.w3.org/1999/xhtml'],
      ];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵnamespaceSVG();
        i0.ɵɵelementStart(0, 'svg', 1)(1, 'foreignObject');
        i0.ɵɵi18nStart(2, 0);
        i0.ɵɵnamespaceHTML();
        i0.ɵɵelementStart(3, 'div', 2);
        i0.ɵɵelement(4, 'span');
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd()();
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
      <svg xmlns="http://www.w3.org/2000/svg">
        <foreignObject i18n>
          <xhtml:div xmlns="http://www.w3.org/1999/xhtml">
            Count: <span>5</span>
          </xhtml:div>
        </foreignObject>
      </svg>
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
      filePath: 'foreign_object.ts',
      lineNumber: 16,
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