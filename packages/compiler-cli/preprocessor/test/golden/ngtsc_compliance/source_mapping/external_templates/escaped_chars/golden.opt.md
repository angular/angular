# /out/escaped_chars.ngtypecheck.ts
```ts
/**
 * TCB for /escaped_chars.ts
 * @generated
 */

import * as i0 from './escaped_chars';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
  }
}

/*ngp-tcb-template-sources:{"tcb1":{"templateFile":"/escaped_chars.html"}}*/

```

# /out/escaped_chars.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, ' Some Message Encoded character: 🚀\n');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-cmp',
                standalone: false,
                template:
                  '<!--\n  NOTE: This template has escaped `\\r\\n` line-endings markers that will be converted to real `\\r\\n` line-ending chars when loaded from the test file-system.\n        This conversion happens in the monkeyPatchReadFile() function, which changes `fs.readFile()`.\n-->\n<div>\r\n  Some Message\r\n  Encoded character: 🚀\r\n</div>',
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'escaped_chars.ts',
      lineNumber: 8,
    });
})();

```