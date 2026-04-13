/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TypeCheckBlockMetadata, TypeCheckableDirectiveMeta} from '../api';
import {Environment} from './environment';
import {ImportFlags, ReferenceEmitKind, Reference} from '../../imports';
import {
  AbsoluteSourceSpan,
  ExternalExpr,
  TransplantedType,
  BoundTarget,
  ReferenceTarget,
  TmplAstElement,
  TmplAstTemplate,
  WrappedNodeExpr,
  ClassPropertyMapping,
  ConflictingHostDirectiveBinding,
  TcbGenericContextBehavior,
  TcbTypeCheckBlockMetadata,
  TcbDirectiveMetadata,
  TcbPipeMetadata,
  TcbTypeParameter,
  TcbReferenceMetadata,
  TcbReferenceKey,
  TcbComponentMetadata,
  TcbInputMapping,
} from '@angular/compiler';
import {InputMapping} from '../../metadata';
import {requiresInlineTypeCtor} from './type_constructor';
import {tempPrint} from './tcb_print';
import {generateTcbTypeParameters} from './tcb_util';
import {TypeParameterEmitter} from './type_parameter_emitter';
import {ClassDeclaration} from '../../reflection';
import ts from 'typescript';

/**
 * Adapts the compiler's `TypeCheckBlockMetadata` (which includes full TS AST nodes)
 * into a purely detached `TcbTypeCheckBlockMetadata` that can be mapped to JSON.
 */
export function adaptTypeCheckBlockMetadata(
  ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
  meta: TypeCheckBlockMetadata,
  env: Environment,
  genericContextBehavior: TcbGenericContextBehavior,
): {tcbMeta: TcbTypeCheckBlockMetadata; component: TcbComponentMetadata} {
  const refCache = new Map<Reference<ClassDeclaration>, TcbReferenceMetadata>();
  const dirCache = new Map<TypeCheckableDirectiveMeta, TcbDirectiveMetadata>();

  const extractRef = (ref: Reference<ClassDeclaration>) => {
    if (refCache.has(ref)) {
      return refCache.get(ref)!;
    }
    const result = extractReferenceMetadata(ref, env);
    refCache.set(ref, result);
    return result;
  };

  const convertDir = (dir: TypeCheckableDirectiveMeta): TcbDirectiveMetadata => {
    if (dirCache.has(dir)) return dirCache.get(dir)!;

    const tcbDir: TcbDirectiveMetadata = {
      isComponent: dir.isComponent,
      name: dir.name,
      selector: dir.selector,
      exportAs: dir.exportAs,
      inputs: ClassPropertyMapping.fromMappedObject<TcbInputMapping>(
        dir.inputs.toJointMappedObject((input: InputMapping) => {
          return {
            classPropertyName: input.classPropertyName,
            bindingPropertyName: input.bindingPropertyName,
            required: input.required,
            isSignal: input.isSignal,
            transformType: (() => {
              if (input.transform != null) {
                const node = env.referenceTransplantedType(
                  new TransplantedType(input.transform.type),
                );
                return tempPrint(node, env.contextFile);
              }
              return undefined;
            })(),
          };
        }),
      ),
      outputs: dir.outputs,
      isStructural: dir.isStructural,
      isStandalone: dir.isStandalone,
      isExplicitlyDeferred: dir.isExplicitlyDeferred,
      preserveWhitespaces: dir.preserveWhitespaces,
      ngContentSelectors: dir.ngContentSelectors,
      animationTriggerNames: dir.animationTriggerNames,
      ngTemplateGuards: dir.ngTemplateGuards,
      hasNgTemplateContextGuard: dir.hasNgTemplateContextGuard,
      hasNgFieldDirective:
        ts.isClassDeclaration(dir.ref.node) &&
        dir.ref.node.members.some(
          (member: ts.Node) =>
            ts.isPropertyDeclaration(member) &&
            ts.isComputedPropertyName(member.name) &&
            ts.isIdentifier(member.name.expression) &&
            member.name.expression.text === 'ɵNgFieldDirective',
        ),
      coercedInputFields: dir.coercedInputFields,
      restrictedInputFields: dir.restrictedInputFields,
      stringLiteralInputFields: dir.stringLiteralInputFields,
      undeclaredInputFields: dir.undeclaredInputFields,
      publicMethods: dir.publicMethods,
      matchSource: dir.matchSource,

      ref: extractRef(dir.ref as Reference<ClassDeclaration>),
      isGeneric: dir.isGeneric,
      requiresInlineTypeCtor: requiresInlineTypeCtor(
        dir.ref.node as ClassDeclaration<ts.ClassDeclaration>,
        env.reflector,
        env,
      ),
      ...adaptGenerics(
        dir.ref.node as ClassDeclaration<ts.ClassDeclaration>,
        env,
        // The directive that we're processing is its own dependency
        // so we should the same generic context behavior.
        extractRef(dir.ref).key === extractRef(ref).key
          ? genericContextBehavior
          : TcbGenericContextBehavior.UseEmitter,
      ),
    };

    dirCache.set(dir, tcbDir);
    return tcbDir;
  };

  const originalBoundTarget = meta.boundTarget.target;
  const adaptedBoundTarget: BoundTarget<TcbDirectiveMetadata> = {
    target: {
      template: originalBoundTarget.template,
      host: originalBoundTarget.host
        ? {
            node: originalBoundTarget.host.node,
            directives: originalBoundTarget.host.directives.map(convertDir),
          }
        : undefined,
    },
    getUsedDirectives: () => meta.boundTarget.getUsedDirectives().map(convertDir),
    getEagerlyUsedDirectives: () => meta.boundTarget.getEagerlyUsedDirectives().map(convertDir),
    getUsedPipes: () => meta.boundTarget.getUsedPipes(),
    getDirectivesOfNode: (node) => {
      const dirs = meta.boundTarget.getDirectivesOfNode(node);
      return dirs ? dirs.map(convertDir) : null;
    },
    getReferenceTarget: (ref) => {
      const target = meta.boundTarget.getReferenceTarget(ref);
      if (target && 'directive' in target) {
        return {
          directive: convertDir(target.directive as TypeCheckableDirectiveMeta),
          node: target.node,
        };
      }
      return target as ReferenceTarget<TcbDirectiveMetadata>;
    },
    getDeferredTriggerTarget: (b, t) => meta.boundTarget.getDeferredTriggerTarget(b, t),
    isDeferred: (node) => meta.boundTarget.isDeferred(node),
    referencedDirectiveExists: (name) => meta.boundTarget.referencedDirectiveExists(name),
    getConsumerOfBinding: (binding) => {
      const consumer = meta.boundTarget.getConsumerOfBinding(binding);
      if (consumer && (consumer as TypeCheckableDirectiveMeta).isComponent !== undefined) {
        return convertDir(consumer as TypeCheckableDirectiveMeta);
      }
      return consumer as TmplAstElement | TmplAstTemplate | null;
    },
    getExpressionTarget: (expr) => meta.boundTarget.getExpressionTarget(expr),
    getDefinitionNodeOfSymbol: (sym) => meta.boundTarget.getDefinitionNodeOfSymbol(sym),
    getNestingLevel: (node) => meta.boundTarget.getNestingLevel(node),
    getEntitiesInScope: (node) => meta.boundTarget.getEntitiesInScope(node),
    getEagerlyUsedPipes: () => meta.boundTarget.getEagerlyUsedPipes(),
    getDeferBlocks: () => meta.boundTarget.getDeferBlocks(),
    getConflictingHostDirectiveBindings: (node) =>
      meta.boundTarget.getConflictingHostDirectiveBindings(node) as
        | ConflictingHostDirectiveBinding<TcbDirectiveMetadata>[]
        | null,
  };

  const pipes = new Map<string, TcbPipeMetadata>();
  if (meta.pipes !== null) {
    for (const pipeName of meta.boundTarget.getUsedPipes()) {
      if (!meta.pipes.has(pipeName) || pipes.has(pipeName)) {
        continue;
      }
      const pipe = meta.pipes.get(pipeName)!;
      pipes.set(pipeName, {
        name: pipe.name!,
        ref: extractRef(pipe.ref as Reference<ClassDeclaration>),
        isExplicitlyDeferred: pipe.isExplicitlyDeferred,
      });
    }
  }

  return {
    tcbMeta: {
      id: meta.id,
      boundTarget: adaptedBoundTarget,
      pipes,
      schemas: meta.schemas,
      isStandalone: meta.isStandalone,
      preserveWhitespaces: meta.preserveWhitespaces,
    },
    component: {
      ref: extractRef(ref as Reference<ClassDeclaration>),
      ...adaptGenerics(ref.node, env, genericContextBehavior),
    },
  };
}

function adaptGenerics(
  node: ClassDeclaration<ts.ClassDeclaration>,
  env: Environment,
  genericContextBehavior: TcbGenericContextBehavior,
): {
  typeParameters: TcbTypeParameter[] | null;
  typeArguments: string[] | null;
} {
  let typeParameters: TcbTypeParameter[] | null;
  let typeArguments: string[] | null;

  if (node.typeParameters !== undefined && node.typeParameters.length > 0) {
    if (!env.config.useContextGenericType) {
      genericContextBehavior = TcbGenericContextBehavior.FallbackToAny;
    }

    switch (genericContextBehavior) {
      case TcbGenericContextBehavior.UseEmitter:
        const emitter = new TypeParameterEmitter(node.typeParameters, env.reflector);
        const emittedParams = emitter.canEmit((r) => env.canReferenceType(r))
          ? emitter.emit((typeRef) => env.referenceType(typeRef))
          : undefined;
        typeParameters = generateTcbTypeParameters(
          emittedParams || node.typeParameters,
          env.contextFile,
        );
        typeArguments = typeParameters.map((param) => param.name);
        break;
      case TcbGenericContextBehavior.CopyClassNodes:
        typeParameters = generateTcbTypeParameters(node.typeParameters, env.contextFile);
        typeArguments = typeParameters.map((param) => param.name);
        break;
      case TcbGenericContextBehavior.FallbackToAny:
        typeParameters = generateTcbTypeParameters(node.typeParameters, env.contextFile);
        typeArguments = new Array<string>(node.typeParameters.length).fill('any');
        break;
    }
  } else {
    typeParameters = typeArguments = null;
  }

  return {typeParameters, typeArguments};
}

function extractReferenceMetadata(
  ref: Reference<ClassDeclaration>,
  env: Environment,
): TcbReferenceMetadata {
  let name = ref.debugName || ref.node.name!.text;
  let moduleName = ref.ownedByModuleGuess;
  let unexportedDiagnostic: string | null = null;
  let isLocal = true;

  const emitted = env.refEmitter.emit(ref, env.contextFile, ImportFlags.NoAliasing);
  if (emitted.kind === ReferenceEmitKind.Success) {
    if (emitted.expression instanceof ExternalExpr) {
      name = emitted.expression.value.name!;
      moduleName = emitted.expression.value.moduleName;
      isLocal = false;
    } else if (emitted.expression instanceof WrappedNodeExpr) {
      const node = emitted.expression.node;
      const extractedName = extractNameFromExpr(node);
      if (extractedName !== null) {
        name = extractedName;
      }
    }
  } else if (emitted.kind === ReferenceEmitKind.Failed) {
    unexportedDiagnostic = emitted.reason;
    isLocal = false;
  }

  const nodeName = ref.node?.name as ts.Identifier | undefined;
  const nodeNameSpan = nodeName
    ? new AbsoluteSourceSpan(nodeName.getStart(), nodeName.getEnd())
    : undefined;
  const nodeFilePath = nodeName?.getSourceFile().fileName;
  let key: TcbReferenceKey;

  if (nodeFilePath !== undefined && nodeNameSpan !== undefined) {
    key = `${nodeFilePath}#${nodeNameSpan.start}` as TcbReferenceKey;
  } else {
    key = (moduleName ? `${moduleName}#${name}` : name) as TcbReferenceKey;
  }

  return {
    name,
    moduleName,
    isLocal,
    unexportedDiagnostic,
    nodeNameSpan,
    nodeFilePath,
    key,
  } satisfies TcbReferenceMetadata;
}

function extractNameFromExpr(node: ts.Node): string | null {
  if (ts.isIdentifier(node)) {
    return node.text;
  } else if (ts.isPropertyAccessExpression(node)) {
    const receiver = extractNameFromExpr(node.expression);
    return receiver !== null ? `${receiver}.${node.name.text}` : null;
  }
  return null;
}
