# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from 'test-lib';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    ('hello') /*183,190*/ /*173,191*/;
    ('world') /*208,215*/ /*199,216*/;
    ('backend') /*241,250*/ /*224,251*/;
    ('sig') /*274,279*/ /*259,280*/;
    var _t1 /*T:DIR:0*/ /*156,368*/ = null! as i1.TestComponent; /*T:VAE*/
    _t1['simpleOutput'] /*288,300*/
      .subscribe(($event /*T:EP*/): any => {
        this.handle(/*303,309*/ $event /*310,316*/) /*303,317*/;
      }) /*287,318*/;
    _t1['aliasedOutput'] /*326,344*/
      .subscribe(($event /*T:EP*/): any => {
        this.handle(/*347,353*/ $event /*354,360*/) /*347,361*/;
      }) /*325,362*/;
    ('test') /*410,416*/ /*398,417*/;
    ('sig') /*428,433*/;
  }
}

/* Diagnostics:
 - (418, 434) Can't bind to 'signal' since it isn't a known property of 'div'.
*/

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { TestComponent, TestDirective } from 'test-lib';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  handle(e: any) {}
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
    decls: 2,
    vars: 6,
    consts: [
      [3, 'simpleOutput', 'aliasedOutputAlias', 'simple', 'alias', 'requiredAlias', 'signalAlias'],
      ['test-dir', '', 3, 'dirInput', 'signal'],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'test-cmp', 0);
        i0.ɵɵlistener(
          'simpleOutput',
          function AppComponent_Template_test_cmp_simpleOutput_0_listener($event: any): any {
            return ctx.handle($event);
          },
        )(
          'aliasedOutputAlias',
          function AppComponent_Template_test_cmp_aliasedOutputAlias_0_listener($event: any): any {
            return ctx.handle($event);
          },
        );
        i0.ɵɵelementEnd();
        i0.ɵɵelement(1, 'div', 1);
      }
      if (rf & 2) {
        i0.ɵɵproperty('simple', 'hello')('alias', 'world')('requiredAlias', 'backend')(
          'signalAlias',
          'sig',
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty('dirInput', 'test')('signal', 'sig');
      }
    },
    dependencies: [TestComponent, TestDirective],
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
                template: `
        <test-cmp 
          [simple]="'hello'" 
          [alias]="'world'" 
          [requiredAlias]="'backend'" 
          [signalAlias]="'sig'"
          (simpleOutput)="handle($event)"
          (aliasedOutputAlias)="handle($event)"
        ></test-cmp>
        <div test-dir [dirInput]="'test'" [signal]="'sig'"></div>
      `,
                standalone: true,
                imports: [TestComponent, TestDirective],
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
      filePath: 'app.component.ts',
      lineNumber: 20,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/app.component.ts",
      "category": "error",
      "code": 8002,
      "messageText": "Can't bind to 'signal' since it isn't a known property of 'div'.",
      "span": {
        "start": 418,
        "end": 434
      }
    }
  ]
}

```