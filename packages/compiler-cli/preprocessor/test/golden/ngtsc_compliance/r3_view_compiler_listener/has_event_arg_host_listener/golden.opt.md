# /out/has_event_arg_host_listener.ngtypecheck.ts
```ts
/**
 * TCB for /has_event_arg_host_listener.ts
 * @generated
 */

import * as i0 from './has_event_arg_host_listener';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    var _t1 = document.createElement('ng-directive'); /*82,93*/
    _t1.addEventListener(/*112,119*/ 'click', ($event /*T:EP*/): any => {
      this.click(/*142,147*/ $event /*122,128*/.target /*129,135*/ /*122,135*/) /*142,147*/;
    }) /*98,139*/;
  }
}

```

# /out/has_event_arg_host_listener.ts
```ts
import { Directive, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  click(target: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyComponent,
    never,
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyComponent,
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('click', function MyComponent_click_HostBindingHandler($event: any): any {
          return ctx.click($event.target);
        });
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyComponent, [{ type: Directive }], null, {
        click: [{ type: HostListener, args: ['click', ['$event.target']] }],
      });
  }
}

```