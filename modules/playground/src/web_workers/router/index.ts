import {WORKER_RENDER_LOCATION_PROVIDERS} from '@angular/platform-browser';
import {bootstrapRender} from "@angular/platform-browser-dynamic";

export function main() {
  bootstrapRender("loader.js", WORKER_RENDER_LOCATION_PROVIDERS);
}
