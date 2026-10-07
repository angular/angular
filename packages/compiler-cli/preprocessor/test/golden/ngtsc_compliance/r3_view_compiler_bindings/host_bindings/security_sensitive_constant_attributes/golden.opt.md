# /out/security_sensitive_constant_attributes.ngtypecheck.ts
```ts
/**
 * TCB for /security_sensitive_constant_attributes.ts
 * @generated
 */

import * as i0 from './security_sensitive_constant_attributes';

/*tcb1*/
function _tcb1(this: i0.HostBindingDir) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.HostBindingDir2) {
  if (true) {
  }
}

```

# /out/security_sensitive_constant_attributes.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostBindingDir {
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
    hostAttrs: ['src', 'trusted', 'srcdoc', 'trusted'],
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
                host: { 'src': 'trusted', 'srcdoc': 'trusted' },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class HostBindingDir2 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingDir2, never> = function HostBindingDir2_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostBindingDir2)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingDir2,
    'img',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingDir2,
    selectors: [['img']],
    hostAttrs: ['src', 'trusted', 'srcdoc', 'trusted'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingDir2,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'img',
                host: { 'src': 'trusted', 'srcdoc': 'trusted' },
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