import {bootstrap} from 'angular2/platform/browser';
import {DemoApp} from './demo-app/demo-app';
import {ROUTER_PROVIDERS} from 'angular2/router';

bootstrap(DemoApp, [
  ROUTER_PROVIDERS
]);
