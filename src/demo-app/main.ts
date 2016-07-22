import {bootstrap} from '@angular/platform-browser-dynamic';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {HTTP_PROVIDERS} from '@angular/http';
import {disableDeprecatedForms, provideForms} from '@angular/forms';
import {MdLiveAnnouncer} from '@angular2-material/core/a11y/live-announcer';
import {MdGestureConfig} from '@angular2-material/core/gestures/MdGestureConfig';
import {MdIconRegistry} from '@angular2-material/icon/icon-registry';
import {OverlayContainer} from '@angular2-material/core/overlay/overlay-container';
import {DemoApp} from './demo-app/demo-app';
import {DEMO_APP_ROUTE_PROVIDER} from './demo-app/routes';

bootstrap(DemoApp, [
  DEMO_APP_ROUTE_PROVIDER,
  disableDeprecatedForms(),
  provideForms(),
  MdLiveAnnouncer,
  HTTP_PROVIDERS,
  OverlayContainer,
  MdIconRegistry,
  {provide: HAMMER_GESTURE_CONFIG, useClass: MdGestureConfig},
]);
