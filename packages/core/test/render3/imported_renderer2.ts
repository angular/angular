/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵAnimationEngine, ɵNoopAnimationStyleNormalizer} from '@angular/animations/browser';
import {MockAnimationDriver} from '@angular/animations/browser/testing';
import {NgZone, RendererFactory2} from '@angular/core';
import {EventManager, ɵDomRendererFactory2, ɵDomSharedStylesHost} from '@angular/platform-browser';
import {ɵAnimationRendererFactory} from '@angular/platform-browser/animations';
import {EventManagerPlugin} from '@angular/platform-browser/src/dom/events/event_manager';

import {NoopNgZone} from '../../src/zone/ng_zone';

export class SimpleDomEventsPlugin extends EventManagerPlugin {
  constructor(doc: any) { super(doc); }

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
  const eventManager = new EventManager([new SimpleDomEventsPlugin(document)], fakeNgZone);
  return new ɵDomRendererFactory2(eventManager, new ɵDomSharedStylesHost(document));
}

export function getAnimationRendererFactory2(document: any): RendererFactory2 {
  const fakeNgZone: NgZone = new NoopNgZone();
  return new ɵAnimationRendererFactory(
      getRendererFactory2(document),
      new ɵAnimationEngine(new MockAnimationDriver(), new ɵNoopAnimationStyleNormalizer()),
      fakeNgZone);
}
