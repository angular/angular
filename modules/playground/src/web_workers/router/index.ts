import {
  bootstrapRender,
  WORKER_RENDER_ROUTER
} from '../../../../@angular/platform-browser/src/worker_render';

bootstrapRender("loader.js", WORKER_RENDER_ROUTER);
