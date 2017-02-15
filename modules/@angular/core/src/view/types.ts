/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeTransform} from '../change_detection/change_detection';
import {Injector} from '../di';
import {ComponentRef} from '../linker/component_factory';
import {QueryList} from '../linker/query_list';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {ViewRef} from '../linker/view_ref';
import {ViewEncapsulation} from '../metadata/view';
import {RenderDebugContext, RendererV2} from '../render/api';
import {Sanitizer, SecurityContext} from '../security';

// -------------------------------------
// Defs
// -------------------------------------

export interface ViewDefinition {
  flags: ViewFlags;
  component: ComponentDefinition;
  updateDirectives: ViewUpdateFn;
  updateRenderer: ViewUpdateFn;
  handleEvent: ViewHandleEventFn;
  /**
   * Order: Depth first.
   * Especially providers are before elements / anchors.
   */
  nodes: NodeDef[];
  /** aggregated NodeFlags for all nodes **/
  nodeFlags: NodeFlags;
  /**
   * Order: parents before children, but children in reverse order.
   * Especially providers are after elements / anchors.
   */
  reverseChildNodes: NodeDef[];
  lastRootNode: NodeDef;
  bindingCount: number;
  disposableCount: number;
  /**
   * Binary or of all query ids that are matched by one of the nodes.
   * This includes query ids from templates as well.
   * Used as a bloom filter.
   */
  nodeMatchedQueries: number;
}

export type ViewDefinitionFactory = () => ViewDefinition;

export type ViewUpdateFn = (check: NodeCheckFn, view: ViewData) => void;

// helper functions to create an overloaded function type.
export interface NodeCheckFn {
  (view: ViewData, nodeIndex: number, argStyle: ArgumentType.Dynamic, values: any[]): any;

  (view: ViewData, nodeIndex: number, argStyle: ArgumentType.Inline, v0?: any, v1?: any, v2?: any,
   v3?: any, v4?: any, v5?: any, v6?: any, v7?: any, v8?: any, v9?: any): any;
}

export type ViewHandleEventFn =
    (view: ViewData, nodeIndex: number, eventName: string, event: any) => boolean;

export enum ArgumentType {
  Inline,
  Dynamic
}

/**
 * Bitmask for ViewDefintion.flags.
 */
export enum ViewFlags {
  None = 0,
  OnPush = 1 << 1
}

export interface ComponentDefinition {
  id: string;
  encapsulation: ViewEncapsulation;
  styles: string[];
}

/**
 * A node definition in the view.
 *
 * Note: We use one type for all nodes so that loops that loop over all nodes
 * of a ViewDefinition stay monomorphic!
 */
export interface NodeDef {
  type: NodeType;
  index: number;
  reverseChildIndex: number;
  flags: NodeFlags;
  parent: NodeDef;
  renderParent: NodeDef;
  /** this is checked against NgContentDef.index to find matched nodes */
  ngContentIndex: number;
  /** number of transitive children */
  childCount: number;
  /** aggregated NodeFlags for all children (does not include self) **/
  childFlags: NodeFlags;

  bindingIndex: number;
  bindings: BindingDef[];
  disposableIndex: number;
  disposableCount: number;
  /**
   * references that the user placed on the element
   */
  references: {[refId: string]: QueryValueType};
  /**
   * ids and value types of all queries that are matched by this node.
   */
  matchedQueries: {[queryId: number]: QueryValueType};
  /** Binary or of all matched query ids of this node. */
  matchedQueryIds: number;
  /**
   * Binary or of all query ids that are matched by one of the children.
   * This includes query ids from templates as well.
   * Used as a bloom filter.
   */
  childMatchedQueries: number;
  element: ElementDef;
  provider: ProviderDef;
  text: TextDef;
  pureExpression: PureExpressionDef;
  query: QueryDef;
  ngContent: NgContentDef;
}

export enum NodeType {
  Element,
  Text,
  Directive,
  Provider,
  Pipe,
  PureExpression,
  Query,
  NgContent
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
  HasStaticQuery = 1 << 11,
  HasDynamicQuery = 1 << 12,
  HasViewQuery = 1 << 13,
  LazyProvider = 1 << 14,
  PrivateProvider = 1 << 15,
}

export interface BindingDef {
  type: BindingType;
  name: string;
  nonMinifiedName: string;
  securityContext: SecurityContext;
  suffix: string;
}

export enum BindingType {
  ElementAttribute,
  ElementClass,
  ElementStyle,
  ElementProperty,
  DirectiveProperty,
  TextInterpolation,
  PureExpressionProperty
}

export enum QueryValueType {
  ElementRef,
  RenderElement,
  TemplateRef,
  ViewContainerRef,
  Provider
}

export interface ElementDef {
  name: string;
  attrs: {[name: string]: string};
  outputs: ElementOutputDef[];
  template: ViewDefinition;
  component: NodeDef;
  /**
   * visible public providers for DI in the view,
   * as see from this element. This does not include private providers.
   */
  publicProviders: {[tokenKey: string]: NodeDef};
  /**
   * same as visiblePublicProviders, but also includes private providers
   * that are located on this element.
   */
  allProviders: {[tokenKey: string]: NodeDef};
  source: string;
}

export interface ElementOutputDef {
  target: string;
  eventName: string;
}

export interface ProviderDef {
  type: ProviderType;
  token: any;
  tokenKey: string;
  value: any;
  deps: DepDef[];
  outputs: DirectiveOutputDef[];
  // closure to allow recursive components
  component: ViewDefinitionFactory;
}

export enum ProviderType {
  Value,
  Class,
  Factory,
  UseExisting
}

export interface DepDef {
  flags: DepFlags;
  token: any;
  tokenKey: string;
}

/**
 * Bitmask for DI flags
 */
export enum DepFlags {
  None = 0,
  SkipSelf = 1 << 0,
  Optional = 1 << 1,
  Value = 2 << 2,
}

export interface DirectiveOutputDef {
  propName: string;
  eventName: string;
}

export interface TextDef {
  prefix: string;
  source: string;
}

export interface PureExpressionDef { type: PureExpressionType; }

export enum PureExpressionType {
  Array,
  Object,
  Pipe
}

export interface QueryDef {
  id: number;
  // variant of the id that can be used to check against NodeDef.matchedQueryIds, ...
  filterId: number;
  bindings: QueryBindingDef[];
}

export interface QueryBindingDef {
  propName: string;
  bindingType: QueryBindingType;
}

export enum QueryBindingType {
  First,
  All
}

export interface NgContentDef {
  /**
   * this index is checked against NodeDef.ngContentIndex to find the nodes
   * that are matched by this ng-content.
   * Note that a NodeDef with an ng-content can be reprojected, i.e.
   * have a ngContentIndex on its own.
   */
  index: number;
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
  root: RootData;
  // index of component provider / anchor.
  parentNodeDef: NodeDef;
  parent: ViewData;
  component: any;
  context: any;
  // Attention: Never loop over this, as this will
  // create a polymorphic usage site.
  // Instead: Always loop over ViewDefinition.nodes,
  // and call the right accessor (e.g. `elementData`) based on
  // the NodeType.
  nodes: {[key: number]: NodeData};
  state: ViewState;
  oldValues: any[];
  disposables: DisposableFn[];
}

/**
 * Bitmask of states
 */
export enum ViewState {
  FirstCheck = 1 << 0,
  ChecksEnabled = 1 << 1,
  Errored = 1 << 2,
  Destroyed = 1 << 3
}

export type DisposableFn = () => void;

/**
 * Node instance data.
 *
 * We have a separate type per NodeType to save memory
 * (TextData | ElementData | ProviderData | PureExpressionData | QueryList<any>)
 *
 * To keep our code monomorphic,
 * we prohibit using `NodeData` directly but enforce the use of accessors (`asElementData`, ...).
 * This way, no usage site can get a `NodeData` from view.nodes and then use it for different
 * purposes.
 */
export class NodeData { private __brand: any; }

/**
 * Data for an instantiated NodeType.Text.
 *
 * Attention: Adding fields to this is performance sensitive!
 */
export interface TextData { renderText: any; }

/**
 * Accessor for view.nodes, enforcing that every usage site stays monomorphic.
 */
export function asTextData(view: ViewData, index: number): TextData {
  return <any>view.nodes[index];
}

/**
 * Data for an instantiated NodeType.Element.
 *
 * Attention: Adding fields to this is performance sensitive!
 */
export interface ElementData {
  renderElement: any;
  embeddedViews: ViewData[];
  // views that have been created from the template
  // of this element,
  // but inserted into the embeddedViews of another element.
  // By default, this is undefined.
  projectedViews: ViewData[];
}

/**
 * Accessor for view.nodes, enforcing that every usage site stays monomorphic.
 */
export function asElementData(view: ViewData, index: number): ElementData {
  return <any>view.nodes[index];
}

/**
 * Data for an instantiated NodeType.Provider.
 *
 * Attention: Adding fields to this is performance sensitive!
 */
export interface ProviderData {
  instance: any;
  componentView: ViewData;
}

/**
 * Accessor for view.nodes, enforcing that every usage site stays monomorphic.
 */
export function asProviderData(view: ViewData, index: number): ProviderData {
  return <any>view.nodes[index];
}

/**
 * Data for an instantiated NodeType.PureExpression.
 *
 * Attention: Adding fields to this is performance sensitive!
 */
export interface PureExpressionData { value: any; }

/**
 * Accessor for view.nodes, enforcing that every usage site stays monomorphic.
 */
export function asPureExpressionData(view: ViewData, index: number): PureExpressionData {
  return <any>view.nodes[index];
}

/**
 * Accessor for view.nodes, enforcing that every usage site stays monomorphic.
 */
export function asQueryList(view: ViewData, index: number): QueryList<any> {
  return <any>view.nodes[index];
}

export interface RootData {
  injector: Injector;
  projectableNodes: any[][];
  selectorOrNode: any;
  renderer: RendererV2;
  sanitizer: Sanitizer;
}

export abstract class DebugContext extends RenderDebugContext {
  abstract get view(): ViewData;
  abstract get nodeIndex(): number;
}

// -------------------------------------
// Other
// -------------------------------------

export interface Services {
  setCurrentNode(view: ViewData, nodeIndex: number): void;
  createRootView(
      injector: Injector, projectableNodes: any[][], rootSelectorOrNode: string|any,
      def: ViewDefinition, context?: any): ViewData;
  createEmbeddedView(parent: ViewData, anchorDef: NodeDef, context?: any): ViewData;
  checkAndUpdateView(view: ViewData): void;
  checkNoChangesView(view: ViewData): void;
  attachEmbeddedView(elementData: ElementData, viewIndex: number, view: ViewData): void;
  detachEmbeddedView(elementData: ElementData, viewIndex: number): ViewData;
  moveEmbeddedView(elementData: ElementData, oldViewIndex: number, newViewIndex: number): ViewData;
  destroyView(view: ViewData): void;
  resolveDep(
      view: ViewData, elDef: NodeDef, allowPrivateServices: boolean, depDef: DepDef,
      notFoundValue?: any): any;
  createDebugContext(view: ViewData, nodeIndex: number): DebugContext;
  handleEvent: ViewHandleEventFn;
  updateDirectives: ViewUpdateFn;
  updateRenderer: ViewUpdateFn;
}

/**
 * This object is used to prevent cycles in the source files and to have a place where
 * debug mode can hook it. It is lazily filled when `isDevMode` is known.
 */
export const Services: Services = {
  setCurrentNode: undefined,
  createRootView: undefined,
  createEmbeddedView: undefined,
  checkAndUpdateView: undefined,
  checkNoChangesView: undefined,
  destroyView: undefined,
  attachEmbeddedView: undefined,
  detachEmbeddedView: undefined,
  moveEmbeddedView: undefined,
  resolveDep: undefined,
  createDebugContext: undefined,
  handleEvent: undefined,
  updateDirectives: undefined,
  updateRenderer: undefined,
};
