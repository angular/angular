import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { ApiListComponent } from './api-list.component';



@NgModule({
  imports: [ CommonModule, SharedModule, HttpClientModule ],
  declarations: [ ApiListComponent ],
  entryComponents: [ ApiListComponent ]
})
export class ApiListModule {
  static customElements = [ ApiListComponent ]
}
