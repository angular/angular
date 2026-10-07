# /out/css_custom_properties.ngtypecheck.ts
```ts
/**
 * TCB for /css_custom_properties.ts
 * @generated
 */

import * as i0 from './css_custom_properties';

/*tcb1*/
function _tcb1(this: i0.MyDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.value /*123,128*/ /*123,128*/;
    this.value /*164,169*/ /*164,169*/;
  }
}

```

# /out/css_custom_properties.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDirective {
  value: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never> = function MyDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDirective,
    'my-dir',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [['my-dir']],
    hostAttrs: [2, '--camel-case', 'foo', '--kebab-case', 'foo'],
    hostVars: 4,
    hostBindings: function MyDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleProp('--%NS%camelCase', ctx.value)('--%NS%kebab-case', ctx.value);
      }
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'my-dir',
                host: {
                  '[style.--camelCase]': 'value',
                  '[style.--kebab-case]': 'value',
                  'style': '--camelCase: foo; --kebab-case: foo',
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

```