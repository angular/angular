/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵPLATFORM_BROWSER_ID as PLATFORM_BROWSER_ID,
  ɵPLATFORM_SERVER_ID as PLATFORM_SERVER_ID,
} from '@angular/common';
import {
  EventManager,
  EventManagerPlugin,
  ɵDomRendererFactory2,
  ɵSharedStylesHost,
} from '@angular/platform-browser';
import {isNode} from '@angular/private/testing';
import {type ListenerOptions, NgZone, RendererFactory2, RendererType2} from '../../src/core';
import {NoopNgZone} from '../../src/zone/ng_zone';

export class SimpleDomEventsPlugin extends EventManagerPlugin {
  constructor(doc: any) {
    super(doc);
  }

  override supports(eventName: string): boolean {
    return true;
  }

  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
    options?: ListenerOptions,
  ): Function {
    let callback: EventListener = handler as EventListener;
    element.addEventListener(eventName, callback, options);
    return () => this.removeEventListener(element, eventName, callback, options);
  }

  removeEventListener(
    target: any,
    eventName: string,
    callback: Function,
    options?: ListenerOptions,
  ): void {
    return target.removeEventListener.apply(target, [eventName, callback, false]);
  }
}

export function getRendererFactory2(document: any): RendererFactory2 {
  const fakeNgZone: NgZone = new NoopNgZone();
  const eventManager = new EventManager([new SimpleDomEventsPlugin(document)], fakeNgZone);
  const appId = 'appid';
  const rendererFactory = new ɵDomRendererFactory2(
    eventManager,
    new ɵSharedStylesHost(document, appId),
    appId,
    true,
    document,
    isNode ? PLATFORM_SERVER_ID : PLATFORM_BROWSER_ID,
    fakeNgZone,
  );
  const origCreateRenderer = rendererFactory.createRenderer;
  rendererFactory.createRenderer = function (element: any, type: RendererType2 | null) {
    const renderer = origCreateRenderer.call(this, element, type);
    renderer.destroyNode = () => {};
    return renderer;
  };
  return rendererFactory;
}
