# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from '@angular/core';

import { Component } from '@angular/core';

interface LocalInterface {
  foo: string;
}

@Component({
  selector: 'app-root',
  template: '<div>{{ prop.foo }}</div>',
  standalone: true,
})
export class AppComponent<T extends LocalInterface> {
  prop!: T;
}

/*tcb1*/
function _tcb1<T extends LocalInterface>(this: AppComponent<T>) {
  if (true) {
    '' + this.prop /*147,151*/ /*147,151*/.foo /*152,155*/ /*147,155*/;
    i0.ɵassertNotSignal(0, this.prop.foo);
    i0.ɵassertNotCallable(1, this.prop.foo);
  }
}
/*ngp-tcb-extended-checks:[{"typeCheckId":"tcb1","code":8109,"category":"warning","message":"NG8109: foo is a function and should be invoked: foo(). Find more at https://angular.dev/extended-diagnostics/NG8109","start":152,"end":155},{"typeCheckId":"tcb1","code":8117,"category":"warning","message":"NG8117: Function in text interpolation should be invoked: foo(). Find more at https://angular.dev/extended-diagnostics/NG8117","start":152,"end":155}]*/

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

interface LocalInterface {
  foo: string;
}

export class AppComponent<T extends LocalInterface> {
  prop!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent<any>, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent<any>,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppComponent,
      selectors: [['app-root']],
      decls: 2,
      vars: 1,
      template: function AppComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵdomElementStart(0, 'div');
          i0.ɵɵtext(1);
          i0.ɵɵdomElementEnd();
        }
        if (rf & 2) {
          i0.ɵɵadvance();
          i0.ɵɵtextInterpolate(ctx.prop.foo);
        }
      },
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
                template: '<div>{{ prop.foo }}</div>',
                standalone: true,
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
      lineNumber: 12,
    });
})();

```