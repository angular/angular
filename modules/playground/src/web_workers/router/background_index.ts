import {Provider} from "angular2/core";
import {bootstrapApp, WORKER_APP_ROUTER} from "angular2/platform/worker_app";
import {HashLocationStrategy, LocationStrategy} from 'angular2/platform/common';
import {App} from "./index_common";

export function main() {
  bootstrapApp(
      App, [WORKER_APP_ROUTER, new Provider(LocationStrategy, {useClass: HashLocationStrategy})]);
}
