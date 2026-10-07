# /out/host.component.ngtypecheck.ts
```ts
/**
 * TCB for /host.component.ts
 * @generated
 */

import * as i0 from './host.component';

/*tcb1*/
function _tcb1(this: i0.HostComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*181,206*/ = null! as i0.TargetComponent; /*T:VAE*/
    _t1.value /*194,199*/ = 42 /*202,204*/ /*193,205*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.TargetComponent) {
  if (true) {
  }
}

```

# /out/host.component.ts
```ts
import { Component, Input, forwardRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostComponent, never> = function HostComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HostComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HostComponent,
    'app-host',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostComponent,
    selectors: [['app-host']],
    decls: 1,
    vars: 1,
    consts: [[3, 'value']],
    template: function HostComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'app-target', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('value', 42);
      }
    },
    dependencies: (): any => [TargetComponent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-host',
                standalone: true,
                imports: [forwardRef(() => TargetComponent)],
                template: '<app-target [value]="42"></app-target>',
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
    i0.ɵsetClassDebugInfo(HostComponent, {
      className: 'HostComponent',
      filePath: 'host.component.ts',
      lineNumber: 9,
    });
})();

export class TargetComponent {
  value!: string;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TargetComponent, never> = function TargetComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TargetComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TargetComponent,
    'app-target',
    never,
    { 'value': { 'alias': 'value'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TargetComponent,
    selectors: [['app-target']],
    inputs: { value: 'value' },
    decls: 2,
    vars: 0,
    template: function TargetComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'span');
        i0.ɵɵtext(1, 'Target');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TargetComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-target',
                standalone: true,
                template: '<span>Target</span>',
              },
            ],
          },
        ],
        null,
        { value: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TargetComponent, {
      className: 'TargetComponent',
      filePath: 'host.component.ts',
      lineNumber: 16,
    });
})();

```