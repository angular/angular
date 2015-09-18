import {bootstrapWebWorker} from "angular2/src/web_workers/worker/application";
import {TodoApp} from "./index_common";

export function main() {
  bootstrapWebWorker(TodoApp);
}
