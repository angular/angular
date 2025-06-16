/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ConstantPool} from '../../../constant_pool';
import * as o from '../../../output/output_ast';
import {R3ComponentDeferMetadata} from '../../../render3/view/api';
import * as ir from '../ir';

export enum CompilationJobKind {
  Tmpl,
  Host,
  Both, // A special value used to indicate that some logic applies to both compilation types
}

/** Possible modes in which a component's template can be compiled. */
export enum TemplateCompilationMode {
  /** Supports the full instruction set, including directives. */
  Full,

  /** Uses a narrower instruction set that doesn't support directives and allows optimizations. */
  DomOnly,
}

/**
 * An entire ongoing compilation, which will result in one or more template functions when complete.
 * Contains one or more corresponding compilation units.
 */
export abstract class CompilationJob {
  constructor(
    readonly componentName: string,
    readonly pool: ConstantPool,
    readonly compatibility: ir.CompatibilityMode,
    readonly mode: TemplateCompilationMode,
  ) {}

  kind: CompilationJobKind = CompilationJobKind.Both;

  /**
   * A compilation job will contain one or more compilation units.
   */
  abstract get units(): Iterable<CompilationUnit>;

  /**
   * The root compilation unit, such as the component's template, or the host binding's compilation
   * unit.
   */
  abstract root: CompilationUnit;

  /**
   * A unique string used to identify this kind of job, and generate the template function (as a
   * suffix of the name).
   */
  abstract fnSuffix: string;

  /**
   * Generate a new unique `ir.XrefId` in this job.
   */
  allocateXrefId(): ir.XrefId {
    return this.nextXrefId++ as ir.XrefId;
  }

  /**
   * Tracks the next `ir.XrefId` which can be assigned as template structures are ingested.
   */
  private nextXrefId: ir.XrefId = 0 as ir.XrefId;
}

/**
 * Compilation-in-progress of a whole component's template, including the main template and any
 * embedded views or host bindings.
 */
export class ComponentCompilationJob extends CompilationJob {
  constructor(
    componentName: string,
    pool: ConstantPool,
    compatibility: ir.CompatibilityMode,
    mode: TemplateCompilationMode,
    readonly relativeContextFilePath: string,
    readonly i18nUseExternalIds: boolean,
    readonly deferMeta: R3ComponentDeferMetadata,
    readonly allDeferrableDepsFn: o.ReadVarExpr | null,
    readonly relativeTemplatePath: string | null,
    readonly enableDebugLocations: boolean,
  ) {
    super(componentName, pool, compatibility, mode);
    this.root = new ViewCompilationUnit(this, this.allocateXrefId(), null);
    this.views.set(this.root.xref, this.root);
  }

  override kind = CompilationJobKind.Tmpl;

  override readonly fnSuffix: string = 'Template';

  /**
   * The root view, representing the component's template.
   */
  override readonly root: ViewCompilationUnit;

  readonly views = new Map<ir.XrefId, ViewCompilationUnit>();

  /**
   * Causes ngContentSelectors to be emitted, for content projection slots in the view. Possibly a
   * reference into the constant pool.
   */
  public contentSelectors: o.Expression | null = null;

  /**
   * Add a `ViewCompilation` for a new embedded view to this compilation.
   */
  allocateView(parent: ir.XrefId): ViewCompilationUnit {
    const view = new ViewCompilationUnit(this, this.allocateXrefId(), parent);
    this.views.set(view.xref, view);
    return view;
  }

  override get units(): Iterable<ViewCompilationUnit> {
    return this.views.values();
  }

  /**
   * Add a constant `o.Expression` to the compilation and return its index in the `consts` array.
   */
  addConst(newConst: o.Expression, initializers?: o.Statement[]): ir.ConstIndex {
    for (let idx = 0; idx < this.consts.length; idx++) {
      if (this.consts[idx].isEquivalent(newConst)) {
        return idx as ir.ConstIndex;
      }
    }
    const idx = this.consts.length;
    this.consts.push(newConst);
    if (initializers) {
      this.constsInitializers.push(...initializers);
    }
    return idx as ir.ConstIndex;
  }

  /**
   * Constant expressions used by operations within this component's compilation.
   *
   * This will eventually become the `consts` array in the component definition.
   */
  readonly consts: o.Expression[] = [];

  /**
   * Initialization statements needed to set up the consts.
   */
  readonly constsInitializers: o.Statement[] = [];
}

/**
 * A compilation unit is compiled into a template function. Some example units are views and host
 * bindings.
 */
export abstract class CompilationUnit {
  constructor(readonly xref: ir.XrefId) {}

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
   * The enclosing job, which might contain several individual compilation units.
   */
  abstract readonly job: CompilationJob;

  /**
   * Name of the function which will be generated for this unit.
   *
   * May be `null` if not yet determined.
   */
  fnName: string | null = null;

  /**
   * Number of variable slots used within this view, or `null` if variables have not yet been
   * counted.
   */
  vars: number | null = null;

  /**
   * Iterate over all `ir.Op`s within this view.
   *
   * Some operations may have child operations, which this iterator will visit.
   */
  *ops(): Generator<ir.CreateOp | ir.UpdateOp> {
    for (const op of this.create) {
      yield op;
      if (op.kind === ir.OpKind.Listener || op.kind === ir.OpKind.TwoWayListener) {
        for (const listenerOp of op.handlerOps) {
          yield listenerOp;
        }
      } else if (op.kind === ir.OpKind.RepeaterCreate && op.trackByOps !== null) {
        for (const trackOp of op.trackByOps) {
          yield trackOp;
        }
      }
    }
    for (const op of this.update) {
      yield op;
    }
  }
}

/**
 * Compilation-in-progress of an individual view within a template.
 */
export class ViewCompilationUnit extends CompilationUnit {
  constructor(
    readonly job: ComponentCompilationJob,
    xref: ir.XrefId,
    readonly parent: ir.XrefId | null,
  ) {
    super(xref);
  }

  /**
   * Map of declared variables available within this view to the property on the context object
   * which they alias.
   */
  readonly contextVariables = new Map<string, string>();

  /**
   * Set of aliases available within this view. An alias is a variable whose provided expression is
   * inlined at every location it is used. It may also depend on context variables, by name.
   */
  readonly aliases = new Set<ir.AliasVariable>();

  /**
   * Number of declaration slots used within this view, or `null` if slots have not yet been
   * allocated.
   */
  decls: number | null = null;
}

/**
 * Compilation-in-progress of a host binding, which contains a single unit for that host binding.
 */
export class HostBindingCompilationJob extends CompilationJob {
  constructor(
    componentName: string,
    pool: ConstantPool,
    compatibility: ir.CompatibilityMode,
    mode: TemplateCompilationMode,
  ) {
    super(componentName, pool, compatibility, mode);
    this.root = new HostBindingCompilationUnit(this);
  }

  override kind = CompilationJobKind.Host;

  override readonly fnSuffix: string = 'HostBindings';

  override readonly root: HostBindingCompilationUnit;

  override get units(): Iterable<HostBindingCompilationUnit> {
    return [this.root];
  }
}

export class HostBindingCompilationUnit extends CompilationUnit {
  constructor(readonly job: HostBindingCompilationJob) {
    super(0 as ir.XrefId);
  }

  /**
   * Much like an element can have attributes, so can a host binding function.
   */
  attributes: o.LiteralArrayExpr | null = null;
}
