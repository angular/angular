import { NgModule } from '@angular/core'
import { DocService } from './doc.service';
import { DocFetchingService } from './doc-fetching.service';
import { DocMetadataService } from './doc-metadata.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class AioDocManager {
  static withConfig(config){
    return {
      ngModule: AioDocManager,
      providers: [
        DocService,
        DocFetchingService,
        DocMetadataService
      ]
    }
  }
}
