# /out/shared_name_with_consts.ngtypecheck.ts
```ts
/**
 * TCB for /shared_name_with_consts.ts
 * @generated
 */

import * as i0 from './shared_name_with_consts';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.tabIndex /*248,256*/ /*248,256*/;
    {
      this.all /*442,445*/ /*442,445*/;
    }
  }
}

/* Diagnostics:
 - (435, 446) Can't bind to 'all' since it isn't a known property of 'div'.
*/

```

# /out/shared_name_with_consts.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomElement(0, 'div', 7);
  }
}
function MyComponent_div_6_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomElement(0, 'div', 8);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵdomProperty('all', ctx_r0.all);
  }
}

export class MyComponent {
  tabIndex = 0;
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
    decls: 7,
    vars: 3,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8915674564851115041$$_SHARED_NAME_WITH_CONSTS_TS_0 =
          /* @ts-ignore */
          goog.getMsg('label');
        i18n_0 = MSG_EXTERNAL_8915674564851115041$$_SHARED_NAME_WITH_CONSTS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`label`;
      }
      return [
        ['attr', '', 1, 'attr'],
        ['ngProjectAs', 'selector', 5, ['selector'], 1, 'selector'],
        [1, 'width', 2, 'width', '0px'],
        [1, 'tabindex', 3, 'tabindex'],
        ['class', 'ngIf', 4, 'ngIf'],
        ['aria-label', i18n_0, 1, 'aria-label'],
        [
          'all',
          '',
          'ngProjectAs',
          'all',
          'style',
          'all:all',
          'class',
          'all',
          5,
          ['all'],
          3,
          'all',
          4,
          'all',
        ],
        [1, 'ngIf'],
        ['all', '', 'ngProjectAs', 'all', 5, ['all'], 1, 'all', 2, 'all', 'all', 3, 'all'],
      ];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'div', 0)(1, 'div', 1)(2, 'div', 2)(3, 'div', 3);
        i0.ɵɵdomTemplate(4, MyComponent_div_4_Template, 1, 0, 'div', 4);
        i0.ɵɵdomElement(5, 'div', 5);
        i0.ɵɵdomTemplate(6, MyComponent_div_6_Template, 1, 1, 'div', 6);
      }
      if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵdomProperty('tabIndex', ctx.tabIndex);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty('ngIf', ctx.cond);
        i0.ɵɵadvance(2);
        i0.ɵɵdomProperty('all', ctx.all);
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
      <div attr class="attr"></div>
      <div ngProjectAs="selector" class="selector"></div>
      <div style="width:0px" class="width"></div>
      <div [tabindex]="tabIndex" class="tabindex"></div>
      <div *ngIf="cond" class="ngIf"></div>
      <div aria-label="label" i18n-aria-label class="aria-label"></div>
      <div all ngProjectAs="all" style="all:all" [all]="all" *all="all" i18n-all class="all"></div>
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
      filePath: 'shared_name_with_consts.ts',
      lineNumber: 15,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/shared_name_with_consts.ts",
      "category": "error",
      "code": 8002,
      "messageText": "Can't bind to 'all' since it isn't a known property of 'div'.",
      "span": {
        "start": 435,
        "end": 446
      }
    }
  ]
}

```