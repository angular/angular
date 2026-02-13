/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ImportFlags, Reference, ReferenceEmitter} from '../../imports';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {ImportManager, translateExpression} from '../../translator';
import {
  TcbDirectiveMetadata,
  TcbPipeMetadata,
  TypeCheckId,
  TypeCheckingConfig,
  TypeCtorMetadata,
} from '../api';

import {ReferenceEmitEnvironment} from './reference_emit_environment';
import {tsDeclareVariable} from './ts_util';
import {generateTypeCtorDeclarationFn, requiresInlineTypeCtor} from './type_constructor';
import {TypeParameterEmitter} from './type_parameter_emitter';

/**
 * A context which hosts one or more Type Check Blocks (TCBs).
 *
 * An `Environment` supports the generation of TCBs by tracking necessary imports, declarations of
 * type constructors, and other statements beyond the type-checking code within the TCB itself.
 * Through method calls on `Environment`, the TCB generator can request `ts.Expression`s which
 * reference declarations in the `Environment` for these artifacts`.
 *
 * `Environment` can be used in a standalone fashion, or can be extended to support more specialized
 * usage.
 */
export class Environment extends ReferenceEmitEnvironment {
  private nextIds = {
    pipeInst: 1,
    typeCtor: 1,
  };

  private typeCtors = new Map<string, ts.Expression>();
  protected typeCtorStatements: ts.Statement[] = [];

  private pipeInsts = new Map<string, ts.Expression>();
  protected pipeInstStatements: ts.Statement[] = [];

  constructor(
    readonly config: TypeCheckingConfig,
    importManager: ImportManager,
    refEmitter: ReferenceEmitter,
    reflector: ReflectionHost,
    contextFile: ts.SourceFile,
  ) {
    super(importManager, refEmitter, reflector, contextFile);
  }

  /**
   * Get an expression referring to a type constructor for the given directive.
   *
   * Depending on the shape of the directive itself, this could be either a reference to a declared
   * type constructor, or to an inline type constructor.
   */
  typeCtorFor(dir: TcbDirectiveMetadata): ts.Expression {
    const key = dir.ref.moduleName ? `${dir.ref.moduleName}#${dir.ref.name}` : dir.ref.name;
    if (this.typeCtors.has(key)) {
      return this.typeCtors.get(key)!;
    }

    if (dir.hasRequiresInlineTypeCtor) {
      // The constructor has already been created inline, we just need to construct a reference to
      // it.
      const typeCtorExpr = ts.factory.createPropertyAccessExpression(
        this.referenceTcbValue(dir.ref),
        'ngTypeCtor',
      );
      this.typeCtors.set(key, typeCtorExpr);
      return typeCtorExpr;
    } else {
      const fnName = `_ctor${this.nextIds.typeCtor++}`;
      const nodeTypeRef = this.referenceTcbType(dir.ref);
      if (!ts.isTypeReferenceNode(nodeTypeRef)) {
        throw new Error(`Expected TypeReferenceNode from reference to ${dir.ref.name}`);
      }
      const meta: TypeCtorMetadata = {
        fnName,
        body: true,
        fields: {
          inputs: dir.inputs,
          // TODO: support queries
        },
        coercedInputFields: dir.coercedInputFields,
      };

      const typeParams = dir.typeParameters || undefined;
      const typeCtor = generateTypeCtorDeclarationFn(this, meta, nodeTypeRef.typeName, typeParams);
      this.typeCtorStatements.push(typeCtor);
      const fnId = ts.factory.createIdentifier(fnName);
      this.typeCtors.set(key, fnId);
      return fnId;
    }
  }

  /*
   * Get an expression referring to an instance of the given pipe.
   */
  pipeInst(pipe: TcbPipeMetadata): ts.Expression {
    const key = pipe.ref.moduleName ? `${pipe.ref.moduleName}#${pipe.ref.name}` : pipe.ref.name;
    if (this.pipeInsts.has(key)) {
      return this.pipeInsts.get(key)!;
    }

    const pipeType = this.referenceTcbType(pipe.ref);
    const pipeInstId = ts.factory.createIdentifier(`_pipe${this.nextIds.pipeInst++}`);

    this.pipeInstStatements.push(tsDeclareVariable(pipeInstId, pipeType));
    this.pipeInsts.set(key, pipeInstId);

    return pipeInstId;
  }

  getPreludeStatements(): ts.Statement[] {
    return [...this.pipeInstStatements, ...this.typeCtorStatements];
  }
}
