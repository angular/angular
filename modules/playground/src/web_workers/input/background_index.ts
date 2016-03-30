import {InputCmp} from "./index_common";
import {platform} from "angular2/core";
import {WORKER_APP_PLATFORM, WORKER_APP_APPLICATION} from "angular2/platform/worker_app";

export function main() {
  platform([WORKER_APP_PLATFORM]).application([WORKER_APP_APPLICATION]).bootstrap(InputCmp);
}
