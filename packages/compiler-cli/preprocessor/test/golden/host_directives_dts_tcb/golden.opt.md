# /out/src/app/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /src/app/app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from '../directives/host_dir';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    var _t1 /*T:HOSTDIR:0*/ /*226,292*/ = null! as i1.TestHostDirective; /*T:VAE*/
    _t1['customChange'] /*249,263*/
      .subscribe(($event /*T:EP*/): any => {
        this.onDisabledChange(/*266,282*/ $event /*283,289*/) /*266,290*/;
      }) /*248,291*/;
  }
}

```

# /out/src/app/app.component.ts
```ts
import { Component } from '@angular/core';
import { TestHostConsumerDirective } from '../directives/consumer_dir';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  onDisabledChange(val: boolean) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 1,
    vars: 0,
    consts: [['testHostConsumer', '', 3, 'disabledChange']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵlistener(
          'disabledChange',
          function AppComponent_Template_div_disabledChange_0_listener($event: any): any {
            return ctx.onDisabledChange($event);
          },
        );
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [TestHostConsumerDirective],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                standalone: true,
                imports: [TestHostConsumerDirective],
                template:
                  '<div testHostConsumer (disabledChange)="onDisabledChange($event)"></div>',
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'src/app/app.component.ts',
      lineNumber: 10,
    });
})();

```

# /out/src/directives/consumer_dir.d.ts
```ts
import * as i0 from '@angular/core';
import * as i1 from './host_dir';

export declare class TestHostConsumerDirective {
  static ɵfac: i0.ɵɵFactoryDeclaration<TestHostConsumerDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestHostConsumerDirective,
    '[testHostConsumer]',
    never,
    {},
    {},
    never,
    never,
    true,
    [
      {
        directive: typeof i1.TestHostDirective;
        inputs: {};
        outputs: {
          'customChange': 'disabledChange';
        };
      },
    ]
  >;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestHostConsumerDirective, never> =
    function TestHostConsumerDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || TestHostConsumerDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestHostConsumerDirective,
    '[testHostConsumer]',
    never,
    {},
    {},
    never,
    never,
    true,
    [
      {
        directive: typeof i1.TestHostDirective;
        inputs: {};
        outputs: { 'customChange': 'disabledChange' };
      },
    ]
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestHostConsumerDirective,
    selectors: [['', 'testHostConsumer', '']],
    features: [
      i0.ɵɵHostDirectivesFeature([
        { directive: i1.TestHostDirective, outputs: ['customChange', 'disabledChange'] },
      ]),
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestHostConsumerDirective, [{ type: Directive }], null, null);
  }
}

```

# /out/src/directives/host_dir.d.ts
```ts
import * as i0 from '@angular/core';

export declare class TestHostDirective {
  customChange: i0.EventEmitter<boolean>;
  static ɵfac: i0.ɵɵFactoryDeclaration<TestHostDirective, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestHostDirective,
    never,
    never,
    {},
    { 'customChange': 'customChange' },
    never,
    never,
    true
  >;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestHostDirective, never> =
    function TestHostDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || TestHostDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestHostDirective,
    never,
    never,
    {},
    { 'customChange': 'customChange' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestHostDirective,
    outputs: { customChange: 'customChange' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestHostDirective, [{ type: Directive }], null, null);
  }
}

```