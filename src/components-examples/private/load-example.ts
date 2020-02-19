import {ComponentFactory, Injector, NgModuleFactory, Type} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '../example-module';

/** Asynchronously loads the specified example and returns its component factory. */
export async function loadExampleFactory(name: string, injector: Injector)
    : Promise<ComponentFactory<any>> {
  const {componentName, module} = EXAMPLE_COMPONENTS[name];
  const importSpecifier = `@angular/components-examples/${module.importSpecifier}`;
  // TODO(devversion): remove the NgFactory import when the `--config=view-engine` switch is gone.
  const [moduleFactoryExports, moduleExports] = await Promise.all([
    import(importSpecifier + '/index.ngfactory'),
    import(importSpecifier)
  ]);
  const moduleFactory: NgModuleFactory<any> = moduleFactoryExports[`${module.name}NgFactory`];
  const componentType: Type<any> = moduleExports[componentName];
  return moduleFactory.create(injector)
    .componentFactoryResolver.resolveComponentFactory(componentType);
}

