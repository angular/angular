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

import {getHostComponent, getInjector, getLocalRefs, loadContext} from './discovery_utils';
import {DirectiveDef} from './interfaces/definition';
import {TNode, TNodeFlags} from './interfaces/node';
import {TVIEW} from './interfaces/view';

/**
 * Adapts the DebugRendererFactory2 to create a DebugRenderer2 specific for IVY.
 *
 * The created DebugRenderer know how to create a Debug Context specific to IVY.
 */
export class Render3DebugRendererFactory2 extends DebugRendererFactory2 {
  createRenderer(element: any, renderData: RendererType2|null): Renderer2 {
    const renderer = super.createRenderer(element, renderData) as DebugRenderer2;
    renderer.debugContextFactory = (nativeElement: any) => new Render3DebugContext(nativeElement);
    return renderer;
  }
}

/**
 * Stores context information about view nodes.
 *
 * Used in tests to retrieve information those nodes.
 */
class Render3DebugContext implements DebugContext {
  constructor(private _nativeNode: any) {}

  get nodeIndex(): number|null { return loadContext(this._nativeNode).nodeIndex; }

  get view(): any { return loadContext(this._nativeNode).lViewData; }

  get injector(): Injector { return getInjector(this._nativeNode); }

  get component(): any { return getHostComponent(this._nativeNode); }

  get providerTokens(): any[] {
    const lDebugCtx = loadContext(this._nativeNode);
    const lViewData = lDebugCtx.lViewData;
    const tNode = lViewData[TVIEW].data[lDebugCtx.nodeIndex] as TNode;
    const directivesCount = tNode.flags & TNodeFlags.DirectiveCountMask;

    if (directivesCount > 0) {
      const directiveIdxStart = tNode.flags >> TNodeFlags.DirectiveStartingIndexShift;
      const directiveIdxEnd = directiveIdxStart + directivesCount;
      const viewDirectiveDefs = this.view[TVIEW].data;
      const directiveDefs =
          viewDirectiveDefs.slice(directiveIdxStart, directiveIdxEnd) as DirectiveDef<any>[];

      return directiveDefs.map(directiveDef => directiveDef.type);
    }

    return [];
  }

  get references(): {[key: string]: any} { return getLocalRefs(this._nativeNode); }

  // TODO(pk): check previous implementation and re-implement
  get context(): any { throw new Error('Not implemented in ivy'); }

  // TODO(pk): check previous implementation and re-implement
  get componentRenderElement(): any { throw new Error('Not implemented in ivy'); }

  // TODO(pk): check previous implementation and re-implement
  get renderNode(): any { throw new Error('Not implemented in ivy'); }

  // TODO(pk): check previous implementation and re-implement
  logError(console: Console, ...values: any[]): void { console.error(...values); }
}
