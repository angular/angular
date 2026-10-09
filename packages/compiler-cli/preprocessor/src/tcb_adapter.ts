/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  SelectorMatcher,
  SelectorlessMatcher,
  CssSelector,
  R3TargetBinder,
  TmplAstHostElement,
  ClassPropertyMapping,
  MatchSource,
  TcbComponentMetadata,
  TcbTypeCheckBlockMetadata,
  TcbDirectiveMetadata,
  TypeCheckId,
  createHostElement,
  HostObjectLiteralBinding,
  HostBindingDecorator,
  HostListenerDecorator,
  SourceNode,
  StaticSourceNode,
  TcbPipeMetadata,
  TcbInputMapping,
  TcbTypeParameter,
} from '@angular/compiler';

import type {TcbTargetInput, NgpTypeCheckingConfig} from './tcb.js';
import * as nga from './types.js';
import {createSpan, isStaticSourceNode} from './compiler-utils.js';

// PropertyMappingImpl is removed as we now use ClassPropertyMapping directly.

export function createInputPropertyMapping(
  metadata: nga.InputMetadata[] | null | undefined,
  content?: string,
): ClassPropertyMapping<TcbInputMapping> {
  const obj: Record<string, TcbInputMapping> = {};

  if (metadata) {
    for (const item of metadata) {
      const classProp = item.name;
      const bindingName = item.alias || classProp;
      const mapping: TcbInputMapping = {
        classPropertyName: classProp,
        bindingPropertyName: bindingName,
        isSignal: item.isSignal,
        required: item.required,
      };

      if (
        item.transform !== undefined &&
        item.transform.kind === 'type' &&
        item.transform.typeSpan &&
        content
      ) {
        mapping.transformType = content.substring(
          item.transform.typeSpan.start,
          item.transform.typeSpan.end,
        );
      }

      obj[classProp] = mapping;
    }
  }

  return ClassPropertyMapping.fromMappedObject<TcbInputMapping>(obj);
}

export function createOutputPropertyMapping(
  metadata: nga.OutputMetadata[] | null | undefined,
): ClassPropertyMapping<any> {
  const obj: Record<
    string,
    {classPropertyName: string; bindingPropertyName: string; isSignal: boolean}
  > = {};

  if (metadata) {
    for (const item of metadata) {
      const classProp = item.name;
      const bindingName = item.alias || classProp;

      obj[classProp] = {
        classPropertyName: classProp,
        bindingPropertyName: bindingName,
        isSignal: false,
      };
    }
  }

  return ClassPropertyMapping.fromMappedObject(obj);
}

function filterInputMappings(
  source: ClassPropertyMapping<TcbInputMapping>,
  allowed: nga.HostDirectiveBinding[] | undefined | null,
): ClassPropertyMapping<TcbInputMapping> {
  const result: Record<string, TcbInputMapping> = {};

  if (allowed && allowed.length > 0) {
    for (const {publicName, bindingName} of allowed) {
      const bindings = source.getByBindingPropertyName(publicName);
      if (bindings !== null) {
        for (const binding of bindings) {
          result[binding.classPropertyName] = {
            classPropertyName: binding.classPropertyName,
            bindingPropertyName: bindingName,
            isSignal: binding.isSignal,
            required: binding.required,
            transformType: binding.transformType,
          };
        }
      }
    }
  }

  return ClassPropertyMapping.fromMappedObject<TcbInputMapping>(result);
}

function filterOutputMappings(
  source: ClassPropertyMapping<any>,
  allowed: nga.HostDirectiveBinding[] | undefined | null,
): ClassPropertyMapping<any> {
  const result: Record<
    string,
    {classPropertyName: string; bindingPropertyName: string; isSignal: boolean}
  > = {};

  if (allowed && allowed.length > 0) {
    for (const {publicName, bindingName} of allowed) {
      const bindings = source.getByBindingPropertyName(publicName);
      if (bindings !== null) {
        for (const binding of bindings) {
          result[binding.classPropertyName] = {
            classPropertyName: binding.classPropertyName,
            bindingPropertyName: bindingName,
            isSignal: binding.isSignal ?? false,
          };
        }
      }
    }
  }

  return ClassPropertyMapping.fromMappedObject(result);
}

/**
 * The directives a host's `resolvedHostDirectives` put on every element the host matches, each
 * chain's inner host directives first. Mirrors ngtsc's `HostDirectivesResolver.resolve`.
 *
 * The analyzer attaches these to the declaration that hosts them, not to the template scope. A
 * host directive is not a member of the consumer's scope, so it is only ever registered alongside
 * its host and never under its own selector.
 */
export function resolveHostDirectives(
  resolvedHostDirectives: nga.ResolvedHostDirectiveMetadata[] | null | undefined,
  filePath: string,
  requiresInline: boolean = false,
  content?: string,
  consumerPath?: string,
  visited = new Set<string>(),
): TcbDirectiveMetadata[] {
  if (!resolvedHostDirectives || resolvedHostDirectives.length === 0) {
    return [];
  }

  const results: TcbDirectiveMetadata[] = [];

  for (const hd of resolvedHostDirectives) {
    const hostDecl = hd.directive;
    const hostKey = `${hostDecl.filePath || filePath}#${hostDecl.name}`;
    if (visited.has(hostKey)) {
      continue;
    }
    visited.add(hostKey);

    const hostDeclPath = hostDecl.filePath || filePath;

    // Recursively resolve chained host directives first
    const chained = resolveHostDirectives(
      hostDecl.resolvedHostDirectives,
      hostDeclPath,
      requiresInline,
      content,
      consumerPath,
      visited,
    );
    results.push(...chained);

    const hostMeta = declarationToMetadata(
      hostDecl,
      hostDeclPath,
      requiresInline,
      content,
      consumerPath,
    );

    const mappedInputs = filterInputMappings(hostMeta.inputs, hd.inputs);
    const mappedOutputs = filterOutputMappings(hostMeta.outputs, hd.outputs);

    results.push({
      ...hostMeta,
      matchSource: MatchSource.HostDirective,
      inputs: mappedInputs,
      outputs: mappedOutputs,
    });
  }

  return results;
}

export function adaptTcbInput(
  target: TcbTargetInput,
  typeCheckId: TypeCheckId,
  filePath: string,
  config: NgpTypeCheckingConfig,
  requiresInline: boolean = false,
  content?: string,
): {
  tcbMeta: TcbTypeCheckBlockMetadata;
  targetMeta: TcbComponentMetadata;
  hostElement: TmplAstHostElement | null;
} {
  const isStandalone = target.isStandalone ?? target.ownDeclaration.isStandalone ?? false;
  const isSelectorless =
    target.ownDeclaration.declarationType === 'component' &&
    isStandalone &&
    (target.selectorlessEnabled ?? false);
  let matcher: SelectorMatcher<TcbDirectiveMetadata[]> | SelectorlessMatcher<TcbDirectiveMetadata>;

  const declarations =
    isStandalone &&
    target.ownDeclaration &&
    !target.declarations.some((d) => d.name === target.ownDeclaration.name)
      ? [...target.declarations, target.ownDeclaration]
      : target.declarations;

  if (isSelectorless) {
    const registry = new Map<string, TcbDirectiveMetadata[]>();
    for (const decl of declarations) {
      if (decl.declarationType !== 'directive' && decl.declarationType !== 'component') {
        continue;
      }
      const declPath = decl.filePath || filePath;
      const meta = declarationToMetadata(decl, declPath, requiresInline, content, filePath);
      const hostDirectives = resolveHostDirectives(
        decl.resolvedHostDirectives,
        declPath,
        requiresInline,
        content,
        filePath,
      );
      const existing = registry.get(decl.name) || [];
      registry.set(decl.name, [...existing, ...hostDirectives, meta]);
    }
    matcher = new SelectorlessMatcher<TcbDirectiveMetadata>(registry);
  } else {
    const selectorMatcher = new SelectorMatcher<TcbDirectiveMetadata[]>();
    for (const decl of declarations) {
      if (decl.declarationType !== 'directive' && decl.declarationType !== 'component') {
        continue;
      }
      if (decl.selector) {
        const declPath = decl.filePath || filePath;
        const hostDirectives = resolveHostDirectives(
          decl.resolvedHostDirectives,
          declPath,
          requiresInline,
          content,
          filePath,
        );
        selectorMatcher.addSelectables(CssSelector.parse(decl.selector), [
          ...hostDirectives,
          declarationToMetadata(decl, declPath, requiresInline, content, filePath),
        ]);
      }
    }
    matcher = selectorMatcher;
  }

  const hostDirectivesOnTarget = target.ownDeclaration
    ? resolveHostDirectives(
        target.ownDeclaration.resolvedHostDirectives,
        filePath,
        requiresInline,
        content,
        filePath,
      )
    : [];

  const binder = new R3TargetBinder<TcbDirectiveMetadata>(matcher);
  const host = config.typeCheckHostBindings === false ? null : adaptHostElement(target, content);
  const boundTarget = binder.bind({
    template: target.templateNodes,
    host: host
      ? {
          node: host,
          directives: [
            ...hostDirectivesOnTarget,
            declarationToMetadata(
              target.ownDeclaration,
              filePath,
              requiresInline,
              content,
              filePath,
            ),
          ],
        }
      : undefined,
  });
  // Monkey-patch missing method in reference compiler
  boundTarget.getConflictingHostDirectiveBindings ??= () => null;

  let pipes = null as Map<string, TcbPipeMetadata> | null;

  if (target.pipeRegistry !== null) {
    for (const [name, meta] of target.pipeRegistry) {
      const isSameFile = meta.filePath !== undefined && meta.filePath === filePath;
      const isLocal = (requiresInline && isSameFile) || !meta.importPath;
      const moduleName = isLocal ? null : (meta.importPath ?? null);
      pipes ??= new Map();
      pipes.set(name, {
        name,
        ref: {
          key: (meta.importPath
            ? `${meta.importPath}#${meta.className}`
            : `${filePath}#${meta.className}`) as any,
          name: meta.className,
          moduleName,
          isLocal,
          unexportedDiagnostic: null,
        },
        isExplicitlyDeferred: meta.isExplicitlyDeferred ?? false,
        deferredBlocks: meta.deferredBlocks ? new Set(meta.deferredBlocks) : null,
      });
    }
  }

  const typeParameters = mapTypeParameters(target.typeParameters);
  const typeArguments = typeParameters
    ? config.useContextGenericType
      ? typeParameters.map((p) => p.name)
      : new Array<string>(typeParameters.length).fill('any')
    : null;

  const isLocal = requiresInline || !target.classMeta.ref?.typecheckImport;
  const moduleName = isLocal ? null : (target.classMeta.ref?.typecheckImport?.specifier ?? null);

  const targetMeta: TcbComponentMetadata = {
    ref: {
      key: (target.classMeta.ref?.typecheckImport
        ? `${target.classMeta.ref.typecheckImport.specifier}#${target.className}`
        : `${filePath}#${target.className}`) as any,
      name: target.className,
      moduleName,
      isLocal,
      unexportedDiagnostic: null,
    },
    typeParameters,
    typeArguments,
  };

  const tcbMeta: TcbTypeCheckBlockMetadata = {
    id: typeCheckId,
    boundTarget,
    pipes,
    schemas: target.schemas || [],
    isStandalone: target.isStandalone ?? true,
    preserveWhitespaces: target.preserveWhitespaces ?? false,
  };

  return {tcbMeta, targetMeta, hostElement: host};
}

function adaptHostElement(target: TcbTargetInput, content?: string): TmplAstHostElement | null {
  // We don't use the name for anything so just pass a dummy one.
  const fileName = 'hostTcb.ts';
  const objectLiteralBindings: HostObjectLiteralBinding[] = [];
  const hostBindingDecorators: HostBindingDecorator[] = [];
  const hostListenerDecorators: HostListenerDecorator[] = [];

  for (const prop of target.hostProperties) {
    if (!isStaticSourceNode(prop.key) || prop.value.kind !== 'string') {
      continue;
    }

    objectLiteralBindings.push({
      key: adaptSourceNode(prop.key, fileName, content),
      value: adaptSourceNode(prop.value, fileName, content),
      sourceSpan: createSpan(fileName, prop.key.sourceSpan.start, prop.value.sourceSpan.end),
    });
  }

  for (const decorator of target.hostBindings) {
    if (!isStaticSourceNode(decorator.memberName)) {
      continue;
    }

    hostBindingDecorators.push({
      memberName: adaptSourceNode(decorator.memberName, fileName, content) as StaticSourceNode,
      memberSpan: createSpan(fileName, decorator.memberSpan.start, decorator.memberSpan.end),
      decoratorSpan: createSpan(
        fileName,
        decorator.decoratorSpan.start,
        decorator.decoratorSpan.end,
      ),
      arguments: decorator.arguments.map((arg) => adaptSourceNode(arg, fileName, content)),
    });
  }

  for (const decorator of target.hostListeners) {
    const eventName = decorator.eventName;

    if (eventName?.kind !== 'string' || !isStaticSourceNode(decorator.methodName)) {
      continue;
    }

    hostListenerDecorators.push({
      eventName: adaptSourceNode(eventName, fileName, content) as StaticSourceNode,
      memberName: adaptSourceNode(decorator.methodName, fileName, content) as StaticSourceNode,
      memberSpan: createSpan(fileName, decorator.memberSpan.start, decorator.memberSpan.end),
      decoratorSpan: createSpan(
        fileName,
        decorator.decoratorSpan.start,
        decorator.decoratorSpan.end,
      ),
      arguments: decorator.args.map((arg) => adaptSourceNode(arg, fileName, content)),
    });
  }

  return createHostElement(
    target.ownDeclaration.declarationType === 'directive' ? 'directive' : 'component',
    target.ownDeclaration.selector || null,
    createSpan(fileName, target.ownDeclaration.nameSpan.start, target.ownDeclaration.nameSpan.end),
    objectLiteralBindings,
    hostBindingDecorators,
    hostListenerDecorators,
  );
}

function adaptSourceNode(
  node: nga.ExpressionValueMetadata,
  fileName: string,
  content?: string,
): SourceNode {
  const sourceSpan = createSpan(fileName, node.sourceSpan.start, node.sourceSpan.end);
  const source = content ? content.substring(node.sourceSpan.start, node.sourceSpan.end) : '';

  if (isStaticSourceNode(node)) {
    return {
      kind: node.kind === 'string' ? 'string' : 'identifier',
      text: node.text,
      source,
      sourceSpan,
    } satisfies StaticSourceNode;
  }

  return {kind: 'unspecified', sourceSpan} satisfies SourceNode;
}

function declarationToMetadata(
  decl: nga.DeclarationMetadata,
  filePath: string,
  requiresInline: boolean = false,
  content?: string,
  consumerPath?: string,
): TcbDirectiveMetadata {
  const isSameFile = consumerPath !== undefined && filePath === consumerPath;
  const isLocal = (requiresInline && isSameFile) || !decl.ref.typecheckImport;
  const moduleName = isLocal ? null : (decl.ref.typecheckImport?.specifier ?? null);
  const symbolName = isLocal ? decl.name : (decl.ref.typecheckImport?.symbol ?? decl.name);
  const fields = decl.flattenedFields ?? decl.fields ?? [];

  const meta: TcbDirectiveMetadata = {
    matchSource: MatchSource.Selector,
    ref: {
      key: (decl.ref.typecheckImport
        ? `${decl.ref.typecheckImport.specifier}#${symbolName}`
        : `${filePath}#${symbolName}`) as any,
      name: symbolName,
      moduleName,
      isLocal,
      unexportedDiagnostic: null,
      nodeFilePath: filePath,
      nodeNameSpan: decl.nameSpan,
    },
    name: decl.name,
    selector: decl.selector || null,
    isComponent: decl.declarationType === 'component',
    isGeneric: !!(decl.typeParameters && decl.typeParameters.length > 0),
    isStructural: decl.isStructural ?? false,
    isStandalone: decl.isStandalone ?? false,
    isExplicitlyDeferred: decl.isExplicitlyDeferred ?? false,
    deferredBlocks: decl.deferredBlocks ? new Set(decl.deferredBlocks) : null,
    preserveWhitespaces: false,
    exportAs: decl.exportAs || null,
    typeParameters: mapTypeParameters(decl.typeParameters) ?? null,
    inputs: (() => {
      const inputsList: nga.InputMetadata[] = [];
      const coercions = new Set<string>();
      for (const f of fields) {
        if (f.kind === 'input' && f.input) {
          inputsList.push(f.input);
        } else if (f.kind === 'coercion' && f.coercion) {
          coercions.add(f.coercion);
        }
      }
      for (const i of inputsList) {
        if (coercions.has(i.name)) {
          i.isCoerced = true;
        }
      }
      return createInputPropertyMapping(inputsList, content);
    })(),
    outputs: (() => {
      const outputsList: nga.OutputMetadata[] = [];
      for (const f of fields) {
        if (f.kind === 'output' && f.output) {
          outputsList.push(f.output);
        }
      }
      return createOutputPropertyMapping(outputsList);
    })(),
    requiresInlineTypeCtor: decl.hasNonExportedBounds ?? false,
    ngTemplateGuards:
      decl.ngTemplateGuards?.map((g) => ({
        inputName: g.inputName,
        type: g.type === 'binding' ? 'binding' : 'invocation',
      })) ?? [],
    hasNgTemplateContextGuard: decl.hasNgTemplateContextGuard ?? false,
    hasNgFieldDirective: decl.hasNgFieldDirective ?? false,
    coercedInputFields: (() => {
      const coerced = new Set<string>();
      const coercions = new Set<string>();
      const inputsList: nga.InputMetadata[] = [];
      for (const f of fields) {
        if (f.kind === 'input' && f.input) {
          inputsList.push(f.input);
        } else if (f.kind === 'coercion' && f.coercion) {
          coercions.add(f.coercion);
        }
      }
      for (const i of inputsList) {
        if (!i.isSignal && (i.transform || i.isCoerced || coercions.has(i.name))) {
          coerced.add(i.name);
        }
      }
      return coerced;
    })(),
    restrictedInputFields: new Set(
      fields.filter((f) => f.kind === 'input' && f.input?.isRestricted).map((f) => f.input!.name),
    ),
    stringLiteralInputFields: new Set(
      fields.filter((f) => f.kind === 'input' && f.input?.isLiteral).map((f) => f.input!.name),
    ),
    undeclaredInputFields: new Set(
      fields
        .filter((f) => f.kind === 'input' && f.input && !f.input.propertySpan)
        .map((f) => f.input!.name),
    ),
    // TODO(parity): populate `publicMethods`; signal-forms type-checking uses it to detect
    // ControlValueAccessor directives (`writeValue`, `registerOnChange`, `registerOnTouched`).
    publicMethods: new Set(),
    ngContentSelectors: decl.ngContentSelectors || null,
    animationTriggerNames: decl.animationTriggerNames || null,
  };

  return meta;
}

export interface ExtendedTcbTypeParameter extends TcbTypeParameter {
  typeRefs?: nga.TypeRefMetadata[];
}

function mapTypeParameters(
  params: nga.TypeParameterMetadata[] | null | undefined,
): ExtendedTcbTypeParameter[] | null {
  if (!params) return null;
  return params.map((p) => ({
    name: p.name,
    representation: p.representation,
    representationWithDefault: p.representationWithDefault,
    typeRefs: p.typeRefs,
  }));
}
