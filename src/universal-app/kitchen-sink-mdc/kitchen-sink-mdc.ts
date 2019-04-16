import {Component, NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';

@Component({
  selector: 'kitchen-sink-mdc',
  templateUrl: './kitchen-sink-mdc.html',
})
export class KitchenSinkMdc {
}

@NgModule({
  imports: [
    MatCheckboxModule,
  ],
  declarations: [KitchenSinkMdc],
  exports: [KitchenSinkMdc],
})
export class KitchenSinkMdcModule {
}
