import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributorListComponent } from './contributor-list.component';
import { ContributorService } from './contributor.service';
import { ContributorComponent } from './contributor.component';
import { WithCustomElements } from '../element-registry';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ ContributorListComponent, ContributorComponent ],
  entryComponents: [ ContributorListComponent ],
  providers: [ ContributorService ]
})
export class ContributorListModule implements WithCustomElements {
  customElements: Type<any>[] = [ ContributorListComponent ];
}
