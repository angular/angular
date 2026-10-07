# /out/test.ts
```ts
import { Component, Directive, Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

@Injectable()
class LocalService {}

@Directive({ selector: '[local]', standalone: false })
class LocalDir {}

class StandaloneLocal {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneLocal, never> = function StandaloneLocal_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StandaloneLocal)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    StandaloneLocal,
    'standalone-local',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StandaloneLocal,
    selectors: [['standalone-local']],
    decls: 2,
    vars: 0,
    template: function StandaloneLocal_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1, 'hi');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneLocal,
        [
          {
            type: Component,
            args: [{ selector: 'standalone-local', template: '<span>hi</span>' }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(StandaloneLocal, {
      className: 'StandaloneLocal',
      filePath: 'test.ts',
      lineNumber: 10,
    });
})();

export class ExportedDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExportedDir, never> = function ExportedDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ExportedDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ExportedDir,
    '[exported]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ExportedDir,
    selectors: [['', 'exported', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ExportedDir,
        [{ type: Directive, args: [{ selector: '[exported]', standalone: false }] }],
        null,
        null,
      );
  }
}

```