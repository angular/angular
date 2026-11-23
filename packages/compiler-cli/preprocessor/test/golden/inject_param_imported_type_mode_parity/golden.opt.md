# /out/consumer.ts
```ts
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Dep } from './dep';
import { Iface } from './iface';
// @ts-ignore
import * as i0 from '@angular/core';

const depToken = new InjectionToken<Dep>('Dep');
const ifaceToken = new InjectionToken<Dep>('Iface');

export class Consumer {
  constructor(
    readonly dep: Dep,
    readonly iface: Iface,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Consumer, never> = function Consumer_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || Consumer)(i0.ɵɵinject(depToken), i0.ɵɵinject(ifaceToken));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Consumer, factory: Consumer.ɵfac });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Consumer,
        [{ type: Injectable }],
        (): any => [
          { type: undefined, decorators: [{ type: Inject, args: [depToken] }] },
          { type: undefined, decorators: [{ type: Inject, args: [ifaceToken] }] },
        ],
        null,
      );
  }
}

```