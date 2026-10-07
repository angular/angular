# /out/self_closing_structural_directives.ngtypecheck.ts
```ts
/**
 * TCB for /self_closing_structural_directives.ts
 * @generated
 */

import * as i0 from './self_closing_structural_directives';

/*tcb1*/
function _tcb1(this: i0.OtherComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/self_closing_structural_directives.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];
const _c1 = ['*ngIf', 'flag'];
function MyComponent_img_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, 'img');
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_other_component_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelement(1, 'other-component');
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_4_ng_template_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 4);
  }
}
function MyComponent_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵtemplate(1, MyComponent_4_ng_template_1_Template, 1, 0, 'ng-template');
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_ng_container_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 5);
    i0.ɵɵelementContainer(1);
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_ng_content_6_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 6);
    i0.ɵɵprojection(1, 0, _c1);
    i0.ɵɵi18nEnd();
  }
}

export class OtherComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OtherComponent, never> = function OtherComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || OtherComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    OtherComponent,
    'other-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OtherComponent,
    selectors: [['other-component']],
    decls: 0,
    vars: 0,
    template: function OtherComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        OtherComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'other-component',
                template: '',
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
    i0.ɵsetClassDebugInfo(OtherComponent, {
      className: 'OtherComponent',
      filePath: 'self_closing_structural_directives.ts',
      lineNumber: 7,
    });
})();

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
    ['*'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    ngContentSelectors: _c0,
    decls: 7,
    vars: 5,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_9160312708998185306$$_SELF_CLOSING_STRUCTURAL_DIRECTIVES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$tagImg}{$startTagOtherComponent}{$closeTagOtherComponent}{$startTagNgTemplate}{$closeTagNgTemplate}{$startTagNgContainer}{$closeTagNgContainer}{$startTagNgContent}{$closeTagNgContent}',
            {
              'closeTagNgContainer': '�/#1:5��/*5:5�',
              'closeTagNgContent': '�/#1:6��/*6:6�',
              'closeTagNgTemplate': '[�/*1:4�|�/*4:3�]',
              'closeTagOtherComponent': '�/#1:2��/*3:2�',
              'startTagNgContainer': '�*5:5��#1:5�',
              'startTagNgContent': '�*6:6��#1:6�',
              'startTagNgTemplate': '[�*4:3�|�*1:4�]',
              'startTagOtherComponent': '�*3:2��#1:2�',
              'tagImg': '�*2:1��/*2:1��#1:1��/#1:1��*2:1��/*2:1�',
            },
            {
              original_code: {
                'closeTagNgContainer': '<ng-container *ngIf="flag" />',
                'closeTagNgContent': '<ng-content *ngIf="flag" />',
                'closeTagNgTemplate': '<ng-template *ngIf="flag" />',
                'closeTagOtherComponent': '<other-component *ngIf="flag" />',
                'startTagNgContainer': '<ng-container *ngIf="flag" />',
                'startTagNgContent': '<ng-content *ngIf="flag" />',
                'startTagNgTemplate': '<ng-template *ngIf="flag" />',
                'startTagOtherComponent': '<other-component *ngIf="flag" />',
                'tagImg': '<img *ngIf="flag" />',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_9160312708998185306$$_SELF_CLOSING_STRUCTURAL_DIRECTIVES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'�*2:1��/*2:1��#1:1��/#1:1��*2:1��/*2:1�'}:TAG_IMG:${'�*3:2��#1:2�'}:START_TAG_OTHER_COMPONENT:${'�/#1:2��/*3:2�'}:CLOSE_TAG_OTHER_COMPONENT:${'[�*4:3�|�*1:4�]'}:START_TAG_NG_TEMPLATE:${'[�/*1:4�|�/*4:3�]'}:CLOSE_TAG_NG_TEMPLATE:${'�*5:5��#1:5�'}:START_TAG_NG_CONTAINER:${'�/#1:5��/*5:5�'}:CLOSE_TAG_NG_CONTAINER:${'�*6:6��#1:6�'}:START_TAG_NG_CONTENT:${'�/#1:6��/*6:6�'}:CLOSE_TAG_NG_CONTENT:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0, [4, 'ngIf']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_img_2_Template, 2, 0, 'img', 1)(
          3,
          MyComponent_other_component_3_Template,
          2,
          0,
          'other-component',
          1,
        )(4, MyComponent_4_Template, 2, 0, null, 1)(
          5,
          MyComponent_ng_container_5_Template,
          2,
          0,
          'ng-container',
          1,
        )(6, MyComponent_ng_content_6_Template, 2, 0, 'ng-content', 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty('ngIf', ctx.flag);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.flag);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.flag);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.flag);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.flag);
      }
    },
    dependencies: [OtherComponent],
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
                imports: [OtherComponent],
                template: `
      <div i18n>
        <img *ngIf="flag" />
        <other-component *ngIf="flag" />
        <ng-template *ngIf="flag" />
        <ng-container *ngIf="flag" />
        <ng-content *ngIf="flag" />
      </div>
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
      filePath: 'self_closing_structural_directives.ts',
      lineNumber: 22,
    });
})();

```