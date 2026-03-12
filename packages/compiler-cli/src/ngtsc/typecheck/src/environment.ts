/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ReferenceEmitter} from '../../imports';
import {ReflectionHost} from '../../reflection';
import {ImportManager} from '../../translator';
import {
  TcbDirectiveMetadata,
  TcbPipeMetadata,
  TcbReferenceKey,
  TcbReferenceMetadata,
  TypeCheckingConfig,
  TypeCtorMetadata,
} from '../api';

import {ReferenceEmitEnvironment} from './reference_emit_environment';
import {generateTypeCtorDeclarationFn} from './type_constructor';
import {declareVariable, TcbExpr} from './ops/codegen';

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

  private typeCtors = new Map<TcbReferenceKey, string>();
  protected typeCtorStatements: TcbExpr[] = [];

  private pipeInsts = new Map<TcbReferenceKey, string>();
  protected pipeInstStatements: TcbExpr[] = [];

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
  typeCtorFor(dir: TcbDirectiveMetadata): TcbExpr {
    const key = getTcbReferenceKey(dir.ref);
    if (this.typeCtors.has(key)) {
      return new TcbExpr(this.typeCtors.get(key)!);
    }

    if (dir.hasRequiresInlineTypeCtor) {
      // The constructor has already been created inline, we just need to construct a reference to
      // it.
      const typeCtorExpr = `${this.referenceTcbValue(dir.ref).print()}.ngTypeCtor`;
      this.typeCtors.set(key, typeCtorExpr);
      return new TcbExpr(typeCtorExpr);
    } else {
      const fnName = `_ctor${this.nextIds.typeCtor++}`;
      const nodeTypeRef = this.referenceTcbValue(dir.ref);
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
      const typeCtor = generateTypeCtorDeclarationFn(this, meta, nodeTypeRef, typeParams);
      this.typeCtorStatements.push(typeCtor);
      this.typeCtors.set(key, fnName);
      return new TcbExpr(fnName);
    }
  }

  /*
   * Get an expression referring to an instance of the given pipe.
   */
  pipeInst(pipe: TcbPipeMetadata): TcbExpr {
    const key = getTcbReferenceKey(pipe.ref);
    if (this.pipeInsts.has(key)) {
      return new TcbExpr(this.pipeInsts.get(key)!);
    }

    const pipeType = this.referenceTcbValue(pipe.ref);
    const pipeInstId = `_pipe${this.nextIds.pipeInst++}`;

    this.pipeInsts.set(key, pipeInstId);
    this.pipeInstStatements.push(declareVariable(new TcbExpr(pipeInstId), pipeType));
    return new TcbExpr(pipeInstId);
  }

  getPreludeStatements(): TcbExpr[] {
    return [...this.pipeInstStatements, ...this.typeCtorStatements];
  }
}

export function getTcbReferenceKey(ref: TcbReferenceMetadata): TcbReferenceKey {
  if (ref.nodeFilePath !== undefined && ref.nodeNameSpan !== undefined) {
    return `${ref.nodeFilePath}#${ref.nodeNameSpan.start}` as TcbReferenceKey;
  }
  return (ref.moduleName ? `${ref.moduleName}#${ref.name}` : ref.name) as TcbReferenceKey;
}
