# /out/test.ts
```ts
import { Component, input, model, output } from '@angular/core';
import * as core from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import * as rx from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['tpl'];

export class AdvancedComp {
  // Direct function calls
  directInput = input<string>(
    'initial',
    ...((ngDevMode ? [{ debugName: 'directInput' }] : /* istanbul ignore next */ []) as []),
  );
  directRequiredInput = input.required<number>(
    ...((ngDevMode ? [{ debugName: 'directRequiredInput' }] : /* istanbul ignore next */ []) as []),
  );
  directModel = model(
    0,
    ...((ngDevMode ? [{ debugName: 'directModel' }] : /* istanbul ignore next */ []) as []),
  );
  directRequiredModel = model.required<boolean>(
    ...((ngDevMode ? [{ debugName: 'directRequiredModel' }] : /* istanbul ignore next */ []) as []),
  );
  directOutput = output();
  directOutputObs = outputFromObservable(new Observable<string>());

  // Namespaced calls
  nsInput = core.input<number>(42);
  nsRequiredInput = core.input.required<string>();
  nsModel = core.model(true);
  nsRequiredModel = core.model.required<number>();
  nsOutput = core.output();
  nsOutputObs = rx.outputFromObservable(new Observable<number>());

  // Queries (both direct and namespaced)
  directViewChild = core.viewChild<string>('tpl');
  directRequiredViewChild = core.viewChild.required<string>('tpl');
  directViewChildren = core.viewChildren<string>('tpl');
  directContentChild = core.contentChild<string>('tpl');
  directRequiredContentChild = core.contentChild.required<string>('tpl');
  directContentChildren = core.contentChildren<string>('tpl');
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AdvancedComp, never> = function AdvancedComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AdvancedComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AdvancedComp,
    'advanced-comp',
    never,
    {
      'directInput': { 'alias': 'directInput'; 'required': false; 'isSignal': true };
      'directRequiredInput': { 'alias': 'directRequiredInput'; 'required': true; 'isSignal': true };
      'directModel': { 'alias': 'directModel'; 'required': false; 'isSignal': true };
      'directRequiredModel': { 'alias': 'directRequiredModel'; 'required': true; 'isSignal': true };
      'nsInput': { 'alias': 'nsInput'; 'required': false; 'isSignal': true };
      'nsRequiredInput': { 'alias': 'nsRequiredInput'; 'required': true; 'isSignal': true };
      'nsModel': { 'alias': 'nsModel'; 'required': false; 'isSignal': true };
      'nsRequiredModel': { 'alias': 'nsRequiredModel'; 'required': true; 'isSignal': true };
    },
    {
      'directModel': 'directModelChange';
      'directRequiredModel': 'directRequiredModelChange';
      'directOutput': 'directOutput';
      'directOutputObs': 'directOutputObs';
      'nsModel': 'nsModelChange';
      'nsRequiredModel': 'nsRequiredModelChange';
      'nsOutput': 'nsOutput';
      'nsOutputObs': 'nsOutputObs';
    },
    ['directContentChild', 'directRequiredContentChild', 'directContentChildren'],
    never,
    true,
    never,
    true
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AdvancedComp,
    selectors: [['advanced-comp']],
    contentQueries: function AdvancedComp_ContentQueries(
      rf: number,
      ctx: any,
      dirIndex: number,
    ): any {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.directContentChild, _c0, 5)(
          dirIndex,
          ctx.directRequiredContentChild,
          _c0,
          5,
        )(dirIndex, ctx.directContentChildren, _c0, 4);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(3);
      }
    },
    viewQuery: function AdvancedComp_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.directViewChild, _c0, 5)(ctx.directRequiredViewChild, _c0, 5)(
          ctx.directViewChildren,
          _c0,
          5,
        );
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(3);
      }
    },
    inputs: {
      directInput: [1, 'directInput'],
      directRequiredInput: [1, 'directRequiredInput'],
      directModel: [1, 'directModel'],
      directRequiredModel: [1, 'directRequiredModel'],
      nsInput: [1, 'nsInput'],
      nsRequiredInput: [1, 'nsRequiredInput'],
      nsModel: [1, 'nsModel'],
      nsRequiredModel: [1, 'nsRequiredModel'],
    },
    outputs: {
      directModel: 'directModelChange',
      directRequiredModel: 'directRequiredModelChange',
      directOutput: 'directOutput',
      directOutputObs: 'directOutputObs',
      nsModel: 'nsModelChange',
      nsRequiredModel: 'nsRequiredModelChange',
      nsOutput: 'nsOutput',
      nsOutputObs: 'nsOutputObs',
    },
    signals: true,
    decls: 2,
    vars: 0,
    template: function AdvancedComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Advanced Component');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AdvancedComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'advanced-comp',
                template: '<div>Advanced Component</div>',
                standalone: true,
                signals: true,
              },
            ],
          },
        ],
        null,
        {
          directInput: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'directInput', required: false }] },
          ],
          directRequiredInput: [
            {
              type: i0.Input,
              args: [{ isSignal: true, alias: 'directRequiredInput', required: true }],
            },
          ],
          directModel: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'directModel', required: false }] },
            { type: i0.Output, args: ['directModelChange'] },
          ],
          directRequiredModel: [
            {
              type: i0.Input,
              args: [{ isSignal: true, alias: 'directRequiredModel', required: true }],
            },
            { type: i0.Output, args: ['directRequiredModelChange'] },
          ],
          nsInput: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'nsInput', required: false }] },
          ],
          nsRequiredInput: [
            {
              type: i0.Input,
              args: [{ isSignal: true, alias: 'nsRequiredInput', required: true }],
            },
          ],
          nsModel: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'nsModel', required: false }] },
            { type: i0.Output, args: ['nsModelChange'] },
          ],
          nsRequiredModel: [
            {
              type: i0.Input,
              args: [{ isSignal: true, alias: 'nsRequiredModel', required: true }],
            },
            { type: i0.Output, args: ['nsRequiredModelChange'] },
          ],
          directOutput: [{ type: i0.Output, args: ['directOutput'] }],
          directOutputObs: [{ type: i0.Output, args: ['directOutputObs'] }],
          nsOutput: [{ type: i0.Output, args: ['nsOutput'] }],
          nsOutputObs: [{ type: i0.Output, args: ['nsOutputObs'] }],
          directContentChild: [
            { type: i0.ContentChild, args: ['tpl', { isSignal: true, descendants: true }] },
          ],
          directRequiredContentChild: [
            { type: i0.ContentChild, args: ['tpl', { isSignal: true, descendants: true }] },
          ],
          directContentChildren: [{ type: i0.ContentChildren, args: ['tpl', { isSignal: true }] }],
          directViewChild: [{ type: i0.ViewChild, args: ['tpl', { isSignal: true }] }],
          directRequiredViewChild: [{ type: i0.ViewChild, args: ['tpl', { isSignal: true }] }],
          directViewChildren: [{ type: i0.ViewChildren, args: ['tpl', { isSignal: true }] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AdvancedComp, {
      className: 'AdvancedComp',
      filePath: 'test.ts',
      lineNumber: 13,
    });
})();

```