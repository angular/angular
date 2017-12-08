/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentTemplate, ComponentType, PublicFeature, defineComponent, renderComponent as _renderComponent} from '../../src/render3/index';
import {NG_HOST_SYMBOL, createLNode, createViewState, renderTemplate} from '../../src/render3/instructions';
import {LElement, LNodeFlags} from '../../src/render3/interfaces';
import {RElement, RText, Renderer3} from '../../src/render3/renderer';
import {getRenderer2} from './imported_renderer2';

export const document = ((global || window) as any).document;
export let containerEl: HTMLElement = null !;
let host: LElement;
let activeRenderer: Renderer3 =
    (typeof process !== 'undefined' && process.argv[3] && process.argv[3] === '--r=renderer2') ?
    getRenderer2(document) :
    document;
// tslint:disable-next-line:no-console
console.log(
    `Running tests with ${activeRenderer === document ? 'document' : 'Renderer2'} renderer...`);

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
  host = createLNode(null, LNodeFlags.Element, containerEl, createViewState(-1, activeRenderer));
  // TODO: assert that the global state is clean (e.g. ngData, previousOrParentNode, etc)
}

export function renderToHtml(template: ComponentTemplate<any>, ctx: any) {
  renderTemplate(host, template, ctx);
  return toHtml(host.native);
}

beforeEach(resetDOM);

export function renderComponent<T>(type: ComponentType<T>): T {
  return _renderComponent(type, {renderer: activeRenderer, host: containerEl});
}

export function toHtml<T>(componentOrElement: T | RElement): string {
  const node = (componentOrElement as any)[NG_HOST_SYMBOL] as LElement;
  if (node) {
    return toHtml(node.native);
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
