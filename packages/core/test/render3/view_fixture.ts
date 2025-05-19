/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Sanitizer, Type} from '../../src/core';
import {stringifyElement} from '@angular/private/testing';

import {extractDirectiveDef} from '../../src/render3/definition';
import {refreshView} from '../../src/render3/instructions/change_detection';
import {renderView} from '../../src/render3/instructions/render';
import {
  DirectiveDef,
  DirectiveDefList,
  DirectiveTypesOrFactory,
  PipeDef,
  PipeDefList,
  PipeTypesOrFactory,
  RenderFlags,
} from '../../src/render3/interfaces/definition';
import {TConstants, TElementNode, TNodeType} from '../../src/render3/interfaces/node';
import {
  HEADER_OFFSET,
  LView,
  LViewFlags,
  TView,
  TViewType,
} from '../../src/render3/interfaces/view';
import {enterView, leaveView, specOnlyIsInstructionStateEmpty} from '../../src/render3/state';
import {noop} from '../../src/util/noop';

import {getRendererFactory2} from './imported_renderer2';
import {createTNode} from '../../src/render3/tnode_manipulation';
import {createLView, createTView} from '../../src/render3/view/construction';

/**
 * Fixture useful for testing operations which need `LView` / `TView`
 */
export class ViewFixture {
  /**
   * Clean up the `LFrame` stack between tests.
   */
  static cleanUp() {
    while (!specOnlyIsInstructionStateEmpty()) {
      leaveView();
    }
  }

  private createFn?: () => void;

  private updateFn?: () => void;

  private context?: {};

  /**
   * DOM element which acts as a host to the `LView`.
   */
  host: HTMLElement;

  tView: TView;

  lView: LView;

  constructor({
    create,
    update,
    decls,
    vars,
    consts,
    context,
    directives,
    sanitizer,
  }: {
    create?: () => void;
    update?: () => void;
    decls?: number;
    vars?: number;
    consts?: TConstants;
    context?: {};
    directives?: any[];
    sanitizer?: Sanitizer;
  } = {}) {
    this.context = context;
    this.createFn = create;
    this.updateFn = update;

    const document = (((typeof global == 'object' && global) || window) as any).document;
    const rendererFactory = getRendererFactory2(document);

    const hostRenderer = rendererFactory.createRenderer(null, null);
    this.host = hostRenderer.createElement('host-element') as HTMLElement;
    const hostTView = createTView(
      TViewType.Root,
      null,
      null,
      1,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
    );
    const hostLView = createLView(
      null,
      hostTView,
      {},
      LViewFlags.CheckAlways | LViewFlags.IsRoot,
      null,
      null,
      {
        rendererFactory,
        sanitizer: sanitizer || null,
        changeDetectionScheduler: null,
      },
      hostRenderer,
      null,
      null,
      null,
    );

    let template = noop;
    if (create) {
      // If `create` function is provided - assemble a template function
      // based on it and pass to the `createTView` function to store in
      // `tView` for future use. The update function would be stored and
      // invoked separately.
      template = (rf: RenderFlags, ctx: {}) => {
        if (rf & RenderFlags.Create) {
          create();
        }
      };
    }

    this.tView = createTView(
      TViewType.Component,
      null,
      template,
      decls || 0,
      vars || 0,
      directives ? toDefs(directives, (dir) => extractDirectiveDef(dir)!) : null,
      null,
      null,
      null,
      consts || null,
      null,
    );
    const hostTNode = createTNode(
      hostTView,
      null,
      TNodeType.Element,
      0,
      'host-element',
      null,
    ) as TElementNode;
    // Store TNode at the first slot right after the header part
    hostTView.data[HEADER_OFFSET] = hostTNode;
    this.lView = createLView(
      hostLView,
      this.tView,
      context || {},
      LViewFlags.CheckAlways,
      this.host,
      hostTNode,
      null,
      hostRenderer,
      null,
      null,
      null,
    );

    if (this.createFn) {
      renderView(this.tView, this.lView, this.context);
    }
  }

  get html(): string {
    return toHtml(this.host.firstChild as Element);
  }

  /**
   * Invokes an update block function, which can either be provided during
   * the `ViewFixture` initialization or as an argument.
   *
   * @param updateFn An update block function to invoke.
   */
  update(updateFn?: () => void) {
    updateFn ||= this.updateFn;
    if (!updateFn) {
      throw new Error(
        'The `ViewFixture.update` was invoked, but there was no `update` function ' +
          'provided during the `ViewFixture` instantiation or specified as an argument ' +
          'in this call.',
      );
    }
    refreshView(this.tView, this.lView, updateFn, this.context);
  }

  /**
   * If you use `ViewFixture` and `enter()`, please add `afterEach(ViewFixture.cleanup);` to ensure
   * that he global `LFrame` stack gets cleaned up between the tests.
   */
  enterView() {
    enterView(this.lView);
  }

  leaveView() {
    leaveView();
  }

  apply(fn: () => void) {
    this.enterView();
    try {
      fn();
    } finally {
      this.leaveView();
    }
  }
}

function toDefs(
  types: DirectiveTypesOrFactory | undefined | null,
  mapFn: (type: Type<any>) => DirectiveDef<any>,
): DirectiveDefList | null;
function toDefs(
  types: PipeTypesOrFactory | undefined | null,
  mapFn: (type: Type<any>) => PipeDef<any>,
): PipeDefList | null;
function toDefs(
  types: Type<any>[] | (() => Type<any>[]) | undefined | null,
  mapFn: (type: Type<any>) => PipeDef<any> | DirectiveDef<any>,
): any {
  if (!types) return null;
  if (typeof types == 'function') {
    types = types();
  }
  return types.map(mapFn);
}

function toHtml(element: Element, keepNgReflect = false): string {
  if (element) {
    let html = stringifyElement(element);

    if (!keepNgReflect) {
      html = html
        .replace(/\sng-reflect-\S*="[^"]*"/g, '')
        .replace(/<!--bindings=\{(\W.*\W\s*)?\}-->/g, '');
    }

    html = html
      .replace(/^<div host="">(.*)<\/div>$/, '$1')
      .replace(/^<div fixture="mark">(.*)<\/div>$/, '$1')
      .replace(/^<div host="mark">(.*)<\/div>$/, '$1')
      .replace(' style=""', '')
      .replace(/<!--container-->/g, '')
      .replace(/<!--ng-container-->/g, '');
    return html;
  } else {
    return '';
  }
}
