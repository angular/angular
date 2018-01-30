import { NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader } from '@angular/core';

import { EmbedComponentsService } from './embed-components.service';
import { ElementsLoader } from '../elements/elements-loader'

@NgModule({
  imports: [
    ElementsLoader.withElements([
      {selector: 'aio-api-list', loadChildren: '../embedded/api/api-list.module#ApiListModule' }
    ])
  ],
  providers: [
    EmbedComponentsService,
    { provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader },
  ],
})
export class EmbedComponentsModule {
}
