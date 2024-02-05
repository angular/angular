/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, InjectOptions, Injector, Type, ViewEncapsulation} from '@angular/core';

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
  | null
  | {status: 'hydrated' | 'skipped'}
  | {
      status: 'mismatched';
      expectedNodeDetails: string | null;
      actualNodeDetails: string | null;
    };

export interface DevToolsNode<DirType = DirectiveType, CmpType = ComponentType> {
  element: string;
  directives: DirType[];
  component: CmpType | null;
  children: DevToolsNode<DirType, CmpType>[];
  nativeElement?: Node;
  resolutionPath?: SerializedInjector[];
  hydration: HydrationStatus;
}

export interface SerializedInjector {
  id: string;
  name: string;
  type: string;
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

export interface DirectiveMetadata {
  inputs: {[name: string]: string};
  outputs: {[name: string]: string};
  encapsulation: ViewEncapsulation;
  onPush: boolean;
  dependencies?: SerializedInjectedService[];
}

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
  hash?: string | null;
  specificity?: string | null;
  handler?: string;
  pathMatch?: 'prefix' | 'full';
  canActivateGuards?: string;
  providers?: string;
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

export interface InjectorGraphViewQuery {
  directivePosition: DirectivePosition;
  paramIndex: number;
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
  }) => void;

  inspectorStart: () => void;
  inspectorEnd: () => void;

  getNestedProperties: (position: DirectivePosition, path: string[]) => void;
  nestedProperties: (position: DirectivePosition, data: Properties, path: string[]) => void;

  setSelectedComponent: (position: ElementPosition) => void;
  getRoutes: () => void;
  updateRouterTree: (routes: Route[]) => void;

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
