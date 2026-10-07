# /out/dir.ngtypecheck.ts
```ts
/**
 * TCB for /dir.ts
 * @generated
 */

import * as i0 from './dir';

/*tcb1*/
function _tcb1(this: i0.MyDir) {
  if (true) {
  }
}

```

# /out/dir.ts
```ts
import { Directive, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDir {
  click() {}

  focus = () => {};
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
        i0.ɵɵlistener('click', function MyDir_click_HostBindingHandler(): any {
          return ctx.click();
        })('focus', function MyDir_focus_HostBindingHandler(): any {
          return ctx.focus();
        });
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyDir, [{ type: Directive, args: [{ selector: '[myDir]' }] }], null, {
        click: [{ type: HostListener }],
        focus: [{ type: HostListener }],
      });
  }
}

```