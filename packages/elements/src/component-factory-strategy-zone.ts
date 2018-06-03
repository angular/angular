/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, ComponentRef, Injector, NgZone} from '@angular/core';

import {ComponentNgElementStrategy, ComponentNgElementStrategyFactory} from './component-factory-strategy';

/**
 * Factory that creates new ComponentNgElementZoneStrategy instance.
 *
 * @experimental
 */
export class ComponentNgElementZoneStrategyFactory extends ComponentNgElementStrategyFactory {
  create(injector: Injector) {
    return new ComponentNgElementZoneStrategy(this.componentFactory, injector);
  }
}

/**
 * extends ComponentNgElementStrategy to insure callbacks run in the Angular zone
 *
 * @experimental
 */
export class ComponentNgElementZoneStrategy extends ComponentNgElementStrategy {
  private ngZone: NgZone;

  constructor(protected componentFactory: ComponentFactory<any>, protected injector: Injector) {
    super(componentFactory, injector);
    this.ngZone = this.injector.get<NgZone>(NgZone);
  }

  connect(element: HTMLElement) {
    this.insureAngularZone(() => { super.connect(element); });
  }

  disconnect() { this.insureAngularZone(super.disconnect); }

  getInputValue(propName: string) {
    return this.insureAngularZone(() => { return super.getInputValue(propName); });
  }

  setInputValue(propName: string, value: string) {
    this.insureAngularZone(() => { super.setInputValue(propName, value); });
  }

  private insureAngularZone(fn: () => any) {
    return NgZone.isInAngularZone() ? fn() : this.ngZone.run(fn);
  }
}
