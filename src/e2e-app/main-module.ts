import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {BlockScrollStrategyE2eModule} from './block-scroll-strategy/block-scroll-strategy-e2e-module';
import {ButtonToggleE2eModule} from './button-toggle/button-toggle-e2e-module';
import {CardE2eModule} from './card/card-e2e-module';
import {ComponentHarnessE2eModule} from './component-harness/component-harness-e2e-module';
import {E2eApp} from './e2e-app';
import {E2eAppModule} from './e2e-app/e2e-app-module';
import {ExpansionE2eModule} from './expansion/expansion-e2e-module';
import {GridListE2eModule} from './grid-list/grid-list-e2e-module';
import {IconE2eModule} from './icon/icon-e2e-module';
import {LegacyCheckboxE2eModule} from './legacy-checkbox/legacy-checkbox-e2e-module';
import {LegacyDialogE2eModule} from './legacy-dialog/legacy-dialog-e2e-module';
import {LegacyInputE2eModule} from './legacy-input/legacy-input-e2e-module';
import {LegacyMenuE2eModule} from './legacy-menu/legacy-menu-e2e-module';
import {LegacyProgressBarE2eModule} from './legacy-progress-bar/legacy-progress-bar-e2e-module';
import {LegacyProgressSpinnerE2eModule} from './legacy-progress-spinner/legacy-progress-spinner-e2e-module';
import {LegacyRadioE2eModule} from './legacy-radio/legacy-radio-e2e-module';
import {LegacySlideToggleE2eModule} from './legacy-slide-toggle/legacy-slide-toggle-e2e-module';
import {LegacyTabsE2eModule} from './legacy-tabs/legacy-tabs-e2e-module';
import {ListE2eModule} from './list/list-e2e-module';
import {ButtonE2eModule} from './button/button-e2e-module';
import {MdcCheckboxE2eModule} from './mdc-checkbox/mdc-checkbox-e2e-module';
import {MdcChipsE2eModule} from './mdc-chips/mdc-chips-e2e-module';
import {MdcDialogE2eModule} from './mdc-dialog/mdc-dialog-e2e-module';
import {MdcMenuE2eModule} from './mdc-menu/mdc-menu-e2e-module';
import {MdcProgressBarE2eModule} from './mdc-progress-bar/mdc-progress-bar-e2e-module';
import {MdcProgressSpinnerE2eModule} from './mdc-progress-spinner/mdc-progress-spinner-module';
import {MdcRadioE2eModule} from './mdc-radio/mdc-radio-e2e-module';
import {MdcSlideToggleE2eModule} from './mdc-slide-toggle/mdc-slide-toggle-e2e-module';
import {MdcSliderE2eModule} from './mdc-slider/mdc-slider-e2e-module';
import {MdcTableE2eModule} from './mdc-table/mdc-table-e2e-module';
import {MdcTabsE2eModule} from './mdc-tabs/mdc-tabs-e2e-module';
import {E2E_APP_ROUTES} from './routes';
import {SidenavE2eModule} from './sidenav/sidenav-e2e-module';
import {StepperE2eModule} from './stepper/stepper-e2e-module';
import {ToolbarE2eModule} from './toolbar/toolbar-e2e-module';
import {VirtualScrollE2eModule} from './virtual-scroll/virtual-scroll-e2e-module';

/** We allow for animations to be explicitly enabled in certain e2e tests. */
const enableAnimations = window.location.search.includes('animations=true');

@NgModule({
  imports: [
    BrowserModule,
    E2eAppModule,
    BrowserAnimationsModule.withConfig({disableAnimations: !enableAnimations}),
    RouterModule.forRoot(E2E_APP_ROUTES),

    // E2E demos
    BlockScrollStrategyE2eModule,
    ButtonToggleE2eModule,
    CardE2eModule,
    ComponentHarnessE2eModule,
    ExpansionE2eModule,
    GridListE2eModule,
    IconE2eModule,
    LegacyCheckboxE2eModule,
    LegacyDialogE2eModule,
    LegacyInputE2eModule,
    LegacyMenuE2eModule,
    LegacyProgressBarE2eModule,
    LegacyProgressSpinnerE2eModule,
    LegacyRadioE2eModule,
    LegacySlideToggleE2eModule,
    LegacyTabsE2eModule,
    ListE2eModule,
    ButtonE2eModule,
    MdcCheckboxE2eModule,
    MdcChipsE2eModule,
    MdcDialogE2eModule,
    MdcMenuE2eModule,
    MdcProgressBarE2eModule,
    MdcProgressSpinnerE2eModule,
    MdcRadioE2eModule,
    MdcSliderE2eModule,
    MdcSlideToggleE2eModule,
    MdcTableE2eModule,
    MdcTabsE2eModule,
    SidenavE2eModule,
    StepperE2eModule,
    ToolbarE2eModule,
    VirtualScrollE2eModule,
  ],
  declarations: [E2eApp],
  bootstrap: [E2eApp],
})
export class MainModule {}
