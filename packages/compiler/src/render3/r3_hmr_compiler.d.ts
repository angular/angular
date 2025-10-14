/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../output/output_ast';
/** Metadata necessary to compile HMR-related code call. */
export interface R3HmrMetadata {
    /** Component class for which HMR is being enabled. */
    type: o.Expression;
    /** Name of the component class. */
    className: string;
    /** File path of the component class. */
    filePath: string;
    /**
     * When the compiler generates new imports, they get produced as namespace imports
     * (e.g. import * as i0 from '@angular/core'). These namespaces have to be captured and passed
     * along to the update callback.
     */
    namespaceDependencies: R3HmrNamespaceDependency[];
    /**
     * HMR update functions cannot contain imports so any locals the generated code depends on
     * (e.g. references to imports within the same file or imported symbols) have to be passed in
     * as function parameters. This array contains the names and runtime representation of the locals.
     */
    localDependencies: {
        name: string;
        runtimeRepresentation: o.Expression;
    }[];
}
/** HMR dependency on a namespace import. */
export interface R3HmrNamespaceDependency {
    /** Module name of the import. */
    moduleName: string;
    /**
     * Name under which to refer to the namespace inside
     * HMR-related code. Must be a valid JS identifier.
     */
    assignedName: string;
}
/**
 * Compiles the expression that initializes HMR for a class.
 * @param meta HMR metadata extracted from the class.
 */
export declare function compileHmrInitializer(meta: R3HmrMetadata): o.Expression;
/**
 * Compiles the HMR update callback for a class.
 * @param definitions Compiled definitions for the class (e.g. `defineComponent` calls).
 * @param constantStatements Supporting constants statements that were generated alongside
 *  the definition.
 * @param meta HMR metadata extracted from the class.
 */
export declare function compileHmrUpdateCallback(definitions: {
    name: string;
    initializer: o.Expression | null;
    statements: o.Statement[];
}[], constantStatements: o.Statement[], meta: R3HmrMetadata): o.DeclareFunctionStmt;
