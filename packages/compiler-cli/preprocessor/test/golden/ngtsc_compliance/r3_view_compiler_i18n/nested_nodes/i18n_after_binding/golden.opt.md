# /out/i18n_after_binding.ngtypecheck.ts
```ts
/**
 * TCB for /i18n_after_binding.ts
 * @generated
 */

import * as i0 from './i18n_after_binding';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.someBoolean /*146,157*/ /*146,157*/;
    '' + this.someField /*163,172*/ /*163,172*/;
  }
}

```

# /out/i18n_after_binding.ts
```ts
import { Component, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  someBoolean = false;
  someField!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-cmp']],
    decls: 3,
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8762838141169159471$$_I18N_AFTER_BINDING_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$tagInput} {$interpolation} ',
            { 'interpolation': '�0�', 'tagInput': '�#2��/#2�' },
            {
              original_code: {
                'interpolation': '{{ someField }}',
                'tagInput': '<input [disabled]="someBoolean">',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_8762838141169159471$$_I18N_AFTER_BINDING_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'�#2��/#2�'}:TAG_INPUT: ${'�0�'}:INTERPOLATION: `;
      }
      return [i18n_0, [3, 'disabled']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'span');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵdomElement(2, 'input', 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵdomProperty('disabled', ctx.someBoolean);
        i0.ɵɵi18nExp(ctx.someField);
        i0.ɵɵi18nApply(1);
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
                selector: 'my-cmp',
                template: `
    		<span i18n>
      			<input [disabled]="someBoolean">
    			{{ someField }}
    		</span>
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
      filePath: 'i18n_after_binding.ts',
      lineNumber: 12,
    });
})();

```