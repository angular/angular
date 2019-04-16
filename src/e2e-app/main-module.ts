import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {
  BlockScrollStrategyE2eModule
} from './block-scroll-strategy/block-scroll-strategy-e2e-module';
import {ButtonToggleE2eModule} from './button-toggle/button-toggle-e2e-module';
import {ButtonE2eModule} from './button/button-e2e-module';
import {CardE2eModule} from './card/card-e2e-module';
import {CheckboxE2eModule} from './checkbox/checkbox-e2e-module';
import {DialogE2eModule} from './dialog/dialog-e2e-module';
import {E2eApp} from './e2e-app';
import {E2eAppModule} from './e2e-app/e2e-app-module';
import {E2E_APP_ROUTES} from './e2e-app/routes';
import {ExpansionE2eModule} from './expansion/expansion-e2e-module';
import {GridListE2eModule} from './grid-list/grid-list-e2e-module';
import {IconE2eModule} from './icon/icon-e2e-module';
import {InputE2eModule} from './input/input-e2e-module';
import {ListE2eModule} from './list/list-e2e-module';
import {MdcButtonE2eModule} from './mdc-button/mdc-button-e2e-module';
import {MdcCardE2eModule} from './mdc-card/mdc-card-e2e-module';
import {MdcCheckboxE2eModule} from './mdc-checkbox/mdc-checkbox-e2e-module';
import {MdcMenuE2eModule} from './mdc-menu/mdc-menu-e2e-module';
import {MdcRadioE2eModule} from './mdc-radio/mdc-radio-e2e-module';
import {MdcSlideToggleE2eModule} from './mdc-slide-toggle/mdc-slide-toggle-e2e-module';
import {MenuE2eModule} from './menu/menu-e2e-module';
import {ProgressBarE2eModule} from './progress-bar/progress-bar-e2e-module';
import {ProgressSpinnerE2eModule} from './progress-spinner/progress-spinner-e2e-module';
import {RadioE2eModule} from './radio/radio-e2e-module';
import {SidenavE2eModule} from './sidenav/sidenav-e2e-module';
import {SlideToggleE2eModule} from './slide-toggle/slide-toggle-e2e-module';
import {StepperE2eModule} from './stepper/stepper-e2e-module';
import {TabsE2eModule} from './tabs/tabs-e2e-module';
import {ToolbarE2eModule} from './toolbar/toolbar-e2e-module';
import {VirtualScrollE2eModule} from './virtual-scroll/virtual-scroll-e2e-module';

@NgModule({
  imports: [
    BrowserModule,
    E2eAppModule,
    NoopAnimationsModule,
    RouterModule.forRoot(E2E_APP_ROUTES),

    // E2E demos
    BlockScrollStrategyE2eModule,
    ButtonE2eModule,
    ButtonToggleE2eModule,
    CardE2eModule,
    CheckboxE2eModule,
    DialogE2eModule,
    ExpansionE2eModule,
    GridListE2eModule,
    IconE2eModule,
    InputE2eModule,
    ListE2eModule,
    MdcButtonE2eModule,
    MdcCardE2eModule,
    MdcCheckboxE2eModule,
    MdcMenuE2eModule,
    MdcRadioE2eModule,
    MdcSlideToggleE2eModule,
    MenuE2eModule,
    ProgressBarE2eModule,
    ProgressSpinnerE2eModule,
    RadioE2eModule,
    SidenavE2eModule,
    SlideToggleE2eModule,
    StepperE2eModule,
    TabsE2eModule,
    ToolbarE2eModule,
    VirtualScrollE2eModule,
  ],
  declarations: [
    E2eApp,
  ],
  bootstrap: [E2eApp],
})
export class MainModule {
}
