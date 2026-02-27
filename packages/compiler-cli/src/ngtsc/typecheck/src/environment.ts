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
import {tsDeclareVariable} from './ts_util';
import {generateTypeCtorDeclarationFn} from './type_constructor';

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

  private typeCtors = new Map<TcbReferenceKey, ts.Expression>();
  protected typeCtorStatements: ts.Statement[] = [];

  private pipeInsts = new Map<TcbReferenceKey, ts.Expression>();
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
    const key = getTcbReferenceKey(dir.ref);
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
    const key = getTcbReferenceKey(pipe.ref);
    if (this.pipeInsts.has(key)) {
      return this.pipeInsts.get(key)!;
    }

    // Note: It's important that we do not try to evaluate the `pipe.typeParameters` here and pad them
    // out with `any` type arguments.
    // If we supply `any` to a generic pipe (e.g. `var _pipe1: MyPipe<any>;`), it destroys the generic
    // constraints and degrades the `transform` signature. When they are omitted entirely, TypeScript
    // implicitly flags an error, which the Angular compiler filters out, and crucially recovers by
    // falling back to constraint inference (e.g. `var _pipe1: MyPipe;` infers bounds safely).
    let pipeType = this.referenceTcbType(pipe.ref);
    const pipeInstId = ts.factory.createIdentifier(`_pipe${this.nextIds.pipeInst++}`);

    this.pipeInstStatements.push(tsDeclareVariable(pipeInstId, pipeType));
    this.pipeInsts.set(key, pipeInstId);

    return pipeInstId;
  }

  getPreludeStatements(): ts.Statement[] {
    return [...this.pipeInstStatements, ...this.typeCtorStatements];
  }
}

export function getTcbReferenceKey(ref: TcbReferenceMetadata): TcbReferenceKey {
  if (ref.nodeFilePath !== undefined && ref.nodeNameSpan !== undefined) {
    return `${ref.nodeFilePath}#${ref.nodeNameSpan.start}` as TcbReferenceKey;
  }
  return (ref.moduleName ? `${ref.moduleName}#${ref.name}` : ref.name) as TcbReferenceKey;
}
