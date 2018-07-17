/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider} from '../../core';
import {RendererType2} from '../../render/api';
import {Type} from '../../type';
import {CssSelectorList} from './projection';

/**
 * Definition of what a template rendering function should look like.
 */
export type ComponentTemplate<T> = {
  (rf: RenderFlags, ctx: T, ...parentCtx: ({} | null)[]): void; ngPrivateData?: never;
};

/**
 * Definition of what a query function should look like.
 */
export type ComponentQuery<T> = ComponentTemplate<T>;

/**
 * Flags passed into template functions to determine which blocks (i.e. creation, update)
 * should be executed.
 *
 * Typically, a template runs both the creation block and the update block on initialization and
 * subsequent runs only execute the update block. However, dynamically created views require that
 * the creation block be executed separately from the update block (for backwards compat).
 */
export const enum RenderFlags {
  /* Whether to run the creation block (e.g. create elements and directives) */
  Create = 0b01,

  /* Whether to run the update block (e.g. refresh bindings) */
  Update = 0b10
}

/**
 * A subclass of `Type` which has a static `ngComponentDef`:`ComponentDef` field making it
 * consumable for rendering.
 */
export interface ComponentType<T> extends Type<T> { ngComponentDef: never; }

/**
 * A subclass of `Type` which has a static `ngDirectiveDef`:`DirectiveDef` field making it
 * consumable for rendering.
 */
export interface DirectiveType<T> extends Type<T> { ngDirectiveDef: never; }

export const enum DirectiveDefFlags {ContentQuery = 0b10}

/**
 * A subclass of `Type` which has a static `ngPipeDef`:`PipeDef` field making it
 * consumable for rendering.
 */
export interface PipeType<T> extends Type<T> { ngPipeDef: never; }

/**
 * A version of {@link DirectiveDef} that represents the runtime type shape only, and excludes
 * metadata parameters.
 */
export type DirectiveDefInternal<T> = DirectiveDef<T, string>;

/**
 * Runtime link information for Directives.
 *
 * This is internal data structure used by the render to link
 * directives into templates.
 *
 * NOTE: Always use `defineDirective` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 *
 * @param Selector type metadata specifying the selector of the directive or component
 *
 * See: {@link defineDirective}
 */
export interface DirectiveDef<T, Selector extends string> {
  /** Token representing the directive. Used by DI. */
  type: Type<T>;

  /** Function that makes a directive public to the DI system. */
  diPublic: ((def: DirectiveDef<T, string>) => void)|null;

  /** The selectors that will be used to match nodes to this directive. */
  selectors: CssSelectorList;

  /**
   * A dictionary mapping the inputs' minified property names to their public API names, which
   * are their aliases if any, or their original unminified property names
   * (as in `@Input('alias') propertyName: any;`).
   */
  readonly inputs: {[P in keyof T]: string};

  /**
   * @deprecated This is only here because `NgOnChanges` incorrectly uses declared name instead of
   * public or minified name.
   */
  readonly declaredInputs: {[P in keyof T]: P};

  /**
   * A dictionary mapping the outputs' minified property names to their public API names, which
   * are their aliases if any, or their original unminified property names
   * (as in `@Output('alias') propertyName: any;`).
   */
  readonly outputs: {[P in keyof T]: P};

  /**
   * Name under which the directive is exported (for use with local references in template)
   */
  readonly exportAs: string|null;

  /**
   * Factory function used to create a new directive instance.
   *
   * Usually returns the directive instance, but if the directive has a content query,
   * it instead returns an array that contains the instance as well as content query data.
   */
  factory(): T|[T];

  /**
   * Function to create instances of content queries associated with a given directive.
   */
  contentQueries: (() => void)|null;

  /** Refreshes content queries associated with directives in a given view */
  contentQueriesRefresh: ((directiveIndex: number, queryIndex: number) => void)|null;

  /** Refreshes host bindings on the associated directive. */
  hostBindings: ((directiveIndex: number, elementIndex: number) => void)|null;

  /**
   * Static attributes to set on host element.
   *
   * Even indices: attribute name
   * Odd indices: attribute value
   */
  attributes: string[]|null;

  /* The following are lifecycle hooks for this component */
  onInit: (() => void)|null;
  doCheck: (() => void)|null;
  afterContentInit: (() => void)|null;
  afterContentChecked: (() => void)|null;
  afterViewInit: (() => void)|null;
  afterViewChecked: (() => void)|null;
  onDestroy: (() => void)|null;

  /**
   * The features applied to this directive
   */
  features: DirectiveDefFeature[]|null;
}

/**
 * A version of {@link ComponentDef} that represents the runtime type shape only, and excludes
 * metadata parameters.
 */
export type ComponentDefInternal<T> = ComponentDef<T, string>;

/**
 * Runtime link information for Components.
 *
 * This is internal data structure used by the render to link
 * components into templates.
 *
 * NOTE: Always use `defineComponent` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 *
 * See: {@link defineComponent}
 */
export interface ComponentDef<T, Selector extends string> extends DirectiveDef<T, Selector> {
  /**
   * The View template of the component.
   */
  readonly template: ComponentTemplate<T>;

  /**
   * Query-related instructions for a component.
   */
  readonly viewQuery: ComponentQuery<T>|null;

  /**
   * Renderer type data of the component.
   */
  readonly rendererType: RendererType2|null;

  /** Whether or not this component's ChangeDetectionStrategy is OnPush */
  readonly onPush: boolean;

  /**
   * Defines the set of injectable providers that are visible to a Directive and its content DOM
   * children.
   */
  readonly providers?: Provider[];

  /**
   * Defines the set of injectable providers that are visible to a Directive and its view DOM
   * children only.
   */
  readonly viewProviders?: Provider[];

  /**
   * Registry of directives and components that may be found in this view.
   *
   * The property is either an array of `DirectiveDef`s or a function which returns the array of
   * `DirectiveDef`s. The function is necessary to be able to support forward declarations.
   */
  directiveDefs: DirectiveDefListOrFactory|null;

  /**
   * Registry of pipes that may be found in this view.
   *
   * The property is either an array of `PipeDefs`s or a function which returns the array of
   * `PipeDefs`s. The function is necessary to be able to support forward declarations.
   */
  pipeDefs: PipeDefListOrFactory|null;
}

/**
 * Runtime link information for Pipes.
 *
 * This is internal data structure used by the renderer to link
 * pipes into templates.
 *
 * NOTE: Always use `definePipe` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 *
 * See: {@link definePipe}
 */
export interface PipeDef<T, S extends string> {
  /**
   * Pipe name.
   *
   * Used to resolve pipe in templates.
   */
  name: S;

  /**
   * Factory function used to create a new pipe instance.
   */
  factory: () => T;

  /**
   * Whether or not the pipe is pure.
   *
   * Pure pipes result only depends on the pipe input and not on internal
   * state of the pipe.
   */
  pure: boolean;

  /* The following are lifecycle hooks for this pipe */
  onDestroy: (() => void)|null;
}

export type PipeDefInternal<T> = PipeDef<T, string>;

export type DirectiveDefFeature = <T>(directiveDef: DirectiveDef<T, string>) => void;
export type ComponentDefFeature = <T>(componentDef: ComponentDef<T, string>) => void;

/**
 * Type used for directiveDefs on component definition.
 *
 * The function is necessary to be able to support forward declarations.
 */
export type DirectiveDefListOrFactory = (() => DirectiveDefList) | DirectiveDefList;

export type DirectiveDefList = (DirectiveDef<any, string>| ComponentDef<any, string>)[];

export type DirectiveTypesOrFactory = (() => DirectiveTypeList) | DirectiveTypeList;

export type DirectiveTypeList =
    (DirectiveDef<any, string>| ComponentDef<any, string>|
     Type<any>/* Type as workaround for: Microsoft/TypeScript/issues/4881 */)[];

/**
 * Type used for PipeDefs on component definition.
 *
 * The function is necessary to be able to support forward declarations.
 */
export type PipeDefListOrFactory = (() => PipeDefList) | PipeDefList;

export type PipeDefList = PipeDefInternal<any>[];

export type PipeTypesOrFactory = (() => DirectiveTypeList) | DirectiveTypeList;

export type PipeTypeList =
    (PipeDefInternal<any>|
     Type<any>/* Type as workaround for: Microsoft/TypeScript/issues/4881 */)[];


// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;

export const enum InitialStylingFlags {
  VALUES_MODE = 0b1,
}
