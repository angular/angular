# /out/deps.ts
```ts
import { Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DepA {
  aIn: string = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DepA, never> = function DepA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DepA)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DepA,
    '[dep-a]',
    never,
    { 'aIn': { 'alias': 'a'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DepA,
    selectors: [['', 'dep-a', '']],
    inputs: { aIn: [0, 'a', 'aIn'] },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DepA,
        [{ type: Directive, args: [{ selector: '[dep-a]', standalone: true }] }],
        null,
        { aIn: [{ type: Input, args: ['a'] }] },
      );
  }
}

```

# /out/test.ngtypecheck.ts
```ts
/**
 * TCB for /test.ts
 * @generated
 */

import * as i0 from './test';

/*tcb1*/
function _tcb1(this: i0.NsComp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.NsComp2) {
  if (true) {
  }
}

```

# /out/test.ts
```ts
import { Component } from '@angular/core';
import * as ns from './deps';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './deps';

export class NsComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NsComp, never> = function NsComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NsComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    NsComp,
    'nsc',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof i1.DepA; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: NsComp,
    selectors: [['nsc']],
    features: [i0.ɵɵHostDirectivesFeature([i1.DepA])],
    decls: 0,
    vars: 0,
    template: function NsComp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NsComp,
        [{ type: Component, args: [{ selector: 'nsc', template: '', hostDirectives: [ns.DepA] }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(NsComp, { className: 'NsComp', filePath: 'test.ts', lineNumber: 5 });
})();

export class NsComp2 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NsComp2, never> = function NsComp2_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NsComp2)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    NsComp2,
    'nsc2',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof i1.DepA; inputs: { 'a': 'b' }; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: NsComp2,
    selectors: [['nsc2']],
    features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.DepA, inputs: ['a', 'b'] }])],
    decls: 0,
    vars: 0,
    template: function NsComp2_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NsComp2,
        [
          {
            type: Component,
            args: [
              {
                selector: 'nsc2',
                template: '',
                hostDirectives: [{ directive: ns.DepA, inputs: ['a: b'] }],
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
    i0.ɵsetClassDebugInfo(NsComp2, { className: 'NsComp2', filePath: 'test.ts', lineNumber: 12 });
})();

```