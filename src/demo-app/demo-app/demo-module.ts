import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DemoApp, Home} from './demo-app';
import {DEMO_APP_ROUTES} from './routes';
import {ProgressBarDemo} from '../progress-bar/progress-bar-demo';
import {ContentElementDialog, DialogDemo, IFrameDialog, JazzDialog} from '../dialog/dialog-demo';
import {RippleDemo} from '../ripple/ripple-demo';
import {IconDemo} from '../icon/icon-demo';
import {GesturesDemo} from '../gestures/gestures-demo';
import {CardDemo} from '../card/card-demo';
import {ChipsDemo} from '../chips/chips-demo';
import {RadioDemo} from '../radio/radio-demo';
import {ButtonToggleDemo} from '../button-toggle/button-toggle-demo';
import {ProgressSpinnerDemo} from '../progress-spinner/progress-spinner-demo';
import {TooltipDemo} from '../tooltip/tooltip-demo';
import {ListDemo} from '../list/list-demo';
import {BaselineDemo} from '../baseline/baseline-demo';
import {GridListDemo} from '../grid-list/grid-list-demo';
import {LiveAnnouncerDemo} from '../live-announcer/live-announcer-demo';
import {OverlayDemo, RotiniPanel, SpagettiPanel} from '../overlay/overlay-demo';
import {SlideToggleDemo} from '../slide-toggle/slide-toggle-demo';
import {ToolbarDemo} from '../toolbar/toolbar-demo';
import {ButtonDemo} from '../button/button-demo';
import {CheckboxDemo, MdCheckboxDemoNestedChecklist} from '../checkbox/checkbox-demo';
import {SelectDemo} from '../select/select-demo';
import {SliderDemo} from '../slider/slider-demo';
import {SidenavDemo} from '../sidenav/sidenav-demo';
import {SnackBarDemo} from '../snack-bar/snack-bar-demo';
import {PortalDemo, ScienceJoke} from '../portal/portal-demo';
import {MenuDemo} from '../menu/menu-demo';
import {FoggyTabContent, RainyTabContent, SunnyTabContent, TabsDemo} from '../tabs/tabs-demo';
import {PlatformDemo} from '../platform/platform-demo';
import {AutocompleteDemo} from '../autocomplete/autocomplete-demo';
import {InputDemo} from '../input/input-demo';
import {StyleDemo} from '../style/style-demo';
import {TableDemo} from '../table/table-demo';
import {PeopleDatabase} from '../table/people-database';
import {DatepickerDemo} from '../datepicker/datepicker-demo';
import {TypographyDemo} from '../typography/typography-demo';
import {ExpansionDemo} from '../expansion/expansion-demo';
import {StepperDemo} from '../stepper/stepper-demo';
import {DemoMaterialModule} from '../demo-material-module';
import {
  FullscreenOverlayContainer,
  OverlayContainer,
} from '@angular/material';
import {TableHeaderDemo} from '../table/table-header-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(DEMO_APP_ROUTES),
    DemoMaterialModule,
  ],
  declarations: [
    AutocompleteDemo,
    BaselineDemo,
    ButtonDemo,
    ButtonToggleDemo,
    CardDemo,
    ChipsDemo,
    CheckboxDemo,
    DatepickerDemo,
    DemoApp,
    DialogDemo,
    GesturesDemo,
    GridListDemo,
    Home,
    IconDemo,
    InputDemo,
    JazzDialog,
    ContentElementDialog,
    IFrameDialog,
    ListDemo,
    LiveAnnouncerDemo,
    MdCheckboxDemoNestedChecklist,
    MenuDemo,
    SnackBarDemo,
    OverlayDemo,
    PortalDemo,
    ProgressBarDemo,
    ProgressSpinnerDemo,
    RadioDemo,
    RippleDemo,
    RotiniPanel,
    ScienceJoke,
    SelectDemo,
    SidenavDemo,
    SliderDemo,
    SlideToggleDemo,
    SpagettiPanel,
    StepperDemo,
    StyleDemo,
    TableHeaderDemo,
    ToolbarDemo,
    TooltipDemo,
    TableDemo,
    TabsDemo,
    SunnyTabContent,
    RainyTabContent,
    FoggyTabContent,
    PlatformDemo,
    TypographyDemo,
    ExpansionDemo,
  ],
  providers: [
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer},
    PeopleDatabase
  ],
  entryComponents: [
    DemoApp,
    JazzDialog,
    ContentElementDialog,
    IFrameDialog,
    RotiniPanel,
    ScienceJoke,
    SpagettiPanel,
  ],
})
export class DemoModule {}
