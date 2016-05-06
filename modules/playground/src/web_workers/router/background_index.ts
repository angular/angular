import {Provider} from '@angular/core';
import {
  bootstrapApp,
  WORKER_APP_ROUTER
} from '../../../../@angular/platform-browser/src/worker_app';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {App} from './index_common';

export function main() {
  bootstrapApp(App,
               [WORKER_APP_ROUTER, {provide: LocationStrategy, useClass: HashLocationStrategy}]);
}
