# /out/deps.ts
```ts
import { Directive, EventEmitter, Input, Output, forwardRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DepA {
  aIn: string = '';
  cOut = new EventEmitter<void>();
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
    { 'cOut': 'c' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DepA,
    selectors: [['', 'dep-a', '']],
    inputs: { aIn: [0, 'a', 'aIn'] },
    outputs: { cOut: 'c' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DepA,
        [{ type: Directive, args: [{ selector: '[dep-a]', standalone: true }] }],
        null,
        { aIn: [{ type: Input, args: ['a'] }], cOut: [{ type: Output, args: ['c'] }] },
      );
  }
}

export class DepB {
  xIn: string = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DepB, never> = function DepB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DepB)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DepB,
    '[dep-b]',
    never,
    { 'xIn': { 'alias': 'x'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DepB,
    selectors: [['', 'dep-b', '']],
    inputs: { xIn: [0, 'x', 'xIn'] },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DepB,
        [{ type: Directive, args: [{ selector: '[dep-b]', standalone: true }] }],
        null,
        { xIn: [{ type: Input, args: ['x'] }] },
      );
  }
}

export const IMPORTED_HOST_DIRS = [DepA, { directive: DepB, inputs: ['x: y'] }];

export const freeRef = forwardRef;

```

# /out/test.ts
```ts
import { Component, Directive, forwardRef } from '@angular/core';
import { DepA, DepB, IMPORTED_HOST_DIRS } from './deps';
import * as ns from './deps';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './deps';

export class C1 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C1, never> = function C1_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C1)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C1,
    'c1',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DepA; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C1,
    selectors: [['c1']],
    features: [i0.ɵɵHostDirectivesFeature([DepA])],
    decls: 0,
    vars: 0,
    template: function C1_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C1,
        [{ type: Component, args: [{ selector: 'c1', template: '', hostDirectives: [DepA] }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C1, { className: 'C1', filePath: 'test.ts', lineNumber: 6 });
})();

const LOCAL_HOST_DIRS = [DepA, DepB];
export class C2 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C2, never> = function C2_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C2)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C2,
    'c2',
    never,
    {},
    {},
    never,
    never,
    true,
    [
      { directive: typeof DepA; inputs: {}; outputs: {} },
      { directive: typeof DepB; inputs: {}; outputs: {} },
    ]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C2,
    selectors: [['c2']],
    features: [i0.ɵɵHostDirectivesFeature([DepA, DepB])],
    decls: 0,
    vars: 0,
    template: function C2_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C2,
        [
          {
            type: Component,
            args: [{ selector: 'c2', template: '', hostDirectives: LOCAL_HOST_DIRS }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C2, { className: 'C2', filePath: 'test.ts', lineNumber: 10 });
})();

export class C3 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C3, never> = function C3_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C3)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<C3, 'c3', never, {}, {}, never, never, true, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: C3,
      selectors: [['c3']],
      decls: 0,
      vars: 0,
      template: function C3_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C3,
        [
          {
            type: Component,
            args: [{ selector: 'c3', template: '', hostDirectives: IMPORTED_HOST_DIRS }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C3, { className: 'C3', filePath: 'test.ts', lineNumber: 13 });
})();

const fref = forwardRef;
export class C4 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C4, never> = function C4_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C4)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C4,
    'c4',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof LateDir; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C4,
    selectors: [['c4']],
    features: [
      i0.ɵɵHostDirectivesFeature(function (): any {
        return [LateDir];
      }),
    ],
    decls: 0,
    vars: 0,
    template: function C4_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C4,
        [
          {
            type: Component,
            args: [{ selector: 'c4', template: '', hostDirectives: [fref(() => LateDir)] }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C4, { className: 'C4', filePath: 'test.ts', lineNumber: 17 });
})();

const INPUTS = ['a: b'];
const OUTPUTS = ['c: d'];
export class C6 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C6, never> = function C6_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C6)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C6,
    'c6',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DepA; inputs: { 'a': 'b' }; outputs: { 'c': 'd' } }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C6,
    selectors: [['c6']],
    features: [
      i0.ɵɵHostDirectivesFeature([{ directive: DepA, inputs: ['a', 'b'], outputs: ['c', 'd'] }]),
    ],
    decls: 0,
    vars: 0,
    template: function C6_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C6,
        [
          {
            type: Component,
            args: [
              {
                selector: 'c6',
                template: '',
                hostDirectives: [{ directive: DepA, inputs: INPUTS, outputs: OUTPUTS }],
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
    i0.ɵsetClassDebugInfo(C6, { className: 'C6', filePath: 'test.ts', lineNumber: 26 });
})();

const SPREADABLE = [DepA];
export class C7 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C7, never> = function C7_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C7)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C7,
    'c7',
    never,
    {},
    {},
    never,
    never,
    true,
    [
      { directive: typeof DepA; inputs: {}; outputs: {} },
      { directive: typeof DepB; inputs: {}; outputs: {} },
    ]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C7,
    selectors: [['c7']],
    features: [i0.ɵɵHostDirectivesFeature([DepA, DepB])],
    decls: 0,
    vars: 0,
    template: function C7_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C7,
        [
          {
            type: Component,
            args: [{ selector: 'c7', template: '', hostDirectives: [...SPREADABLE, DepB] }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C7, { className: 'C7', filePath: 'test.ts', lineNumber: 30 });
})();

const AliasedDir = DepA;
export class C8 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C8, never> = function C8_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C8)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C8,
    'c8',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DepA; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C8,
    selectors: [['c8']],
    features: [i0.ɵɵHostDirectivesFeature([DepA])],
    decls: 0,
    vars: 0,
    template: function C8_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C8,
        [
          {
            type: Component,
            args: [{ selector: 'c8', template: '', hostDirectives: [AliasedDir] }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C8, { className: 'C8', filePath: 'test.ts', lineNumber: 34 });
})();

export class C10 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C10, never> = function C10_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C10)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C10,
    'c10',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof i1.DepA; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C10,
    selectors: [['c10']],
    features: [i0.ɵɵHostDirectivesFeature([i1.DepA])],
    decls: 0,
    vars: 0,
    template: function C10_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C10,
        [{ type: Component, args: [{ selector: 'c10', template: '', hostDirectives: [ns.DepA] }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C10, { className: 'C10', filePath: 'test.ts', lineNumber: 37 });
})();

export class C11 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C11, never> = function C11_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C11)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C11,
    'c11',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof i1.DepB; inputs: { 'x': 'q' }; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C11,
    selectors: [['c11']],
    features: [i0.ɵɵHostDirectivesFeature([{ directive: i1.DepB, inputs: ['x', 'q'] }])],
    decls: 0,
    vars: 0,
    template: function C11_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C11,
        [
          {
            type: Component,
            args: [
              {
                selector: 'c11',
                template: '',
                hostDirectives: [{ directive: ns.DepB, inputs: ['x: q'] }],
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
    i0.ɵsetClassDebugInfo(C11, { className: 'C11', filePath: 'test.ts', lineNumber: 44 });
})();

// forwardRef whose target is imported: `isForwardReference` must survive the cross-file hole,
// or the array is emitted eagerly and defeats the point of the forwardRef.
export class C12 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C12, never> = function C12_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C12)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C12,
    'c12',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DepA; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C12,
    selectors: [['c12']],
    features: [
      i0.ɵɵHostDirectivesFeature(function (): any {
        return [DepA];
      }),
    ],
    decls: 0,
    vars: 0,
    template: function C12_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C12,
        [
          {
            type: Component,
            args: [{ selector: 'c12', template: '', hostDirectives: [forwardRef(() => DepA)] }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(C12, { className: 'C12', filePath: 'test.ts', lineNumber: 49 });
})();

export class C13 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C13, never> = function C13_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C13)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C13,
    'c13',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DepB; inputs: { 'x': 'y' }; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C13,
    selectors: [['c13']],
    features: [
      i0.ɵɵHostDirectivesFeature(function (): any {
        return [{ directive: DepB, inputs: ['x', 'y'] }];
      }),
    ],
    decls: 0,
    vars: 0,
    template: function C13_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C13,
        [
          {
            type: Component,
            args: [
              {
                selector: 'c13',
                template: '',
                hostDirectives: [{ directive: forwardRef(() => DepB), inputs: ['x: y'] }],
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
    i0.ɵsetClassDebugInfo(C13, { className: 'C13', filePath: 'test.ts', lineNumber: 56 });
})();

// A present-but-empty mapping is `{}` upstream, which is truthy, so the object form is kept.
export class C14 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C14, never> = function C14_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C14)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C14,
    'c14',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DepA; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C14,
    selectors: [['c14']],
    features: [i0.ɵɵHostDirectivesFeature([{ directive: DepA }])],
    decls: 0,
    vars: 0,
    template: function C14_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C14,
        [
          {
            type: Component,
            args: [
              { selector: 'c14', template: '', hostDirectives: [{ directive: DepA, inputs: [] }] },
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
    i0.ɵsetClassDebugInfo(C14, { className: 'C14', filePath: 'test.ts', lineNumber: 60 });
})();

// `split(':', 2)` truncates: everything after the second colon is discarded.
export class C15 {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<C15, never> = function C15_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || C15)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    C15,
    'c15',
    never,
    {},
    {},
    never,
    never,
    true,
    [{ directive: typeof DepA; inputs: { 'a': 'b' }; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: C15,
    selectors: [['c15']],
    features: [i0.ɵɵHostDirectivesFeature([{ directive: DepA, inputs: ['a', 'b'] }])],
    decls: 0,
    vars: 0,
    template: function C15_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        C15,
        [
          {
            type: Component,
            args: [
              {
                selector: 'c15',
                template: '',
                hostDirectives: [{ directive: DepA, inputs: ['a: b: c'] }],
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
    i0.ɵsetClassDebugInfo(C15, { className: 'C15', filePath: 'test.ts', lineNumber: 68 });
})();

export class LateDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LateDir, never> = function LateDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LateDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LateDir,
    '[late]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: LateDir, selectors: [['', 'late', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LateDir,
        [{ type: Directive, args: [{ selector: '[late]', standalone: true }] }],
        null,
        null,
      );
  }
}

```