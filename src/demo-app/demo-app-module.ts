import {NgModule, ApplicationRef} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import {DemoApp, Home} from './demo-app/demo-app';
import {DEMO_APP_ROUTE_PROVIDER} from './demo-app/routes';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '@angular2-material/all/all';
import {ProgressBarDemo} from './progress-bar/progress-bar-demo';
import {JazzDialog, DialogDemo} from './dialog/dialog-demo';
import {RippleDemo} from './ripple/ripple-demo';
import {IconDemo} from './icon/icon-demo';
import {GesturesDemo} from './gestures/gestures-demo';
import {InputDemo} from './input/input-demo';
import {CardDemo} from './card/card-demo';
import {RadioDemo} from './radio/radio-demo';
import {ButtonToggleDemo} from './button-toggle/button-toggle-demo';
import {ProgressCircleDemo} from './progress-circle/progress-circle-demo';
import {TooltipDemo} from './tooltip/tooltip-demo';
import {ListDemo} from './list/list-demo';
import {BaselineDemo} from './baseline/baseline-demo';
import {GridListDemo} from './grid-list/grid-list-demo';
import {LiveAnnouncerDemo} from './live-announcer/live-announcer-demo';
import {OverlayDemo, SpagettiPanel, RotiniPanel} from './overlay/overlay-demo';
import {SlideToggleDemo} from './slide-toggle/slide-toggle-demo';
import {ToolbarDemo} from './toolbar/toolbar-demo';
import {ButtonDemo} from './button/button-demo';
import {MdCheckboxDemoNestedChecklist, CheckboxDemo} from './checkbox/checkbox-demo';
import {SliderDemo} from './slider/slider-demo';
import {SidenavDemo} from './sidenav/sidenav-demo';
import {PortalDemo, ScienceJoke} from './portal/portal-demo';
import {MenuDemo} from './menu/menu-demo';
import {TabsDemo} from './tabs/tab-group-demo';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    RouterModule,
  ],
  providers: [
    DEMO_APP_ROUTE_PROVIDER,
  ],
  declarations: [
    BaselineDemo,
    ButtonDemo,
    ButtonToggleDemo,
    CardDemo,
    CheckboxDemo,
    DemoApp,
    DialogDemo,
    GesturesDemo,
    GridListDemo,
    Home,
    IconDemo,
    InputDemo,
    JazzDialog,
    ListDemo,
    LiveAnnouncerDemo,
    MdCheckboxDemoNestedChecklist,
    MenuDemo,
    OverlayDemo,
    PortalDemo,
    ProgressBarDemo,
    ProgressCircleDemo,
    RadioDemo,
    RippleDemo,
    RotiniPanel,
    ScienceJoke,
    SidenavDemo,
    SliderDemo,
    SlideToggleDemo,
    SpagettiPanel,
    TabsDemo,
    ToolbarDemo,
    TooltipDemo,
  ],
  entryComponents: [
    DemoApp,
    JazzDialog,
    RotiniPanel,
    ScienceJoke,
    SpagettiPanel,
  ],
})
export class DemoAppModule {
  constructor(private _appRef: ApplicationRef) { }

  ngDoBootstrap() {
    this._appRef.bootstrap(DemoApp);
  }
}
