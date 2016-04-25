import {TodoApp} from './index_common';
import {bootstrapApp} from '@angular/platform-browser/worker_app';

export function main() {
  bootstrapApp(TodoApp);
}
