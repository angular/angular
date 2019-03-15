/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FullscreenOverlayContainer, OverlayContainer} from '@angular/cdk/overlay';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {MAT_RIPPLE_GLOBAL_OPTIONS} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {AutocompleteDemoModule} from './autocomplete/autocomplete-demo-module';
import {BadgeDemoModule} from './badge/badge-demo-module';
import {BaselineDemoModule} from './baseline/baseline-demo-module';
import {BottomSheetDemoModule} from './bottom-sheet/bottom-sheet-demo-module';
import {ButtonToggleDemoModule} from './button-toggle/button-toggle-demo-module';
import {ButtonDemoModule} from './button/button-demo-module';
import {CardDemoModule} from './card/card-demo-module';
import {CheckboxDemoModule} from './checkbox/checkbox-demo-module';
import {ChipsDemoModule} from './chips/chips-demo-module';
import {ConnectedOverlayDemoModule} from './connected-overlay/connected-overlay-demo-module';
import {DatepickerDemoModule} from './datepicker/datepicker-demo-module';
import {DevApp404, DevAppComponent, DevAppHome} from './dev-app';
import {DevAppLayoutModule} from './dev-app-layout/dev-app-layout-module';
import {DialogDemoModule} from './dialog/dialog-demo-module';
import {DragDropDemoModule} from './drag-drop/drag-drop-demo-module';
import {DrawerDemoModule} from './drawer/drawer-demo-module';
import {ExamplesPageModule} from './examples-page/examples-page-module';
import {ExpansionDemoModule} from './expansion/expansion-demo-module';
import {FocusOriginDemoModule} from './focus-origin/focus-origin-demo-module';
import {GesturesDemoModule} from './gestures/gestures-demo-module';
import {GridListDemoModule} from './grid-list/grid-list-demo-module';
import {IconDemoModule} from './icon/icon-demo-module';
import {InputDemoModule} from './input/input-demo-module';
import {ListDemoModule} from './list/list-demo-module';
import {LiveAnnouncerDemoModule} from './live-announcer/live-announcer-demo-module';
import {MenuDemoModule} from './menu/menu-demo-module';
import {PaginatorDemoModule} from './paginator/paginator-demo-module';
import {PlatformDemoModule} from './platform/platform-demo-module';
import {PortalDemoModule} from './portal/portal-demo-module';
import {ProgressBarDemoModule} from './progress-bar/progress-bar-demo-module';
import {ProgressSpinnerDemoModule} from './progress-spinner/progress-spinner-demo-module';
import {RadioDemoModule} from './radio/radio-demo-module';
import {RippleDemoModule} from './ripple/ripple-demo-module';
import {DevAppRippleOptions} from './ripple/ripple-options';
import {DEV_APP_ROUTES} from './routes';
import {ScreenTypeDemoModule} from './screen-type/screen-type-demo-module';
import {SelectDemoModule} from './select/select-demo-module';
import {SidenavDemoModule} from './sidenav/sidenav-demo-module';
import {SlideToggleDemoModule} from './slide-toggle/slide-toggle-demo-module';
import {SliderDemoModule} from './slider/slider-demo-module';
import {SnackBarDemoModule} from './snack-bar/snack-bar-demo-module';
import {StepperDemoModule} from './stepper/stepper-demo-module';
import {TableDemoModule} from './table/table-demo-module';
import {TabsDemoModule} from './tabs/tabs-demo-module';
import {ToolbarDemoModule} from './toolbar/toolbar-demo-module';
import {TooltipDemoModule} from './tooltip/tooltip-demo-module';
import {TreeDemoModule} from './tree/tree-demo-module';
import {TypographyDemoModule} from './typography/typography-demo-module';
import {VirtualScrollDemoModule} from './virtual-scroll/virtual-scroll-demo-module';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    DevAppLayoutModule,
    HttpClientModule,
    RouterModule.forRoot(DEV_APP_ROUTES),

    // Demo pages
    AutocompleteDemoModule,
    BadgeDemoModule,
    BaselineDemoModule,
    BottomSheetDemoModule,
    ButtonDemoModule,
    ButtonToggleDemoModule,
    CardDemoModule,
    CheckboxDemoModule,
    ChipsDemoModule,
    ConnectedOverlayDemoModule,
    DatepickerDemoModule,
    DialogDemoModule,
    DragDropDemoModule,
    DrawerDemoModule,
    ExamplesPageModule,
    ExpansionDemoModule,
    FocusOriginDemoModule,
    GesturesDemoModule,
    GridListDemoModule,
    IconDemoModule,
    InputDemoModule,
    ListDemoModule,
    LiveAnnouncerDemoModule,
    MenuDemoModule,
    PaginatorDemoModule,
    PlatformDemoModule,
    PortalDemoModule,
    ProgressBarDemoModule,
    ProgressSpinnerDemoModule,
    RadioDemoModule,
    RippleDemoModule,
    ScreenTypeDemoModule,
    SelectDemoModule,
    SidenavDemoModule,
    SliderDemoModule,
    SlideToggleDemoModule,
    SnackBarDemoModule,
    StepperDemoModule,
    TableDemoModule,
    TabsDemoModule,
    ToolbarDemoModule,
    TooltipDemoModule,
    TreeDemoModule,
    TypographyDemoModule,
    VirtualScrollDemoModule,
  ],
  declarations: [
    DevAppComponent,
    DevAppHome,
    DevApp404,
  ],
  providers: [
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
    {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useExisting: DevAppRippleOptions},
  ],
  bootstrap: [DevAppComponent],
})
export class DevAppModule {
}
