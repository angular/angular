/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeTransform} from '../change_detection/change_detection';
import {QueryList} from '../linker/query_list';
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
  handleEvent: ViewHandleEventFn;
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
  disposableCount: number;
  /**
   * ids of all queries that are matched by one of the nodes.
   * This includes query ids from templates as well.
   */
  nodeMatchedQueries: {[queryId: string]: boolean};
}

export type ViewUpdateFn = (updater: NodeUpdater, view: ViewData) => void;

export interface NodeUpdater {
  checkInline(
      view: ViewData, nodeIndex: number, v0?: any, v1?: any, v2?: any, v3?: any, v4?: any, v5?: any,
      v6?: any, v7?: any, v8?: any, v9?: any): any;
  checkDynamic(view: ViewData, nodeIndex: number, values: any[]): any;
}

export type ViewHandleEventFn =
    (view: ViewData, nodeIndex: number, eventName: string, event: any) => boolean;

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

  providerIndices: {[tokenKey: string]: number};
  bindingIndex: number;
  bindings: BindingDef[];
  disposableIndex: number;
  disposableCount: number;
  /**
   * ids and value types of all queries that are matched by this node.
   */
  matchedQueries: {[queryId: string]: QueryValueType};
  /**
   * ids of all queries that are matched by one of the child nodes.
   * This includes query ids from templates as well.
   */
  childMatchedQueries: {[queryId: string]: boolean};
  element: ElementDef;
  provider: ProviderDef;
  text: TextDef;
  pureExpression: PureExpressionDef;
}

export enum NodeType {
  Element,
  Text,
  Provider,
  PureExpression,
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
  HasContentQuery = 1 << 10,
  HasViewQuery = 1 << 11,
}

export interface ElementDef {
  name: string;
  attrs: {[name: string]: string};
  outputs: ElementOutputDef[];
  template: ViewDefinition;
}

export interface ElementOutputDef {
  target: string;
  eventName: string;
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

export interface ProviderOutputDef {
  propName: string;
  eventName: string;
}

export interface ProviderDef {
  tokenKey: string;
  ctor: any;
  deps: DepDef[];
  outputs: ProviderOutputDef[];
  contentQueries: QueryDef[];
  viewQueries: QueryDef[];
  // closure to allow recursive components
  component: () => ViewDefinition;
}

export interface QueryDef {
  id: string;
  propName: string;
  bindingType: QueryBindingType;
}

export enum QueryBindingType {
  First,
  All
}

export enum QueryValueType {
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  Provider
}

export interface TextDef { prefix: string; }

export interface PureExpressionDef {
  type: PureExpressionType;
  pipeDep: DepDef;
}

export enum PureExpressionType {
  Array,
  Object,
  Pipe
}

export enum BindingType {
  ElementAttribute,
  ElementClass,
  ElementStyle,
  ElementProperty,
  ProviderProperty,
  Interpolation,
  PureExpressionProperty
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
  // for component views, this is the same as parentIndex.
  // for embedded views, this is the index of the parent node
  // that contains the view container.
  parentDiIndex: number;
  parent: ViewData;
  component: any;
  context: any;
  nodes: NodeData[];
  firstChange: boolean;
  oldValues: any[];
  disposables: DisposableFn[];
}

export type DisposableFn = () => void;

/**
 * Node instance data.
 * Attention: Adding fields to this is performance sensitive!
 */
export interface NodeData {
  elementOrText: ElementOrTextData;
  provider: ProviderData;
  pureExpression: PureExpressionData;
}

export interface ElementOrTextData {
  node: any;
  embeddedViews: ViewData[];
  // views that have been created from the template
  // of this element,
  // but inserted into the embeddedViews of another element.
  // By default, this is undefined.
  projectedViews: ViewData[];
}

export interface ProviderData {
  instance: any;
  componentView: ViewData;
  queries: {[queryId: string]: QueryList<any>};
}

export interface PureExpressionData {
  value: any;
  pipe: PipeTransform;
}

export interface Services {
  renderComponent(rcp: RenderComponentType): Renderer;
  sanitize(context: SecurityContext, value: string): string;
  // Note: This needs to be here to prevent a cycle in source files.
  createViewContainerRef(data: NodeData): ViewContainerRef;
  // Note: This needs to be here to prevent a cycle in source files.
  createTemplateRef(parentView: ViewData, def: NodeDef): TemplateRef<any>;
}
