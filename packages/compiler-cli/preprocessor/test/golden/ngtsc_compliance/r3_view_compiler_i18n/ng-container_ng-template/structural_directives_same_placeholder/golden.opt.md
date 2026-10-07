# /out/structural_directives_same_placeholder.ngtypecheck.ts
```ts
/**
 * TCB for /structural_directives_same_placeholder.ts
 * @generated
 */

import * as i0 from './structural_directives_same_placeholder';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/structural_directives_same_placeholder.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, 'div');
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_div_3_div_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelement(1, 'div');
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_div_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelementStart(1, 'div');
    i0.ɵɵtemplate(2, MyComponent_div_3_div_2_Template, 2, 0, 'div', 1);
    i0.ɵɵelementEnd();
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty('ngIf', ctx_r0.someFlag);
  }
}
function MyComponent_img_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 4);
    i0.ɵɵelement(1, 'img');
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_img_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 5);
    i0.ɵɵelement(1, 'img');
    i0.ɵɵi18nEnd();
  }
}

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
    decls: 6,
    vars: 4,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7491232361816524177$$_STRUCTURAL_DIRECTIVES_SAME_PLACEHOLDER_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$startTagDiv}Content{$closeTagDiv}{$startTagDiv}{$startTagDiv}Content{$closeTagDiv}{$closeTagDiv}{$tagImg}{$tagImg}',
            {
              'closeTagDiv': '[�/#1:1��/*2:1�|�/#1:3��/*2:3�|�/#1:2��/*3:2�]',
              'startTagDiv': '[�*2:1��#1:1�|�*3:2��#1:2�|�*2:3��#1:3�]',
              'tagImg':
                '[�*4:4��/*4:4��#1:4��/#1:4��*4:4��/*4:4�|�*5:5��/*5:5��#1:5��/#1:5��*5:5��/*5:5�]',
            },
            {
              original_code: {
                'closeTagDiv': '</div>',
                'startTagDiv': '<div *ngIf="someFlag">',
                'tagImg': '<img *ngIf="someOtherFlag" />',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_7491232361816524177$$_STRUCTURAL_DIRECTIVES_SAME_PLACEHOLDER_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'[�*2:1��#1:1�|�*3:2��#1:2�|�*2:3��#1:3�]'}:START_TAG_DIV:Content${'[�/#1:1��/*2:1�|�/#1:3��/*2:3�|�/#1:2��/*3:2�]'}:CLOSE_TAG_DIV:${'[�*2:1��#1:1�|�*3:2��#1:2�|�*2:3��#1:3�]'}:START_TAG_DIV:${'[�*2:1��#1:1�|�*3:2��#1:2�|�*2:3��#1:3�]'}:START_TAG_DIV:Content${'[�/#1:1��/*2:1�|�/#1:3��/*2:3�|�/#1:2��/*3:2�]'}:CLOSE_TAG_DIV:${'[�/#1:1��/*2:1�|�/#1:3��/*2:3�|�/#1:2��/*3:2�]'}:CLOSE_TAG_DIV:${'[�*4:4��/*4:4��#1:4��/#1:4��*4:4��/*4:4�|�*5:5��/*5:5��#1:5��/#1:5��*5:5��/*5:5�]'}:TAG_IMG:${'[�*4:4��/*4:4��#1:4��/#1:4��*4:4��/*4:4�|�*5:5��/*5:5��#1:5��/#1:5��*5:5��/*5:5�]'}:TAG_IMG:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0, [4, 'ngIf']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 2, 0, 'div', 1)(
          3,
          MyComponent_div_3_Template,
          3,
          1,
          'div',
          1,
        )(4, MyComponent_img_4_Template, 2, 0, 'img', 1)(
          5,
          MyComponent_img_5_Template,
          2,
          0,
          'img',
          1,
        );
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty('ngIf', ctx.someFlag);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.someFlag);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.someOtherFlag);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.someOtherFlag);
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
      <div i18n>
        <div *ngIf="someFlag">Content</div>
        <div *ngIf="someFlag">
          <div *ngIf="someFlag">Content</div>
        </div>

        <img *ngIf="someOtherFlag" />
        <img *ngIf="someOtherFlag" />
      </div>
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
      filePath: 'structural_directives_same_placeholder.ts',
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