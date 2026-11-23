import { Component, Directive, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class NotStandaloneDir {
  static ɵfac = function NotStandaloneDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NotStandaloneDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NotStandaloneDir,
    selectors: [["", "not-standalone", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      NotStandaloneDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[not-standalone]",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class NotStandalonePipe {
  transform(value) {}
  static ɵfac = function NotStandalonePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NotStandalonePipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "nspipe",
    type: NotStandalonePipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      NotStandalonePipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "nspipe",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class NotStandaloneStuffModule {
  static ɵfac = function NotStandaloneStuffModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NotStandaloneStuffModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NotStandaloneStuffModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      NotStandaloneStuffModule,
      [
        {
          type: NgModule,
          args: [
            {
              declarations: [NotStandaloneDir, NotStandalonePipe],
              exports: [NotStandaloneDir, NotStandalonePipe]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(NotStandaloneStuffModule, {
      declarations: [NotStandaloneDir, NotStandalonePipe],
      exports: [NotStandaloneDir, NotStandalonePipe]
    });
})();
export class IndirectDir {
  static ɵfac = function IndirectDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || IndirectDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: IndirectDir,
    selectors: [["", "indirect", ""]]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      IndirectDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[indirect]"
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class IndirectPipe {
  transform(value) {}
  static ɵfac = function IndirectPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || IndirectPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "indirectpipe",
    type: IndirectPipe,
    pure: true
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      IndirectPipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "indirectpipe"
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class SomeModule {
  static ɵfac = function SomeModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SomeModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SomeModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [NotStandaloneStuffModule] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SomeModule,
      [
        {
          type: NgModule,
          args: [
            {
              imports: [IndirectDir, IndirectPipe],
              exports: [NotStandaloneStuffModule, IndirectDir, IndirectPipe]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(SomeModule, {
      imports: [IndirectDir, IndirectPipe],
      exports: [NotStandaloneStuffModule, IndirectDir, IndirectPipe]
    });
})();
export class DirectDir {
  static ɵfac = function DirectDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DirectDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectDir,
    selectors: [["", "direct", ""]]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DirectDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[direct]"
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class DirectPipe {
  transform(value) {}
  static ɵfac = function DirectPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DirectPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "directpipe",
    type: DirectPipe,
    pure: true
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DirectPipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "directpipe"
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class TestCmp {
  data = true;
  static ɵfac = function TestCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["test-cmp"]],
    decls: 15,
    vars: 9,
    consts: [
      ["not-standalone", ""],
      ["indirect", ""],
      ["direct", ""]
    ],
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "p");
        i0.ɵɵtext(1, "Reference some non-standalone things:");
        i0.ɵɵelementStart(2, "span", 0);
        i0.ɵɵtext(3);
        i0.ɵɵpipe(4, "nspipe");
        i0.ɵɵelementEnd()();
        i0.ɵɵelementStart(5, "p");
        i0.ɵɵtext(6, "Reference some indirect standalone things:");
        i0.ɵɵelementStart(7, "span", 1);
        i0.ɵɵtext(8);
        i0.ɵɵpipe(9, "indirectpipe");
        i0.ɵɵelementEnd()();
        i0.ɵɵelementStart(10, "p");
        i0.ɵɵtext(11, "Reference some standalone things directly:");
        i0.ɵɵelementStart(12, "span", 2);
        i0.ɵɵtext(13);
        i0.ɵɵpipe(14, "directpipe");
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
      DirectPipe
    ],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "test-cmp",
              template: `
    <p>Reference some non-standalone things:<span not-standalone>{{data | nspipe}}</span></p>
    <p>Reference some indirect standalone things:<span indirect>{{data | indirectpipe}}</span></p>
    <p>Reference some standalone things directly:<span direct>{{data | directpipe}}</span></p>
  `,
              imports: [SomeModule, DirectDir, DirectPipe]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: "TestCmp",
      filePath: "imports.ts",
      lineNumber: 68
    });
})();
