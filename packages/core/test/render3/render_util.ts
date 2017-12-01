/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createWindow} from 'domino';

import {ComponentTemplate, ComponentType, PublicFeature, defineComponent, renderComponent as _renderComponent} from '../../src/render3/index';
import {NG_HOST_SYMBOL, createNode, createViewState, renderTemplate} from '../../src/render3/instructions';
import {LElement, LNodeFlags} from '../../src/render3/interfaces';
import {RElement, RText, Renderer3} from '../../src/render3/renderer';
import {global} from '../../src/util';

(global as any).ngDevMode = true;

export const document =
    typeof window == 'undefined' ? createWindow('', 'http://localhost').document : global.document;
if (typeof window == 'undefined') {
  (global as any).document = document;
}
export let containerEl: HTMLElement;
let ivHost: LElement;
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
  ivHost = createNode(null, LNodeFlags.Element,  containerEl, createViewState(-1, document));
}

export function renderToHtml(template: ComponentTemplate<any>, ctx: any) {
  renderTemplate(ivHost, template, ctx);
  return toHtml(ivHost.native);
}

beforeEach(resetDOM);

export function renderComponent<T>(type: ComponentType<T>): T {
  return _renderComponent(type, {renderer: document, host: containerEl});
}

export function toHtml<T>(componentOrElement: T | RElement): string {
  const ivNode = (componentOrElement as any)[NG_HOST_SYMBOL] as LElement;
  if (ivNode) {
    return toHtml(ivNode.native);
  } else {
    return containerEl.innerHTML.replace(' style=""', '').replace(/<!--[\w]*-->/g, '');
  }
}

export function createComponent(
    name: string, template: ComponentTemplate<any>): ComponentType<any> {
  return class Component {
    value: any;
    static ngComponentDef = defineComponent({
      type: Component,
      tag: name,
      factory: () => new Component,
      template: template,
      features: [PublicFeature]
    });
  };
}



// Verify that DOM is a type of render. This is here for error checking only and has no use.
export const renderer: Renderer3 = null as any as Document;
export const element: RElement = null as any as HTMLElement;
export const text: RText = null as any as Text;
