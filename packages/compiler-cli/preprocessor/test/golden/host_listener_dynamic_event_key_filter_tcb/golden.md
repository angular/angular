# /out/src/test.ts
```ts
import { Component, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export const SHORTCUT_RESET_TO_INITIAL_TRANSFORM = {
  eventName: 'window:keydown.r',
  description: 'Reset the ruler zoom and translation to the original state',
};

export class ReproComponent {
  resetToInitialTransform(event?: KeyboardEvent) {}

  literalResetToInitialTransform(event?: Event) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ReproComponent, never> = function ReproComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ReproComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ReproComponent,
    'repro-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ReproComponent,
    selectors: [['repro-cmp']],
    hostBindings: function ReproComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener(
          'keydown.r',
          function ReproComponent_keydown_r_HostBindingHandler($event: any): any {
            return ctx.resetToInitialTransform($event);
          },
          i0.ɵɵresolveWindow,
        )(
          'keyup.escape',
          function ReproComponent_keyup_escape_HostBindingHandler($event: any): any {
            return ctx.literalResetToInitialTransform($event);
          },
          i0.ɵɵresolveWindow,
        );
      }
    },
    decls: 1,
    vars: 0,
    template: function ReproComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ReproComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'repro-cmp',
                template: '<div></div>',
              },
            ],
          },
        ],
        null,
        {
          resetToInitialTransform: [
            {
              type: HostListener,
              args: [`${SHORTCUT_RESET_TO_INITIAL_TRANSFORM.eventName}`, ['$event']],
            },
          ],
          literalResetToInitialTransform: [
            { type: HostListener, args: ['window:keyup.escape', ['$event']] },
          ],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ReproComponent, {
      className: 'ReproComponent',
      filePath: 'src/test.ts',
      lineNumber: 12,
    });
})();

```