# /out/src/components/container.ngtypecheck.ts
```ts
/**
 * TCB for /src/components/container.ts
 * @generated
 */

import * as i0 from './container';

/*tcb1*/
function _tcb1(this: i0.ContainerComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    window.addEventListener(/*254,269*/ 'resize', ($event /*T:EP*/): any => {
      this.onResize(/*331,339*/ 0 /*272,326*/ as any /*272,326*/) /*331,339*/;
    }) /*240,328*/;
  }
}

```

# /out/src/components/container.ts
```ts
import { Component, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export const MIN_LARGE_SCREEN_WIDTH = 1000;

export class ContainerComponent {
  onResize(isSmallScreen: boolean): void {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ContainerComponent, never> =
    function ContainerComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ContainerComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ContainerComponent,
    'app-container',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ContainerComponent,
    selectors: [['app-container']],
    hostBindings: function ContainerComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener(
          'resize',
          function ContainerComponent_resize_HostBindingHandler($event: any): any {
            return ctx.onResize($event.target.innerWidth < 1000);
          },
          i0.ɵɵresolveWindow,
        );
      }
    },
    decls: 2,
    vars: 0,
    template: function ContainerComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1, 'Container');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ContainerComponent,
        [
          {
            type: Component,
            args: [
              {
                standalone: true,
                selector: 'app-container',
                template: '<div>Container</div>',
              },
            ],
          },
        ],
        null,
        {
          onResize: [
            {
              type: HostListener,
              args: ['window:resize', [`$event.target.innerWidth < ${MIN_LARGE_SCREEN_WIDTH}`]],
            },
          ],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ContainerComponent, {
      className: 'ContainerComponent',
      filePath: 'src/components/container.ts',
      lineNumber: 10,
    });
})();

```