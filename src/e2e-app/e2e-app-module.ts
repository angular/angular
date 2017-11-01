import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {SimpleCheckboxes} from './checkbox/checkbox-e2e';
import {E2EApp, Home} from './e2e-app/e2e-app';
import {IconE2E} from './icon/icon-e2e';
import {ButtonE2E} from './button/button-e2e';
import {MenuE2E} from './menu/menu-e2e';
import {SimpleRadioButtons} from './radio/radio-e2e';
import {BasicTabs} from './tabs/tabs-e2e';
import {DialogE2E, TestDialog} from './dialog/dialog-e2e';
import {GridListE2E} from './grid-list/grid-list-e2e';
import {ProgressBarE2E} from './progress-bar/progress-bar-e2e';
import {ProgressSpinnerE2E} from './progress-spinner/progress-spinner-e2e';
import {FullscreenE2E, TestDialogFullScreen} from './fullscreen/fullscreen-e2e';
import {E2E_APP_ROUTES} from './e2e-app/routes';
import {SlideToggleE2E} from './slide-toggle/slide-toggle-e2e';
import {InputE2E} from './input/input-e2e';
import {SidenavE2E} from './sidenav/sidenav-e2e';
import {BlockScrollStrategyE2E} from './block-scroll-strategy/block-scroll-strategy-e2e';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatStepperModule,
  MatTabsModule,
} from '@angular/material';
import {FullscreenOverlayContainer, OverlayContainer} from '@angular/cdk/overlay';
import {ExampleModule} from '@angular/material-examples';
import {ReactiveFormsModule} from '@angular/forms';

/**
 * NgModule that contains all Material modules that are required to serve the e2e-app.
 */
@NgModule({
  exports: [
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatTabsModule,
    MatNativeDateModule,
  ]
})
export class E2eMaterialModule {}

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(E2E_APP_ROUTES),
    E2eMaterialModule,
    NoopAnimationsModule,
    ExampleModule,
    ReactiveFormsModule
  ],
  declarations: [
    BasicTabs,
    ButtonE2E,
    DialogE2E,
    E2EApp,
    FullscreenE2E,
    GridListE2E,
    Home,
    IconE2E,
    InputE2E,
    MenuE2E,
    ProgressBarE2E,
    ProgressSpinnerE2E,
    SidenavE2E,
    SimpleCheckboxes,
    SimpleRadioButtons,
    SlideToggleE2E,
    TestDialog,
    TestDialogFullScreen,
    BlockScrollStrategyE2E
  ],
  bootstrap: [E2EApp],
  providers: [
    {provide: OverlayContainer, useClass: FullscreenOverlayContainer}
  ],
  entryComponents: [TestDialog, TestDialogFullScreen]
})
export class E2eAppModule { }
