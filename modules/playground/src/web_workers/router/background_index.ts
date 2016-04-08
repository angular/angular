import {platform, Provider, NgZone} from 'angular2/core';
import {WORKER_APP_PLATFORM, WORKER_APP_APPLICATION, WORKER_APP_ROUTER} from 'angular2/platform/worker_app';
import {App} from './index_common';
import {HashLocationStrategy, LocationStrategy} from 'angular2/router';

export function main() {
  let refPromise = platform([WORKER_APP_PLATFORM]).asyncApplication(null, [
    WORKER_APP_APPLICATION, WORKER_APP_ROUTER,
    new Provider(LocationStrategy, {useClass: HashLocationStrategy})
  ]);
  refPromise.then((ref) => ref.bootstrap(App));
}
