# /out/security_sensitive_style_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /security_sensitive_style_bindings.ts
 * @generated
 */

import * as i0 from './security_sensitive_style_bindings';

/*tcb1*/
function _tcb1(this: i0.HostBindingDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.imgUrl /*125,131*/ /*125,131*/;
    this.styles /*146,152*/ /*146,152*/;
  }
}

```

# /out/security_sensitive_style_bindings.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostBindingDir {
  imgUrl = 'url(foo.jpg)';
  styles = { backgroundImage: this.imgUrl };
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingDir, never> = function HostBindingDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostBindingDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingDir,
    '[hostBindingDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingDir,
    selectors: [['', 'hostBindingDir', '']],
    hostVars: 4,
    hostBindings: function HostBindingDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleMap(ctx.styles);
        i0.ɵɵstyleProp('background-image', ctx.imgUrl);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[hostBindingDir]',
                host: { '[style.background-image]': 'imgUrl', '[style]': 'styles' },
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