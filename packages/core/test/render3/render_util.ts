/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {stringifyElement} from '@angular/platform-browser/testing/src/browser_util';

import {ComponentTemplate, ComponentType, DirectiveType, PublicFeature, defineComponent, defineDirective, renderComponent as _renderComponent} from '../../src/render3/index';
import {NG_HOST_SYMBOL, createLNode, createLView, renderTemplate} from '../../src/render3/instructions';
import {CreateComponentOptions} from '../../src/render3/component';
import {DirectiveDefArgs} from '../../src/render3/interfaces/definition';
import {LElementNode, LNodeFlags} from '../../src/render3/interfaces/node';
import {RElement, RText, Renderer3, RendererFactory3, domRendererFactory3} from '../../src/render3/interfaces/renderer';

import {getRendererFactory2} from './imported_renderer2';

function noop() {}
/**
 * Fixture for testing template functions in a convenient way.
 *
 * This fixture allows:
 * - specifying the creation block and update block as two separate functions,
 * - maintaining the template state between invocations,
 * - access to the render `html`.
 */
export class TemplateFixture {
  hostElement: HTMLElement;

  hostNode: LElementNode;

  /**
   *
   * @param createBlock Instructions which go into the creation block:
   *          `if (creationMode) { __here__ }`.
   * @param updateBlock Optional instructions which go after the creation block:
   *          `if (creationMode) { ... } __here__`.
   */
  constructor(private createBlock: () => void, private updateBlock: () => void = noop) {
    this.updateBlock = updateBlock || function() {};
    this.hostElement = document.createElement('div');
    this.hostNode = renderTemplate(this.hostElement, (ctx: any, cm: boolean) => {
      if (cm) {
        this.createBlock();
      }
      this.updateBlock();
    }, null !, domRendererFactory3, null);
  }

  /**
   * Update the existing template
   *
   * @param updateBlock Optional update block.
   */
  update(updateBlock?: () => void): void {
    renderTemplate(
        this.hostNode.native, updateBlock || this.updateBlock, null !, domRendererFactory3,
        this.hostNode);
  }

  /**
   * Current state of rendered HTML.
   */
  get html(): string {
    return (this.hostNode.native as any as Element).innerHTML.replace(/ style=""/g, '');
  }
}


export const document = ((global || window) as any).document;
export let containerEl: HTMLElement = null !;
let host: LElementNode|null;
const isRenderer2 =
    typeof process == 'object' && process.argv[3] && process.argv[3] === '--r=renderer2';
// tslint:disable-next-line:no-console
console.log(`Running tests with ${!isRenderer2 ? 'document' : 'Renderer2'} renderer...`);
const testRendererFactory: RendererFactory3 =
    isRenderer2 ? getRendererFactory2(document) : domRendererFactory3;

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
  if (containerEl) {
    try {
      document.body.removeChild(containerEl);
    } catch (e) {
    }
  }
  containerEl = document.createElement('div');
  containerEl.setAttribute('host', '');
  document.body.appendChild(containerEl);
  host = null;
  // TODO: assert that the global state is clean (e.g. ngData, previousOrParentNode, etc)
}

export function renderToHtml(
    template: ComponentTemplate<any>, ctx: any, providedRendererFactory?: RendererFactory3) {
  host = renderTemplate(
      containerEl, template, ctx, providedRendererFactory || testRendererFactory, host);
  return toHtml(containerEl);
}

beforeEach(resetDOM);

export function renderComponent<T>(type: ComponentType<T>, opts?: CreateComponentOptions): T {
  return _renderComponent(type, {
    rendererFactory: opts && opts.rendererFactory || testRendererFactory,
    host: containerEl,
    scheduler: requestAnimationFrame,
    features: opts && opts.features
  });
}

export function toHtml<T>(componentOrElement: T | RElement): string {
  const node = (componentOrElement as any)[NG_HOST_SYMBOL] as LElementNode;
  if (node) {
    return toHtml(node.native);
  } else {
    return stringifyElement(componentOrElement)
        .replace(/^<div host="">/, '')
        .replace(/<\/div>$/, '')
        .replace(' style=""', '')
        .replace(/<!--[\w]*-->/g, '');
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

export function createDirective({exportAs}: {exportAs?: string} = {}): DirectiveType<any> {
  return class Directive {
    static ngDirectiveDef = defineDirective({
      type: Directive,
      factory: () => new Directive(),
      features: [PublicFeature],
      exportAs: exportAs,
    });
  };
}


// Verify that DOM is a type of render. This is here for error checking only and has no use.
export const renderer: Renderer3 = null as any as Document;
export const element: RElement = null as any as HTMLElement;
export const text: RText = null as any as Text;
