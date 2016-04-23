import {Component} from 'angular2/core';
import {Route, RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {CardDemo} from './card/card-demo';
import {ButtonDemo} from './button/button-demo';
import {IconDemo} from './icon/icon-demo';
import {RadioDemo} from './radio/radio-demo';
import {SidenavDemo} from './sidenav/sidenav-demo';
import {ProgressBarDemo} from './progress-bar/progress-bar-demo';
import {ProgressCircleDemo} from './progress-circle/progress-circle-demo';
import {CheckboxDemo} from './checkbox/checkbox-demo';
import {Dir} from '../core/rtl/dir';
import {MdButton} from '../components/button/button';
import {MD_SIDENAV_DIRECTIVES} from '../components/sidenav/sidenav';
import {MD_LIST_DIRECTIVES} from '../components/list/list';
import {MdIcon} from '../components/icon/icon';
import {MdToolbar} from '../components/toolbar/toolbar';
import {PortalDemo} from './portal/portal-demo';
import {ToolbarDemo} from './toolbar/toolbar-demo';
import {OverlayDemo} from './overlay/overlay-demo';
import {ListDemo} from './list/list-demo';
import {InputDemo} from './input/input-demo';
import {LiveAnnouncerDemo} from './live-announcer/live-announcer-demo';
import {GesturesDemo} from './gestures/gestures-demo';
import {GridListDemo} from './grid-list/grid-list-demo';

@Component({
  selector: 'home',
  template: `
    <p>Welcome to the development demos for Angular Material 2!</p>
    <p>Open the sidenav to select a demo. </p>
  `
})
export class Home {}

@Component({
  selector: 'demo-app',
  providers: [],
  templateUrl: 'demo-app/demo-app.html',
  styleUrls: ['demo-app/demo-app.css'],
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
@RouteConfig([
  new Route({path: '/', name: 'Home', component: Home, useAsDefault: true}),
  new Route({path: '/button',   name: 'ButtonDemo', component: ButtonDemo}),
  new Route({path: '/card', name: 'CardDemo', component: CardDemo}),
  new Route({path: '/radio', name: 'RadioDemo', component: RadioDemo}),
  new Route({path: '/sidenav', name: 'SidenavDemo', component: SidenavDemo}),
  new Route({path: '/progress-circle', name: 'ProgressCircleDemo', component: ProgressCircleDemo}),
  new Route({path: '/progress-bar', name: 'ProgressBarDemo', component: ProgressBarDemo}),
  new Route({path: '/portal', name: 'PortalDemo', component: PortalDemo}),
  new Route({path: '/overlay', name: 'OverlayDemo', component: OverlayDemo}),
  new Route({path: '/checkbox', name: 'CheckboxDemo', component: CheckboxDemo}),
  new Route({path: '/input', name: 'InputDemo', component: InputDemo}),
  new Route({path: '/toolbar', name: 'ToolbarDemo', component: ToolbarDemo}),
  new Route({path: '/icon', name: 'IconDemo', component: IconDemo}),
  new Route({path: '/list', name: 'ListDemo', component: ListDemo}),
  new Route({path: '/live-announcer', name: 'LiveAnnouncerDemo', component: LiveAnnouncerDemo}),
  new Route({path: '/gestures', name: 'GesturesDemo', component: GesturesDemo}),
  new Route({path: '/grid-list', name: 'GridListDemo', component: GridListDemo}),
])
export class DemoApp { }
