import {HelloCmp} from "./index_common";
import {bootstrapWebworker} from "angular2/src/web-workers/worker/application";

export function main() {
  bootstrapWebworker(HelloCmp);
}
