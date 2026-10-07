# /out/event_arg_listener_implicit_meaning.ngtypecheck.ts
```ts
/**
 * TCB for /event_arg_listener_implicit_meaning.ts
 * @generated
 */

import { Component } from '@angular/core';

@Component({
  template: '<div (click)="c($event)"></div>',
  standalone: false,
})
class Comp {
  c(event: any) {}
}

/*tcb1*/
function _tcb1(this: Comp) {
  if (true) {
    var _t1 /*70,95*/ = document.createElement('div'); /*70,95*/ /*70,95*/
    _t1.addEventListener(/*76,81*/ 'click', ($event /*T:EP*/): any => {
      this.c(/*84,85*/ $event /*86,92*/) /*84,93*/;
    }) /*75,94*/;
  }
}

```

# /out/event_arg_listener_implicit_meaning.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class Comp {
  c(event: any) {}
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
        i0.ɵɵlistener('click', function Comp_Template_div_click_0_listener($event: any): any {
          return ctx.c($event);
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
                template: '<div (click)="c($event)"></div>',
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
      filePath: 'event_arg_listener_implicit_meaning.ts',
      lineNumber: 7,
    });
})();

```