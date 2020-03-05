import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineComponent } from'./offline.component';

import { WithCustomElementComponent } from '../element-registry';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [ CommonModule, MatDialogModule, MatButtonModule ],
  declarations: [ OfflineComponent ],
  entryComponents: [ OfflineComponent ],
})
export class OfflineModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = OfflineComponent;
}
