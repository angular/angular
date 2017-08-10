import {Component, NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';
import {BrowserModule} from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';
import {
  MdAutocompleteModule,
  MdButtonModule,
  MdCardModule,
  MdChipsModule,
  MdDatepickerModule,
  MdDialogModule,
  MdExpansionModule,
  MdFormFieldModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdMenuModule,
  MdNativeDateModule,
  MdPaginatorModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
  MdRadioModule,
  MdRippleModule,
  MdSelectModule,
  MdSidenavModule,
  MdSliderModule,
  MdSlideToggleModule,
  MdSnackBarModule,
  MdSortModule,
  MdTableModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
} from '@angular/material';
import {
  CdkTableModule,
  DataSource
} from '@angular/cdk/table';

import 'rxjs/add/observable/of';

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
    connect: () => Observable.of([
      { userId: 1 },
      { userId: 2 }
    ]),
    disconnect: () => {}
  };

}


@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'kitchen-sink'}),
    MdAutocompleteModule,
    MdButtonModule,
    // Button toggle and checkbox can't work due to https://github.com/angular/angular/issues/17050
    // MdButtonToggleModule,
    MdCardModule,
    // MdCheckboxModule,
    MdChipsModule,
    MdDatepickerModule,
    MdDialogModule,
    MdFormFieldModule,
    MdGridListModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdMenuModule,
    MdNativeDateModule,
    MdPaginatorModule,
    MdProgressBarModule,
    MdProgressSpinnerModule,
    MdRadioModule,
    MdRippleModule,
    MdSelectModule,
    MdSidenavModule,
    MdSliderModule,
    MdSlideToggleModule,
    MdSnackBarModule,
    MdTabsModule,
    MdToolbarModule,
    MdTooltipModule,
    MdExpansionModule,
    MdSortModule,
    MdTableModule,

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
