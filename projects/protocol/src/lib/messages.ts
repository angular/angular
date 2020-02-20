export interface DirectiveType {
  name: string;
  id: number;
}

export interface ComponentType {
  name: string;
  id: number;
}

export interface Node<DirType = DirectiveType, CmpType = ComponentType> {
  element: string;
  directives: DirType[];
  component: CmpType | null;
  children: Node<DirType, CmpType>[];
  nativeElement?: Element;
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
  [directive: string]: NestedProp[] | null;
}

export interface ComponentExplorerViewQuery {
  selectedElement: ElementPosition | null;
  expandedProperties: ComponentExplorerViewProperties;
}

export interface ComponentExplorerView {
  forest: Node[];
  properties: DirectivesProperties;
}

export enum DirectiveEventType {
  Create,
  Destroy,
}

export enum ComponentEventType {
  Create,
  Destroy,
  ChangeDetection,
}

export interface DirectiveProfile {
  name: string;
  isComponent: boolean;
  lifecycle: number;
  changeDetection: number;
}

export interface ElementProfile {
  directives: DirectiveProfile[];
  children: ElementProfile[];
}

export interface ProfilerFrame {
  source: string;
  directives: ElementProfile[];
}

export interface Events {
  handshake: () => void;
  shutdown: () => void;
  queryNgAvailability: () => void;
  ngAvailability: (config: { version: string | undefined | boolean; prodMode: boolean }) => void;

  inspectorStart: () => void;
  inspectorEnd: () => void;

  getElementDirectivesProperties: (position: ElementPosition) => void;
  elementDirectivesProperties: (data: DirectivesProperties) => void;
  getNestedProperties: (position: DirectivePosition, path: string[]) => void;
  nestedProperties: (position: DirectivePosition, data: Properties, path: string[]) => void;

  setSelectedComponent: (position: ElementPosition) => void;

  componentTreeDirty: () => void;
  getLatestComponentExplorerView: (query: ComponentExplorerViewQuery) => void;
  latestComponentExplorerView: (view: ComponentExplorerView) => void;

  startProfiling: () => void;
  stopProfiling: () => void;
  sendProfilerChunk: (results: ProfilerFrame) => void;
  profilerResults: (results: ProfilerFrame) => void;
  highlightElementFromComponentTree: (position: ElementPosition) => void;
  removeHighlightFromElement: () => void;
  highlightComponentInTreeFromElement: (position: ElementPosition) => void;
  removeHighlightFromComponentTree: () => void;
}
