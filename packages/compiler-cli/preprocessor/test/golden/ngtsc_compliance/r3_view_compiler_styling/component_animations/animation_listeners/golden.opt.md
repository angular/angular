# /out/animation_listeners.ngtypecheck.ts
```ts
/**
 * TCB for /animation_listeners.ts
 * @generated
 */

import * as i0 from '@angular/animations';

import { Component, NgModule } from '@angular/core';

declare const animate: any;
declare const style: any;
declare const trigger: any;
declare const transition: any;

@Component({
  selector: 'my-cmp',
  template: `
    <div
      [@myAnimation]="exp"
      (@myAnimation.start)="onStart($event)"
      (@myAnimation.done)="onDone($event)"
    ></div>
  `,
  animations: [
    trigger('myAnimation', [
      transition('* => state', [
        style({ 'opacity': '0' }),
        animate(500, style({ 'opacity': '1' })),
      ]),
    ]),
  ],
  standalone: false,
})
class MyComponent {
  exp: any;
  startEvent: any;
  doneEvent: any;
  onStart(event: any) {
    this.startEvent = event;
  }
  onDone(event: any) {
    this.doneEvent = event;
  }
}

/*tcb1*/
function _tcb1(this: MyComponent) {
  if (true) {
    this.exp /*250,253*/ /*250,253*/;
    ($event: i0.AnimationEvent /*T:EP*/): any => {
      this.onStart(/*283,290*/ $event /*291,297*/) /*283,298*/;
    };
    ($event: i0.AnimationEvent /*T:EP*/): any => {
      this.onDone(/*327,333*/ $event /*334,340*/) /*327,341*/;
    };
  }
}

@NgModule({ declarations: [MyComponent] })
export class MyModule {}

```

# /out/animation_listeners.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

declare const animate: any;
declare const style: any;
declare const trigger: any;
declare const transition: any;

class MyComponent {
  exp: any;
  startEvent: any;
  doneEvent: any;
  onStart(event: any) {
    this.startEvent = event;
  }
  onDone(event: any) {
    this.doneEvent = event;
  }
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
    vars: 1,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵlistener(
          '@myAnimation.start',
          function MyComponent_Template_div_animation_myAnimation_start_0_listener(
            $event: any,
          ): any {
            return ctx.onStart($event);
          },
        )(
          '@myAnimation.done',
          function MyComponent_Template_div_animation_myAnimation_done_0_listener(
            $event: any,
          ): any {
            return ctx.onDone($event);
          },
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('@myAnimation', ctx.exp);
      }
    },
    encapsulation: 2,
    data: {
      animation: [
        trigger('myAnimation', [
          transition('* => state', [
            style({ 'opacity': '0' }),
            animate(500, style({ 'opacity': '1' })),
          ]),
        ]),
      ],
    },
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
        <div
          [@myAnimation]="exp"
          (@myAnimation.start)="onStart($event)"
          (@myAnimation.done)="onDone($event)"></div>
      `,
                animations: [
                  trigger('myAnimation', [
                    transition('* => state', [
                      style({ 'opacity': '0' }),
                      animate(500, style({ 'opacity': '1' })),
                    ]),
                  ]),
                ],
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
      filePath: 'animation_listeners.ts',
      lineNumber: 23,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

```