import {ROUTER_PROVIDERS} from '@angular/router-deprecated';
import {bootstrapApp} from '@angular/platform-browser-dynamic';

import {WORKER_APP_LOCATION_PROVIDERS} from '@angular/platform-browser';

import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {App} from './index_common';

export function main() {
  bootstrapApp(App, [
    ROUTER_PROVIDERS,
    WORKER_APP_LOCATION_PROVIDERS,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ]);
}
