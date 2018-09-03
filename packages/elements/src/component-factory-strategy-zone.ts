/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, ComponentRef, Injector, NgZone} from '@angular/core';
import {} from 'zone.js';

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
 * extends ComponentNgElementStrategy to ensure callbacks run in the Angular zone
 *
 * @experimental
 */
export class ComponentNgElementZoneStrategy extends ComponentNgElementStrategy {
  private readonly ngZone: NgZone;
  private elementZone: Zone;

  constructor(componentFactory: ComponentFactory<any>, injector: Injector) {
    super(componentFactory, injector);
    this.ngZone = this.injector.get<NgZone>(NgZone);
    this.ngZone.run(() => { this.elementZone = Zone.current; });
  }

  connect(element: HTMLElement) {
    this.runInZone(() => { super.connect(element); });
  }

  disconnect() {
    this.runInZone(() => { super.disconnect(); });
  }

  getInputValue(propName: string) {
    return this.runInZone(() => { return super.getInputValue(propName); });
  }

  setInputValue(propName: string, value: string) {
    this.runInZone(() => { super.setInputValue(propName, value); });
  }

  /**
   * Multiple elements may have their own NgZone and NgZone.isInAngularZone() doesn't
   * distinguish between them
   */
  private runInZone(fn: () => any) {
    return (Zone.current === this.elementZone) ? fn() : this.ngZone.run(fn);
  }
}