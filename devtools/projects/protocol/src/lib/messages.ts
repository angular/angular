/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵFramework as Framework,
  ɵAcxViewEncapsulation as AcxViewEncapsulation,
  InjectionToken,
  InjectOptions,
  Injector,
  Type,
  ViewEncapsulation as AngularViewEncapsulation,
} from '@angular/core';

export interface DebugSignalGraphNode {
  id: string;
  kind: string;
  epoch: number;
  label?: string;
  preview: Descriptor;
}

export interface DebugSignalGraphEdge {
  /**
   * Index of a signal node in the `nodes` array that is a consumer of the signal produced by the producer node.
   */
  consumer: number;

  /**
   * Index of a signal node in the `nodes` array that is a producer of the signal consumed by the consumer node.
   */
  producer: number;
}

/**
 * A debug representation of the signal graph.
 */
export interface DebugSignalGraph {
  nodes: DebugSignalGraphNode[];
  edges: DebugSignalGraphEdge[];
}

export interface SignalNodePosition {
  element: ElementPosition;
  signalId: string;
}

export interface DirectiveType {
  name: string;
  id: number;
}

export interface ComponentType {
  name: string;
  isElement: boolean;
  id: number;
}

export type HydrationStatus =
  // null represent the absence of hydration status (a node created via CSR)
  | null
  | {status: 'hydrated' | 'skipped' | 'dehydrated'}
  | {
      status: 'mismatched';
      expectedNodeDetails: string | null;
      actualNodeDetails: string | null;
    };

export type CurrentDeferBlock = 'placeholder' | 'loading' | 'error';

export interface DeferInfo {
  id: string;
  state: 'placeholder' | 'loading' | 'complete' | 'error' | 'initial';
  currentBlock: CurrentDeferBlock | null;
  triggers: {
    defer: string[];
    hydrate: string[];
    prefetch: string[];
  };
  blocks: BlockDetails;
}

export interface BlockDetails {
  hasErrorBlock: boolean;
  placeholderBlock: null | {minimumTime: number | null};
  loadingBlock: null | {minimumTime: number | null; afterTime: number | null};
}

// TODO: refactor to remove nativeElement as it is not serializable
// and only really exists on the ng-devtools-backend
export interface DevToolsNode<DirType = DirectiveType, CmpType = ComponentType> {
  element: string;
  directives: DirType[];
  component: CmpType | null;
  children: DevToolsNode<DirType, CmpType>[];
  nativeElement?: Node;
  resolutionPath?: SerializedInjector[];
  hydration: HydrationStatus;
  defer: DeferInfo | null;
  onPush?: boolean;
}

export interface SerializedInjector {
  id: string;
  name: string;
  type: 'imported-module' | 'environment' | 'element' | 'null' | 'hidden';
  node?: DevToolsNode;
  providers?: number;
}

export interface SerializedProviderRecord {
  token: string;
  type: 'type' | 'existing' | 'class' | 'value' | 'factory' | 'multi';
  multi: boolean;
  isViewProvider: boolean;
  index?: number | number[];
}

/**
 * Duplicate of the InjectedService interface from Angular framework to prevent
 * needing to publicly expose the interface from the framework.
 */
export interface InjectedService {
  token?: Type<unknown> | InjectionToken<unknown>;
  value: unknown;
  flags?: InjectOptions;
  providedIn: Injector;
}

export type ContainerType = 'WritableSignal' | 'ReadonlySignal' | null;

export enum PropType {
  Number,
  String,
  Null,
  Undefined,
  Symbol,
  HTMLNode,
  Boolean,
  BigInt,
  Function,
  Object,
  Date,
  Array,
  Set,
  Map,
  Unknown,
}

export interface Descriptor {
  expandable: boolean;
  value?: any;
  editable: boolean;
  type: PropType;
  preview: string;
  containerType: ContainerType;
}

export interface DirectivesProperties {
  [name: string]: Properties;
}

/** Directive metadata shared by all frameworks. */
export interface BaseDirectiveMetadata {
  framework: Framework;
  name?: string;
}

/** Directive metadata specific to Angular. */
export interface AngularDirectiveMetadata extends BaseDirectiveMetadata {
  framework: Framework.Angular;
  inputs: {[name: string]: string};
  outputs: {[name: string]: string};
  encapsulation?: AngularViewEncapsulation;
  onPush?: boolean;
  dependencies?: SerializedInjectedService[];
}

/** Directive metadata specific to ACX. */
export interface AcxDirectiveMetadata extends BaseDirectiveMetadata {
  framework: Framework.ACX;
  inputs: {[name: string]: string};
  outputs: {[name: string]: string};
  encapsulation?: AcxViewEncapsulation;
  onPush?: boolean;
}

/** Directive metadata specific to Wiz. */
export interface WizComponentMetadata extends BaseDirectiveMetadata {
  framework: Framework.Wiz;
  props: {[name: string]: string};
}

/** Directive metadata for all supported frameworks. */
export type DirectiveMetadata =
  | AngularDirectiveMetadata
  | AcxDirectiveMetadata
  | WizComponentMetadata;

export interface SerializedInjectedService {
  token: string;
  value: string;
  position: number[];
  flags?: InjectOptions;
  resolutionPath?: SerializedInjector[];
}

export interface Properties {
  props: {[name: string]: Descriptor};
  metadata?: DirectiveMetadata;
}

export type ElementPosition = number[];

export interface DirectivePosition {
  element: ElementPosition;
  directive?: number;
}

export interface NestedProp {
  name: string | number;
  children: NestedProp[];
}

export interface ComponentExplorerViewProperties {
  [directive: string]: NestedProp[];
}

export enum PropertyQueryTypes {
  All,
  Specified,
}

export interface AllPropertiesQuery {
  type: PropertyQueryTypes.All;
}

export interface SelectedPropertiesQuery {
  type: PropertyQueryTypes.Specified;
  properties: ComponentExplorerViewProperties;
}

export type PropertyQuery = AllPropertiesQuery | SelectedPropertiesQuery;

export interface ComponentExplorerViewQuery {
  selectedElement: ElementPosition;
  propertyQuery: PropertyQuery;
}

export interface ComponentExplorerView {
  forest: DevToolsNode[];
  properties?: DirectivesProperties;
}

export interface LifecycleProfile {
  ngOnInit?: number;
  ngOnDestroy?: number;
  ngOnChanges?: number;
  ngDoCheck?: number;
  ngAfterContentInit?: number;
  ngAfterContentChecked?: number;
  ngAfterViewInit?: number;
  ngAfterViewChecked?: number;
}

export interface OutputProfile {
  [outputName: string]: number;
}

export interface DirectiveProfile {
  name: string;
  isElement: boolean;
  isComponent: boolean;
  lifecycle: LifecycleProfile;
  outputs: OutputProfile;
  changeDetection?: number;
}

export interface ElementProfile {
  directives: DirectiveProfile[];
  children: ElementProfile[];
  type: 'defer' | 'element';
}

export interface ProfilerFrame {
  source: string;
  duration: number;
  directives: ElementProfile[];
}

export interface UpdatedStateData {
  directiveId: DirectivePosition;
  keyPath: string[];
  newValue: any;
}

export interface Route {
  name?: string;
  hash?: string;
  specificity?: string;
  handler?: string;
  pathMatch?: 'prefix' | 'full';
  canActivateGuards?: string[];
  canActivateChildGuards?: string[];
  canMatchGuards?: string[];
  canDeactivateGuards?: string[];
  providers?: string[];
  title?: string;
  children?: Array<Route>;
  data?: any;
  path: string;
  component: string;
  isActive: boolean;
  isAux: boolean;
  isLazy: boolean;
}

export interface AngularDetection {
  // This is necessary because the runtime
  // message listener handles messages globally
  // including from other extensions. We don't
  // want to set icon and/or popup based on
  // a message coming from an unrelated extension.
  isAngularDevTools: true;
  isIvy: boolean;
  isAngular: boolean;
  isDebugMode: boolean;
  isSupportedAngularVersion: boolean;
}

export type Topic = keyof Events;

export interface SupportedApis {
  profiler: boolean;
  dependencyInjection: boolean;
  routes: boolean;
}

export interface Events {
  handshake: () => void;
  shutdown: () => void;
  queryNgAvailability: () => void;
  ngAvailability: (config: {
    version: string | undefined;
    devMode: boolean;
    ivy: boolean;
    hydration: boolean;
    supportedApis: SupportedApis;
  }) => void;

  inspectorStart: () => void;
  inspectorEnd: () => void;

  getSignalGraph: (query: ElementPosition) => void;
  latestSignalGraph: (graph: DebugSignalGraph) => void;

  getSignalNestedProperties: (position: SignalNodePosition, path: string[]) => void;
  signalNestedProperties: (position: SignalNodePosition, data: Properties, path: string[]) => void;

  getNestedProperties: (position: DirectivePosition, path: string[]) => void;
  nestedProperties: (position: DirectivePosition, data: Properties, path: string[]) => void;

  setSelectedComponent: (position: ElementPosition) => void;
  getRoutes: () => void;
  updateRouterTree: (routes: Route[]) => void;
  navigateRoute: (route: string) => void;

  componentTreeDirty: () => void;
  getLatestComponentExplorerView: (query?: ComponentExplorerViewQuery) => void;
  latestComponentExplorerView: (view: ComponentExplorerView) => void;

  updateState: (value: UpdatedStateData) => void;

  startProfiling: () => void;
  stopProfiling: () => void;
  sendProfilerChunk: (results: ProfilerFrame) => void;
  profilerResults: (results: ProfilerFrame) => void;

  createHighlightOverlay: (position: ElementPosition) => void;
  removeHighlightOverlay: () => void;

  createHydrationOverlay: () => void;
  removeHydrationOverlay: () => void;

  highlightComponent: (id: number) => void;
  selectComponent: (id: number) => void;
  removeComponentHighlight: () => void;

  enableTimingAPI: () => void;
  disableTimingAPI: () => void;

  // todo: type properly
  getInjectorProviders: (injector: SerializedInjector) => void;
  latestInjectorProviders: (
    injector: SerializedInjector,
    providers: SerializedProviderRecord[],
  ) => void;

  logProvider: (injector: SerializedInjector, providers: SerializedProviderRecord) => void;

  contentScriptConnected: (frameId: number, name: string, url: string) => void;
  contentScriptDisconnected: (frameId: number, name: string, url: string) => void;
  enableFrameConnection: (frameId: number, tabId: number) => void;
  frameConnected: (frameId: number) => void;
  detectAngular: (detectionResult: AngularDetection) => void;
  backendReady: () => void;

  log: (logEvent: {message: string; level: 'log' | 'warn' | 'debug' | 'error'}) => void;
}
