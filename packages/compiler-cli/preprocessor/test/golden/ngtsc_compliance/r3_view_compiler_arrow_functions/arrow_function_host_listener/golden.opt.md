# /out/arrow_function_host_listener.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_host_listener.ts
 * @generated
 */

import * as i0 from './arrow_function_host_listener';

/*tcb1*/
function _tcb1(this: i0.TestDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    var _t1 = document.createElement('ng-directive'); /*212,219*/
    _t1.addEventListener(/*78,85*/ 'click', ($event /*T:EP*/): any => {
      this.someSignal /*89,99*/ /*89,99*/
        .update(
          /*100,106*/ (prev) /*D:ignore*/ => prev /*115,119*/ + 1 /*122,123*/ /*115,123*/,
        ) /*89,124*/;
    }) /*78,124*/;
    _t1.addEventListener(/*132,143*/ 'mousedown', ($event /*T:EP*/): any => {
      this.someSignal /*147,157*/ /*147,157*/
        .update(
          /*158,164*/ () => this.componentProp /*171,184*/ /*171,184*/ + 1 /*187,188*/ /*171,188*/,
        ) /*147,189*/;
    }) /*132,189*/;
  }
}

```

# /out/arrow_function_host_listener.ts
```ts
import { Directive, signal } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestDir {
  someSignal = signal(
    0,
    ...((ngDevMode ? [{ debugName: 'someSignal' }] : /* istanbul ignore next */ []) as []),
  );
  componentProp = 1;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never> = function TestDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, {}, {}, never, never, true, never> =
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: TestDir,
      hostBindings: function TestDir_HostBindings(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵlistener('click', function TestDir_click_HostBindingHandler(): any {
            return ctx.someSignal.update((prev: any): any => prev + 1);
          })('mousedown', function TestDir_mousedown_HostBindingHandler(): any {
            return ctx.someSignal.update((): any => ctx.componentProp + 1);
          });
        }
      },
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestDir,
        [
          {
            type: Directive,
            args: [
              {
                host: {
                  '(click)': 'someSignal.update(prev => prev + 1)',
                  '(mousedown)': 'someSignal.update(() => componentProp + 1)',
                },
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