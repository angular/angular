/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy} from '../../change_detection/constants';
import {PipeTransform} from '../../change_detection/pipe_transform';
import {Provider} from '../../core';
import {RendererType2} from '../../render/api';
import {Type} from '../../type';
import {resolveRendererType2} from '../../view/util';



/**
 * Definition of what a template rendering function should look like.
 */
export type ComponentTemplate<T> = {
  (ctx: T, creationMode: boolean): void; ngPrivateData?: never;
};

/**
 * A subclass of `Type` which has a static `ngComponentDef`:`ComponentDef` field making it
 * consumable for rendering.
 */
export interface ComponentType<T> extends Type<T> { ngComponentDef: ComponentDef<T>; }

/**
 * A subclass of `Type` which has a static `ngDirectiveDef`:`DirectiveDef` field making it
 * consumable for rendering.
 */
export interface DirectiveType<T> extends Type<T> { ngDirectiveDef: DirectiveDef<T>; }

export const enum DirectiveDefFlags {ContentQuery = 0b10}

/**
 * A subclass of `Type` which has a static `ngPipeDef`:`PipeDef` field making it
 * consumable for rendering.
 */
export interface PipeType<T> extends Type<T> { ngPipeDef: PipeDef<T>; }

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
 * See: {@link defineDirective}
 */
export interface DirectiveDef<T> {
  /** Token representing the directive. Used by DI. */
  type: Type<T>;

  /** Function that makes a directive public to the DI system. */
  diPublic: ((def: DirectiveDef<any>) => void)|null;

  /**
   * A dictionary mapping the inputs' minified property names to their public API names, which
   * are their aliases if any, or their original unminified property names
   * (as in `@Input('alias') propertyName: any;`).
   */
  readonly inputs: {[P in keyof T]: P};

  /**
   * A dictionary mapping the inputs' minified property names to the original unminified property
   * names.
   *
   * An entry is added if and only if the alias is different from the property name.
   */
  readonly inputsPropertyName: {[P in keyof T]: P};

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
   *
   * NOTE: this property is short (1 char) because it is used in
   * component templates which is sensitive to size.
   */
  n(): T|[T];

  /**
   * Refreshes host bindings on the associated directive. Also calls lifecycle hooks
   * like ngOnInit and ngDoCheck, if they are defined on the directive.
   */
  h(directiveIndex: number, elementIndex: number): void;

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
}

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
export interface ComponentDef<T> extends DirectiveDef<T> {
  /**
   * The tag name which should be used by the component.
   *
   * NOTE: only used with component directives.
   */
  readonly tag: string;

  /**
   * The View template of the component.
   *
   * NOTE: only used with component directives.
   */
  readonly template: ComponentTemplate<T>;

  /**
   * Renderer type data of the component.
   *
   * NOTE: only used with component directives.
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
export interface PipeDef<T> {
  /**
   * factory function used to create a new directive instance.
   *
   * NOTE: this property is short (1 char) because it is used in
   * component templates which is sensitive to size.
   */
  n: () => T;

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

/**
 * Arguments for `defineDirective`
 */
export interface DirectiveDefArgs<T> {
  /**
   * Directive type, needed to configure the injector.
   */
  type: Type<T>;

  /**
   * Factory method used to create an instance of directive.
   */
  factory: () => T | ({0: T} & any[]); /* trying to say T | [T, ...any] */

  /**
   * Static attributes to set on host element.
   *
   * Even indices: attribute name
   * Odd indices: attribute value
   */
  attributes?: string[];

  /**
   * A map of input names.
   *
   * The format is in: `{[actualPropertyName: string]:string}`.
   *
   * Which the minifier may translate to: `{[minifiedPropertyName: string]:string}`.
   *
   * This allows the render to re-construct the minified and non-minified names
   * of properties.
   */
  inputs?: {[P in keyof T]?: string};

  /**
   * TODO: Remove per https://github.com/angular/angular/issues/22591
   */
  inputsPropertyName?: {[P in keyof T]?: string};

  /**
   * A map of output names.
   *
   * The format is in: `{[actualPropertyName: string]:string}`.
   *
   * Which the minifier may translate to: `{[minifiedPropertyName: string]:string}`.
   *
   * This allows the render to re-construct the minified and non-minified names
   * of properties.
   */
  outputs?: {[P in keyof T]?: string};

  /**
   * A list of optional features to apply.
   *
   * See: {@link NgOnChangesFeature}, {@link PublicFeature}
   */
  features?: DirectiveDefFeature[];

  /**
   * Function executed by the parent template to allow child directive to apply host bindings.
   */
  hostBindings?: (directiveIndex: number, elementIndex: number) => void;

  /**
   * Defines the name that can be used in the template to assign this directive to a variable.
   *
   * See: {@link Directive.exportAs}
   */
  exportAs?: string;
}

/**
 * Arguments for `defineComponent`.
 */
export interface ComponentDefArgs<T> extends DirectiveDefArgs<T> {
  /**
   * HTML tag name to use in place where this component should be instantiated.
   */
  tag: string;

  /**
   * Template function use for rendering DOM.
   *
   * This function has following structure.
   *
   * ```
   * function Template<T>(ctx:T, creationMode: boolean) {
   *   if (creationMode) {
   *     // Contains creation mode instructions.
   *   }
   *   // Contains binding update instructions
   * }
   * ```
   *
   * Common instructions are:
   * Creation mode instructions:
   *  - `elementStart`, `elementEnd`
   *  - `text`
   *  - `container`
   *  - `listener`
   *
   * Binding update instructions:
   * - `bind`
   * - `elementAttribute`
   * - `elementProperty`
   * - `elementClass`
   * - `elementStyle`
   *
   */
  template: ComponentTemplate<T>;

  /**
   * A list of optional features to apply.
   *
   * See: {@link NgOnChancesFeature}, {@link PublicFeature}
   */
  features?: ComponentDefFeature[];

  rendererType?: RendererType2;

  changeDetection?: ChangeDetectionStrategy;

  /**
   * Defines the set of injectable objects that are visible to a Directive and its light DOM
   * children.
   */
  providers?: Provider[];

  /**
   * Defines the set of injectable objects that are visible to its view DOM children.
   */
  viewProviders?: Provider[];
}

export type DirectiveDefFeature = <T>(directiveDef: DirectiveDef<T>) => void;
export type ComponentDefFeature = <T>(componentDef: ComponentDef<T>) => void;

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
