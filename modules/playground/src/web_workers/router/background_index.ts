import {Provider, NgZone} from "angular2/core";
import {bootstrapApp, WORKER_APP_ROUTER} from "angular2/platform/worker_app";
import {App} from "./index_common";
import {HashLocationStrategy, LocationStrategy} from "angular2/router";

export function main() {
  bootstrapApp(
      App, [WORKER_APP_ROUTER, new Provider(LocationStrategy, {useClass: HashLocationStrategy})]);
}
