/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../ir';

/**
 * Compilation-in-progress of a whole component's template, including the main template and any
 * embedded views or host bindings.
 */
export class ComponentCompilation {
  /**
   * Tracks the next `ir.XrefId` which can be assigned as template structures are ingested.
   */
  private nextXrefId: ir.XrefId = 0 as ir.XrefId;

  /**
   * Map of view IDs to `ViewCompilation`s.
   */
  readonly views = new Map<ir.XrefId, ViewCompilation>();

  /**
   * The root view, representing the component's template.
   */
  readonly root: ViewCompilation;

  constructor(readonly componentName: string) {
    // Allocate the root view.
    const root = new ViewCompilation(this, this.allocateXrefId(), null);
    this.views.set(root.xref, root);
    this.root = root;
  }

  /**
   * Add a `ViewCompilation` for a new embedded view to this compilation.
   */
  allocateView(parent: ir.XrefId): ViewCompilation {
    const view = new ViewCompilation(this, this.allocateXrefId(), parent);
    this.views.set(view.xref, view);
    return view;
  }

  /**
   * Generate a new unique `ir.XrefId`.
   */
  allocateXrefId(): ir.XrefId {
    return this.nextXrefId++ as ir.XrefId;
  }
}

/**
 * Compilation-in-progress of an individual view within a template.
 */
export class ViewCompilation {
  constructor(
      readonly tpl: ComponentCompilation, readonly xref: ir.XrefId,
      readonly parent: ir.XrefId|null) {}

  /**
   * List of creation operations for this view.
   *
   * Creation operations may internally contain other operations, including update operations.
   */
  readonly create = new ir.OpList<ir.CreateOp>();

  /**
   * List of update operations for this view.
   */
  readonly update = new ir.OpList<ir.UpdateOp>();

  /**
   * Map of declared variables available within this view to the property on the context object
   * which they alias.
   */
  readonly contextVariables = new Map<string, string>();

  /**
   * Iterate over all `ir.Op`s within this view.
   *
   * Some operations may have child operations, which this iterator will visit.
   */
  * ops(): Generator<ir.CreateOp|ir.UpdateOp> {
    for (const op of this.create) {
      yield op;
      if (op.kind === ir.OpKind.Listener) {
        for (const listenerOp of op.handlerOps) {
          yield listenerOp;
        }
      }
    }
    for (const op of this.update) {
      yield op;
    }
  }
}
