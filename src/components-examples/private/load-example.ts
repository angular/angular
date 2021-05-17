import {ComponentFactory, Injector, NgModuleFactory, Type} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '../example-module';

/** Asynchronously loads the specified example and returns its component factory. */
export async function loadExampleFactory(name: string, injector: Injector)
    : Promise<ComponentFactory<any>> {
  const {componentName, module} = EXAMPLE_COMPONENTS[name];
  // TODO(devversion): remove the NgFactory import when the `--config=view-engine` switch is gone.
  // Note: This line will be replaced by the e2e-app when a rollup bundle is composed. Rollup needs
  // to run for the partial compilation in order to process sources with the Angular linker.
  const {moduleExports, moduleFactoryExports} = await loadModuleWithFactory(
      `@angular/components-examples/${module.importSpecifier}`);
  const moduleFactory: NgModuleFactory<any> = moduleFactoryExports[`${module.name}NgFactory`];
  const componentType: Type<any> = moduleExports[componentName];
  return moduleFactory.create(injector)
    .componentFactoryResolver.resolveComponentFactory(componentType);
}

/** Loads the module and factory file for the given module. */
async function loadModuleWithFactory(moduleName: string) {
  const [moduleFactoryExports, moduleExports] = await Promise.all([
    import(moduleName + '/index.ngfactory'),
    import(moduleName)
  ]);
  return {moduleFactoryExports, moduleExports};
}
