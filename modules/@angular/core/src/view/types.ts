/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {RenderComponentType, Renderer, RootRenderer} from '../render/api';
import {Sanitizer, SecurityContext} from '../security';

// -------------------------------------
// Defs
// -------------------------------------

export interface ViewDefinition {
  flags: ViewFlags;
  componentType: RenderComponentType;
  update: ViewUpdateFn;
  /**
   * Order: Depth first.
   * Especially providers are before elements / anchros.
   */
  nodes: NodeDef[];
  /** aggregated NodeFlags for all nodes **/
  nodeFlags: NodeFlags;
  /**
   * Order: parents before children, but children in reverse order.
   * Especially providers are after elements / anchros.
   */
  reverseChildNodes: NodeDef[];
  lastRootNode: number;
  bindingCount: number;
}

export type ViewUpdateFn = (updater: NodeUpdater, view: ViewData, component: any, context: any) =>
    void;

export interface NodeUpdater {
  checkInline(
      view: ViewData, nodeIndex: number, v0?: any, v1?: any, v2?: any, v3?: any, v4?: any, v5?: any,
      v6?: any, v7?: any, v8?: any, v9?: any): void;
  checkDynamic(view: ViewData, nodeIndex: number, values: any[]): void;
}

/**
 * Bitmask for ViewDefintion.flags.
 */
export enum ViewFlags {
  None = 0,
  LogBindingUpdate = 1 << 0,
  DirectDom = 1 << 1
}

export interface NodeDef {
  type: NodeType;
  index: number;
  reverseChildIndex: number;
  flags: NodeFlags;
  parent: number;
  /** number of transitive children */
  childCount: number;
  /** aggregated NodeFlags for all children **/
  childFlags: NodeFlags;
  bindingIndex: number;
  bindings: BindingDef[];
  element: ElementDef;
  providerIndices: {[tokenKey: string]: number};
  provider: ProviderDef;
  text: TextDef;
  // closure to allow recursive components
  component: () => ViewDefinition;
  template: ViewDefinition;
}

export enum NodeType {
  Element,
  Text,
  Anchor,
  Provider
}

/**
 * Bitmask for NodeDef.flags.
 */
export enum NodeFlags {
  None = 0,
  OnInit = 1 << 0,
  OnDestroy = 1 << 1,
  DoCheck = 1 << 2,
  OnChanges = 1 << 3,
  AfterContentInit = 1 << 4,
  AfterContentChecked = 1 << 5,
  AfterViewInit = 1 << 6,
  AfterViewChecked = 1 << 7,
  HasEmbeddedViews = 1 << 8,
  HasComponent = 1 << 9,
}

export interface ElementDef {
  name: string;
  attrs: {[name: string]: string};
}

/**
 * Bitmask for DI flags
 */
export enum DepFlags {
  None = 0,
  SkipSelf = 1 << 0
}

export interface DepDef {
  flags: DepFlags;
  token: any;
  tokenKey: string;
}

export interface ProviderDef {
  tokenKey: string;
  ctor: any;
  deps: DepDef[];
}

export interface TextDef { prefix: string; }

export enum BindingType {
  ElementAttribute,
  ElementClass,
  ElementStyle,
  ElementProperty,
  ProviderProperty,
  Interpolation
}

export interface BindingDef {
  type: BindingType;
  name: string;
  nonMinifiedName: string;
  securityContext: SecurityContext;
  suffix: string;
}

// -------------------------------------
// Data
// -------------------------------------

/**
 * View instance data.
 * Attention: Adding fields to this is performance sensitive!
 */
export interface ViewData {
  def: ViewDefinition;
  renderer: Renderer;
  services: Services;
  // index of parent element / anchor. Not the index
  // of the provider with the component view.
  parentIndex: number;
  parent: ViewData;
  component: any;
  context: any;
  nodes: NodeData[];
  firstChange: boolean;
  oldValues: any[];
}

/**
 * Node instance data.
 * Attention: Adding fields to this is performance sensitive!
 */
export interface NodeData {
  renderNode: any;
  provider: any;
  componentView: ViewData;
  embeddedViews: ViewData[];
}

export interface Services {
  renderComponent(rcp: RenderComponentType): Renderer;
  sanitize(context: SecurityContext, value: string): string;
  // Note: This needs to be here to prevent a cycle in source files.
  createViewContainerRef(data: NodeData): ViewContainerRef;
  // Note: This needs to be here to prevent a cycle in source files.
  createTemplateRef(parentView: ViewData, def: NodeDef): TemplateRef<any>;
}
