import {bootstrap} from 'angular2/platform/browser';
import {HAMMER_GESTURE_CONFIG} from 'angular2/src/platform/browser_common';
import {DemoApp} from './demo-app/demo-app';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {OVERLAY_CONTAINER_TOKEN} from './core/overlay/overlay';
import {MdLiveAnnouncer} from './core/live-announcer/live-announcer';
import {provide} from 'angular2/core';
import {createOverlayContainer} from './core/overlay/overlay-container';
import {MdGestureConfig} from './core/gestures/MdGestureConfig';

bootstrap(DemoApp, [
  ROUTER_PROVIDERS,
  MdLiveAnnouncer,
  provide(OVERLAY_CONTAINER_TOKEN, {useValue: createOverlayContainer()}),
  provide(HAMMER_GESTURE_CONFIG, {useClass: MdGestureConfig})
]);
