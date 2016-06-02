import {bootstrap} from '@angular/platform-browser-dynamic';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {HTTP_PROVIDERS} from '@angular/http';
import {ROUTER_PROVIDERS} from '@angular/router';
import {provide} from '@angular/core';
import {Renderer} from '@angular/core';

import {OVERLAY_CONTAINER_TOKEN} from '@angular2-material/core/overlay/overlay';
import {MdLiveAnnouncer} from '@angular2-material/core/a11y/live-announcer';
import {createOverlayContainer} from '@angular2-material/core/overlay/overlay-container';
import {MdGestureConfig} from '@angular2-material/core/gestures/MdGestureConfig';
import {MdIconRegistry} from '@angular2-material/icon/icon-registry';

import {DemoApp} from './demo-app/demo-app';

bootstrap(DemoApp, [
  ROUTER_PROVIDERS,
  MdLiveAnnouncer,
  provide(OVERLAY_CONTAINER_TOKEN, {useValue: createOverlayContainer()}),
  HTTP_PROVIDERS,
  MdIconRegistry,
  Renderer,
  provide(HAMMER_GESTURE_CONFIG, {useClass: MdGestureConfig})
]);
