import {bootstrapRender} from '@angular/platform-browser-dynamic';

import {WORKER_RENDER_LOCATION_PROVIDERS} from '@angular/platform-browser';

export function main() {
  bootstrapRender("loader.js", WORKER_RENDER_LOCATION_PROVIDERS);
}
