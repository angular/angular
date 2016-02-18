import {bootstrap} from 'angular2/platform/browser';
import {DemoApp} from './demo-app/demo-app';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HashLocationStrategy} from 'angular2/router';
import {LocationStrategy} from 'angular2/router';
import {provide} from 'angular2/core';

bootstrap(DemoApp, [
  ROUTER_PROVIDERS
]);
