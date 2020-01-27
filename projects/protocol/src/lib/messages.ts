export interface DirectiveType {
  name: string;
}

export interface ComponentType {
  name: string;
}

export interface Node<DirType = DirectiveType, CmpType = ComponentType> {
  element: string;
  directives: DirType[];
  component: CmpType | null;
  children: Node[];
}

export enum PropType {
  Number,
  String,
  Null,
  Undefined,
  Symbol,
  HTMLElement,
  Boolean,
  BigInt,
  Function,
  Object,
  Date,
  Array,
  Unknown,
}

export interface Descriptor {
  expandable: boolean;
  value?: any;
  editable: boolean;
  type: PropType;
  preview: string;
}

export interface DirectivesProperties {
  [name: string]: Properties;
}

export interface Properties {
  props: { [name: string]: Descriptor };
}

export type ElementID = number[];

export interface DirectiveID  {
  element: ElementID;
  directive?: number;
}

export interface NestedProp {
  name: string | number;
  children: NestedProp[];
}

export interface ComponentExplorerViewProperties {
  [directive: string]: NestedProp[] | null;
}

export interface ComponentExplorerViewQuery {
  selectedElement: ElementID | null;
  expandedProperties: ComponentExplorerViewProperties;
}

export interface ComponentExplorerView {
  forest: Node[];
  properties: DirectivesProperties;
}

export enum ComponentEventType {
  Create,
  Destroy,
  ChangeDetection
}

export interface ComponentRecord {
  recordType: 'component';
  timestamp: number;
  component: string;
  id: ElementID;
  event: ComponentEventType;
  duration: number;
  state: Properties;
}

export enum LifeCycleEventType {
  ChangeDetectionStart,
  ChangeDetectionEnd
}

export interface AppEndChangeDetection {
  recordType: 'lifecycle';
  timestamp: number;
  event: LifeCycleEventType.ChangeDetectionEnd;
}

export interface AppStartChangeDetection {
  recordType: 'lifecycle';
  timestamp: number;
  event: LifeCycleEventType.ChangeDetectionStart;
  source: string;
}

export type AppRecord = ComponentRecord | AppStartChangeDetection | AppEndChangeDetection;

export interface Events {
  handshake: () => void;
  shutdown: () => void;
  syn: () => void;
  queryNgAvailability: () => void;
  ngAvailability: (config: { version: string | undefined }) => void;

  inspectorStart: () => void;
  inspectorEnd: () => void;

  getElementDirectivesProperties: (id: ElementID) => void;
  elementDirectivesProperties: (data: DirectivesProperties) => void;
  getNestedProperties: (id: DirectiveID, path: string[]) => void;
  nestedProperties: (id: DirectiveID, data: Properties, path: string[]) => void;

  componentTreeDirty: () => void;
  getLatestComponentExplorerView: (query: ComponentExplorerViewQuery) => void;
  latestComponentExplorerView: (view: ComponentExplorerView) => void;

  startProfiling: () => void;
  stopProfiling: () => void;
  profilerResults: (results: AppRecord[]) => void;
}
