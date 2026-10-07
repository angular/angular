# /out/host.ngtypecheck.ts
```ts
/**
 * TCB for /host.ts
 * @generated
 */

import * as i0 from './host';

/*tcb1*/
function _tcb1(this: i0.NumAttr) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.Folded) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.ComputedKey) {
  if (true) {
  }
}

/*tcb4*/
function _tcb4(this: i0.FoldedExpr) {
  if (true) {
  }
}

/*tcb5*/
function _tcb5(this: i0.DynamicValue) {
  if (true) {
  }
}

/*tcb6*/
function _tcb6(this: i0.LocalDynamicConst) {
  if (true) {
  }
}

/*tcb7*/
function _tcb7(this: i0.CrossFile) {
  if (true) {
  }
}

/*tcb8*/
function _tcb8(this: i0.CrossFileDynamic) {
  if (true) {
  }
}

/*tcb9*/
function _tcb9(this: i0.CmpHost) {
  if (true) {
  }
}

```

# /out/host.ts
```ts
import { Component, Directive } from '@angular/core';
import { PREFIX, SHARED_HOST, FOREIGN_DYN } from './consts';
// @ts-ignore
import * as i0 from '@angular/core';

const A = 'foo';
const B = 'bar';
const KEY = 'data-key';
const EXPR = 'title';
const LOCAL_HOST = { 'data-whole': 'whole-value', '[attr.x]': 'title' };

enum E {
  Val = 'enum-value',
}

declare const dyn: any;

// A `+` concatenation is folded by the partial evaluator, so the attribute value is the
// coerced result rather than the source text.
export class NumAttr {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NumAttr, never> = function NumAttr_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NumAttr)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    NumAttr,
    '[numAttr]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NumAttr,
    selectors: [['', 'numAttr', '']],
    hostAttrs: ['data-num', '42'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NumAttr,
        [{ type: Directive, args: [{ selector: '[numAttr]', host: { 'data-num': '' + 42 } }] }],
        null,
        null,
      );
  }
}

// Concatenation, template literals and constant references all fold to their value.
export class Folded {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Folded, never> = function Folded_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Folded)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Folded,
    '[folded]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Folded,
    selectors: [['', 'folded', '']],
    hostAttrs: [
      'data-concat',
      'foobar',
      'data-tmpl',
      'foo-bar',
      'data-const',
      'foo',
      'data-enum',
      'enum-value',
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Folded,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[folded]',
                host: {
                  'data-concat': A + B,
                  'data-tmpl': `${A}-${B}`,
                  'data-const': A,
                  'data-enum': E.Val,
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

// A computed key is evaluated too, so the attribute is named `data-key`, not `KEY`.
export class ComputedKey {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ComputedKey, never> = function ComputedKey_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ComputedKey)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ComputedKey,
    '[computedKey]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ComputedKey,
    selectors: [['', 'computedKey', '']],
    hostAttrs: ['data-key', 'v'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ComputedKey,
        [{ type: Directive, args: [{ selector: '[computedKey]', host: { [KEY]: 'v' } }] }],
        null,
        null,
      );
  }
}

// The whole `host` object may be reached through a constant.
export class WholeObject {
  title = 'x';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<WholeObject, never> = function WholeObject_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || WholeObject)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    WholeObject,
    '[wholeObject]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: WholeObject,
    selectors: [['', 'wholeObject', '']],
    hostAttrs: ['data-whole', 'whole-value'],
    hostVars: 1,
    hostBindings: function WholeObject_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('x', ctx.title);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        WholeObject,
        [{ type: Directive, args: [{ selector: '[wholeObject]', host: LOCAL_HOST }] }],
        null,
        null,
      );
  }
}

// Folding happens before host bindings are parsed, so a constant may carry the binding
// and listener expressions themselves.
export class FoldedExpr {
  title = 'x';
  foo() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FoldedExpr, never> = function FoldedExpr_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FoldedExpr)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    FoldedExpr,
    '[foldedExpr]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: FoldedExpr,
    selectors: [['', 'foldedExpr', '']],
    hostVars: 1,
    hostBindings: function FoldedExpr_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('click', function FoldedExpr_click_HostBindingHandler(): any {
          return ctx.foo();
        });
      }
      if (rf & 2) {
        i0.ɵɵattribute('b', ctx.title);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FoldedExpr,
        [
          {
            type: Directive,
            args: [{ selector: '[foldedExpr]', host: { '[attr.b]': EXPR, '(click)': A + '()' } }],
          },
        ],
        null,
        null,
      );
  }
}

// A value that is not statically evaluable is emitted verbatim, as ngtsc's `WrappedNodeExpr`
// passthrough does.
export class DynamicValue {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DynamicValue, never> = function DynamicValue_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DynamicValue)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DynamicValue,
    '[dynamicValue]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DynamicValue,
    selectors: [['', 'dynamicValue', '']],
    hostAttrs: ['data-dyn', dyn.thing],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DynamicValue,
        [
          {
            type: Directive,
            args: [{ selector: '[dynamicValue]', host: { 'data-dyn': dyn.thing } }],
          },
        ],
        null,
        null,
      );
  }
}

// A local constant that is itself unevaluable reports the *reference*, not the constant's
// initializer, so `LOCAL_DYN` is emitted rather than `mkLocal()`.
declare function mkLocal(): string;
const LOCAL_DYN = mkLocal();

export class LocalDynamicConst {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalDynamicConst, never> =
    function LocalDynamicConst_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalDynamicConst)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LocalDynamicConst,
    '[localDynamicConst]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: LocalDynamicConst,
    selectors: [['', 'localDynamicConst', '']],
    hostAttrs: ['data-l', LOCAL_DYN],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalDynamicConst,
        [
          {
            type: Directive,
            args: [{ selector: '[localDynamicConst]', host: { 'data-l': LOCAL_DYN } }],
          },
        ],
        null,
        null,
      );
  }
}

// Constants imported from another file resolve in optimized (whole-program) mode. The
// unoptimized mode is single-file, so it emits the unresolved reference verbatim instead —
// note that this is the pipeline's own local mode, not ngtsc's `compilationMode: local`,
// which does resolve across files.
export class CrossFile {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CrossFile, never> = function CrossFile_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CrossFile)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    CrossFile,
    '[crossFile]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: CrossFile,
    selectors: [['', 'crossFile', '']],
    hostAttrs: ['data-x', 'pre-suffix'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CrossFile,
        [
          {
            type: Directive,
            args: [{ selector: '[crossFile]', host: { 'data-x': PREFIX + '-suffix' } }],
          },
        ],
        null,
        null,
      );
  }
}

export class CrossFileObject {
  title = 'x';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CrossFileObject, never> = function CrossFileObject_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CrossFileObject)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    CrossFileObject,
    '[crossFileObject]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: CrossFileObject,
    selectors: [['', 'crossFileObject', '']],
    hostAttrs: ['data-shared', 'shared'],
    hostVars: 1,
    hostBindings: function CrossFileObject_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('t', ctx.title);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CrossFileObject,
        [{ type: Directive, args: [{ selector: '[crossFileObject]', host: SHARED_HOST }] }],
        null,
        null,
      );
  }
}

// An imported constant that does not fold must still name the local reference in both modes:
// resolving it across files must not re-anchor the value onto a node in `consts.ts`, which
// this file could not emit.
export class CrossFileDynamic {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CrossFileDynamic, never> = function CrossFileDynamic_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CrossFileDynamic)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    CrossFileDynamic,
    '[crossFileDynamic]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: CrossFileDynamic,
    selectors: [['', 'crossFileDynamic', '']],
    hostAttrs: ['data-g', FOREIGN_DYN],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CrossFileDynamic,
        [
          {
            type: Directive,
            args: [{ selector: '[crossFileDynamic]', host: { 'data-g': FOREIGN_DYN } }],
          },
        ],
        null,
        null,
      );
  }
}

export class CmpHost {
  title = 'x';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpHost, never> = function CmpHost_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpHost)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CmpHost,
    'cmp-host',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CmpHost,
    selectors: [['cmp-host']],
    hostAttrs: ['data-c', 'foobar'],
    hostVars: 1,
    hostBindings: function CmpHost_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('a', ctx.title);
      }
    },
    decls: 0,
    vars: 0,
    template: function CmpHost_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpHost,
        [
          {
            type: Component,
            args: [
              { selector: 'cmp-host', template: '', host: { 'data-c': A + B, '[attr.a]': EXPR } },
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
    i0.ɵsetClassDebugInfo(CmpHost, { className: 'CmpHost', filePath: 'host.ts', lineNumber: 78 });
})();

```