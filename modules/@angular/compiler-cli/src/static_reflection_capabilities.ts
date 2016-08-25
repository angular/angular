/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReflectionCapabilities, reflector} from './core_private';
import {StaticReflector} from './static_reflector';

export class StaticAndDynamicReflectionCapabilities {
  static install(staticDelegate: StaticReflector) {
    reflector.updateCapabilities(new StaticAndDynamicReflectionCapabilities(staticDelegate));
  }

  private dynamicDelegate = new ReflectionCapabilities();

  constructor(private staticDelegate: StaticReflector) {}

  isReflectionEnabled(): boolean { return true; }
  factory(type: any): Function { return this.dynamicDelegate.factory(type); }
  interfaces(type: any): any[] { return this.dynamicDelegate.interfaces(type); }
  hasLifecycleHook(type: any, lcInterface: /*Type*/ any, lcProperty: string): boolean {
    return isStaticType(type) ?
        this.staticDelegate.hasLifecycleHook(type, lcInterface, lcProperty) :
        this.dynamicDelegate.hasLifecycleHook(type, lcInterface, lcProperty);
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
  getter(name: string) { return this.dynamicDelegate.getter(name); }
  setter(name: string) { return this.dynamicDelegate.setter(name); }
  method(name: string) { return this.dynamicDelegate.method(name); }
  importUri(type: any): string { return this.staticDelegate.importUri(type); }
  resolveType(name: string, moduleUrl: string) {
    return this.staticDelegate.resolveType(name, moduleUrl);
  }
  resolveEnum(enumType: any, name: string): any {
    if (isStaticType(enumType)) {
      return this.staticDelegate.resolveEnum(enumType, name);
    } else {
      return null;
    }
  }
}

function isStaticType(type: any): boolean {
  return typeof type === 'object' && type.name && type.filePath;
}
