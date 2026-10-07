# /out/animation_host_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /animation_host_bindings.ts
 * @generated
 */

import * as i0 from '@angular/animations';

import { Component, Directive, NgModule } from '@angular/core';

@Directive({
  selector: '[my-anim-dir]',
  host: {
    '[@myAnim]': 'myAnimState',
    '(@myAnim.start)': 'onStart()',
    '(@myAnim.done)': 'onDone()',
  },
  standalone: false,
})
class MyAnimDir {
  onStart() {}
  onDone() {}
  myAnimState = '123';
}

/*tcb1*/
function _tcb1(this: MyAnimDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myAnimState /*133,144*/ /*133,144*/;
    ($event: i0.AnimationEvent /*T:EP*/): any => {
      this
        .onStart /*167,174*/
        () /*167,176*/;
    };
    ($event: i0.AnimationEvent /*T:EP*/): any => {
      this
        .onDone /*198,204*/
        () /*198,206*/;
    };
  }
}

@Component({
  selector: 'my-cmp',
  template: ` <div my-anim-dir></div> `,
  standalone: false,
})
class MyComponent {}

/*tcb2*/
function _tcb2(this: MyComponent) {
  if (true) {
  }
}

@NgModule({ declarations: [MyComponent, MyAnimDir] })
export class MyModule {}

```

# /out/animation_host_bindings.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class MyAnimDir {
  onStart() {}
  onDone() {}
  myAnimState = '123';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyAnimDir, never> = function MyAnimDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyAnimDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyAnimDir,
    '[my-anim-dir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyAnimDir,
    selectors: [['', 'my-anim-dir', '']],
    hostVars: 1,
    hostBindings: function MyAnimDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵsyntheticHostListener(
          '@myAnim.start',
          function MyAnimDir_animation_myAnim_start_HostBindingHandler(): any {
            return ctx.onStart();
          },
        )('@myAnim.done', function MyAnimDir_animation_myAnim_done_HostBindingHandler(): any {
          return ctx.onDone();
        });
      }
      if (rf & 2) {
        i0.ɵɵsyntheticHostProperty('@myAnim', ctx.myAnimState);
      }
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyAnimDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[my-anim-dir]',
                host: {
                  '[@myAnim]': 'myAnimState',
                  '(@myAnim.start)': 'onStart()',
                  '(@myAnim.done)': 'onDone()',
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

class MyComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-cmp']],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [['my-anim-dir', '']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
    dependencies: [MyAnimDir],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-cmp',
                template: `
        <div my-anim-dir></div>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'animation_host_bindings.ts',
      lineNumber: 21,
    });
})();

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
    [typeof MyComponent, typeof MyAnimDir],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, MyAnimDir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, MyAnimDir] });
})();

```