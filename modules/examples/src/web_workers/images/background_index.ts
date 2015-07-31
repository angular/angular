import {bootstrapWebworker} from "angular2/src/web-workers/worker/application";
import {ImageDemo} from "./index_common";

export function main() {
  bootstrapWebworker(ImageDemo);
}
