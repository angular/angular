/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵGetterFn, ɵMethodFn, ɵReflectionCapabilities, ɵSetterFn, ɵreflector} from '@angular/core';
import {StaticReflector} from './static_reflector';
import {StaticSymbol} from './static_symbol';

export class StaticAndDynamicReflectionCapabilities {
  static install(staticDelegate: StaticReflector) {
    ɵreflector.updateCapabilities(new StaticAndDynamicReflectionCapabilities(staticDelegate));
  }

  private dynamicDelegate = new ɵReflectionCapabilities();

  constructor(private staticDelegate: StaticReflector) {}

  isReflectionEnabled(): boolean { return true; }
  factory(type: any): Function { return this.dynamicDelegate.factory(type); }

  hasLifecycleHook(type: any, lcProperty: string): boolean {
    return isStaticType(type) ? this.staticDelegate.hasLifecycleHook(type, lcProperty) :
                                this.dynamicDelegate.hasLifecycleHook(type, lcProperty);
  }
  parameters(type: any): any[][] {
    return isStaticType(type) ? this.staticDelegate.parameters(type) :
                                this.dynamicDelegate.parameters(type);
  }
  annotations(type: any): any[] {
    return isStaticType(type) ? this.staticDelegate.annotations(type) :
                                this.dynamicDelegate.annotations(type);
  }
  propMetadata(typeOrFunc: any): {[key: string]: any[]} {
    return isStaticType(typeOrFunc) ? this.staticDelegate.propMetadata(typeOrFunc) :
                                      this.dynamicDelegate.propMetadata(typeOrFunc);
  }
  getter(name: string): ɵGetterFn { return this.dynamicDelegate.getter(name); }
  setter(name: string): ɵSetterFn { return this.dynamicDelegate.setter(name); }
  method(name: string): ɵMethodFn { return this.dynamicDelegate.method(name); }
  importUri(type: any): string { return this.staticDelegate.importUri(type) !; }
  resourceUri(type: any): string { return this.staticDelegate.resourceUri(type); }
  resolveIdentifier(name: string, moduleUrl: string, members: string[], runtime: any) {
    return this.staticDelegate.resolveIdentifier(name, moduleUrl, members);
  }
  resolveEnum(enumIdentifier: any, name: string): any {
    if (isStaticType(enumIdentifier)) {
      return this.staticDelegate.resolveEnum(enumIdentifier, name);
    } else {
      return null;
    }
  }
}

function isStaticType(type: any): boolean {
  return typeof type === 'object' && type.name && type.filePath;
}
