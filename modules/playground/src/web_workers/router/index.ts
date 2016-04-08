import {platform, Provider} from 'angular2/core';
import {
  WORKER_RENDER_APP,
  WORKER_RENDER_PLATFORM,
  WORKER_SCRIPT,
  WORKER_RENDER_ROUTER
} from 'angular2/platform/worker_render';
import {MessageBasedPlatformLocation} from "angular2/src/web_workers/ui/platform_location";

let ref = platform([WORKER_RENDER_PLATFORM])
              .application([
                WORKER_RENDER_APP,
                new Provider(WORKER_SCRIPT, {useValue: "loader.js"}),
                WORKER_RENDER_ROUTER
              ]);
