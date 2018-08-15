/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ExpressionType, ExternalExpr, Type, WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {ImportFlags, NOOP_DEFAULT_IMPORT_RECORDER, Reference, ReferenceEmitter} from '../../imports';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {ImportManager, translateExpression, translateType} from '../../translator';
import {TypeCheckableDirectiveMeta, TypeCheckingConfig, TypeCtorMetadata} from '../api';

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
export class Environment {
  private nextIds = {
    pipeInst: 1,
    typeCtor: 1,
  };

  private typeCtors = new Map<ClassDeclaration, ts.Expression>();
  protected typeCtorStatements: ts.Statement[] = [];

  private pipeInsts = new Map<ClassDeclaration, ts.Expression>();
  protected pipeInstStatements: ts.Statement[] = [];

  private outputHelperIdent: ts.Identifier|null = null;
  protected helperStatements: ts.Statement[] = [];

  constructor(
      readonly config: TypeCheckingConfig, protected importManager: ImportManager,
      private refEmitter: ReferenceEmitter, private reflector: ReflectionHost,
      protected contextFile: ts.SourceFile) {}

  /**
   * Get an expression referring to a type constructor for the given directive.
   *
   * Depending on the shape of the directive itself, this could be either a reference to a declared
   * type constructor, or to an inline type constructor.
   */
  typeCtorFor(dir: TypeCheckableDirectiveMeta): ts.Expression {
    const dirRef = dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;
    const node = dirRef.node;
    if (this.typeCtors.has(node)) {
      return this.typeCtors.get(node)!;
    }

    if (requiresInlineTypeCtor(node, this.reflector)) {
      // The constructor has already been created inline, we just need to construct a reference to
      // it.
      const ref = this.reference(dirRef);
      const typeCtorExpr = ts.createPropertyAccess(ref, 'ngTypeCtor');
      this.typeCtors.set(node, typeCtorExpr);
      return typeCtorExpr;
    } else {
      const fnName = `_ctor${this.nextIds.typeCtor++}`;
      const nodeTypeRef = this.referenceType(dirRef);
      if (!ts.isTypeReferenceNode(nodeTypeRef)) {
        throw new Error(`Expected TypeReferenceNode from reference to ${dirRef.debugName}`);
      }
      const meta: TypeCtorMetadata = {
        fnName,
        body: true,
        fields: {
          inputs: Object.keys(dir.inputs),
          outputs: Object.keys(dir.outputs),
          // TODO: support queries
          queries: dir.queries,
        },
        coercedInputFields: dir.coercedInputFields,
      };
      const typeParams = this.emitTypeParameters(node);
      const typeCtor = generateTypeCtorDeclarationFn(
          node, meta, nodeTypeRef.typeName, typeParams, this.reflector);
      this.typeCtorStatements.push(typeCtor);
      const fnId = ts.createIdentifier(fnName);
      this.typeCtors.set(node, fnId);
      return fnId;
    }
  }

  /*
   * Get an expression referring to an instance of the given pipe.
   */
  pipeInst(ref: Reference<ClassDeclaration<ts.ClassDeclaration>>): ts.Expression {
    if (this.pipeInsts.has(ref.node)) {
      return this.pipeInsts.get(ref.node)!;
    }

    const pipeType = this.referenceType(ref);
    const pipeInstId = ts.createIdentifier(`_pipe${this.nextIds.pipeInst++}`);

    this.pipeInstStatements.push(tsDeclareVariable(pipeInstId, pipeType));
    this.pipeInsts.set(ref.node, pipeInstId);

    return pipeInstId;
  }

  /**
   * Declares a helper function to be able to cast directive outputs of type `EventEmitter<T>` to
   * have an accurate `subscribe()` method that properly carries over the generic type `T` into the
   * listener function passed as argument to `subscribe`. This is done to work around a typing
   * deficiency in `EventEmitter.subscribe`, where the listener function is typed as any.
   */
  declareOutputHelper(): ts.Expression {
    if (this.outputHelperIdent !== null) {
      return this.outputHelperIdent;
    }

    const outputHelperIdent = ts.createIdentifier('_outputHelper');
    const genericTypeDecl = ts.createTypeParameterDeclaration('T');
    const genericTypeRef = ts.createTypeReferenceNode('T', /* typeParameters */ undefined);

    const eventEmitter = this.referenceExternalType(
        '@angular/core', 'EventEmitter', [new ExpressionType(new WrappedNodeExpr(genericTypeRef))]);

    // Declare a type that has a `subscribe` method that carries over type `T` as parameter
    // into the callback. The below code generates the following type literal:
    // `{subscribe(cb: (event: T) => any): void;}`
    const observableLike = ts.createTypeLiteralNode([ts.createMethodSignature(
        /* typeParameters */ undefined,
        /* parameters */[ts.createParameter(
            /* decorators */ undefined,
            /* modifiers */ undefined,
            /* dotDotDotToken */ undefined,
            /* name */ 'cb',
            /* questionToken */ undefined,
            /* type */
            ts.createFunctionTypeNode(
                /* typeParameters */ undefined,
                /* parameters */[ts.createParameter(
                    /* decorators */ undefined,
                    /* modifiers */ undefined,
                    /* dotDotDotToken */ undefined,
                    /* name */ 'event',
                    /* questionToken */ undefined,
                    /* type */ genericTypeRef)],
                /* type */ ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)))],
        /* type */ ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        /* name */ 'subscribe',
        /* questionToken */ undefined)]);

    // Declares the first signature of `_outputHelper` that matches arguments of type
    // `EventEmitter`, to convert them into `observableLike` defined above. The following
    // statement is generated:
    // `declare function _outputHelper<T>(output: EventEmitter<T>): observableLike;`
    this.helperStatements.push(ts.createFunctionDeclaration(
        /* decorators */ undefined,
        /* modifiers */[ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
        /* asteriskToken */ undefined,
        /* name */ outputHelperIdent,
        /* typeParameters */[genericTypeDecl],
        /* parameters */[ts.createParameter(
            /* decorators */ undefined,
            /* modifiers */ undefined,
            /* dotDotDotToken */ undefined,
            /* name */ 'output',
            /* questionToken */ undefined,
            /* type */ eventEmitter)],
        /* type */ observableLike,
        /* body */ undefined));

    // Declares the second signature of `_outputHelper` that matches all other argument types,
    // i.e. ensures type identity for output types other than `EventEmitter`. This corresponds
    // with the following statement:
    // `declare function _outputHelper<T>(output: T): T;`
    this.helperStatements.push(ts.createFunctionDeclaration(
        /* decorators */ undefined,
        /* modifiers */[ts.createModifier(ts.SyntaxKind.DeclareKeyword)],
        /* asteriskToken */ undefined,
        /* name */ outputHelperIdent,
        /* typeParameters */[genericTypeDecl],
        /* parameters */[ts.createParameter(
            /* decorators */ undefined,
            /* modifiers */ undefined,
            /* dotDotDotToken */ undefined,
            /* name */ 'output',
            /* questionToken */ undefined,
            /* type */ genericTypeRef)],
        /* type */ genericTypeRef,
        /* body */ undefined));

    return this.outputHelperIdent = outputHelperIdent;
  }

  /**
   * Generate a `ts.Expression` that references the given node.
   *
   * This may involve importing the node into the file if it's not declared there already.
   */
  reference(ref: Reference<ClassDeclaration<ts.ClassDeclaration>>): ts.Expression {
    // Disable aliasing for imports generated in a template type-checking context, as there is no
    // guarantee that any alias re-exports exist in the .d.ts files. It's safe to use direct imports
    // in these cases as there is no strict dependency checking during the template type-checking
    // pass.
    const ngExpr = this.refEmitter.emit(ref, this.contextFile, ImportFlags.NoAliasing);

    // Use `translateExpression` to convert the `Expression` into a `ts.Expression`.
    return translateExpression(
        ngExpr, this.importManager, NOOP_DEFAULT_IMPORT_RECORDER, ts.ScriptTarget.ES2015);
  }

  /**
   * Generate a `ts.TypeNode` that references the given node as a type.
   *
   * This may involve importing the node into the file if it's not declared there already.
   */
  referenceType(ref: Reference): ts.TypeNode {
    const ngExpr = this.refEmitter.emit(
        ref, this.contextFile, ImportFlags.NoAliasing | ImportFlags.AllowTypeImports);

    // Create an `ExpressionType` from the `Expression` and translate it via `translateType`.
    // TODO(alxhub): support references to types with generic arguments in a clean way.
    return translateType(new ExpressionType(ngExpr), this.importManager);
  }

  private emitTypeParameters(declaration: ClassDeclaration<ts.ClassDeclaration>):
      ts.TypeParameterDeclaration[]|undefined {
    const emitter = new TypeParameterEmitter(declaration.typeParameters, this.reflector);
    return emitter.emit(ref => this.referenceType(ref));
  }

  /**
   * Generate a `ts.TypeNode` that references a given type from the provided module.
   *
   * This will involve importing the type into the file, and will also add type parameters if
   * provided.
   */
  referenceExternalType(moduleName: string, name: string, typeParams?: Type[]): ts.TypeNode {
    const external = new ExternalExpr({moduleName, name});
    return translateType(new ExpressionType(external, null, typeParams), this.importManager);
  }

  getPreludeStatements(): ts.Statement[] {
    return [
      ...this.helperStatements,
      ...this.pipeInstStatements,
      ...this.typeCtorStatements,
    ];
  }
}
