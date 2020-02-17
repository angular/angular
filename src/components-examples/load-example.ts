/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, Injector, NgModuleFactory, Type} from '@angular/core';
import {EXAMPLE_COMPONENTS} from './example-module';

/** Asynchronously loads the specified example and returns its component factory. */
export async function loadExampleFactory(name: string, injector: Injector)
    : Promise<ComponentFactory<any>> {
  const {componentName, module} = EXAMPLE_COMPONENTS[name];
  // TODO(devversion): remove the NgFactory import when the `--config=view-engine` switch is gone.
  const [moduleFactoryExports, moduleExports] = await Promise.all([
    import(module.importSpecifier + '/index.ngfactory'),
    import(module.importSpecifier)
  ]);
  const moduleFactory: NgModuleFactory<any> = moduleFactoryExports[`${module.name}NgFactory`];
  const componentType: Type<any> = moduleExports[componentName];
  return moduleFactory.create(injector)
    .componentFactoryResolver.resolveComponentFactory(componentType);
}

