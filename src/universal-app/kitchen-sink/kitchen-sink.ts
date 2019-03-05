import {ViewportRuler, ScrollingModule} from '@angular/cdk/scrolling';
import {
  CdkTableModule,
  DataSource
} from '@angular/cdk/table';
import {Component, ElementRef, NgModule} from '@angular/core';
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialog,
  MatDialogModule,
  MatDividerModule,
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
  MatSnackBar,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatBottomSheet,
} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';
import {FocusMonitor} from '@angular/cdk/a11y';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {Observable, of as observableOf} from 'rxjs';

export class TableDataSource extends DataSource<any> {
  connect(): Observable<any> {
    return observableOf([{userId: 1}, {userId: 2}]);
  }

  disconnect() {}
}


@Component({
  template: `<button>Do the thing</button>`
})
export class TestEntryComponent {}


@Component({
  selector: 'kitchen-sink',
  templateUrl: './kitchen-sink.html',
})
export class KitchenSink {

  /** List of columns for the CDK and Material table. */
  tableColumns = ['userId'];

  /** Data source for the CDK and Material table. */
  tableDataSource = new TableDataSource();

  /** Data used to render a virtual scrolling list. */
  virtualScrollData = Array(10000).fill(50);

  constructor(
    snackBar: MatSnackBar,
    dialog: MatDialog,
    viewportRuler: ViewportRuler,
    focusMonitor: FocusMonitor,
    elementRef: ElementRef<HTMLElement>,
    bottomSheet: MatBottomSheet) {
    focusMonitor.focusVia(elementRef, 'program');
    snackBar.open('Hello there');
    dialog.open(TestEntryComponent);
    bottomSheet.open(TestEntryComponent);

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
    MatBottomSheetModule,
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
    ScrollingModule,

    // CDK Modules
    CdkTableModule,
    DragDropModule,
  ],
  bootstrap: [KitchenSink],
  declarations: [KitchenSink, TestEntryComponent],
  entryComponents: [TestEntryComponent],
})
export class KitchenSinkClientModule { }


@NgModule({
  imports: [KitchenSinkClientModule, ServerModule],
  bootstrap: [KitchenSink],
})
export class KitchenSinkServerModule { }
