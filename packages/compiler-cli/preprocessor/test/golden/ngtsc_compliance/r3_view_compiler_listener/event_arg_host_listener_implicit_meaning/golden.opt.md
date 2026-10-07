# /out/event_arg_host_listener_implicit_meaning.ngtypecheck.ts
```ts
/**
 * TCB for /event_arg_host_listener_implicit_meaning.ts
 * @generated
 */

import { Directive } from '@angular/core';

@Directive({
  host: { '(click)': 'c($event)' },
  standalone: false,
})
class Dir {
  c(event: any) {}
}

/*tcb1*/
function _tcb1(this: Dir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    var _t1 = document.createElement('ng-directive'); /*124,127*/
    _t1.addEventListener(/*68,75*/ 'click', ($event /*T:EP*/): any => {
      this.c(/*79,80*/ $event /*81,87*/) /*79,88*/;
    }) /*68,88*/;
  }
}

```

# /out/event_arg_host_listener_implicit_meaning.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class Dir {
  c(event: any) {}
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
          i0.ɵɵlistener('click', function Dir_click_HostBindingHandler($event: any): any {
            return ctx.c($event);
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
                host: { '(click)': 'c($event)' },
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