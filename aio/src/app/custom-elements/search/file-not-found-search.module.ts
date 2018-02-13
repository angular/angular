import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FileNotFoundSearchComponent } from './file-not-found-search.component';
import { WithCustomElement } from '../element-registry';

@NgModule({
  imports: [ CommonModule, SharedModule ],
  declarations: [ FileNotFoundSearchComponent ],
  entryComponents: [ FileNotFoundSearchComponent ]
})
export class FileNotFoundSearchModule implements WithCustomElement {
  customElement: Type<any> = FileNotFoundSearchComponent;
}
