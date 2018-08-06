/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {Renderer2, RendererType2} from '../render/api';
import {DebugContext} from '../view';
import {DebugRenderer2, DebugRendererFactory2} from '../view/services';

import * as di from './di';
import {NG_HOST_SYMBOL, _getViewData} from './instructions';
import {LElementNode} from './interfaces/node';
import {CONTEXT, DIRECTIVES, LViewData, TVIEW} from './interfaces/view';

/**
 * Adapts the DebugRendererFactory2 to create a DebugRenderer2 specific for IVY.
 *
 * The created DebugRenderer know how to create a Debug Context specific to IVY.
 */
export class Render3DebugRendererFactory2 extends DebugRendererFactory2 {
  createRenderer(element: any, renderData: RendererType2|null): Renderer2 {
    const renderer = super.createRenderer(element, renderData) as DebugRenderer2;
    renderer.debugContextFactory = () => new Render3DebugContext(_getViewData());
    return renderer;
  }
}

/**
 * Stores context information about view nodes.
 *
 * Used in tests to retrieve information those nodes.
 */
class Render3DebugContext implements DebugContext {
  readonly nodeIndex: number|null;

  constructor(private viewData: LViewData) {
    // The LNode will be created next and appended to viewData
    this.nodeIndex = viewData ? viewData.length : null;
  }

  get view(): any { return this.viewData; }

  get injector(): Injector {
    if (this.nodeIndex !== null) {
      const lElementNode: LElementNode = this.view[this.nodeIndex];
      const nodeInjector = lElementNode.nodeInjector;

      if (nodeInjector) {
        return new di.NodeInjector(nodeInjector);
      }
    }
    return Injector.NULL;
  }

  get component(): any {
    // TODO(vicb): why/when
    if (this.nodeIndex === null) {
      return null;
    }

    const tView = this.view[TVIEW];
    const components: number[]|null = tView.components;

    return (components && components.indexOf(this.nodeIndex) == -1) ?
        null :
        this.view[this.nodeIndex].data[CONTEXT];
  }

  // TODO(vicb): add view providers when supported
  get providerTokens(): any[] {
    const matchedDirectives: any[] = [];

    // TODO(vicb): why/when
    if (this.nodeIndex === null) {
      return matchedDirectives;
    }

    const directives = this.view[DIRECTIVES];

    if (directives) {
      const currentNode = this.view[this.nodeIndex];
      for (let dirIndex = 0; dirIndex < directives.length; dirIndex++) {
        const directive = directives[dirIndex];
        if (directive[NG_HOST_SYMBOL] === currentNode) {
          matchedDirectives.push(directive.constructor);
        }
      }
    }
    return matchedDirectives;
  }

  get references(): {[key: string]: any} {
    // TODO(vicb): implement retrieving references
    throw new Error('Not implemented yet in ivy');
  }

  get context(): any {
    if (this.nodeIndex === null) {
      return null;
    }
    const lNode = this.view[this.nodeIndex];
    return lNode.view[CONTEXT];
  }

  get componentRenderElement(): any { throw new Error('Not implemented in ivy'); }

  get renderNode(): any { throw new Error('Not implemented in ivy'); }

  // TODO(vicb): check previous implementation
  logError(console: Console, ...values: any[]): void { console.error(...values); }
}