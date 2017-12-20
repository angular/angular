/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RendererType2} from '../render/api';
import {Type} from '../type';
import {resolveRendererType2} from '../view/util';



/**
 * Definition of what a template rendering function should look like.
 */
export type ComponentTemplate<T> = {
  (ctx: T, creationMode: boolean): void; ngStaticData?: never;
};
export type EmbeddedTemplate<T> = (ctx: T) => void;

export interface ComponentType<T> extends Type<T> { ngComponentDef: ComponentDef<T>; }

export interface DirectiveType<T> extends Type<T> { ngDirectiveDef: DirectiveDef<T>; }

export const enum DirectiveDefFlags {ContentQuery = 0b10}

/**
 * `DirectiveDef` is a compiled version of the Directive used by the renderer instructions.
 */
export interface DirectiveDef<T> {
  /**
   * Token representing the directive. Used by DI.
   */
  type: Type<T>;

  /** Function that makes a directive public to the DI system. */
  diPublic: ((def: DirectiveDef<any>) => void)|null;

  /**
   * List of inputs which are part of the components public API.
   *
   * The key is minified property name whereas the value is the original unminified name.
   */
  inputs: {[P in keyof T]: P};

  /**
   * List of outputs which are part of the components public API.
   *
   * The key is minified property name whereas the value is the original unminified name.=
   */
  outputs: {[P in keyof T]: P};

  /**
   * List of methods which are part of the components public API.
   *
   * The key is minified property name whereas the value is the original unminified name.
   */
  methods: {[P in keyof T]: P};

  /**
   * factory function used to create a new directive instance.
   *
   * NOTE: this property is short (1 char) because it is used in
   * component templates which is sensitive to size.
   */
  n(): T;

  /**
   * Refresh method. Used by the containing component to signal
   * to the directive that it should be refreshed. (Directives
   * usually call life cycle methods at this point.)
   *
   * NOTE: this property is short (1 char) because it is used in
   * component templates which is sensitive to size.
   *
   * @param directiveIndex index of the directive in the containing template
   * @param elementIndex index of an host element for a given directive.
   */
  r(directiveIndex: number, elementIndex: number): void;
}

export interface ComponentDef<T> extends DirectiveDef<T> {
  /**
   * Refresh method. Used by the containing component to signal
   * to the directive that it should be refreshed. (Directives
   * usually call life cycle methods at this point.)
   *
   * NOTE: this property is short (1 char) because it is used in
   * component templates which is sensitive to size.
   *
   * @param directiveIndex index of the directive in the containing template
   * @param elementIndex index of an host element for a given component.
   */
  r(directiveIndex: number, elementIndex: number): void;

  /**
   * The tag name which should be used by the component.
   *
   * NOTE: only used with component directives.
   */
  tag: string;

  /**
   * The View template of the component.
   *
   * NOTE: only used with component directives.
   */
  template: ComponentTemplate<T>;

  /**
   * Renderer type data of the component.
   *
   * NOTE: only used with component directives.
   */
  rendererType: RendererType2|null;
}

export interface DirectiveDefArgs<T> {
  type: Type<T>;
  factory: () => T;
  refresh?: (directiveIndex: number, elementIndex: number) => void;
  inputs?: {[P in keyof T]?: string};
  outputs?: {[P in keyof T]?: string};
  methods?: {[P in keyof T]?: string};
  features?: DirectiveDefFeature[];
}

export interface ComponentDefArgs<T> extends DirectiveDefArgs<T> {
  tag: string;
  template: ComponentTemplate<T>;
  refresh?: (directiveIndex: number, elementIndex: number) => void;
  features?: ComponentDefFeature[];
  rendererType?: RendererType2;
}

export type DirectiveDefFeature = <T>(directiveDef: DirectiveDef<T>) => void;
export type ComponentDefFeature = <T>(directiveDef: DirectiveDef<T>) => void;
