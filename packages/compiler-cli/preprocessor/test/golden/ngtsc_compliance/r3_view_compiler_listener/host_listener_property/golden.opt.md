# /out/host_listener_property.ngtypecheck.ts
```ts
/**
 * TCB for /host_listener_property.ts
 * @generated
 */

import * as i0 from './host_listener_property';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    var _t1 = document.createElement('ng-directive'); /*82,93*/
    _t1.addEventListener(/*112,119*/ 'click', ($event /*T:EP*/): any => {
      this.handleClick(/*135,146*/ $event /*122,128*/) /*135,146*/;
    }) /*98,132*/;
    window.addEventListener(/*187,208*/ 'beforeunload', ($event /*T:EP*/): any => {
      this.handleBeforeUnload(/*232,250*/ $event /*211,217*/) /*232,250*/;
    }) /*173,221*/;
  }
}

```

# /out/host_listener_property.ts
```ts
import { Directive, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  handleClick = ($event: any) => {};

  private handleBeforeUnload = ($event: any) => {};
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
          return ctx.handleClick($event);
        })(
          'beforeunload',
          function MyComponent_beforeunload_HostBindingHandler($event: any): any {
            return ctx.handleBeforeUnload($event);
          },
          i0.ɵɵresolveWindow,
        );
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyComponent, [{ type: Directive }], null, {
        handleClick: [{ type: HostListener, args: ['click', ['$event']] }],
        handleBeforeUnload: [{ type: HostListener, args: ['window:beforeunload', ['$event']] }],
      });
  }
}

```