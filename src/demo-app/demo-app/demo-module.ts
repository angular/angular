/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LayoutModule} from '@angular/cdk/layout';
import {FullscreenOverlayContainer, OverlayContainer} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {Injector, NgModule} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {EXAMPLE_COMPONENTS, ExampleModule} from '@angular/material-examples';
import {RouterModule} from '@angular/router';

import {AutocompleteDemo} from '../autocomplete/autocomplete-demo';
import {BadgeDemo} from '../badge/badge-demo';
import {BaselineDemo} from '../baseline/baseline-demo';
import {BottomSheetDemo, ExampleBottomSheet} from '../bottom-sheet/bottom-sheet-demo';
import {ButtonToggleDemo} from '../button-toggle/button-toggle-demo';
import {ButtonDemo} from '../button/button-demo';
import {CardDemo} from '../card/card-demo';
import {CheckboxDemo, MatCheckboxDemoNestedChecklist} from '../checkbox/checkbox-demo';
import {ChipsDemo} from '../chips/chips-demo';
import {ConnectedOverlayDemo} from '../connected-overlay/connected-overlay-demo';
import {CustomHeader, DatepickerDemo} from '../datepicker/datepicker-demo';
import {DemoMaterialModule} from '../demo-material-module';
import {ContentElementDialog, DialogDemo, IFrameDialog, JazzDialog} from '../dialog/dialog-demo';
import {DrawerDemo} from '../drawer/drawer-demo';
import {MaterialExampleModule} from '../example/example-module';
import {ExamplesPage} from '../examples-page/examples-page';
import {ExpansionDemo} from '../expansion/expansion-demo';
import {FocusOriginDemo} from '../focus-origin/focus-origin-demo';
import {GesturesDemo} from '../gestures/gestures-demo';
import {GridListDemo} from '../grid-list/grid-list-demo';
import {IconDemo} from '../icon/icon-demo';
import {InputDemo} from '../input/input-demo';
import {ListDemo} from '../list/list-demo';
import {LiveAnnouncerDemo} from '../live-announcer/live-announcer-demo';
import {MenuDemo} from '../menu/menu-demo';
import {PaginatorDemo} from '../paginator/paginator-demo';
import {PlatformDemo} from '../platform/platform-demo';
import {PortalDemo, ScienceJoke} from '../portal/portal-demo';
import {ProgressBarDemo} from '../progress-bar/progress-bar-demo';
import {ProgressSpinnerDemo} from '../progress-spinner/progress-spinner-demo';
import {RadioDemo} from '../radio/radio-demo';
import {RippleDemo} from '../ripple/ripple-demo';
import {ScreenTypeDemo} from '../screen-type/screen-type-demo';
import {SelectDemo} from '../select/select-demo';
import {SidenavDemo} from '../sidenav/sidenav-demo';
import {SlideToggleDemo} from '../slide-toggle/slide-toggle-demo';
import {SliderDemo} from '../slider/slider-demo';
import {SnackBarDemo} from '../snack-bar/snack-bar-demo';
import {StepperDemo} from '../stepper/stepper-demo';
import {TableDemoModule} from '../table/table-demo-module';
import {TabsDemo} from '../tabs/tabs-demo';
import {ToolbarDemo} from '../toolbar/toolbar-demo';
import {TooltipDemo} from '../tooltip/tooltip-demo';
import {TreeDemoModule} from '../tree/tree-demo-module';
import {TypographyDemo} from '../typography/typography-demo';
import {VirtualScrollDemo} from '../virtual-scroll/virtual-scroll-demo';
import {DemoApp, Home} from './demo-app';
import {DEMO_APP_ROUTES} from './routes';
import {DragAndDropDemo} from '../drag-drop/drag-drop-demo';

@NgModule({
  imports: [
    MaterialExampleModule,
    ExampleModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(DEMO_APP_ROUTES),
    DemoMaterialModule,
    LayoutModule,
    TableDemoModule,
    TreeDemoModule,
  ],
  declarations: [
    ExamplesPage,
    AutocompleteDemo,
    BadgeDemo,
    BaselineDemo,
    BottomSheetDemo,
    ButtonDemo,
    ButtonToggleDemo,
    CardDemo,
    CheckboxDemo,
    ChipsDemo,
    ConnectedOverlayDemo,
    ContentElementDialog,
    CustomHeader,
    DatepickerDemo,
    DemoApp,
    DialogDemo,
    DrawerDemo,
    ExampleBottomSheet,
    DragAndDropDemo,
    ExpansionDemo,
    FocusOriginDemo,
    GesturesDemo,
    GridListDemo,
    Home,
    IFrameDialog,
    IconDemo,
    InputDemo,
    JazzDialog,
    ListDemo,
    LiveAnnouncerDemo,
    MatCheckboxDemoNestedChecklist,
    MenuDemo,
    PaginatorDemo,
    PlatformDemo,
    PortalDemo,
    ProgressBarDemo,
    ProgressSpinnerDemo,
    RadioDemo,
    RippleDemo,
    ScienceJoke,
    ScreenTypeDemo,
    SelectDemo,
    SidenavDemo,
    SlideToggleDemo,
    SliderDemo,
    SnackBarDemo,
    StepperDemo,
    TabsDemo,
    ToolbarDemo,
    TooltipDemo,
    TypographyDemo,
    VirtualScrollDemo,
  ],
  providers: [
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
  ],
  entryComponents: [
    ContentElementDialog,
    CustomHeader,
    DemoApp,
    ExampleBottomSheet,
    IFrameDialog,
    JazzDialog,
    ScienceJoke,
  ],
})
export class DemoModule {
  constructor(injector: Injector) {
    // Register examples as custom elements so that they can be inserted into the DOM dynamically
    Object.keys(EXAMPLE_COMPONENTS).forEach(key => {
      const element = createCustomElement(EXAMPLE_COMPONENTS[key].component, {injector});
      customElements.define(key, element);
    });
  }
}
