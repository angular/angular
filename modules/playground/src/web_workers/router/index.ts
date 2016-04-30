import {Provider} from 'angular2/core';
import {bootstrapRender, WORKER_RENDER_ROUTER} from 'angular2/platform/worker_render';
import {MessageBasedPlatformLocation} from "angular2/src/web_workers/ui/platform_location";

let ref = bootstrapRender("loader.js", WORKER_RENDER_ROUTER);
