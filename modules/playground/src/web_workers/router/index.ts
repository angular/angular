import {bootstrapRender, WORKER_RENDER_ROUTER} from '@angular/platform-browser/worker_render';

bootstrapRender("loader.js", WORKER_RENDER_ROUTER);
