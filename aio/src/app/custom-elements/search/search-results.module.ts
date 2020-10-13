import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { WithCustomElementComponent } from '../element-registry';
import { SearchResultsComponent } from './search-results.component';


@NgModule({
  imports: [ CommonModule ],
  exports: [ SearchResultsComponent ],
  declarations: [ SearchResultsComponent ],
  entryComponents: [ SearchResultsComponent ],
})
export class SearchResultsModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = SearchResultsComponent;
}
