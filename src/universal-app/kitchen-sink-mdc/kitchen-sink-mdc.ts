import {Component, NgModule, ErrorHandler} from '@angular/core';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {MatProgressBarModule} from '@angular/material-experimental/mdc-progress-bar';
import {MatChipsModule} from '@angular/material-experimental/mdc-chips';
import {MatMenuModule} from '@angular/material-experimental/mdc-menu';
import {MatRadioModule} from '@angular/material-experimental/mdc-radio';
import {MatSlideToggleModule} from '@angular/material-experimental/mdc-slide-toggle';
import {MatSliderModule} from '@angular/material-experimental/mdc-slider';
import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';
import {MatIconModule} from '@angular/material/icon';

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
    MatIconModule,
    MatMenuModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatTabsModule,
    MatProgressBarModule,
  ],
  declarations: [KitchenSinkMdc],
  exports: [KitchenSinkMdc],
  providers: [{
    // If an error is thrown asynchronously during server-side rendering it'll get logged to stderr,
    // but it won't cause the build to fail. We still want to catch these errors so we provide an
    // `ErrorHandler` that re-throws the error and causes the process to exit correctly.
    provide: ErrorHandler,
    useValue: {handleError: ERROR_HANDLER}
  }]
})
export class KitchenSinkMdcModule {
}

export function ERROR_HANDLER(error: Error) {
  throw error;
}
