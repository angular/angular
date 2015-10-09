import {HelloCmp} from "./index_common";
import {bootstrapWebWorker} from "angular2/src/web_workers/worker/application";

export function main() {
  bootstrapWebWorker(HelloCmp);
}
