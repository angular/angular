# /out/event_explicit_access.ngtypecheck.ts
```ts
/**
 * TCB for /event_explicit_access.ts
 * @generated
 */

import { Component } from '@angular/core';

@Component({
  template: '<div (click)="c(this.$event)"></div>',
  standalone: false,
})
class Comp {
  $event = {};

  c(value: {}) {}
}

/*tcb1*/
function _tcb1(this: Comp) {
  if (true) {
    var _t1 /*70,100*/ = document.createElement('div'); /*70,100*/ /*70,100*/
    _t1.addEventListener(/*76,81*/ 'click', ($event /*T:EP*/): any => {
      this.c(/*84,85*/ this.$event /*91,97*/ /*86,97*/) /*84,98*/;
    }) /*75,99*/;
  }
}

```

# /out/event_explicit_access.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class Comp {
  $event = {};

  c(value: {}) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Comp, never> = function Comp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Comp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Comp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Comp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [[3, 'click']],
    template: function Comp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵlistener('click', function Comp_Template_div_click_0_listener(): any {
          return ctx.c(ctx.$event);
        });
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Comp,
        [
          {
            type: Component,
            args: [
              {
                template: '<div (click)="c(this.$event)"></div>',
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
    i0.ɵsetClassDebugInfo(Comp, {
      className: 'Comp',
      filePath: 'event_explicit_access.ts',
      lineNumber: 7,
    });
})();

```