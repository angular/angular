/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DataSlot} from './aspect/data_slot';
import {Id} from './node';

/**
 * Tracks information about the named entities defined at a particular level of the template.
 *
 * Each template/embedded view may define a number of named entities: variables, local references,
 * etc. As part of converting the template into IR, this information is extracted and stored in a
 * `Scope` for that particular view.
 *
 * The `Scope` can be used to retrieve a singleton mutable metadata object for each entity defined
 * in the template. This allows transformation stages to both access information about the named
 * entity, and tag it with additional context for later stages to consume.
 */
export interface Scope {
  /**
   * Map of entity names defined in this template to their target metadata.
   */
  readonly targets: Map<string, Target>;

  readonly parent: Scope|null;

  /**
   * Look up `name` in the context of this scope.
   *
   * `name` might refer to an entity that's defined at this level of the template, or at a higher
   * level (in a parent template).
   *
   * If no entity with the given name is found, then `name` is assumed to refer to a "root context"
   * property - a property of the component for which the template is declared.
   */
  lookup(name: string): Target;

  /**
   * Look up a child template within this scope by its `Id`.
   */
  getChild(id: Id): Scope;
}

/**
 * The kind of entity a target represents.
 */
export enum TargetKind {
  /**
   * The entity is a local reference (#ref).
   */
  Reference,

  /**
   * The entity is a variable declaration made when declaring an embedded view.
   */
  Variable,

  /**
   * The entity refers to a property read from the root context (component property).
   */
  RootContext,

  /**
   * The entity refers to `$event`.
   */
  Event,
}

/**
 * Metadata specific to a local reference entity.
 */
export interface Reference {
  kind: TargetKind.Reference;

  /**
   * The runtime index in the data array where the value of this reference will be stored, or `null`
   * if it has not yet been set.
   */
  slot: DataSlot|null;

  /**
   * Name of the local reference.
   */
  name: string;

  /**
   * Value of the local reference, such as the `exportAs` of a directive.
   */
  value: string;
}

/**
 * Metadata specific to a template context variable.
 */
export interface Variable {
  kind: TargetKind.Variable;

  /**
   * The `Id` of the template which declared this context variable.
   */
  template: Id;

  /**
   * The property name of the template context object to which this variable refers.
   */
  value: string;
}

/**
 * Metadata which indicates that the targeted value is a property of the root context (component
 * class).
 *
 * This metadata is effectively a singleton - there is no mutable metadata for a component property
 * target.
 */
export interface RootContext {
  kind: TargetKind.RootContext;
}

/**
 * Metadata which indicates that the targeted value is the event value of an event binding.
 *
 * This likely indicates the target was `$event` in the template.
 *
 * This metadata is effectively a singleton - there is no mutable metadata for an event target.
 */
export interface Event {
  kind: TargetKind.Event;
}

/**
 * Metadata of a named entity within the template, disambiguated by its `kind` field.
 */
export type Target = Reference|Variable|RootContext|Event;
