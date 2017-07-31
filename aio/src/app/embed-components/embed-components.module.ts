import { NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader } from '@angular/core';

import { EmbedComponentsService } from './embed-components.service';


@NgModule({
  providers: [
    EmbedComponentsService,
    { provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader },
  ],
})
export class EmbedComponentsModule {
}
