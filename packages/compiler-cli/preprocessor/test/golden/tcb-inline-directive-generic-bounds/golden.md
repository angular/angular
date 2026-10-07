# /out/app.directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

interface LocalInterface {
  foo: string;
}

export class AppDirective<T extends LocalInterface> {
  prop!: T;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppDirective<any>, never> = function AppDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AppDirective<any>,
    '[appRoot]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AppDirective,
    selectors: [['', 'appRoot', '']],
    hostVars: 1,
    hostBindings: function AppDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('foo', ctx.prop.foo);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appRoot]',
                standalone: true,
                host: {
                  '[attr.foo]': 'prop.foo',
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