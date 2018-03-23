import {Component, NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';
import {BrowserModule} from '@angular/platform-browser';
import {
  MatAutocompleteModule,
  MatBadgeModule,
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
  MatDialog,
} from '@angular/material';
import {
  CdkTableModule,
  DataSource
} from '@angular/cdk/table';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {of as observableOf} from 'rxjs';
import {Observable} from 'rxjs';

export class TableDataSource extends DataSource<any> {
  connect(): Observable<any> {
    return observableOf([{userId: 1}, {userId: 2}]);
  }

  disconnect() {}
}


@Component({
  template: `<button>Do the thing</button>`
})
export class TestDialog {}


@Component({
  selector: 'kitchen-sink',
  templateUrl: './kitchen-sink.html',
  styleUrls: ['./kitchen-sink.css'],
})
export class KitchenSink {

  /** List of columns for the CDK and Material table. */
  tableColumns = ['userId'];

  /** Data source for the CDK and Material table. */
  tableDataSource = new TableDataSource();

  constructor(
    snackBar: MatSnackBar,
    dialog: MatDialog,
    viewportRuler: ViewportRuler) {
    snackBar.open('Hello there');
    dialog.open(TestDialog);

    // Do a sanity check on the viewport ruler.
    viewportRuler.getViewportRect();
    viewportRuler.getViewportSize();
    viewportRuler.getViewportScrollPosition();
  }
}


@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'kitchen-sink'}),
    MatAutocompleteModule,
    MatBadgeModule,
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
  declarations: [KitchenSink, TestDialog],
  entryComponents: [TestDialog],
})
export class KitchenSinkClientModule { }


@NgModule({
  imports: [KitchenSinkClientModule, ServerModule],
  bootstrap: [KitchenSink],
})
export class KitchenSinkServerModule { }
