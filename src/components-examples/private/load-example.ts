import {Injector, Type, createNgModuleRef} from '@angular/core';
import {EXAMPLE_COMPONENTS} from '../example-module';

/**
 * Asynchronously loads the specified example and returns its component and
 * an injector instantiated from the containing example module.
 *
 * This is used in the `dev-app` and `e2e-app` and assumes ESBuild having created
 * entry-points for the example modules under the `<host>/bundles/` URL.
 */
export async function loadExample(
  name: string,
  injector: Injector,
): Promise<{component: Type<any>; injector: Injector}> {
  const {componentName, module} = EXAMPLE_COMPONENTS[name];
  const moduleExports = await import(
    `/bundles/components-examples/${module.importSpecifier}/index.js`
  );
  const moduleType: Type<any> = moduleExports[module.name];
  const componentType: Type<any> = moduleExports[componentName];
  const moduleRef = createNgModuleRef(moduleType, injector);

  return {
    component: componentType,
    injector: moduleRef.injector,
  };
}
