import {XHR} from "@angular/compiler";
import {XHRImpl} from "./xhr/xhr_impl";
import {MessageBasedXHRImpl} from "./web_workers/ui/xhr_impl";
import {
  WORKER_RENDER_APPLICATION_PROVIDERS,
  WORKER_RENDER_STARTABLE_MESSAGING_SERVICE
} from '@angular/platform-browser';
import {
  ApplicationRef,
  PlatformRef,
  ReflectiveInjector,
} from '@angular/core';
import {workerRenderPlatform, WORKER_SCRIPT} from '@angular/platform-browser';
import {isPresent} from './facade/lang';
import {PromiseWrapper} from './facade/async';

export const WORKER_RENDER_DYNAMIC_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  WORKER_RENDER_APPLICATION_PROVIDERS,
  /* @ts2dart_Provider */ {provide: XHR, useClass: XHRImpl},
  MessageBasedXHRImpl,
  /* @ts2dart_Provider */ {provide: WORKER_RENDER_STARTABLE_MESSAGING_SERVICE, useExisting: MessageBasedXHRImpl, multi: true},
];

export function bootstrapRender(
    workerScriptUri: string,
    customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ApplicationRef> {
  var app = ReflectiveInjector.resolveAndCreate(
      [
        WORKER_RENDER_DYNAMIC_APPLICATION_PROVIDERS,
        /* @ts2dart_Provider */ {provide: WORKER_SCRIPT, useValue: workerScriptUri},
        isPresent(customProviders) ? customProviders : []
      ],
      workerRenderPlatform().injector);
  // Return a promise so that we keep the same semantics as Dart,
  // and we might want to wait for the app side to come up
  // in the future...
  return PromiseWrapper.resolve(app.get(ApplicationRef));
}
