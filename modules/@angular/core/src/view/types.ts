/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeTransform} from '../change_detection/change_detection';
import {Injector} from '../di';
import {ComponentFactory} from '../linker/component_factory';
import {QueryList} from '../linker/query_list';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {ViewRef} from '../linker/view_ref';
import {RenderComponentType, RenderDebugInfo, Renderer, RootRenderer} from '../render/api';
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
   * ids of all queries that are matched by one of the nodes.
   * This includes query ids from templates as well.
   */
  nodeMatchedQueries: {[queryId: string]: boolean};
}

export type ViewDefinitionFactory = () => ViewDefinition;

export type ViewUpdateFn = (view: ViewData) => void;

export type ViewHandleEventFn =
    (view: ViewData, nodeIndex: number, eventName: string, event: any) => boolean;

/**
 * Bitmask for ViewDefintion.flags.
 */
export enum ViewFlags {
  None = 0,
  DirectDom = 1 << 1,
  OnPush = 1 << 2
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
  parent: number;
  /** this is checked against NgContentDef.index to find matched nodes */
  ngContentIndex: number;
  /** number of transitive children */
  childCount: number;
  /** aggregated NodeFlags for all children **/
  childFlags: NodeFlags;

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
  query: QueryDef;
  ngContent: NgContentDef;
}

export enum NodeType {
  Element,
  Text,
  Provider,
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
  HasViewQuery = 1 << 11,
  LazyProvider = 1 << 12
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
  ProviderProperty,
  Interpolation,
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
  /**
   * visible providers for DI in the view,
   * as see from this element.
   */
  providerIndices: {[tokenKey: string]: number};
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
  outputs: ProviderOutputDef[];
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
  Optional = 1 << 1
}

export interface ProviderOutputDef {
  propName: string;
  eventName: string;
}

export interface TextDef {
  prefix: string;
  source: string;
}

export interface PureExpressionDef {
  type: PureExpressionType;
  pipeDep: DepDef;
}

export enum PureExpressionType {
  Array,
  Object,
  Pipe
}

export interface QueryDef {
  id: string;
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
  renderer: Renderer;
  root: RootData;
  // index of parent element / anchor. Not the index
  // of the provider with the component view.
  parentIndex: number;
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
export interface PureExpressionData {
  value: any;
  pipe: PipeTransform;
}

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
  selectorOrNode: string|any;
  renderer: RootRenderer;
  sanitizer: Sanitizer;
}

// -------------------------------------
// Other
// -------------------------------------
export enum EntryAction {
  CheckAndUpdate,
  CheckNoChanges,
  Create,
  Destroy,
  HandleEvent
}

export interface DebugContext extends RenderDebugInfo {
  view: ViewData;
  nodeIndex: number;
  componentRenderElement: any;
  renderNode: any;
}

/**
 * This class is used to prevent cycles in the source files.
 */
export abstract class Refs {
  private static instance: Refs;

  static setInstance(instance: Refs) { Refs.instance = instance; }
  static createComponentFactory(selector: string, viewDefFactory: ViewDefinitionFactory):
      ComponentFactory<any> {
    return Refs.instance.createComponentFactory(selector, viewDefFactory);
  }
  static createViewRef(data: ViewData): ViewRef { return Refs.instance.createViewRef(data); }
  static createViewContainerRef(view: ViewData, elIndex: number): ViewContainerRef {
    return Refs.instance.createViewContainerRef(view, elIndex);
  }
  static createTemplateRef(parentView: ViewData, def: NodeDef): TemplateRef<any> {
    return Refs.instance.createTemplateRef(parentView, def);
  }
  static createInjector(view: ViewData, elIndex: number): Injector {
    return Refs.instance.createInjector(view, elIndex);
  }
  static createDebugContext(view: ViewData, nodeIndex: number): DebugContext {
    return Refs.instance.createDebugContext(view, nodeIndex);
  }

  abstract createComponentFactory(selector: string, viewDefFactory: ViewDefinitionFactory):
      ComponentFactory<any>;
  abstract createViewRef(data: ViewData): ViewRef;
  abstract createViewContainerRef(view: ViewData, elIndex: number): ViewContainerRef;
  abstract createTemplateRef(parentView: ViewData, def: NodeDef): TemplateRef<any>;
  abstract createInjector(view: ViewData, elIndex: number): Injector;
  abstract createDebugContext(view: ViewData, nodeIndex: number): DebugContext;
}
