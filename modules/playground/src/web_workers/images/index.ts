import {platform, Provider} from 'angular2/core';
import {
  WORKER_RENDER_APP,
  WORKER_RENDER_PLATFORM,
  WORKER_SCRIPT
} from 'angular2/platform/worker_render';

platform([WORKER_RENDER_PLATFORM])
    .application([WORKER_RENDER_APP, new Provider(WORKER_SCRIPT, {useValue: "loader.js"})]);
