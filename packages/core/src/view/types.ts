/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di';
import {ErrorHandler} from '../error_handler';
import {Type} from '../interface/type';
import {ComponentFactory} from '../linker/component_factory';
import {NgModuleRef} from '../linker/ng_module_factory';
import {QueryList} from '../linker/query_list';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {Renderer2, RendererFactory2} from '../render/api';
import {RendererType2} from '../render/api_flags';
import {Sanitizer} from '../sanitization/sanitizer';
import {SecurityContext} from '../sanitization/security';



// -------------------------------------
// Defs
// -------------------------------------

/**
 * Factory for ViewDefinitions/NgModuleDefinitions.
 * We use a function so we can reexeute it in case an error happens and use the given logger
 * function to log the error from the definition of the node, which is shown in all browser
 * logs.
 */
export interface DefinitionFactory<D extends Definition<any>> {
  (logger: NodeLogger): D;
}

/**
 * Function to call console.error at the right source location. This is an indirection
 * via another function as browser will log the location that actually called
 * `console.error`.
 */
export interface NodeLogger {
  (): () => void;
}

export interface Definition<DF extends DefinitionFactory<any>> {
  factory: DF|null;
}

export interface NgModuleDefinition extends Definition<NgModuleDefinitionFactory> {
  providers: NgModuleProviderDef[];
  providersByKey: {[tokenKey: string]: NgModuleProviderDef};
  modules: any[];
  scope: 'root'|'platform'|null;
}

export interface NgModuleDefinitionFactory extends DefinitionFactory<NgModuleDefinition> {}

export interface ViewDefinition extends Definition<ViewDefinitionFactory> {
  flags: ViewFlags;
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
  rootNodeFlags: NodeFlags;
  lastRenderRootNode: NodeDef|null;
  bindingCount: number;
  outputCount: number;
  /**
   * Binary or of all query ids that are matched by one of the nodes.
   * This includes query ids from templates as well.
   * Used as a bloom filter.
   */
  nodeMatchedQueries: number;
}

export interface ViewDefinitionFactory extends DefinitionFactory<ViewDefinition> {}


export interface ViewUpdateFn {
  (check: NodeCheckFn, view: ViewData): void;
}

// helper functions to create an overloaded function type.
export interface NodeCheckFn {
  (view: ViewData, nodeIndex: number, argStyle: ArgumentType.Dynamic, values: any[]): any;

  (view: ViewData, nodeIndex: number, argStyle: ArgumentType.Inline, v0?: any, v1?: any, v2?: any,
   v3?: any, v4?: any, v5?: any, v6?: any, v7?: any, v8?: any, v9?: any): any;
}

export const enum ArgumentType {
  Inline = 0,
  Dynamic = 1
}

export interface ViewHandleEventFn {
  (view: ViewData, nodeIndex: number, eventName: string, event: any): boolean;
}

/**
 * Bitmask for ViewDefinition.flags.
 */
export const enum ViewFlags {
  None = 0,
  OnPush = 1 << 1,
}

/**
 * A node definition in the view.
 *
 * Note: We use one type for all nodes so that loops that loop over all nodes
 * of a ViewDefinition stay monomorphic!
 */
export interface NodeDef {
  flags: NodeFlags;
  // Index of the node in view data and view definition (those are the same)
  nodeIndex: number;
  // Index of the node in the check functions
  // Differ from nodeIndex when nodes are added or removed at runtime (ie after compilation)
  checkIndex: number;
  parent: NodeDef|null;
  renderParent: NodeDef|null;
  /** this is checked against NgContentDef.index to find matched nodes */
  ngContentIndex: number|null;
  /** number of transitive children */
  childCount: number;
  /** aggregated NodeFlags for all transitive children (does not include self) **/
  childFlags: NodeFlags;
  /** aggregated NodeFlags for all direct children (does not include self) **/
  directChildFlags: NodeFlags;

  bindingIndex: number;
  bindings: BindingDef[];
  bindingFlags: BindingFlags;
  outputIndex: number;
  outputs: OutputDef[];
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
  element: ElementDef|null;
  provider: ProviderDef|null;
  text: TextDef|null;
  query: QueryDef|null;
  ngContent: NgContentDef|null;
}

/**
 * Bitmask for NodeDef.flags.
 * Naming convention:
 * - `Type...`: flags that are mutually exclusive
 * - `Cat...`: union of multiple `Type...` (short for category).
 */
export const enum NodeFlags {
  None = 0,
  TypeElement = 1 << 0,
  TypeText = 1 << 1,
  ProjectedTemplate = 1 << 2,
  CatRenderNode = TypeElement | TypeText,
  TypeNgContent = 1 << 3,
  TypePipe = 1 << 4,
  TypePureArray = 1 << 5,
  TypePureObject = 1 << 6,
  TypePurePipe = 1 << 7,
  CatPureExpression = TypePureArray | TypePureObject | TypePurePipe,
  TypeValueProvider = 1 << 8,
  TypeClassProvider = 1 << 9,
  TypeFactoryProvider = 1 << 10,
  TypeUseExistingProvider = 1 << 11,
  LazyProvider = 1 << 12,
  PrivateProvider = 1 << 13,
  TypeDirective = 1 << 14,
  Component = 1 << 15,
  CatProviderNoDirective =
      TypeValueProvider | TypeClassProvider | TypeFactoryProvider | TypeUseExistingProvider,
  CatProvider = CatProviderNoDirective | TypeDirective,
  OnInit = 1 << 16,
  OnDestroy = 1 << 17,
  DoCheck = 1 << 18,
  OnChanges = 1 << 19,
  AfterContentInit = 1 << 20,
  AfterContentChecked = 1 << 21,
  AfterViewInit = 1 << 22,
  AfterViewChecked = 1 << 23,
  EmbeddedViews = 1 << 24,
  ComponentView = 1 << 25,
  TypeContentQuery = 1 << 26,
  TypeViewQuery = 1 << 27,
  StaticQuery = 1 << 28,
  DynamicQuery = 1 << 29,
  TypeNgModule = 1 << 30,
  EmitDistinctChangesOnly = 1 << 31,
  CatQuery = TypeContentQuery | TypeViewQuery,

  // mutually exclusive values...
  Types = CatRenderNode | TypeNgContent | TypePipe | CatPureExpression | CatProvider | CatQuery
}

export interface BindingDef {
  flags: BindingFlags;
  ns: string|null;
  name: string|null;
  nonMinifiedName: string|null;
  securityContext: SecurityContext|null;
  suffix: string|null;
}

export const enum BindingFlags {
  TypeElementAttribute = 1 << 0,
  TypeElementClass = 1 << 1,
  TypeElementStyle = 1 << 2,
  TypeProperty = 1 << 3,
  SyntheticProperty = 1 << 4,
  SyntheticHostProperty = 1 << 5,
  CatSyntheticProperty = SyntheticProperty | SyntheticHostProperty,

  // mutually exclusive values...
  Types = TypeElementAttribute | TypeElementClass | TypeElementStyle | TypeProperty
}

export interface OutputDef {
  type: OutputType;
  target: 'window'|'document'|'body'|'component'|null;
  eventName: string;
  propName: string|null;
}

export const enum OutputType {
  ElementOutput,
  DirectiveOutput
}

export const enum QueryValueType {
  ElementRef = 0,
  RenderElement = 1,
  TemplateRef = 2,
  ViewContainerRef = 3,
  Provider = 4
}

export interface ElementDef {
  // set to null for `<ng-container>`
  name: string|null;
  ns: string|null;
  /** ns, name, value */
  attrs: [string, string, string][]|null;
  template: ViewDefinition|null;
  componentProvider: NodeDef|null;
  componentRendererType: RendererType2|null;
  // closure to allow recursive components
  componentView: ViewDefinitionFactory|null;
  /**
   * visible public providers for DI in the view,
   * as see from this element. This does not include private providers.
   */
  publicProviders: {[tokenKey: string]: NodeDef}|null;
  /**
   * same as visiblePublicProviders, but also includes private providers
   * that are located on this element.
   */
  allProviders: {[tokenKey: string]: NodeDef}|null;
  handleEvent: ElementHandleEventFn|null;
}

export interface ElementHandleEventFn {
  (view: ViewData, eventName: string, event: any): boolean;
}

export interface ProviderDef {
  token: any;
  value: any;
  deps: DepDef[];
}

export interface NgModuleProviderDef {
  flags: NodeFlags;
  index: number;
  token: any;
  value: any;
  deps: DepDef[];
}

export interface DepDef {
  flags: DepFlags;
  token: any;
  tokenKey: string;
}

/**
 * Bitmask for DI flags
 */
export const enum DepFlags {
  None = 0,
  SkipSelf = 1 << 0,
  Optional = 1 << 1,
  Self = 1 << 2,
  Value = 1 << 3,
}

export interface TextDef {
  prefix: string;
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

export const enum QueryBindingType {
  First = 0,
  All = 1
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

export interface NgModuleData extends Injector, NgModuleRef<any> {
  // Note: we are using the prefix _ as NgModuleData is an NgModuleRef and therefore directly
  // exposed to the user.
  _def: NgModuleDefinition;
  _parent: Injector;
  _providers: any[];
}

/**
 * View instance data.
 * Attention: Adding fields to this is performance sensitive!
 */
export interface ViewData {
  def: ViewDefinition;
  root: RootData;
  renderer: Renderer2;
  // index of component provider / anchor.
  parentNodeDef: NodeDef|null;
  parent: ViewData|null;
  viewContainerParent: ViewData|null;
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
  disposables: DisposableFn[]|null;
  initIndex: number;
}

/**
 * Bitmask of states
 */
export const enum ViewState {
  BeforeFirstCheck = 1 << 0,
  FirstCheck = 1 << 1,
  Attached = 1 << 2,
  ChecksEnabled = 1 << 3,
  IsProjectedView = 1 << 4,
  CheckProjectedView = 1 << 5,
  CheckProjectedViews = 1 << 6,
  Destroyed = 1 << 7,

  // InitState Uses 3 bits
  InitState_Mask = 7 << 8,
  InitState_BeforeInit = 0 << 8,
  InitState_CallingOnInit = 1 << 8,
  InitState_CallingAfterContentInit = 2 << 8,
  InitState_CallingAfterViewInit = 3 << 8,
  InitState_AfterInit = 4 << 8,

  CatDetectChanges = Attached | ChecksEnabled,
  CatInit = BeforeFirstCheck | CatDetectChanges | InitState_BeforeInit
}

// Called before each cycle of a view's check to detect whether this is in the
// initState for which we need to call ngOnInit, ngAfterContentInit or ngAfterViewInit
// lifecycle methods. Returns true if this check cycle should call lifecycle
// methods.
export function shiftInitState(
    view: ViewData, priorInitState: ViewState, newInitState: ViewState): boolean {
  // Only update the InitState if we are currently in the prior state.
  // For example, only move into CallingInit if we are in BeforeInit. Only
  // move into CallingContentInit if we are in CallingInit. Normally this will
  // always be true because of how checkCycle is called in checkAndUpdateView.
  // However, if checkAndUpdateView is called recursively or if an exception is
  // thrown while checkAndUpdateView is running, checkAndUpdateView starts over
  // from the beginning. This ensures the state is monotonically increasing,
  // terminating in the AfterInit state, which ensures the Init methods are called
  // at least once and only once.
  const state = view.state;
  const initState = state & ViewState.InitState_Mask;
  if (initState === priorInitState) {
    view.state = (state & ~ViewState.InitState_Mask) | newInitState;
    view.initIndex = -1;
    return true;
  }
  return initState === newInitState;
}

// Returns true if the lifecycle init method should be called for the node with
// the given init index.
export function shouldCallLifecycleInitHook(
    view: ViewData, initState: ViewState, index: number): boolean {
  if ((view.state & ViewState.InitState_Mask) === initState && view.initIndex <= index) {
    view.initIndex = index + 1;
    return true;
  }
  return false;
}

export interface DisposableFn {
  (): void;
}

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
export class NodeData {
  private __brand: any;
}

/**
 * Data for an instantiated NodeType.Text.
 *
 * Attention: Adding fields to this is performance sensitive!
 */
export interface TextData {
  renderText: any;
}

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
  componentView: ViewData;
  viewContainer: ViewContainerData|null;
  template: TemplateData;
}

export interface ViewContainerData extends ViewContainerRef {
  // Note: we are using the prefix _ as ViewContainerData is a ViewContainerRef and therefore
  // directly
  // exposed to the user.
  _embeddedViews: ViewData[];
}

export interface TemplateData extends TemplateRef<any> {
  // views that have been created from the template
  // of this element,
  // but inserted into the embeddedViews of another element.
  // By default, this is undefined.
  // Note: we are using the prefix _ as TemplateData is a TemplateRef and therefore directly
  // exposed to the user.
  _projectedViews: ViewData[];
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
  ngModule: NgModuleRef<any>;
  projectableNodes: any[][];
  selectorOrNode: any;
  renderer: Renderer2;
  rendererFactory: RendererFactory2;
  errorHandler: ErrorHandler;
  sanitizer: Sanitizer;
}

export abstract class DebugContext {
  abstract get view(): ViewData;
  abstract get nodeIndex(): number|null;
  abstract get injector(): Injector;
  abstract get component(): any;
  abstract get providerTokens(): any[];
  abstract get references(): {[key: string]: any};
  abstract get context(): any;
  abstract get componentRenderElement(): any;
  abstract get renderNode(): any;
  abstract logError(console: Console, ...values: any[]): void;
}

// -------------------------------------
// Other
// -------------------------------------

export const enum CheckType {
  CheckAndUpdate,
  CheckNoChanges
}

export interface ProviderOverride {
  token: any;
  flags: NodeFlags;
  value: any;
  deps: ([DepFlags, any]|any)[];
  deprecatedBehavior: boolean;
}

export interface Services {
  setCurrentNode(view: ViewData, nodeIndex: number): void;
  createRootView(
      injector: Injector, projectableNodes: any[][], rootSelectorOrNode: string|any,
      def: ViewDefinition, ngModule: NgModuleRef<any>, context?: any): ViewData;
  createEmbeddedView(parent: ViewData, anchorDef: NodeDef, viewDef: ViewDefinition, context?: any):
      ViewData;
  createComponentView(
      parentView: ViewData, nodeDef: NodeDef, viewDef: ViewDefinition, hostElement: any): ViewData;
  createNgModuleRef(
      moduleType: Type<any>, parent: Injector, bootstrapComponents: Type<any>[],
      def: NgModuleDefinition): NgModuleRef<any>;
  overrideProvider(override: ProviderOverride): void;
  overrideComponentView(compType: Type<any>, compFactory: ComponentFactory<any>): void;
  clearOverrides(): void;
  checkAndUpdateView(view: ViewData): void;
  checkNoChangesView(view: ViewData): void;
  destroyView(view: ViewData): void;
  resolveDep(
      view: ViewData, elDef: NodeDef|null, allowPrivateServices: boolean, depDef: DepDef,
      notFoundValue?: any): any;
  createDebugContext(view: ViewData, nodeIndex: number): DebugContext;
  handleEvent: ViewHandleEventFn;
  updateDirectives: (view: ViewData, checkType: CheckType) => void;
  updateRenderer: (view: ViewData, checkType: CheckType) => void;
  dirtyParentQueries: (view: ViewData) => void;
}

/**
 * This object is used to prevent cycles in the source files and to have a place where
 * debug mode can hook it. It is lazily filled when `isDevMode` is known.
 */
export const Services: Services = {
  setCurrentNode: undefined!,
  createRootView: undefined!,
  createEmbeddedView: undefined!,
  createComponentView: undefined!,
  createNgModuleRef: undefined!,
  overrideProvider: undefined!,
  overrideComponentView: undefined!,
  clearOverrides: undefined!,
  checkAndUpdateView: undefined!,
  checkNoChangesView: undefined!,
  destroyView: undefined!,
  resolveDep: undefined!,
  createDebugContext: undefined!,
  handleEvent: undefined!,
  updateDirectives: undefined!,
  updateRenderer: undefined!,
  dirtyParentQueries: undefined!,
};
