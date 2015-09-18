import {bootstrapWebWorker} from "angular2/web_worker/worker";
import {App} from "./index_common";

export function main() {
  bootstrapWebWorker(App);
}
