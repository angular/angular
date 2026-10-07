# /out/src/test.ngtypecheck.ts
```ts
/**
 * TCB for /src/test.ts
 * @generated
 */

import * as i0 from './test';

/*tcb1*/
function _tcb1<T>(this: i0.ChildComponent<T>) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2<T>(this: i0.ParentComponent<T>) {
  if (true) {
  }
}

```

# /out/src/test.ts
```ts
import { Component, ViewChild } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ChildComponent<T> {
  item!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildComponent<any>, never> =
    function ChildComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ChildComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ChildComponent<any>,
    'child-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ChildComponent,
    selectors: [['child-comp']],
    decls: 2,
    vars: 0,
    template: function ChildComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'Child');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ChildComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'child-comp',
                template: '<div>Child</div>',
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
    i0.ɵsetClassDebugInfo(ChildComponent, {
      className: 'ChildComponent',
      filePath: 'src/test.ts',
      lineNumber: 7,
    });
})();

export class ParentComponent<T> {
  child?: ChildComponent<T>;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ParentComponent<any>, never> =
    function ParentComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ParentComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ParentComponent<any>,
    'parent-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ParentComponent,
    selectors: [['parent-comp']],
    viewQuery: function ParentComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuery(ChildComponent, 5);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.child = _t.first);
      }
    },
    decls: 2,
    vars: 0,
    template: function ParentComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'Parent');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ParentComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'parent-comp',
                template: '<div>Parent</div>',
              },
            ],
          },
        ],
        null,
        { child: [{ type: ViewChild, args: [ChildComponent] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ParentComponent, {
      className: 'ParentComponent',
      filePath: 'src/test.ts',
      lineNumber: 15,
    });
})();

```