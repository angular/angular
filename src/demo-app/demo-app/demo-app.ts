import {Component} from '@angular/core';
import {Route, Routes, ROUTER_DIRECTIVES} from '@angular/router';

import {Dir} from '@angular2-material/core/rtl/dir';
import {MdButton} from '@angular2-material/button/button';
import {MD_SIDENAV_DIRECTIVES} from '@angular2-material/sidenav/sidenav';
import {MD_LIST_DIRECTIVES} from '@angular2-material/list/list';
import {MdIcon} from '@angular2-material/icon/icon';
import {MdToolbar} from '@angular2-material/toolbar/toolbar';

import {CardDemo} from '../card/card-demo';
import {BaselineDemo} from '../baseline/baseline-demo';
import {ButtonDemo} from '../button/button-demo';
import {IconDemo} from '../icon/icon-demo';
import {RadioDemo} from '../radio/radio-demo';
import {SidenavDemo} from '../sidenav/sidenav-demo';
import {ProgressBarDemo} from '../progress-bar/progress-bar-demo';
import {ProgressCircleDemo} from '../progress-circle/progress-circle-demo';
import {CheckboxDemo} from '../checkbox/checkbox-demo';
import {PortalDemo} from '../portal/portal-demo';
import {ToolbarDemo} from '../toolbar/toolbar-demo';
import {OverlayDemo} from '../overlay/overlay-demo';
import {ListDemo} from '../list/list-demo';
import {InputDemo} from '../input/input-demo';
import {LiveAnnouncerDemo} from '../live-announcer/live-announcer-demo';
import {GesturesDemo} from '../gestures/gestures-demo';
import {GridListDemo} from '../grid-list/grid-list-demo';
import {TabsDemo} from '../tabs/tab-group-demo';
import {SlideToggleDemo} from '../slide-toggle/slide-toggle-demo';
import {ButtonToggleDemo} from '../button-toggle/button-toggle-demo';

@Component({
  selector: 'home',
  template: `
    <p>Welcome to the development demos for Angular Material 2!</p>
    <p>Open the sidenav to select a demo. </p>
  `
})
export class Home {}

@Component({
  moduleId: module.id,
  selector: 'demo-app',
  providers: [],
  templateUrl: 'demo-app.html',
  styleUrls: ['demo-app.css'],
  directives: [
    ROUTER_DIRECTIVES,
    Dir,
    MdButton,
    MdIcon,
    MD_SIDENAV_DIRECTIVES,
    MD_LIST_DIRECTIVES,
    MdToolbar,
  ],
  pipes: []
})
@Routes([
  new Route({path: '/', component: Home}),
  new Route({path: '/button', component: ButtonDemo}),
  new Route({path: '/card', component: CardDemo}),
  new Route({path: '/radio', component: RadioDemo}),
  new Route({path: '/sidenav', component: SidenavDemo}),
  new Route({path: '/slide-toggle', component: SlideToggleDemo}),
  new Route({path: '/progress-circle', component: ProgressCircleDemo}),
  new Route({path: '/progress-bar', component: ProgressBarDemo}),
  new Route({path: '/portal', component: PortalDemo}),
  new Route({path: '/overlay', component: OverlayDemo}),
  new Route({path: '/checkbox', component: CheckboxDemo}),
  new Route({path: '/input', component: InputDemo}),
  new Route({path: '/toolbar', component: ToolbarDemo}),
  new Route({path: '/icon', component: IconDemo}),
  new Route({path: '/list', component: ListDemo}),
  new Route({path: '/live-announcer', component: LiveAnnouncerDemo}),
  new Route({path: '/gestures', component: GesturesDemo}),
  new Route({path: '/grid-list', component: GridListDemo}),
  new Route({path: '/tabs', component: TabsDemo}),
  new Route({path: '/button-toggle', component: ButtonToggleDemo}),

  new Route({path: '/baseline', component: BaselineDemo})
])
export class DemoApp { }
