# /out/animate_leave_with_event_host_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /animate_leave_with_event_host_bindings.ts
 * @generated
 */

import * as i0 from './animate_leave_with_event_host_bindings';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.ChildComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    ($event: i1.AnimationCallbackEvent /*T:EP*/): any => {
      this.fadeFn(/*182,188*/ $event /*189,195*/) /*182,196*/;
    };
  }
}

/*tcb2*/
function _tcb2(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/animate_leave_with_event_host_bindings.ts
```ts
import { AnimationCallbackEvent, Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ChildComponent {
  fadeFn(event: AnimationCallbackEvent) {
    event.target.classList.add('fade');
    event.animationComplete();
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildComponent, never> = function ChildComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ChildComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ChildComponent,
    'child-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ChildComponent,
    selectors: [['child-component']],
    hostBindings: function ChildComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵanimateLeaveListener(function ChildComponent_animateleave_HostBindingHandler(
          $event: any,
        ): any {
          return ctx.fadeFn($event);
        });
      }
    },
    decls: 2,
    vars: 0,
    template: function ChildComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'p');
        i0.ɵɵtext(1, 'Fading Content');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ChildComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'child-component',
                template: `<p>Fading Content</p>`,
                host: { '(animate.leave)': 'fadeFn($event)' },
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
    i0.ɵsetClassDebugInfo(ChildComponent, {
      className: 'ChildComponent',
      filePath: 'animate_leave_with_event_host_bindings.ts',
      lineNumber: 8,
    });
})();

export class MyComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    decls: 1,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'child-component');
        i0.ɵɵanimateLeave('slide');
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [ChildComponent],
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
                selector: 'my-component',
                imports: [ChildComponent],
                template: `
          <child-component animate.leave="slide"></child-component>
      `,
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
      filePath: 'animate_leave_with_event_host_bindings.ts',
      lineNumber: 22,
    });
})();

```