/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CreateList, Id, UpdateList} from '../node';

export const TemplateAspect = Symbol('TemplateAspect');
export const TemplateWithIdAspect = Symbol('TemplateWithIdAspect');

/**
 * Indicates that an entity represents a template definition (either a top-level component template
 * or an embedded view).
 *
 * This aspect abstracts over a template definition, allowing nested template structures to be
 * processed without depending on the specific `CreateNode` type(s) which represent embedded views.
 */
export interface TemplateAspect {
  [TemplateAspect]: true;

  /**
   * The list of `CreateNode`s for this template.
   */
  create: CreateList;

  /**
   * The list of `UpdateNode`s for this template.
   */
  update: UpdateList;

  /**
   * Number of `DataSlot`s used by this template (see `CreateSlotAspect`).
   */
  decls: number|null;

  /**
   * Number of update binding slots used by this template (see `BindingSlotConsumerAspect`).
   */
  vars: number|null;
}

/**
 * Indicates that a `CreateNode`, in addition to having `TemplateAspect` fields for the template
 * definition, also have an `Id`.
 */
export interface TemplateWithIdAspect extends TemplateAspect {
  [TemplateWithIdAspect]: true;

  /**
   * `Id` of the `CreateNode` which defines this embedded view.
   */
  id: Id;
}
