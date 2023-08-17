/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '../../../constant_pool';
import * as o from '../../../output/output_ast';
import * as ir from '../ir';

/**
 * A compilation unit is compiled into a template function.
 * Some example units are views and host bindings.
 */
export abstract class CompilationUnit {
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
  abstract readonly job: CompilationJob;

  constructor(readonly xref: ir.XrefId) {}

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

  /**
   * Name of the function which will be generated for this unit.
   *
   * May be `null` if not yet determined.
   */
  fnName: string|null = null;

  /**
   * Number of variable slots used within this view, or `null` if variables have not yet been
   * counted.
   */
  vars: number|null = null;
}

export interface CompilationJob {
  get units(): Iterable<CompilationUnit>;

  get fnSuffix(): string;

  /**
   * Whether to compile in compatibility mode, to imitate the output of `TemplateDefinitionBuilder`.
   */
  compatibility: ir.CompatibilityMode;

  componentName: string;

  /**
   * The root compilation unit, such as the component's template, or the host binding's compilation
   * unit.
   */
  root: CompilationUnit;

  /**
   * The constant pool for the job, which will be transformed into a constant array on the emitted
   * function.
   */
  pool: ConstantPool;

  /**
   * Generate a new unique `ir.XrefId` in this job.
   */
  allocateXrefId(): ir.XrefId;
}

export class HostBindingCompilationJob extends CompilationUnit implements CompilationJob {
  readonly fnSuffix = 'HostBindings';

  readonly units = [this];

  /**
   * Tracks the next `ir.XrefId` which can be assigned as template structures are ingested.
   */
  private nextXrefId: ir.XrefId;

  // TODO: Perhaps we should accept a reference to the enclosing component, and get the name from
  // there?
  constructor(
      readonly componentName: string, readonly pool: ConstantPool,
      readonly compatibility: ir.CompatibilityMode) {
    super(0 as ir.XrefId);
    this.nextXrefId = 1 as ir.XrefId;
  }

  override get job() {
    return this;
  }

  get root() {
    return this;
  }

  allocateXrefId(): ir.XrefId {
    return this.nextXrefId++ as ir.XrefId;
  }
}

/**
 * Compilation-in-progress of a whole component's template, including the main template and any
 * embedded views or host bindings.
 */
export class ComponentCompilationJob implements CompilationJob {
  readonly fnSuffix = 'Template';

  /**
   * Tracks the next `ir.XrefId` which can be assigned as template structures are ingested.
   */
  private nextXrefId: ir.XrefId = 0 as ir.XrefId;

  /**
   * Map of view IDs to `ViewCompilation`s.
   */
  readonly views = new Map<ir.XrefId, ViewCompilationUnit>();

  get units(): Iterable<ViewCompilationUnit> {
    return this.views.values();
  }

  /**
   * Constant expressions used by operations within this component's compilation.
   *
   * This will eventually become the `consts` array in the component definition.
   */
  readonly consts: o.Expression[] = [];

  /**
   * The root view, representing the component's template.
   */
  readonly root: ViewCompilationUnit;

  constructor(
      readonly componentName: string, readonly pool: ConstantPool,
      readonly compatibility: ir.CompatibilityMode) {
    // Allocate the root view.
    const root = new ViewCompilationUnit(this, this.allocateXrefId(), null);
    this.views.set(root.xref, root);
    this.root = root;
  }

  /**
   * Add a `ViewCompilation` for a new embedded view to this compilation.
   */
  allocateView(parent: ir.XrefId): ViewCompilationUnit {
    const view = new ViewCompilationUnit(this, this.allocateXrefId(), parent);
    this.views.set(view.xref, view);
    return view;
  }

  /**
   * Generate a new unique `ir.XrefId` in this job.
   */
  allocateXrefId(): ir.XrefId {
    return this.nextXrefId++ as ir.XrefId;
  }

  /**
   * Add a constant `o.Expression` to the compilation and return its index in the `consts` array.
   */
  addConst(newConst: o.Expression): ir.ConstIndex {
    for (let idx = 0; idx < this.consts.length; idx++) {
      if (this.consts[idx].isEquivalent(newConst)) {
        return idx as ir.ConstIndex;
      }
    }
    const idx = this.consts.length;
    this.consts.push(newConst);
    return idx as ir.ConstIndex;
  }
}

/**
 * Compilation-in-progress of an individual view within a template.
 */
export class ViewCompilationUnit extends CompilationUnit {
  constructor(
      readonly job: ComponentCompilationJob, xref: ir.XrefId, readonly parent: ir.XrefId|null) {
    super(xref);
  }

  /**
   * Map of declared variables available within this view to the property on the context object
   * which they alias.
   */
  readonly contextVariables = new Map<string, string>();

  /**
   * Number of declaration slots used within this view, or `null` if slots have not yet been
   * allocated.
   */
  decls: number|null = null;

  get compatibility(): ir.CompatibilityMode {
    return this.job.compatibility;
  }
}
