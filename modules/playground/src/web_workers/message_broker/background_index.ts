import {bootstrapApp} from '../../../../@angular/platform-browser/src/worker_app';
import {App} from './index_common';

export function main() {
  bootstrapApp(App);
}
