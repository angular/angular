import {Component, NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';
import {BrowserModule} from '@angular/platform-browser';
import {
  MdAutocompleteModule,
  MdButtonModule,
  MdCardModule,
  MdChipsModule,
  MdDatepickerModule,
  MdDialogModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdMenuModule,
  MdNativeDateModule,
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
} from '@angular/material';


@Component({
  selector: 'kitchen-sink',
  templateUrl: './kitchen-sink.html',
  styleUrls: ['./kitchen-sink.css'],
})
export class KitchenSink { }


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
    MdGridListModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdMenuModule,
    MdNativeDateModule,
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
