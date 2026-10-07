# /out/dir.ts
```ts
import { Directive, HostListener } from '@angular/core';
import { CUSTOM_CLICK_EVENT, TARGET } from './events';
// @ts-ignore
import * as i0 from '@angular/core';

const LOCAL_EVENT = 'focus';

export class MyDir {
  handleClick(e: Event) {}

  onResize() {}

  onFocus() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDir, never> = function MyDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDir,
    '[myDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDir,
    selectors: [['', 'myDir', '']],
    hostBindings: function MyDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('focus', function MyDir_focus_HostBindingHandler(): any {
          return ctx.onFocus();
        });
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyDir, [{ type: Directive, args: [{ selector: '[myDir]' }] }], null, {
        handleClick: [{ type: HostListener, args: [CUSTOM_CLICK_EVENT, ['$event']] }],
        onResize: [{ type: HostListener, args: [`${TARGET}:resize`] }],
        onFocus: [{ type: HostListener, args: [LOCAL_EVENT] }],
      });
  }
}

```