/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RendererStyleFlags2, RendererType2} from '@angular/core';
import {ChangeDetectorRef} from '@angular/core/src/change_detection/change_detector_ref';
import {InjectFlags} from '@angular/core/src/di';
import {Provider} from '@angular/core/src/di/interface/provider';
import {ElementRef} from '@angular/core/src/linker/element_ref';
import {TemplateRef} from '@angular/core/src/linker/template_ref';
import {ViewContainerRef} from '@angular/core/src/linker/view_container_ref';
import {Renderer2} from '@angular/core/src/render/api';
import {createLView, createTView, getOrCreateTComponentView, getOrCreateTNode, renderComponentOrTemplate} from '@angular/core/src/render3/instructions/shared';
import {TConstants, TNodeType} from '@angular/core/src/render3/interfaces/node';
import {RComment, RElement, RNode, RText} from '@angular/core/src/render3/interfaces/renderer_dom';
import {enterView, getLView} from '@angular/core/src/render3/state';
import {EMPTY_ARRAY} from '@angular/core/src/util/empty';
import {noop} from '@angular/core/src/util/noop';
import {stringifyElement} from '@angular/platform-browser/testing/src/browser_util';

import {SWITCH_CHANGE_DETECTOR_REF_FACTORY__POST_R3__ as R3_CHANGE_DETECTOR_REF_FACTORY} from '../../src/change_detection/change_detector_ref';
import {Injector} from '../../src/di/injector';
import {Type} from '../../src/interface/type';
import {SWITCH_ELEMENT_REF_FACTORY__POST_R3__ as R3_ELEMENT_REF_FACTORY} from '../../src/linker/element_ref';
import {SWITCH_TEMPLATE_REF_FACTORY__POST_R3__ as R3_TEMPLATE_REF_FACTORY} from '../../src/linker/template_ref';
import {SWITCH_VIEW_CONTAINER_REF_FACTORY__POST_R3__ as R3_VIEW_CONTAINER_REF_FACTORY} from '../../src/linker/view_container_ref';
import {SWITCH_RENDERER2_FACTORY__POST_R3__ as R3_RENDERER2_FACTORY} from '../../src/render/api';
import {CreateComponentOptions} from '../../src/render3/component';
import {getDirectivesAtNodeIndex, getLContext, isComponentInstance} from '../../src/render3/context_discovery';
import {extractDirectiveDef, extractPipeDef} from '../../src/render3/definition';
import {NG_ELEMENT_ID} from '../../src/render3/fields';
import {ComponentDef, ComponentTemplate, ComponentType, DirectiveDef, DirectiveType, renderComponent as _renderComponent, RenderFlags, tick, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵProvidersFeature} from '../../src/render3/index';
import {DirectiveDefList, DirectiveDefListOrFactory, DirectiveTypesOrFactory, HostBindingsFunction, PipeDef, PipeDefList, PipeDefListOrFactory, PipeTypesOrFactory} from '../../src/render3/interfaces/definition';
import {PlayerHandler} from '../../src/render3/interfaces/player';
import {domRendererFactory3, ProceduralRenderer3, Renderer3, RendererFactory3, RendererStyleFlags3} from '../../src/render3/interfaces/renderer';
import {LView, LViewFlags, TVIEW, TViewType} from '../../src/render3/interfaces/view';
import {destroyLView} from '../../src/render3/node_manipulation';
import {getRootView} from '../../src/render3/util/view_traversal_utils';
import {Sanitizer} from '../../src/sanitization/sanitizer';

import {getRendererFactory2} from './imported_renderer2';



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
    this._directiveDefs = toDefs(directives, extractDirectiveDef);
    this._pipeDefs = toDefs(pipes, extractPipeDef);
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


/**
 * Fixture for testing Components in a convenient way.
 */
export class ComponentFixture<T> extends BaseFixture {
  component: T;
  requestAnimationFrame: {(fn: () => void): void; flush(): void; queue: (() => void)[];};

  constructor(private componentType: ComponentType<T>, opts: {
    injector?: Injector,
    sanitizer?: Sanitizer,
    rendererFactory?: RendererFactory3,
    playerHandler?: PlayerHandler
  } = {}) {
    super();
    this.requestAnimationFrame = function(fn: () => void) {
      requestAnimationFrame.queue.push(fn);
    } as any;
    this.requestAnimationFrame.queue = [];
    this.requestAnimationFrame.flush = function() {
      while (requestAnimationFrame.queue.length) {
        requestAnimationFrame.queue.shift()!();
      }
    };

    this.component = _renderComponent(componentType, {
      host: this.hostElement,
      scheduler: this.requestAnimationFrame,
      injector: opts.injector,
      sanitizer: opts.sanitizer,
      rendererFactory: opts.rendererFactory || domRendererFactory3,
      playerHandler: opts.playerHandler
    });
  }

  update(): void {
    tick(this.component);
    this.requestAnimationFrame.flush();
  }

  destroy(): void {
    // Skip removing the DOM element if it has already been removed (the view has already
    // been destroyed).
    if (this.hostElement.parentNode === this.containerElement) {
      this.containerElement.removeChild(this.hostElement);
    }

    const rootLView = getRootView(this.component);
    destroyLView(rootLView[TVIEW], rootLView);
  }
}

///////////////////////////////////////////////////////////////////////////////////
// The methods below use global state and we should stop using them.
// Fixtures above are preferred way of testing Components and Templates
///////////////////////////////////////////////////////////////////////////////////

export const document = ((typeof global == 'object' && global || window) as any).document;
export let containerEl: HTMLElement = null!;
let hostView: LView|null;
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
    requestAnimationFrame.queue.shift()!();
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
  hostView = null;
  // TODO: assert that the global state is clean (e.g. ngData, currentTNode, etc)
}


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
export function renderTemplate<T>(
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
        providedRendererFactory, renderer, null, null);
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
        providedRendererFactory, renderer, sanitizer || null, null);
  }
  renderComponentOrTemplate(componentView[TVIEW], componentView, templateFn, context);
  return componentView;
}


/**
 * @deprecated use `TemplateFixture` or `ComponentFixture`
 */
export function renderToHtml(
    template: ComponentTemplate<any>, ctx: any, decls: number = 0, vars: number = 0,
    directives?: DirectiveTypesOrFactory|null, pipes?: PipeTypesOrFactory|null,
    providedRendererFactory?: RendererFactory3|null, keepNgReflect = false, consts?: TConstants) {
  hostView = renderTemplate(
      containerEl, template, decls, vars, ctx, providedRendererFactory || testRendererFactory,
      hostView, toDefs(directives, extractDirectiveDef), toDefs(pipes, extractPipeDef), null,
      consts);
  return toHtml(containerEl, keepNgReflect);
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

beforeEach(resetDOM);

// This is necessary so we can switch between the Render2 version and the Ivy version
// of special objects like ElementRef and TemplateRef.
beforeEach(enableIvyInjectableFactories);

/**
 * @deprecated use `TemplateFixture` or `ComponentFixture`
 */
export function renderComponent<T>(type: ComponentType<T>, opts?: CreateComponentOptions): T {
  return _renderComponent(type, {
    rendererFactory: opts && opts.rendererFactory || testRendererFactory,
    host: containerEl,
    scheduler: requestAnimationFrame,
    sanitizer: opts ? opts.sanitizer : undefined,
    hostFeatures: opts && opts.hostFeatures
  });
}

/**
 * @deprecated use `TemplateFixture` or `ComponentFixture`
 */
export function toHtml<T>(componentOrElement: T|RElement, keepNgReflect = false): string {
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

export function createComponent(
    name: string, template: ComponentTemplate<any>, decls: number = 0, vars: number = 0,
    directives: DirectiveTypesOrFactory = [], pipes: PipeTypesOrFactory = [],
    viewQuery: ComponentTemplate<any>|null = null, providers: Provider[] = [],
    viewProviders: Provider[] = [], hostBindings?: HostBindingsFunction<any>,
    consts: TConstants = []): ComponentType<any> {
  return class Component {
    value: any;
    static ɵfac = () => new Component;
    static ɵcmp = ɵɵdefineComponent({
      type: Component,
      selectors: [[name]],
      decls: decls,
      vars: vars,
      template: template,
      viewQuery: viewQuery,
      directives: directives,
      hostBindings,
      pipes: pipes,
      features: (providers.length > 0 || viewProviders.length > 0)?
      [ɵɵProvidersFeature(providers || [], viewProviders || [])]: [],
      consts: consts,
    });
  };
}

export function createDirective(
    name: string, {exportAs}: {exportAs?: string[]} = {}): DirectiveType<any> {
  return class Directive {
    static ɵfac = () => new Directive();
    static ɵdir = ɵɵdefineDirective({
      type: Directive,
      selectors: [['', name, '']],
      exportAs: exportAs,
    });
  };
}

/** Gets the directive on the given node at the given index */
export function getDirectiveOnNode(nodeIndex: number, dirIndex: number = 0) {
  const directives = getDirectivesAtNodeIndex(nodeIndex, getLView(), true);
  if (directives == null) {
    throw new Error(`No directives exist on node in slot ${nodeIndex}`);
  }
  return directives[dirIndex];
}


// Verify that DOM is a type of render. This is here for error checking only and has no use.
export const renderer: Renderer3 = null as any as Document;
export const element: RElement = null as any as HTMLElement;
export const text: RText = null as any as Text;


/**
 *  Switches between Render2 version of special objects like ElementRef and the Ivy version
 *  of these objects. It's necessary to keep them separate so that we don't pull in fns
 *  like injectElementRef() prematurely.
 */
export function enableIvyInjectableFactories() {
  (ElementRef as any)[NG_ELEMENT_ID] = () => R3_ELEMENT_REF_FACTORY();
  (TemplateRef as any)[NG_ELEMENT_ID] = () => R3_TEMPLATE_REF_FACTORY();
  (ViewContainerRef as any)[NG_ELEMENT_ID] = () => R3_VIEW_CONTAINER_REF_FACTORY();
  (ChangeDetectorRef as any)[NG_ELEMENT_ID] = (flags: InjectFlags) =>
      R3_CHANGE_DETECTOR_REF_FACTORY(flags);
  (Renderer2 as any)[NG_ELEMENT_ID] = () => R3_RENDERER2_FACTORY();
}

export class MockRendererFactory implements RendererFactory3 {
  lastRenderer: any;
  private _spyOnMethods: string[];

  constructor(spyOnMethods?: string[]) {
    this._spyOnMethods = spyOnMethods || [];
  }

  createRenderer(hostElement: RElement|null, rendererType: RendererType2|null): Renderer3 {
    const renderer = this.lastRenderer = new MockRenderer(this._spyOnMethods);
    return renderer;
  }
}

class MockRenderer implements ProceduralRenderer3 {
  public spies: {[methodName: string]: any} = {};

  constructor(spyOnMethods: string[]) {
    spyOnMethods.forEach(methodName => {
      this.spies[methodName] = spyOn(this as any, methodName).and.callThrough();
    });
  }

  destroy(): void {}
  createComment(value: string): RComment {
    return document.createComment(value);
  }
  createElement(name: string, namespace?: string|null): RElement {
    return namespace ? document.createElementNS(namespace, name) : document.createElement(name);
  }
  createText(value: string): RText {
    return document.createTextNode(value);
  }
  appendChild(parent: RElement, newChild: RNode): void {
    parent.appendChild(newChild);
  }
  insertBefore(parent: RNode, newChild: RNode, refChild: RNode|null): void {
    parent.insertBefore(newChild, refChild, false);
  }
  removeChild(parent: RElement, oldChild: RNode): void {
    parent.removeChild(oldChild);
  }
  selectRootElement(selectorOrNode: string|any): RElement {
    return typeof selectorOrNode === 'string' ? document.querySelector(selectorOrNode) :
                                                selectorOrNode;
  }
  parentNode(node: RNode): RElement|null {
    return node.parentNode as RElement;
  }
  nextSibling(node: RNode): RNode|null {
    return node.nextSibling;
  }
  setAttribute(el: RElement, name: string, value: string, namespace?: string|null): void {
    // set all synthetic attributes as properties
    if (name[0] === '@') {
      this.setProperty(el, name, value);
    } else {
      el.setAttribute(name, value);
    }
  }
  removeAttribute(el: RElement, name: string, namespace?: string|null): void {}
  addClass(el: RElement, name: string): void {}
  removeClass(el: RElement, name: string): void {}
  setStyle(
      el: RElement, style: string, value: any,
      flags?: RendererStyleFlags2|RendererStyleFlags3): void {}
  removeStyle(el: RElement, style: string, flags?: RendererStyleFlags2|RendererStyleFlags3): void {}
  setProperty(el: RElement, name: string, value: any): void {
    (el as any)[name] = value;
  }
  setValue(node: RText, value: string): void {
    node.textContent = value;
  }

  // TODO(misko): Deprecate in favor of addEventListener/removeEventListener
  listen(target: RNode, eventName: string, callback: (event: any) => boolean | void): () => void {
    return () => {};
  }
}
