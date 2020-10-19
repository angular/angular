/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';
import {LinkerImportGenerator} from '../../linker_import_generator';
import {LinkerEnvironment} from '../linker_environment';

/**
 * This class represents (from the point of view of the `FileLinker`) the scope in which
 * statements and expressions related to a linked partial declaration will be emitted.
 *
 * It holds a copy of a `ConstantPool` that is used to capture any constant statements that need to
 * be emitted in this context.
 *
 * This implementation will emit the definition and the constant statements separately.
 */
export class EmitScope<TStatement, TExpression> {
  readonly constantPool = new ConstantPool();

  constructor(
      protected readonly ngImport: TExpression,
      protected readonly linkerEnvironment: LinkerEnvironment<TStatement, TExpression>) {}

  /**
   * Translate the given Output AST definition expression into a generic `TExpression`.
   *
   * Use a `LinkerImportGenerator` to handle any imports in the definition.
   */
  translateDefinition(definition: o.Expression): TExpression {
    return this.linkerEnvironment.translator.translateExpression(
        definition, new LinkerImportGenerator(this.ngImport));
  }

  /**
   * Return any constant statements that are shared between all uses of this `EmitScope`.
   */
  getConstantStatements(): TStatement[] {
    const {translator} = this.linkerEnvironment;
    const importGenerator = new LinkerImportGenerator(this.ngImport);
    return this.constantPool.statements.map(
        statement => translator.translateStatement(statement, importGenerator));
  }
}
