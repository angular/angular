/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createWindow} from 'domino';
import {install as installSourceMapSupport} from 'source-map-support';

import {ComponentTemplate, ComponentType, PublicFeature, defineComponent, renderComponent as _renderComponent} from '../../src/render3';
import {NG_HOST_SYMBOL, createNode, createViewState, renderTemplate} from '../../src/render3/instructions';
import {LElement, LNodeFlags} from '../../src/render3/interfaces';
import {RElement, RText, Renderer3} from '../../src/render3/renderer';

import {getRenderer2} from './imported_renderer2';

installSourceMapSupport();
(global as any).ngDevMode = true;

const window = createWindow('', 'http://localhost');
export const document = window.document;
(global as any).document = document;
// Trick to avoid Event patching from
// https://github.com/angular/angular/blob/7cf5e95ac9f0f2648beebf0d5bd9056b79946970/packages/platform-browser/src/dom/events/dom_events.ts#L112-L132
// It fails with Domino with TypeError: Cannot assign to read only property
// 'stopImmediatePropagation' of object '#<Event>'
(global as any).Event = null;
export let containerEl: HTMLElement;
let ivHost: LElement;
let activeRenderer: Renderer3 =
    process.argv[3] && process.argv[3] === '--r=renderer2' ? getRenderer2(document) : document;
console.log(
    `Running tests with ${activeRenderer === document ? 'document' : 'Renderer2'} renderer...`)

    export const requestAnimationFrame:
        {(fn: () => void): void; flush(): void; queue: (() => void)[];} = function(fn: () => void) {
  requestAnimationFrame.queue.push(fn);
} as any;
requestAnimationFrame.flush = function() {
  while (requestAnimationFrame.queue.length) {
    requestAnimationFrame.queue.shift() !();
  }
};

export function resetDOM() {
  requestAnimationFrame.queue = [];
  containerEl = document.createElement('div');
  containerEl.setAttribute('host', '');
  ivHost = createNode(null, LNodeFlags.Element, containerEl, createViewState(-1, activeRenderer));
  // TODO: assert that the global state is clean (e.g. ngData, previousOrParentNode, etc)
}

export function renderToHtml(template: ComponentTemplate<any>, ctx: any) {
  renderTemplate(ivHost, template, ctx);
  return toHtml(ivHost.native);
}

beforeEach(resetDOM);

export function renderComponent<T>(type: ComponentType<T>): T {
  return _renderComponent(type, {renderer: activeRenderer, host: containerEl});
}

export function toHtml<T>(componentOrElement: T | RElement): string {
  const ivNode = (componentOrElement as any)[NG_HOST_SYMBOL] as LElement;
  if (ivNode) {
    return toHtml(ivNode.native);
  } else {
    return containerEl.innerHTML.replace(' style=""', '').replace(/<!--[\w]*-->/g, '');
  }
}

export function createComponent(name: string, template: ComponentTemplate<any>) {
  return class Component {
    value: any;
    static ngComponentDef = defineComponent({
      type: Component,
      tag: name,
      factory: () => new Component,
      template: template,
      features: [PublicFeature]
    });
  }
}



// Verify that DOM is a type of render. This is here for error checking only and has no use.
export const renderer: Renderer3 = null as any as Document;
export const element: RElement = null as any as HTMLElement;
export const text: RText = null as any as Text;
