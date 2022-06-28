/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createLView, createTView, getOrCreateTComponentView, getOrCreateTNode, renderComponentOrTemplate} from '@angular/core/src/render3/instructions/shared';
import {TConstants, TNodeType} from '@angular/core/src/render3/interfaces/node';
import {RElement} from '@angular/core/src/render3/interfaces/renderer_dom';
import {enterView} from '@angular/core/src/render3/state';
import {EMPTY_ARRAY} from '@angular/core/src/util/empty';
import {noop} from '@angular/core/src/util/noop';
import {stringifyElement} from '@angular/platform-browser/testing/src/browser_util';

import {Type} from '../../src/interface/type';
import {getLContext, isComponentInstance} from '../../src/render3/context_discovery';
import {extractDirectiveDef, getPipeDef} from '../../src/render3/definition';
import {ComponentDef, ComponentTemplate, DirectiveDef, renderComponent as _renderComponent, RenderFlags, ɵɵdefineComponent} from '../../src/render3/index';
import {DirectiveDefList, DirectiveDefListOrFactory, DirectiveTypesOrFactory, PipeDef, PipeDefList, PipeDefListOrFactory, PipeTypesOrFactory} from '../../src/render3/interfaces/definition';
import {domRendererFactory3, enableRenderer3, RendererFactory3} from '../../src/render3/interfaces/renderer';
import {LView, LViewFlags, TVIEW, TViewType} from '../../src/render3/interfaces/view';
import {destroyLView} from '../../src/render3/node_manipulation';
import {Sanitizer} from '../../src/sanitization/sanitizer';

enableRenderer3();

export abstract class BaseFixture {
  /**
   * Each fixture creates the following initial DOM structure:
   * <div fixture="mark">
   *  <div host="mark"></div>
   * </div>
   *
   * Components are bootstrapped into the <div host="mark"></div>.
   * The <div fixture="mark"> is there for cases where the root component creates DOM node _outside_
   * of its host element (for example when the root component injectes ViewContainerRef or does
   * low-level DOM manipulation).
   *
   * The <div fixture="mark"> is _not_ attached to the document body.
   */
  containerElement: HTMLElement;
  hostElement: HTMLElement;

  constructor() {
    this.containerElement = document.createElement('div');
    this.containerElement.setAttribute('fixture', 'mark');
    this.hostElement = document.createElement('div');
    this.hostElement.setAttribute('host', 'mark');
    this.containerElement.appendChild(this.hostElement);
  }

  /**
   * Current state of HTML rendered by the bootstrapped component.
   */
  get html(): string {
    return toHtml(this.hostElement as any as Element);
  }

  /**
   * Current state of HTML rendered by the fixture (will include HTML rendered by the bootstrapped
   * component as well as any elements outside of the component's host).
   */
  get outerHtml(): string {
    return toHtml(this.containerElement as any as Element);
  }
}

/**
 * Fixture for testing template functions in a convenient way.
 *
 * This fixture allows:
 * - specifying the creation block and update block as two separate functions,
 * - maintaining the template state between invocations,
 * - access to the render `html`.
 */
export class TemplateFixture extends BaseFixture {
  hostView: LView;
  private _directiveDefs: DirectiveDefList|null;
  private _pipeDefs: PipeDefList|null;
  private _sanitizer: Sanitizer|null;
  private _rendererFactory: RendererFactory3;
  private _consts: TConstants;
  private _vars: number;
  private createBlock: () => void;
  private updateBlock: () => void;

  /**
   *
   * @param createBlock Instructions which go into the creation block:
   *          `if (rf & RenderFlags.Create) { __here__ }`.
   * @param updateBlock Optional instructions which go into the update block:
   *          `if (rf & RenderFlags.Update) { __here__ }`.
   */
  constructor({
    create = noop,
    update = noop,
    decls = 0,
    vars = 0,
    directives,
    pipes,
    sanitizer = null,
    rendererFactory = domRendererFactory3,
    consts = EMPTY_ARRAY
  }: {
    create?: (() => void),
    update?: (() => void),
    decls?: number,
    vars?: number,
    directives?: DirectiveTypesOrFactory,
    pipes?: PipeTypesOrFactory,
    sanitizer?: Sanitizer|null,
    rendererFactory?: RendererFactory3,
    consts?: TConstants
  }) {
    super();
    this._consts = consts;
    this._vars = vars;
    this.createBlock = create;
    this.updateBlock = update;
    this._directiveDefs = toDefs(directives, dir => extractDirectiveDef(dir)!);
    this._pipeDefs = toDefs(pipes, type => getPipeDef(type)!);
    this._sanitizer = sanitizer;
    this._rendererFactory = rendererFactory;
    this.hostView = renderTemplate(
        this.hostElement,
        (rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            this.createBlock();
          }
          if (rf & RenderFlags.Update) {
            this.updateBlock();
          }
        },
        decls, vars, null!, this._rendererFactory, null, this._directiveDefs, this._pipeDefs,
        sanitizer, this._consts);
  }

  /**
   * Update the existing template
   *
   * @param updateBlock Optional update block.
   */
  update(updateBlock?: () => void): void {
    renderTemplate(
        this.hostElement, updateBlock || this.updateBlock, 0, this._vars, null!,
        this._rendererFactory, this.hostView, this._directiveDefs, this._pipeDefs, this._sanitizer,
        this._consts);
  }

  destroy(): void {
    this.containerElement.removeChild(this.hostElement);
    destroyLView(this.hostView[TVIEW], this.hostView);
  }
}

const document = ((typeof global == 'object' && global || window) as any).document;

/**
 *
 * @param hostNode Existing node to render into.
 * @param templateFn Template function with the instructions.
 * @param decls The number of nodes, local refs, and pipes in this template
 * @param context to pass into the template.
 * @param providedRendererFactory renderer factory to use
 * @param host The host element node to use
 * @param directives Directive defs that should be used for matching
 * @param pipes Pipe defs that should be used for matching
 * @param consts Constants associated with the template.
 */
function renderTemplate<T>(
    hostNode: RElement, templateFn: ComponentTemplate<T>, decls: number, vars: number, context: T,
    providedRendererFactory: RendererFactory3, componentView: LView|null,
    directives?: DirectiveDefListOrFactory|null, pipes?: PipeDefListOrFactory|null,
    sanitizer?: Sanitizer|null, consts?: TConstants): LView {
  if (componentView === null) {
    const renderer = providedRendererFactory.createRenderer(null, null);

    // We need to create a root view so it's possible to look up the host element through its index
    const tView = createTView(TViewType.Root, null, null, 1, 0, null, null, null, null, null);
    const hostLView = createLView(
        null, tView, {}, LViewFlags.CheckAlways | LViewFlags.IsRoot, null, null,
        providedRendererFactory, renderer, null, null, null);
    enterView(hostLView);

    const def = ɵɵdefineComponent({
                  type: Object,
                  template: templateFn,
                  decls: decls,
                  vars: vars,
                  consts: consts,
                }) as ComponentDef<any>;
    def.directiveDefs = directives || null;
    def.pipeDefs = pipes || null;

    const componentTView = getOrCreateTComponentView(def);
    const hostTNode = getOrCreateTNode(tView, 0, TNodeType.Element, null, null);
    hostLView[hostTNode.index] = hostNode;
    componentView = createLView(
        hostLView, componentTView, context, LViewFlags.CheckAlways, hostNode, hostTNode,
        providedRendererFactory, renderer, sanitizer || null, null, null);
  }
  renderComponentOrTemplate(componentView[TVIEW], componentView, templateFn, context);
  return componentView;
}

function toDefs(
    types: DirectiveTypesOrFactory|undefined|null,
    mapFn: (type: Type<any>) => DirectiveDef<any>): DirectiveDefList|null;
function toDefs(types: PipeTypesOrFactory|undefined|null, mapFn: (type: Type<any>) => PipeDef<any>):
    PipeDefList|null;
function toDefs(
    types: Type<any>[]|(() => Type<any>[])|undefined|null,
    mapFn: (type: Type<any>) => PipeDef<any>| DirectiveDef<any>): any {
  if (!types) return null;
  if (typeof types == 'function') {
    types = types();
  }
  return types.map(mapFn);
}

function toHtml<T>(componentOrElement: T|RElement, keepNgReflect = false): string {
  let element: any;
  if (isComponentInstance(componentOrElement)) {
    const context = getLContext(componentOrElement);
    element = context ? context.native : null;
  } else {
    element = componentOrElement;
  }

  if (element) {
    let html = stringifyElement(element);

    if (!keepNgReflect) {
      html = html.replace(/\sng-reflect-\S*="[^"]*"/g, '')
                 .replace(/<!--bindings=\{(\W.*\W\s*)?\}-->/g, '');
    }

    html = html.replace(/^<div host="">(.*)<\/div>$/, '$1')
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
