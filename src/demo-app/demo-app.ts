import {Component} from 'angular2/core';
import {CardDemo} from './card/card-demo';
import {ButtonDemo} from './button/button-demo';
import {SidenavDemo} from './sidenav/sidenav-demo';
import {ProgressCircleDemo} from './progress-circle/progress-circle-demo';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {Dir} from '../directives/dir/dir';
import {MdButton} from '../components/button/button';

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
  {path: '/', name: 'Home', component: Home, useAsDefault: true},
  {path: '/button',   name: 'ButtonDemo', component: ButtonDemo},
  {path: '/card', name: 'CardDemo', component: CardDemo},
  {path: '/sidenav', name: 'SidenavDemo', component: SidenavDemo},
  {path: '/progress-circle', name: 'ProgressCircleDemo', component: ProgressCircleDemo},
])
export class DemoApp { }
