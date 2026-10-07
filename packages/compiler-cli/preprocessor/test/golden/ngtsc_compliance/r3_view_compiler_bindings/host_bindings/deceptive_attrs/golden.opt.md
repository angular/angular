# /out/deceptive_attrs.ngtypecheck.ts
```ts
/**
 * TCB for /deceptive_attrs.ts
 * @generated
 */

import * as i0 from './deceptive_attrs';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.MyComponent2) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    false /*321,326*/;
    0 /*351,352*/;
    5 /*379,380*/;
  }
}

```

# /out/deceptive_attrs.ts
```ts
import { Component } from '@angular/core';
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
    'my-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-comp']],
    hostAttrs: ['class.is-compact', 'false', 'style.width', '0', 'attr.tabindex', '5'],
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {},
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
                selector: 'my-comp',
                template: '',
                host: {
                  ['class.is-compact']: 'false',
                  ['style.width']: '0',
                  ['attr.tabindex']: '5',
                },
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
      filePath: 'deceptive_attrs.ts',
      lineNumber: 12,
    });
})();

export class MyComponent2 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent2, never> = function MyComponent2_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent2)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent2,
    'my-comp-2',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent2,
    selectors: [['my-comp-2']],
    hostVars: 5,
    hostBindings: function MyComponent2_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('tabindex', 5);
        i0.ɵɵstyleProp('width', 0);
        i0.ɵɵclassProp('is-compact', false);
      }
    },
    decls: 0,
    vars: 0,
    template: function MyComponent2_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent2,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp-2',
                template: '',
                host: {
                  '[class.is-compact]': 'false',
                  '[style.width]': '0',
                  '[attr.tabindex]': '5',
                },
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
    i0.ɵsetClassDebugInfo(MyComponent2, {
      className: 'MyComponent2',
      filePath: 'deceptive_attrs.ts',
      lineNumber: 24,
    });
})();

```