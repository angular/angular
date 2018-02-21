/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeTransform} from '../../change_detection/pipe_transform';
import {RendererType2} from '../../render/api';
import {Type} from '../../type';
import {resolveRendererType2} from '../../view/util';

/**
 * Definition of what a template rendering function should look like.
 */
export type ComponentTemplate<T> = {
  (ctx: T, creationMode: boolean): void; ngPrivateData?: never;
};

export interface ComponentType<T> extends Type<T> { ngComponentDef: ComponentDef<T>; }

export interface DirectiveType<T> extends Type<T> { ngDirectiveDef: DirectiveDef<T>; }

export const enum DirectiveDefFlags {ContentQuery = 0b10}

export interface PipeType<T> extends Type<T> { ngPipeDef: PipeDef<T>; }

/**
 * `DirectiveDef` is a compiled version of the Directive used by the renderer instructions.
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
   * A dictionary mapping the methods' minified names to their original unminified ones.
   */
  readonly methods: {[P in keyof T]: P};

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
}

/**
 *
 */
export interface PipeDef<T> {
  /**
   * factory function used to create a new directive instance.
   *
   * NOTE: this property is short (1 char) because it is used in
   * component templates which is sensitive to size.
   */
  n: () => PipeTransform;

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


export interface DirectiveDefArgs<T> {
  type: Type<T>;
  factory: () => T | [T];
  attributes?: string[];
  inputs?: {[P in keyof T]?: string};
  inputsPropertyName?: {[P in keyof T]?: string};
  outputs?: {[P in keyof T]?: string};
  methods?: {[P in keyof T]?: string};
  features?: DirectiveDefFeature[];
  hostBindings?: (directiveIndex: number, elementIndex: number) => void;
  exportAs?: string;
}

export interface ComponentDefArgs<T> extends DirectiveDefArgs<T> {
  tag: string;
  template: ComponentTemplate<T>;
  features?: ComponentDefFeature[];
  rendererType?: RendererType2;
}

export type DirectiveDefFeature = <T>(directiveDef: DirectiveDef<T>) => void;
export type ComponentDefFeature = <T>(directiveDef: DirectiveDef<T>) => void;

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
