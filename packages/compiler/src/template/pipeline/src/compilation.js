/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../ir';
export var CompilationJobKind;
(function (CompilationJobKind) {
  CompilationJobKind[(CompilationJobKind['Tmpl'] = 0)] = 'Tmpl';
  CompilationJobKind[(CompilationJobKind['Host'] = 1)] = 'Host';
  CompilationJobKind[(CompilationJobKind['Both'] = 2)] = 'Both';
})(CompilationJobKind || (CompilationJobKind = {}));
/** Possible modes in which a component's template can be compiled. */
export var TemplateCompilationMode;
(function (TemplateCompilationMode) {
  /** Supports the full instruction set, including directives. */
  TemplateCompilationMode[(TemplateCompilationMode['Full'] = 0)] = 'Full';
  /** Uses a narrower instruction set that doesn't support directives and allows optimizations. */
  TemplateCompilationMode[(TemplateCompilationMode['DomOnly'] = 1)] = 'DomOnly';
})(TemplateCompilationMode || (TemplateCompilationMode = {}));
/**
 * An entire ongoing compilation, which will result in one or more template functions when complete.
 * Contains one or more corresponding compilation units.
 */
export class CompilationJob {
  constructor(componentName, pool, compatibility, mode) {
    this.componentName = componentName;
    this.pool = pool;
    this.compatibility = compatibility;
    this.mode = mode;
    this.kind = CompilationJobKind.Both;
    /**
     * Tracks the next `ir.XrefId` which can be assigned as template structures are ingested.
     */
    this.nextXrefId = 0;
  }
  /**
   * Generate a new unique `ir.XrefId` in this job.
   */
  allocateXrefId() {
    return this.nextXrefId++;
  }
}
/**
 * Compilation-in-progress of a whole component's template, including the main template and any
 * embedded views or host bindings.
 */
export class ComponentCompilationJob extends CompilationJob {
  constructor(
    componentName,
    pool,
    compatibility,
    mode,
    relativeContextFilePath,
    i18nUseExternalIds,
    deferMeta,
    allDeferrableDepsFn,
    relativeTemplatePath,
    enableDebugLocations,
  ) {
    super(componentName, pool, compatibility, mode);
    this.relativeContextFilePath = relativeContextFilePath;
    this.i18nUseExternalIds = i18nUseExternalIds;
    this.deferMeta = deferMeta;
    this.allDeferrableDepsFn = allDeferrableDepsFn;
    this.relativeTemplatePath = relativeTemplatePath;
    this.enableDebugLocations = enableDebugLocations;
    this.kind = CompilationJobKind.Tmpl;
    this.fnSuffix = 'Template';
    this.views = new Map();
    /**
     * Causes ngContentSelectors to be emitted, for content projection slots in the view. Possibly a
     * reference into the constant pool.
     */
    this.contentSelectors = null;
    /**
     * Constant expressions used by operations within this component's compilation.
     *
     * This will eventually become the `consts` array in the component definition.
     */
    this.consts = [];
    /**
     * Initialization statements needed to set up the consts.
     */
    this.constsInitializers = [];
    this.root = new ViewCompilationUnit(this, this.allocateXrefId(), null);
    this.views.set(this.root.xref, this.root);
  }
  /**
   * Add a `ViewCompilation` for a new embedded view to this compilation.
   */
  allocateView(parent) {
    const view = new ViewCompilationUnit(this, this.allocateXrefId(), parent);
    this.views.set(view.xref, view);
    return view;
  }
  get units() {
    return this.views.values();
  }
  /**
   * Add a constant `o.Expression` to the compilation and return its index in the `consts` array.
   */
  addConst(newConst, initializers) {
    for (let idx = 0; idx < this.consts.length; idx++) {
      if (this.consts[idx].isEquivalent(newConst)) {
        return idx;
      }
    }
    const idx = this.consts.length;
    this.consts.push(newConst);
    if (initializers) {
      this.constsInitializers.push(...initializers);
    }
    return idx;
  }
}
/**
 * A compilation unit is compiled into a template function. Some example units are views and host
 * bindings.
 */
export class CompilationUnit {
  constructor(xref) {
    this.xref = xref;
    /**
     * List of creation operations for this view.
     *
     * Creation operations may internally contain other operations, including update operations.
     */
    this.create = new ir.OpList();
    /**
     * List of update operations for this view.
     */
    this.update = new ir.OpList();
    /**
     * Name of the function which will be generated for this unit.
     *
     * May be `null` if not yet determined.
     */
    this.fnName = null;
    /**
     * Number of variable slots used within this view, or `null` if variables have not yet been
     * counted.
     */
    this.vars = null;
  }
  /**
   * Iterate over all `ir.Op`s within this view.
   *
   * Some operations may have child operations, which this iterator will visit.
   */
  *ops() {
    for (const op of this.create) {
      yield op;
      if (
        op.kind === ir.OpKind.Listener ||
        op.kind === ir.OpKind.Animation ||
        op.kind === ir.OpKind.AnimationListener ||
        op.kind === ir.OpKind.TwoWayListener
      ) {
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
  constructor(job, xref, parent) {
    super(xref);
    this.job = job;
    this.parent = parent;
    /**
     * Map of declared variables available within this view to the property on the context object
     * which they alias.
     */
    this.contextVariables = new Map();
    /**
     * Set of aliases available within this view. An alias is a variable whose provided expression is
     * inlined at every location it is used. It may also depend on context variables, by name.
     */
    this.aliases = new Set();
    /**
     * Number of declaration slots used within this view, or `null` if slots have not yet been
     * allocated.
     */
    this.decls = null;
  }
}
/**
 * Compilation-in-progress of a host binding, which contains a single unit for that host binding.
 */
export class HostBindingCompilationJob extends CompilationJob {
  constructor(componentName, pool, compatibility, mode) {
    super(componentName, pool, compatibility, mode);
    this.kind = CompilationJobKind.Host;
    this.fnSuffix = 'HostBindings';
    this.root = new HostBindingCompilationUnit(this);
  }
  get units() {
    return [this.root];
  }
}
export class HostBindingCompilationUnit extends CompilationUnit {
  constructor(job) {
    super(0);
    this.job = job;
    /**
     * Much like an element can have attributes, so can a host binding function.
     */
    this.attributes = null;
  }
}
//# sourceMappingURL=compilation.js.map
