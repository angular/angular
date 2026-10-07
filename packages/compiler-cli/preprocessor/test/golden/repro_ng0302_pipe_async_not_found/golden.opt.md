# /out/labels-panel.ngtypecheck.ts
```ts
/**
 * TCB for /labels-panel.ts
 * @generated
 */

import * as i0 from './labels-panel';

/*tcb1*/
function _tcb1(this: i0.LabelsPanel) {
  if (true) {
    '' + (0 as any).transform(/*585,590*/ this.data /*578,582*/ /*578,582*/) /*578,590*/;
  }
}

/* Diagnostics:
 - (585, 590) No pipe found with name 'async'.
*/

```

# /out/labels-panel.ts
```ts
/**
 * Minimal reproduction for Google3 target:
 * Target: //cloud/console/web/common/components/ai/labels_panel:karma_gm2_chrome-linux
 * Sponge: http://sponge/433ccbcb-7782-49ae-9373-fc3d5931f44e
 * Error: NG0302: The pipe 'async' could not be found in the 'LabelsPanel' component. Verify that it is declared or imported in this module. Find more at <url>
 */
import { Component, NgModule } from '@angular/core';
import { PipeModule } from './pipe.module';
import { ExternalModule } from '@third-party/external';
// @ts-ignore
import * as i0 from '@angular/core';

export class LabelsPanel {
  data: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LabelsPanel, never> = function LabelsPanel_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LabelsPanel)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LabelsPanel,
    'labels-panel',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LabelsPanel,
    selectors: [['labels-panel']],
    standalone: false,
    decls: 3,
    vars: 3,
    template: function LabelsPanel_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'async');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ctx.data));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LabelsPanel,
        [
          {
            type: Component,
            args: [
              {
                selector: 'labels-panel',
                template: '<div>{{ data | async }}</div>',
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
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(LabelsPanel, {
      className: 'LabelsPanel',
      filePath: 'labels-panel.ts',
      lineNumber: 16,
    });
})();

export class LabelsPanelModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LabelsPanelModule, never> =
    function LabelsPanelModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LabelsPanelModule)();
    };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    LabelsPanelModule,
    [typeof LabelsPanel],
    [typeof PipeModule, typeof ExternalModule],
    [typeof LabelsPanel]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LabelsPanelModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LabelsPanelModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [PipeModule, ExternalModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LabelsPanelModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [LabelsPanel],
                exports: [LabelsPanel],
                imports: [PipeModule, ExternalModule],
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
    i0.ɵɵsetNgModuleScope(LabelsPanelModule, {
      declarations: [LabelsPanel],
      imports: [PipeModule, ExternalModule],
      exports: [LabelsPanel],
    });
})();

```

# /out/pipe.module.ts
```ts
import { NgModule, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AsyncPipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AsyncPipe, never> = function AsyncPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AsyncPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<AsyncPipe, 'async', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'async',
    type: AsyncPipe,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AsyncPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'async',
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

export class PipeModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipeModule, never> = function PipeModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipeModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<PipeModule, [typeof AsyncPipe], never, [typeof AsyncPipe]> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: PipeModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<PipeModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PipeModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [AsyncPipe],
                exports: [AsyncPipe],
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
    i0.ɵɵsetNgModuleScope(PipeModule, { declarations: [AsyncPipe], exports: [AsyncPipe] });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/labels-panel.ts",
      "category": "error",
      "code": 8004,
      "messageText": "No pipe found with name 'async'.",
      "span": {
        "start": 585,
        "end": 590
      }
    }
  ]
}

```