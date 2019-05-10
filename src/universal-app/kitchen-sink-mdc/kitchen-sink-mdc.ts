import {Component, NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {MatChipsModule} from '@angular/material-experimental/mdc-chips';
import {MatMenuModule} from '@angular/material-experimental/mdc-menu';
import {MatRadioModule} from '@angular/material-experimental/mdc-radio';
import {MatSlideToggleModule} from '@angular/material-experimental/mdc-slide-toggle';

@Component({
  selector: 'kitchen-sink-mdc',
  templateUrl: './kitchen-sink-mdc.html',
})
export class KitchenSinkMdc {
}

@NgModule({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatMenuModule,
    MatRadioModule,
    MatSlideToggleModule,
  ],
  declarations: [KitchenSinkMdc],
  exports: [KitchenSinkMdc],
})
export class KitchenSinkMdcModule {
}
