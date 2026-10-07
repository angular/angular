# /out/forward_referenced_pipe.ngtypecheck.ts
```ts
/**
 * TCB for /forward_referenced_pipe.ts
 * @generated
 */

import { Component, NgModule, Pipe } from '@angular/core';

@Component({
  selector: 'host-binding-comp',
  template: ` <div [attr.style]="{} | my_forward_pipe">...</div> `,
  standalone: false,
})
export class HostBindingComp {}

/*tcb1*/
function _tcb1(this: HostBindingComp) {
  if (true) {
    var _pipe1 = null! as MyForwardPipe;
    _pipe1.transform(/*152,167*/ {} /*147,149*/) /*147,167*/;
  }
}

@Pipe({
  name: 'my_forward_pipe',
  standalone: false,
})
class MyForwardPipe {
  transform(param: unknown) {}
}

@NgModule({ declarations: [HostBindingComp, MyForwardPipe] })
export class MyModule {}

```

# /out/forward_referenced_pipe.ts
```ts
import { Component, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (): any => ({});

export class HostBindingComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingComp, never> = function HostBindingComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostBindingComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HostBindingComp,
    'host-binding-comp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostBindingComp,
    selectors: [['host-binding-comp']],
    standalone: false,
    decls: 3,
    vars: 4,
    template: function HostBindingComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵpipe(1, 'my_forward_pipe');
        i0.ɵɵtext(2, '...');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵattribute(
          'style',
          i0.ɵɵpipeBind1(1, 1, i0.ɵɵpureFunction0(3, _c0)),
          i0.ɵɵsanitizeStyle,
        );
      }
    },
    dependencies: (): any => [MyForwardPipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'host-binding-comp',
                template: `
        <div [attr.style]="{} | my_forward_pipe">...</div>
      `,
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
    i0.ɵsetClassDebugInfo(HostBindingComp, {
      className: 'HostBindingComp',
      filePath: 'forward_referenced_pipe.ts',
      lineNumber: 10,
    });
})();

class MyForwardPipe {
  transform(param: unknown) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyForwardPipe, never> = function MyForwardPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyForwardPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyForwardPipe, 'my_forward_pipe', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'my_forward_pipe',
      type: MyForwardPipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyForwardPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'my_forward_pipe',
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

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof HostBindingComp, typeof MyForwardPipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [HostBindingComp, MyForwardPipe] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingComp, MyForwardPipe] });
})();

```