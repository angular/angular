import {Component, NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';
import {BrowserModule} from '@angular/platform-browser';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDividerModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
  MatSnackBar,
} from '@angular/material';
import {
  CdkTableModule,
  DataSource
} from '@angular/cdk/table';

import {of as observableOf} from 'rxjs/observable/of';

@Component({
  selector: 'kitchen-sink',
  templateUrl: './kitchen-sink.html',
  styleUrls: ['./kitchen-sink.css'],
})
export class KitchenSink {

  /** List of columns for the CDK and Material table. */
  tableColumns = ['userId'];

  /** Data source for the CDK and Material table. */
  tableDataSource: DataSource<any> = {
    connect: () => observableOf([{userId: 1}, {userId: 2}]),
    disconnect: () => {}
  };

  constructor(snackBar: MatSnackBar) {
    // Open a snack bar to do a basic sanity check of the overlays.
    snackBar.open('Hello there');
  }

}


@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'kitchen-sink'}),
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSortModule,
    MatTableModule,
    MatStepperModule,

    // CDK Modules
    CdkTableModule
  ],
  bootstrap: [KitchenSink],
  declarations: [KitchenSink],
})
export class KitchenSinkClientModule { }


@NgModule({
  imports: [KitchenSinkClientModule, ServerModule],
  bootstrap: [KitchenSink],
})
export class KitchenSinkServerModule { }
