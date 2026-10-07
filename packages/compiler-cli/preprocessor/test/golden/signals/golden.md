# /out/test.ts
```ts
import { Component, Directive, model, output } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
// @ts-ignore
import * as i0 from '@angular/core';

export class SignalDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SignalDir, never> = function SignalDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SignalDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    SignalDir,
    '[signalDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never,
    true
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SignalDir,
    selectors: [['', 'signalDir', '']],
    standalone: false,
    signals: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SignalDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[signalDir]',
                standalone: false,
                signals: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class SignalComp {
  val = model(0, ...((ngDevMode ? [{ debugName: 'val' }] : /* istanbul ignore next */ []) as []));
  custom = model(false, {
    ...(ngDevMode ? { debugName: 'custom' } : /* istanbul ignore next */ {}),
    alias: 'customAlias',
  });
  submit = output();
  obs = outputFromObservable(new Observable<number>());
  obsCustom = outputFromObservable(new Observable<string>(), { alias: 'obsAlias' });
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SignalComp, never> = function SignalComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SignalComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SignalComp,
    'signal-comp',
    never,
    {
      'val': { 'alias': 'val'; 'required': false; 'isSignal': true };
      'custom': { 'alias': 'customAlias'; 'required': false; 'isSignal': true };
    },
    {
      'val': 'valChange';
      'custom': 'customAliasChange';
      'submit': 'submit';
      'obs': 'obs';
      'obsCustom': 'obsAlias';
    },
    never,
    never,
    false,
    never,
    true
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SignalComp,
    selectors: [['signal-comp']],
    inputs: { val: [1, 'val'], custom: [1, 'customAlias', 'custom'] },
    outputs: {
      val: 'valChange',
      custom: 'customAliasChange',
      submit: 'submit',
      obs: 'obs',
      obsCustom: 'obsAlias',
    },
    standalone: false,
    signals: true,
    decls: 2,
    vars: 0,
    template: function SignalComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Signal Component');
        i0.ɵɵelementEnd();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(SignalComp),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SignalComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'signal-comp',
                template: '<div>Signal Component</div>',
                standalone: false,
                signals: true,
              },
            ],
          },
        ],
        null,
        {
          val: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'val', required: false }] },
            { type: i0.Output, args: ['valChange'] },
          ],
          custom: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'customAlias', required: false }] },
            { type: i0.Output, args: ['customAliasChange'] },
          ],
          submit: [{ type: i0.Output, args: ['submit'] }],
          obs: [{ type: i0.Output, args: ['obs'] }],
          obsCustom: [{ type: i0.Output, args: ['obsAlias'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(SignalComp, {
      className: 'SignalComp',
      filePath: 'test.ts',
      lineNumber: 18,
    });
})();

export class StandaloneSignalComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneSignalComp, never> =
    function StandaloneSignalComp_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || StandaloneSignalComp)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    StandaloneSignalComp,
    'standalone-signal-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never,
    true
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StandaloneSignalComp,
    selectors: [['standalone-signal-comp']],
    signals: true,
    decls: 2,
    vars: 0,
    template: function StandaloneSignalComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Standalone Signal Component');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneSignalComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'standalone-signal-comp',
                template: '<div>Standalone Signal Component</div>',
                standalone: true,
                signals: true,
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
    i0.ɵsetClassDebugInfo(StandaloneSignalComp, {
      className: 'StandaloneSignalComp',
      filePath: 'test.ts',
      lineNumber: 32,
    });
})();

```