import { NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader } from '@angular/core';
import { ROUTES} from '@angular/router';
import { ElementsLoader, REGISTER_AS_CUSTOM_ELEMENTS_API } from './elements-loader';
import {
  ELEMENT_MODULE_PATHS,
  ELEMENT_MODULE_PATHS_AS_ROUTES,
  ELEMENT_MODULE_PATHS_TOKEN
} from './element-registry';
import { registerAsCustomElements } from '@angular/elements';

@NgModule({
  providers: [
    ElementsLoader,
    { provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader },
    { provide: ELEMENT_MODULE_PATHS_TOKEN, useValue: ELEMENT_MODULE_PATHS},

    // This could be used directly by the ElementsLoader but it is injected so that it can
    // be faked in tests.
    { provide: REGISTER_AS_CUSTOM_ELEMENTS_API, useValue: registerAsCustomElements },

    // Providing these routes as a signal to the build system that these modules should be
    // registered as lazy-loadable.
    // TODO(andrewjs): Provide first-class support for providing this.
    { provide: ROUTES, useValue: ELEMENT_MODULE_PATHS_AS_ROUTES, multi: true },
  ],
})
export class CustomElementsModule { }
