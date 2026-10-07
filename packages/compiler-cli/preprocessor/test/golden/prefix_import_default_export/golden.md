# /out/consumer.ts
```ts
import { Component } from '@angular/core';
import { UpstreamModule } from 'google3/my/upstream/upstream-module';
// @ts-ignore
import * as i0 from '@angular/core';

export class ConsumerComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ConsumerComponent, never> =
    function ConsumerComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ConsumerComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ConsumerComponent,
    'consumer-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ConsumerComponent,
    selectors: [['consumer-cmp']],
    decls: 1,
    vars: 0,
    consts: [['dirA', '']],
    template: function ConsumerComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(ConsumerComponent, [UpstreamModule]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ConsumerComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'consumer-cmp',
                template: '<div dirA></div>',
                imports: [UpstreamModule],
                standalone: true,
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
    i0.ɵsetClassDebugInfo(ConsumerComponent, {
      className: 'ConsumerComponent',
      filePath: 'consumer.ts',
      lineNumber: 10,
    });
})();

```

# /out/my/upstream/directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export default class DirectiveA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never> = function DirectiveA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirectiveA)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirectiveA,
    '[dirA]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveA,
    selectors: [['', 'dirA', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirectiveA,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirA]',
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

```

# /out/my/upstream/upstream-module.ts
```ts
import { NgModule } from '@angular/core';
import DirectiveA from './directive';
// @ts-ignore
import * as i0 from '@angular/core';

export class UpstreamModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UpstreamModule, never> = function UpstreamModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UpstreamModule)();
  };
  // @ts-ignore
  static ɵmod: UpstreamModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: UpstreamModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<UpstreamModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [DirectiveA],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UpstreamModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [DirectiveA],
                exports: [DirectiveA],
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
    i0.ɵɵsetNgModuleScope(UpstreamModule, { declarations: [DirectiveA], exports: [DirectiveA] });
})();

```