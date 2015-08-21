import {bootstrapWebWorker} from "angular2/src/web_workers/worker/application";
import {ImageDemo} from "./index_common";

export function main() {
  bootstrapWebWorker(ImageDemo);
}
