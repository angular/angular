# /out/event_host_explicit_access.ngtypecheck.ts
```ts
/**
 * TCB for /event_host_explicit_access.ts
 * @generated
 */

import { Directive } from '@angular/core';

@Directive({
  host: {
    '(click)': 'c(this.$event)',
  },
  standalone: false,
})
class Dir {
  $event = {};
  c(value: {}) {}
}

/*tcb1*/
function _tcb1(this: Dir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    var _t1 = document.createElement('ng-directive'); /*142,145*/
    _t1.addEventListener(/*76,83*/ 'click', ($event /*T:EP*/): any => {
      this.c(/*87,88*/ this.$event /*94,100*/ /*89,100*/) /*87,101*/;
    }) /*76,101*/;
  }
}

```

# /out/event_host_explicit_access.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class Dir {
  $event = {};
  c(value: {}) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Dir, never> = function Dir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Dir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<Dir, never, never, {}, {}, never, never, false, never> =
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: Dir,
      hostBindings: function Dir_HostBindings(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵlistener('click', function Dir_click_HostBindingHandler(): any {
            return ctx.c(ctx.$event);
          });
        }
      },
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Dir,
        [
          {
            type: Directive,
            args: [
              {
                host: {
                  '(click)': 'c(this.$event)',
                },
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

```