/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '@angular/core/src/change_detection/change_detector_ref';
import {ElementRef} from '@angular/core/src/linker/element_ref';
import {TemplateRef} from '@angular/core/src/linker/template_ref';
import {ViewContainerRef} from '@angular/core/src/linker/view_container_ref';
import {stringifyElement} from '@angular/platform-browser/testing/src/browser_util';

import {Injector} from '../../src/di/injector';
import {R3_CHANGE_DETECTOR_REF_FACTORY, R3_ELEMENT_REF_FACTORY, R3_TEMPLATE_REF_FACTORY, R3_VIEW_CONTAINER_REF_FACTORY} from '../../src/ivy_switch/runtime/ivy_switch_on';
import {CreateComponentOptions} from '../../src/render3/component';
import {discoverDirectives, getContext, isComponentInstance} from '../../src/render3/context_discovery';
import {extractDirectiveDef, extractPipeDef} from '../../src/render3/definition';
import {NG_ELEMENT_ID} from '../../src/render3/fields';
import {ComponentTemplate, ComponentType, DirectiveDef, DirectiveType, PublicFeature, RenderFlags, defineComponent, defineDirective, renderComponent as _renderComponent, tick} from '../../src/render3/index';
import {_getViewData, renderTemplate} from '../../src/render3/instructions';
import {DirectiveDefList, DirectiveTypesOrFactory, PipeDef, PipeDefList, PipeTypesOrFactory} from '../../src/render3/interfaces/definition';
import {LElementNode} from '../../src/render3/interfaces/node';
import {PlayerHandler} from '../../src/render3/interfaces/player';
import {RElement, RText, Renderer3, RendererFactory3, domRendererFactory3} from '../../src/render3/interfaces/renderer';
import {HEADER_OFFSET} from '../../src/render3/interfaces/view';
import {Sanitizer} from '../../src/sanitization/security';
import {Type} from '../../src/type';

import {getRendererFactory2} from './imported_renderer2';

export abstract class BaseFixture {
  hostElement: HTMLElement;

  constructor() {
    this.hostElement = document.createElement('div');
    this.hostElement.setAttribute('fixture', 'mark');
  }

  /**
   * Current state of rendered HTML.
   */
  get html(): string { return toHtml(this.hostElement as any as Element); }
}

function noop() {}
/**
 * Fixture for testing template functions in a convenient way.
 *
 * This fixture allows:
 * - specifying the creation block and update block as two separate functions,
 * - maintaining the template state between invocations,
 * - access to the render `html`.
 */
export class TemplateFixture extends BaseFixture {
  hostNode: LElementNode;
  private _directiveDefs: DirectiveDefList|null;
  private _pipeDefs: PipeDefList|null;
  private _sanitizer: Sanitizer|null;
  private _rendererFactory: RendererFactory3;

  /**
   *
   * @param createBlock Instructions which go into the creation block:
   *          `if (rf & RenderFlags.Create) { __here__ }`.
   * @param updateBlock Optional instructions which go into the update block:
   *          `if (rf & RenderFlags.Update) { __here__ }`.
   */
  constructor(
      private createBlock: () => void, private updateBlock: () => void = noop, consts: number = 0,
      private vars: number = 0, directives?: DirectiveTypesOrFactory|null,
      pipes?: PipeTypesOrFactory|null, sanitizer?: Sanitizer|null,
      rendererFactory?: RendererFactory3) {
    super();
    this._directiveDefs = toDefs(directives, extractDirectiveDef);
    this._pipeDefs = toDefs(pipes, extractPipeDef);
    this._sanitizer = sanitizer || null;
    this._rendererFactory = rendererFactory || domRendererFactory3;
    this.hostNode = renderTemplate(
        this.hostElement,
        (rf: RenderFlags, ctx: any) => {
          if (rf & RenderFlags.Create) {
            this.createBlock();
          }
          if (rf & RenderFlags.Update) {
            this.updateBlock();
          }
        },
        consts, vars, null !, this._rendererFactory, null, this._directiveDefs, this._pipeDefs,
        sanitizer);
  }

  /**
   * Update the existing template
   *
   * @param updateBlock Optional update block.
   */
  update(updateBlock?: () => void): void {
    renderTemplate(
        this.hostNode.native, updateBlock || this.updateBlock, 0, this.vars, null !,
        this._rendererFactory, this.hostNode, this._directiveDefs, this._pipeDefs, this._sanitizer);
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
        requestAnimationFrame.queue.shift() !();
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
}

///////////////////////////////////////////////////////////////////////////////////
// The methods below use global state and we should stop using them.
// Fixtures above are preferred way of testing Components and Templates
///////////////////////////////////////////////////////////////////////////////////

export const document = ((typeof global == 'object' && global || window) as any).document;
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

/**
 * @deprecated use `TemplateFixture` or `ComponentFixture`
 */
export function renderToHtml(
    template: ComponentTemplate<any>, ctx: any, consts: number = 0, vars: number = 0,
    directives?: DirectiveTypesOrFactory | null, pipes?: PipeTypesOrFactory | null,
    providedRendererFactory?: RendererFactory3 | null) {
  host = renderTemplate(
      containerEl, template, consts, vars, ctx, providedRendererFactory || testRendererFactory,
      host, toDefs(directives, extractDirectiveDef), toDefs(pipes, extractPipeDef));
  return toHtml(containerEl);
}

function toDefs(
    types: DirectiveTypesOrFactory | undefined | null,
    mapFn: (type: Type<any>) => DirectiveDef<any>): DirectiveDefList|null;
function toDefs(
    types: PipeTypesOrFactory | undefined | null,
    mapFn: (type: Type<any>) => PipeDef<any>): PipeDefList|null;
function toDefs(
    types: PipeTypesOrFactory | DirectiveTypesOrFactory | undefined | null,
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
export function toHtml<T>(componentOrElement: T | RElement): string {
  let element: any;
  if (isComponentInstance(componentOrElement)) {
    const context = getContext(componentOrElement);
    element = context ? context.native : null;
  } else {
    element = componentOrElement;
  }

  if (element) {
    return stringifyElement(element)
        .replace(/^<div host="">/, '')
        .replace(/^<div fixture="mark">/, '')
        .replace(/<\/div>$/, '')
        .replace(' style=""', '')
        .replace(/<!--container-->/g, '')
        .replace(/<!--ng-container-->/g, '');
  } else {
    return '';
  }
}

export function createComponent(
    name: string, template: ComponentTemplate<any>, consts: number = 0, vars: number = 0,
    directives: DirectiveTypesOrFactory = [], pipes: PipeTypesOrFactory = [],
    viewQuery: ComponentTemplate<any>| null = null): ComponentType<any> {
  return class Component {
    value: any;
    static ngComponentDef = defineComponent({
      type: Component,
      selectors: [[name]],
      consts: consts,
      vars: vars,
      factory: () => new Component,
      template: template,
      viewQuery: viewQuery,
      features: [PublicFeature],
      directives: directives,
      pipes: pipes
    });
  };
}

export function createDirective(
    name: string, {exportAs}: {exportAs?: string} = {}): DirectiveType<any> {
  return class Directive {
    static ngDirectiveDef = defineDirective({
      type: Directive,
      selectors: [['', name, '']],
      factory: () => new Directive(),
      features: [PublicFeature],
      exportAs: exportAs,
    });
  };
}

/** Gets the directive on the given node at the given index */
export function getDirectiveOnNode(nodeIndex: number, dirIndex: number = 0) {
  const directives = discoverDirectives(nodeIndex + HEADER_OFFSET, _getViewData(), true);
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
  (ElementRef as any)[NG_ELEMENT_ID] = () => R3_ELEMENT_REF_FACTORY(ElementRef);
  (TemplateRef as any)[NG_ELEMENT_ID] = () => R3_TEMPLATE_REF_FACTORY(TemplateRef, ElementRef);
  (ViewContainerRef as any)[NG_ELEMENT_ID] = () =>
      R3_VIEW_CONTAINER_REF_FACTORY(ViewContainerRef, ElementRef);
  (ChangeDetectorRef as any)[NG_ELEMENT_ID] = () => R3_CHANGE_DETECTOR_REF_FACTORY();
}
