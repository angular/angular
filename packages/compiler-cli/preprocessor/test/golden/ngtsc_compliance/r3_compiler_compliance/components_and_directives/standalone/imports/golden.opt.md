# /out/imports.ngtypecheck.ts
```ts
/**
 * TCB for /imports.ts
 * @generated
 */

import * as i0 from './imports';

var _pipe1 = null! as i0.NotStandalonePipe;
var _pipe2 = null! as i0.IndirectPipe;
var _pipe3 = null! as i0.DirectPipe;

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    '' + _pipe1.transform(/*1072,1078*/ this.data /*1065,1069*/ /*1065,1069*/) /*1065,1078*/;
    '' + _pipe2.transform(/*1165,1177*/ this.data /*1158,1162*/ /*1158,1162*/) /*1158,1177*/;
    '' + _pipe3.transform(/*1262,1272*/ this.data /*1255,1259*/ /*1255,1259*/) /*1255,1272*/;
  }
}

```

# /out/imports.ts
```ts
import { Component, Directive, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class NotStandaloneDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NotStandaloneDir, never> = function NotStandaloneDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NotStandaloneDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    NotStandaloneDir,
    '[not-standalone]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NotStandaloneDir,
    selectors: [['', 'not-standalone', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NotStandaloneDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[not-standalone]',
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

export class NotStandalonePipe {
  transform(value: any): any {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NotStandalonePipe, never> =
    function NotStandalonePipe_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NotStandalonePipe)();
    };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<NotStandalonePipe, 'nspipe', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'nspipe',
      type: NotStandalonePipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NotStandalonePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'nspipe',
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

export class NotStandaloneStuffModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NotStandaloneStuffModule, never> =
    function NotStandaloneStuffModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NotStandaloneStuffModule)();
    };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    NotStandaloneStuffModule,
    [typeof NotStandaloneDir, typeof NotStandalonePipe],
    never,
    [typeof NotStandaloneDir, typeof NotStandalonePipe]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NotStandaloneStuffModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NotStandaloneStuffModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NotStandaloneStuffModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [NotStandaloneDir, NotStandalonePipe],
                exports: [NotStandaloneDir, NotStandalonePipe],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(NotStandaloneStuffModule, {
      declarations: [NotStandaloneDir, NotStandalonePipe],
      exports: [NotStandaloneDir, NotStandalonePipe],
    });
})();

export class IndirectDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<IndirectDir, never> = function IndirectDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || IndirectDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    IndirectDir,
    '[indirect]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: IndirectDir, selectors: [['', 'indirect', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        IndirectDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[indirect]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class IndirectPipe {
  transform(value: any): any {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<IndirectPipe, never> = function IndirectPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || IndirectPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<IndirectPipe, 'indirectpipe', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'indirectpipe', type: IndirectPipe, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        IndirectPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'indirectpipe',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class SomeModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SomeModule, never> = function SomeModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SomeModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    SomeModule,
    never,
    [typeof IndirectDir, typeof IndirectPipe],
    [typeof NotStandaloneStuffModule, typeof IndirectDir, typeof IndirectPipe]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SomeModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SomeModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [NotStandaloneStuffModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SomeModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [IndirectDir, IndirectPipe],
                exports: [NotStandaloneStuffModule, IndirectDir, IndirectPipe],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(SomeModule, {
      imports: [IndirectDir, IndirectPipe],
      exports: [NotStandaloneStuffModule, IndirectDir, IndirectPipe],
    });
})();

export class DirectDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirectDir, never> = function DirectDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirectDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirectDir,
    '[direct]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: DirectDir, selectors: [['', 'direct', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirectDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[direct]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class DirectPipe {
  transform(value: any): any {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirectPipe, never> = function DirectPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirectPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<DirectPipe, 'directpipe', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'directpipe', type: DirectPipe, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirectPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'directpipe',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class TestCmp {
  data = true;
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
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    decls: 15,
    vars: 9,
    consts: [
      ['not-standalone', ''],
      ['indirect', ''],
      ['direct', ''],
    ],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'p');
        i0.ɵɵtext(1, 'Reference some non-standalone things:');
        i0.ɵɵelementStart(2, 'span', 0);
        i0.ɵɵtext(3);
        i0.ɵɵpipe(4, 'nspipe');
        i0.ɵɵelementEnd()();
        i0.ɵɵelementStart(5, 'p');
        i0.ɵɵtext(6, 'Reference some indirect standalone things:');
        i0.ɵɵelementStart(7, 'span', 1);
        i0.ɵɵtext(8);
        i0.ɵɵpipe(9, 'indirectpipe');
        i0.ɵɵelementEnd()();
        i0.ɵɵelementStart(10, 'p');
        i0.ɵɵtext(11, 'Reference some standalone things directly:');
        i0.ɵɵelementStart(12, 'span', 2);
        i0.ɵɵtext(13);
        i0.ɵɵpipe(14, 'directpipe');
        i0.ɵɵelementEnd()();
      }
      if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 3, ctx.data));
        i0.ɵɵadvance(5);
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 5, ctx.data));
        i0.ɵɵadvance(5);
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 7, ctx.data));
      }
    },
    dependencies: [
      SomeModule,
      NotStandaloneDir,
      IndirectDir,
      DirectDir,
      NotStandalonePipe,
      IndirectPipe,
      DirectPipe,
    ],
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
                template: `
        <p>Reference some non-standalone things:<span not-standalone>{{data | nspipe}}</span></p>
        <p>Reference some indirect standalone things:<span indirect>{{data | indirectpipe}}</span></p>
        <p>Reference some standalone things directly:<span direct>{{data | directpipe}}</span></p>
      `,
                imports: [SomeModule, DirectDir, DirectPipe],
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
      filePath: 'imports.ts',
      lineNumber: 68,
    });
})();

```