import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { WithCustomElementComponent } from '../element-registry';
import { FileNotFoundSearchComponent } from './file-not-found-search.component';
import { SearchResultsModule } from './search-results.module';


@NgModule({
  imports: [ CommonModule, SearchResultsModule ],
  declarations: [ FileNotFoundSearchComponent ],
  entryComponents: [ FileNotFoundSearchComponent ],
})
export class FileNotFoundSearchModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = FileNotFoundSearchComponent;
}
