import {bootstrap} from '@angular/platform-browser-dynamic';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {HTTP_PROVIDERS} from '@angular/http';
import {disableDeprecatedForms, provideForms} from '@angular/forms';

import {OVERLAY_CONTAINER_TOKEN} from '@angular2-material/core/overlay/overlay';
import {MdLiveAnnouncer} from '@angular2-material/core/a11y/live-announcer';
import {createOverlayContainer} from '@angular2-material/core/overlay/overlay-container';
import {MdGestureConfig} from '@angular2-material/core/gestures/MdGestureConfig';
import {MdIconRegistry} from '@angular2-material/icon/icon-registry';

import {DemoApp} from './demo-app/demo-app';
import {DEMO_APP_ROUTE_PROVIDER} from './demo-app/routes';

bootstrap(DemoApp, [
  DEMO_APP_ROUTE_PROVIDER,
  disableDeprecatedForms(),
  provideForms(),
  MdLiveAnnouncer,
  {provide: OVERLAY_CONTAINER_TOKEN, useValue: createOverlayContainer()},
  HTTP_PROVIDERS,
  MdIconRegistry,
  {provide: HAMMER_GESTURE_CONFIG, useClass: MdGestureConfig},
]);
