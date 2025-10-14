/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ConstantPool } from '../../../constant_pool';
import * as o from '../../../output/output_ast';
import { R3ComponentDeferMetadata } from '../../../render3/view/api';
import * as ir from '../ir';
export declare enum CompilationJobKind {
    Tmpl = 0,
    Host = 1,
    Both = 2
}
/** Possible modes in which a component's template can be compiled. */
export declare enum TemplateCompilationMode {
    /** Supports the full instruction set, including directives. */
    Full = 0,
    /** Uses a narrower instruction set that doesn't support directives and allows optimizations. */
    DomOnly = 1
}
/**
 * An entire ongoing compilation, which will result in one or more template functions when complete.
 * Contains one or more corresponding compilation units.
 */
export declare abstract class CompilationJob {
    readonly componentName: string;
    readonly pool: ConstantPool;
    readonly compatibility: ir.CompatibilityMode;
    readonly mode: TemplateCompilationMode;
    constructor(componentName: string, pool: ConstantPool, compatibility: ir.CompatibilityMode, mode: TemplateCompilationMode);
    kind: CompilationJobKind;
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
    allocateXrefId(): ir.XrefId;
    /**
     * Tracks the next `ir.XrefId` which can be assigned as template structures are ingested.
     */
    private nextXrefId;
}
/**
 * Compilation-in-progress of a whole component's template, including the main template and any
 * embedded views or host bindings.
 */
export declare class ComponentCompilationJob extends CompilationJob {
    readonly relativeContextFilePath: string;
    readonly i18nUseExternalIds: boolean;
    readonly deferMeta: R3ComponentDeferMetadata;
    readonly allDeferrableDepsFn: o.ReadVarExpr | null;
    readonly relativeTemplatePath: string | null;
    readonly enableDebugLocations: boolean;
    constructor(componentName: string, pool: ConstantPool, compatibility: ir.CompatibilityMode, mode: TemplateCompilationMode, relativeContextFilePath: string, i18nUseExternalIds: boolean, deferMeta: R3ComponentDeferMetadata, allDeferrableDepsFn: o.ReadVarExpr | null, relativeTemplatePath: string | null, enableDebugLocations: boolean);
    kind: CompilationJobKind;
    readonly fnSuffix: string;
    /**
     * The root view, representing the component's template.
     */
    readonly root: ViewCompilationUnit;
    readonly views: Map<ir.XrefId, ViewCompilationUnit>;
    /**
     * Causes ngContentSelectors to be emitted, for content projection slots in the view. Possibly a
     * reference into the constant pool.
     */
    contentSelectors: o.Expression | null;
    /**
     * Add a `ViewCompilation` for a new embedded view to this compilation.
     */
    allocateView(parent: ir.XrefId): ViewCompilationUnit;
    get units(): Iterable<ViewCompilationUnit>;
    /**
     * Add a constant `o.Expression` to the compilation and return its index in the `consts` array.
     */
    addConst(newConst: o.Expression, initializers?: o.Statement[]): ir.ConstIndex;
    /**
     * Constant expressions used by operations within this component's compilation.
     *
     * This will eventually become the `consts` array in the component definition.
     */
    readonly consts: o.Expression[];
    /**
     * Initialization statements needed to set up the consts.
     */
    readonly constsInitializers: o.Statement[];
}
/**
 * A compilation unit is compiled into a template function. Some example units are views and host
 * bindings.
 */
export declare abstract class CompilationUnit {
    readonly xref: ir.XrefId;
    constructor(xref: ir.XrefId);
    /**
     * List of creation operations for this view.
     *
     * Creation operations may internally contain other operations, including update operations.
     */
    readonly create: ir.OpList<ir.CreateOp>;
    /**
     * List of update operations for this view.
     */
    readonly update: ir.OpList<ir.UpdateOp>;
    /**
     * The enclosing job, which might contain several individual compilation units.
     */
    abstract readonly job: CompilationJob;
    /**
     * Name of the function which will be generated for this unit.
     *
     * May be `null` if not yet determined.
     */
    fnName: string | null;
    /**
     * Number of variable slots used within this view, or `null` if variables have not yet been
     * counted.
     */
    vars: number | null;
    /**
     * Iterate over all `ir.Op`s within this view.
     *
     * Some operations may have child operations, which this iterator will visit.
     */
    ops(): Generator<ir.CreateOp | ir.UpdateOp>;
}
/**
 * Compilation-in-progress of an individual view within a template.
 */
export declare class ViewCompilationUnit extends CompilationUnit {
    readonly job: ComponentCompilationJob;
    readonly parent: ir.XrefId | null;
    constructor(job: ComponentCompilationJob, xref: ir.XrefId, parent: ir.XrefId | null);
    /**
     * Map of declared variables available within this view to the property on the context object
     * which they alias.
     */
    readonly contextVariables: Map<string, string>;
    /**
     * Set of aliases available within this view. An alias is a variable whose provided expression is
     * inlined at every location it is used. It may also depend on context variables, by name.
     */
    readonly aliases: Set<ir.AliasVariable>;
    /**
     * Number of declaration slots used within this view, or `null` if slots have not yet been
     * allocated.
     */
    decls: number | null;
}
/**
 * Compilation-in-progress of a host binding, which contains a single unit for that host binding.
 */
export declare class HostBindingCompilationJob extends CompilationJob {
    constructor(componentName: string, pool: ConstantPool, compatibility: ir.CompatibilityMode, mode: TemplateCompilationMode);
    kind: CompilationJobKind;
    readonly fnSuffix: string;
    readonly root: HostBindingCompilationUnit;
    get units(): Iterable<HostBindingCompilationUnit>;
}
export declare class HostBindingCompilationUnit extends CompilationUnit {
    readonly job: HostBindingCompilationJob;
    constructor(job: HostBindingCompilationJob);
    /**
     * Much like an element can have attributes, so can a host binding function.
     */
    attributes: o.LiteralArrayExpr | null;
}
