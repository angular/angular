import {Component} from 'angular2/core';
import {Route, RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {CardDemo} from './card/card-demo';
import {ButtonDemo} from './button/button-demo';
import {RadioDemo} from './radio/radio-demo';
import {SidenavDemo} from './sidenav/sidenav-demo';
import {ProgressCircleDemo} from './progress-circle/progress-circle-demo';
import {CheckboxDemo} from './checkbox/checkbox-demo';
import {Dir} from '../core/rtl/dir';
import {MdButton} from '../components/button/button';
import {PortalDemo} from './portal/portal-demo';
import {ToolbarDemo} from './toolbar/toolbar-demo';
import {OverlayDemo} from './overlay/overlay-demo';
import {ListDemo} from './list/list-demo';
import {InputDemo} from './input/input-demo';
import {LiveAnnouncerDemo} from './live-announcer/live-announcer-demo';


@Component({
  selector: 'home',
  template: ''
})
export class Home {}

@Component({
  selector: 'demo-app',
  providers: [],
  templateUrl: 'demo-app/demo-app.html',
  styleUrls: ['demo-app/demo-app.css'],
  directives: [ROUTER_DIRECTIVES, Dir, MdButton],
  pipes: []
})
@RouteConfig([
  new Route({path: '/', name: 'Home', component: Home, useAsDefault: true}),
  new Route({path: '/button',   name: 'ButtonDemo', component: ButtonDemo}),
  new Route({path: '/card', name: 'CardDemo', component: CardDemo}),
  new Route({path: '/radio', name: 'RadioDemo', component: RadioDemo}),
  new Route({path: '/sidenav', name: 'SidenavDemo', component: SidenavDemo}),
  new Route({path: '/progress-circle', name: 'ProgressCircleDemo', component: ProgressCircleDemo}),
  new Route({path: '/portal', name: 'PortalDemo', component: PortalDemo}),
  new Route({path: '/overlay', name: 'OverlayDemo', component: OverlayDemo}),
  new Route({path: '/checkbox', name: 'CheckboxDemo', component: CheckboxDemo}),
  new Route({path: '/input', name: 'InputDemo', component: InputDemo}),
  new Route({path: '/toolbar', name: 'ToolbarDemo', component: ToolbarDemo}),
  new Route({path: '/list', name: 'ListDemo', component: ListDemo}),
  new Route({path: '/live-announcer', name: 'LiveAnnouncerDemo', component: LiveAnnouncerDemo})
])
export class DemoApp { }
