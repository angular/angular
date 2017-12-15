/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵAnimationEngine, ɵNoopAnimationStyleNormalizer} from '@angular/animations/browser';
import {MockAnimationDriver} from '@angular/animations/browser/testing';
import {EventEmitter, NgZone, RendererFactory2} from '@angular/core';
import {EventManager, ɵDomEventsPlugin, ɵDomRendererFactory2, ɵDomSharedStylesHost} from '@angular/platform-browser';
import {ɵAnimationRendererFactory} from '@angular/platform-browser/animations';


// Adapted renderer: it creates a Renderer2 instance and adapts it to Renderer3
// TODO: remove once this code is in angular/angular
export class NoopNgZone implements NgZone {
  readonly hasPendingMicrotasks: boolean = false;
  readonly hasPendingMacrotasks: boolean = false;
  readonly isStable: boolean = true;
  readonly onUnstable: EventEmitter<any> = new EventEmitter();
  readonly onMicrotaskEmpty: EventEmitter<any> = new EventEmitter();
  readonly onStable: EventEmitter<any> = new EventEmitter();
  readonly onError: EventEmitter<any> = new EventEmitter();

  run(fn: () => any): any { return fn(); }

  runGuarded(fn: () => any): any { return fn(); }

  runOutsideAngular(fn: () => any): any { return fn(); }

  runTask<T>(fn: () => any): T { return fn(); }
}

// TODO: remove once this code is in angular/angular
export class SimpleDomEventsPlugin extends ɵDomEventsPlugin {
  constructor(doc: any, ngZone: NgZone) { super(doc, ngZone); }

  supports(eventName: string): boolean { return true; }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    let callback: EventListener = handler as EventListener;
    element.addEventListener(eventName, callback, false);
    return () => this.removeEventListener(element, eventName, callback);
  }

  removeEventListener(target: any, eventName: string, callback: Function): void {
    return target.removeEventListener.apply(target, [eventName, callback, false]);
  }
}

export function getRendererFactory2(document: any): RendererFactory2 {
  const fakeNgZone: NgZone = new NoopNgZone();
  const eventManager =
      new EventManager([new SimpleDomEventsPlugin(document, fakeNgZone)], fakeNgZone);
  return new ɵDomRendererFactory2(eventManager, new ɵDomSharedStylesHost(document));
}

export function getAnimationRendererFactory2(document: any): RendererFactory2 {
  const fakeNgZone: NgZone = new NoopNgZone();
  return new ɵAnimationRendererFactory(
      getRendererFactory2(document),
      new ɵAnimationEngine(new MockAnimationDriver(), new ɵNoopAnimationStyleNormalizer()),
      fakeNgZone);
}
