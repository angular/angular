/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Attention:
// This file duplicates types and values from @angular/core
// so that we are able to make @angular/compiler independent of @angular/core.
// This is important to prevent a build cycle, as @angular/core needs to
// be compiled with the compiler.

export interface Inject { token: any; }
export const createInject = makeMetadataFactory<Inject>('Inject', (token: any) => ({token}));
export const createInjectionToken =
    makeMetadataFactory<object>('InjectionToken', (desc: string) => ({_desc: desc}));

export interface Attribute { attributeName?: string; }
export const createAttribute =
    makeMetadataFactory<Attribute>('Attribute', (attributeName?: string) => ({attributeName}));

export interface Query {
  descendants: boolean;
  first: boolean;
  read: any;
  isViewQuery: boolean;
  selector: any;
}

export const createContentChildren = makeMetadataFactory<Query>(
    'ContentChildren',
    (selector?: any, data: any = {}) =>
        ({selector, first: false, isViewQuery: false, descendants: false, ...data}));
export const createContentChild = makeMetadataFactory<Query>(
    'ContentChild', (selector?: any, data: any = {}) =>
                        ({selector, first: true, isViewQuery: false, descendants: true, ...data}));
export const createViewChildren = makeMetadataFactory<Query>(
    'ViewChildren', (selector?: any, data: any = {}) =>
                        ({selector, first: false, isViewQuery: true, descendants: true, ...data}));
export const createViewChild = makeMetadataFactory<Query>(
    'ViewChild', (selector: any, data: any) =>
                     ({selector, first: true, isViewQuery: true, descendants: true, ...data}));

export interface Directive {
  selector?: string;
  inputs?: string[];
  outputs?: string[];
  host?: {[key: string]: string};
  providers?: Provider[];
  exportAs?: string;
  queries?: {[key: string]: any};
}
export const createDirective =
    makeMetadataFactory<Directive>('Directive', (dir: Directive = {}) => dir);

export interface Component extends Directive {
  changeDetection?: ChangeDetectionStrategy;
  viewProviders?: Provider[];
  moduleId?: string;
  templateUrl?: string;
  template?: string;
  styleUrls?: string[];
  styles?: string[];
  animations?: any[];
  encapsulation?: ViewEncapsulation;
  interpolation?: [string, string];
  entryComponents?: Array<Type|any[]>;
  preserveWhitespaces?: boolean;
}
export enum ViewEncapsulation {
  Emulated = 0,
  Native = 1,
  None = 2
}

export enum ChangeDetectionStrategy {
  OnPush = 0,
  Default = 1
}

export const createComponent = makeMetadataFactory<Component>(
    'Component', (c: Component = {}) => ({changeDetection: ChangeDetectionStrategy.Default, ...c}));

export interface Pipe {
  name: string;
  pure?: boolean;
}
export const createPipe = makeMetadataFactory<Pipe>('Pipe', (p: Pipe) => ({pure: true, ...p}));

export interface Input { bindingPropertyName?: string; }
export const createInput =
    makeMetadataFactory<Input>('Input', (bindingPropertyName?: string) => ({bindingPropertyName}));

export interface Output { bindingPropertyName?: string; }
export const createOutput = makeMetadataFactory<Output>(
    'Output', (bindingPropertyName?: string) => ({bindingPropertyName}));

export interface HostBinding { hostPropertyName?: string; }
export const createHostBinding = makeMetadataFactory<HostBinding>(
    'HostBinding', (hostPropertyName?: string) => ({hostPropertyName}));

export interface HostListener {
  eventName?: string;
  args?: string[];
}
export const createHostListener = makeMetadataFactory<HostListener>(
    'HostListener', (eventName?: string, args?: string[]) => ({eventName, args}));

export interface NgModule {
  providers?: Provider[];
  declarations?: Array<Type|any[]>;
  imports?: Array<Type|ModuleWithProviders|any[]>;
  exports?: Array<Type|any[]>;
  entryComponents?: Array<Type|any[]>;
  bootstrap?: Array<Type|any[]>;
  schemas?: Array<SchemaMetadata|any[]>;
  id?: string;
}
export const createNgModule =
    makeMetadataFactory<NgModule>('NgModule', (ngModule: NgModule) => ngModule);

export interface ModuleWithProviders {
  ngModule: Type;
  providers?: Provider[];
}

export interface SchemaMetadata { name: string; }

export const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata = {
  name: 'custom-elements'
};

export const NO_ERRORS_SCHEMA: SchemaMetadata = {
  name: 'no-errors-schema'
};

export const createOptional = makeMetadataFactory('Optional');
export const createInjectable = makeMetadataFactory('Injectable');
export const createSelf = makeMetadataFactory('Self');
export const createSkipSelf = makeMetadataFactory('SkipSelf');
export const createHost = makeMetadataFactory('Host');

export interface Type extends Function { new (...args: any[]): any; }
export const Type = Function;

export enum SecurityContext {
  NONE = 0,
  HTML = 1,
  STYLE = 2,
  SCRIPT = 3,
  URL = 4,
  RESOURCE_URL = 5,
}

export type Provider = any;

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
  CatQuery = TypeContentQuery | TypeViewQuery,

  // mutually exclusive values...
  Types = CatRenderNode | TypeNgContent | TypePipe | CatPureExpression | CatProvider | CatQuery
}

export const enum DepFlags {
  None = 0,
  SkipSelf = 1 << 0,
  Optional = 1 << 1,
  Value = 2 << 2,
}

export const enum ArgumentType {Inline = 0, Dynamic = 1}

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

export const enum QueryBindingType {First = 0, All = 1}

export const enum QueryValueType {
  ElementRef = 0,
  RenderElement = 1,
  TemplateRef = 2,
  ViewContainerRef = 3,
  Provider = 4
}

export const enum ViewFlags {
  None = 0,
  OnPush = 1 << 1,
}

export enum MissingTranslationStrategy {
  Error = 0,
  Warning = 1,
  Ignore = 2,
}

export interface MetadataFactory<T> {
  (...args: any[]): T;
  isTypeOf(obj: any): obj is T;
  ngMetadataName: string;
}

function makeMetadataFactory<T>(name: string, props?: (...args: any[]) => T): MetadataFactory<T> {
  const factory: any = (...args: any[]) => {
    const values = props ? props(...args) : {};
    return {
      ngMetadataName: name,
      ...values,
    };
  };
  factory.isTypeOf = (obj: any) => obj && obj.ngMetadataName === name;
  factory.ngMetadataName = name;
  return factory;
}
