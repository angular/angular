/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbstractBoundTemplate,
  AST,
  BoundTarget,
  IndexerVisitor,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstTemplate,
  TmplAstTextAttribute,
  TmplAstVariable,
  TcbDirectiveMetadata,
} from '@angular/compiler';
import {
  ClassEntity,
  IndexedComponent,
  TopLevelIdentifier,
  UrlMetadata,
  IoMetadata,
} from '../indexer_api.js';
import type {HybridCompiler} from '../hybrid_compiler.js';
import {makeClassKey} from '../compiler-utils.js';
import {createInputPropertyMapping, createOutputPropertyMapping} from '../tcb_adapter.js';

type DirectiveHost = TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective;

/** A matched directive, in the shape `AbstractBoundTemplate` reports it. */
interface DirectiveRef {
  ref: {node: ClassEntity};
  selector: string | null;
}

export class IndexerBoundTemplate implements AbstractBoundTemplate<ClassEntity> {
  private readonly classEntityCache = new Map<unknown, ClassEntity>();

  constructor(
    private readonly boundTarget?: BoundTarget<TcbDirectiveMetadata>,
    private readonly pipes?: Map<string, ClassEntity>,
  ) {}

  getDirectivesOfNode(node: DirectiveHost): DirectiveRef[] | null {
    return (
      this.boundTarget?.getDirectivesOfNode(node)?.map((dir) => this.toDirectiveRef(dir)) || null
    );
  }

  getReferenceTarget(
    node: TmplAstReference,
  ): DirectiveHost | {node: DirectiveHost; directive: DirectiveRef} | null {
    const target = this.boundTarget?.getReferenceTarget(node);
    if (!target) {
      return null;
    }
    if (target instanceof TmplAstElement || target instanceof TmplAstTemplate) {
      return target;
    }
    return {node: target.node, directive: this.toDirectiveRef(target.directive)};
  }

  getConsumerOfBinding(
    binding: TmplAstBoundAttribute | TmplAstBoundEvent | TmplAstTextAttribute,
  ): DirectiveRef | TmplAstElement | TmplAstTemplate | null {
    const consumer = this.boundTarget?.getConsumerOfBinding(binding);
    if (!consumer) {
      return null;
    }
    if (consumer instanceof TmplAstElement || consumer instanceof TmplAstTemplate) {
      return consumer;
    }
    return this.toDirectiveRef(consumer);
  }

  getExpressionTarget(ast: AST): TmplAstReference | TmplAstVariable | TmplAstLetDeclaration | null {
    return this.boundTarget?.getExpressionTarget(ast) ?? null;
  }

  getUsedDirectives(): Array<DirectiveRef & {isComponent: boolean}> {
    const directives = this.boundTarget?.getUsedDirectives() ?? [];
    return directives.map((dir) => ({...this.toDirectiveRef(dir), isComponent: dir.isComponent}));
  }

  getTemplateAst(): TmplAstNode[] | undefined {
    return this.boundTarget?.target.template;
  }

  getPipe(name: string): {ref: {node: ClassEntity}} | null {
    const pipe = this.pipes?.get(name);
    return pipe ? {ref: {node: pipe}} : null;
  }

  getClassEntity(dir: TcbDirectiveMetadata): ClassEntity {
    const cacheKey = dir.ref || dir;
    if (this.classEntityCache.has(cacheKey)) {
      return this.classEntityCache.get(cacheKey)!;
    }

    let name = dir.name ?? '';
    let filePath = '';

    if (dir.ref) {
      name = dir.ref.name || name;
      filePath = dir.ref.nodeFilePath || '';
      if (!filePath && typeof dir.ref.key === 'string') {
        const parts = dir.ref.key.split('#');
        if (parts.length > 1) {
          filePath = parts[0];
        }
      }
    }

    const entity: ClassEntity = {name, filePath};
    this.classEntityCache.set(cacheKey, entity);
    return entity;
  }

  private toDirectiveRef(dir: TcbDirectiveMetadata): DirectiveRef {
    return {ref: {node: this.getClassEntity(dir)}, selector: dir.selector};
  }
}

export async function getIndexedComponents(
  compiler: HybridCompiler,
): Promise<Map<string, IndexedComponent>> {
  const indexedComponents = new Map<string, IndexedComponent>();

  for (const [filePath, fileAnalysis] of compiler.fileCache.entries()) {
    const templatesByClass = fileAnalysis?.parsedTemplates;
    if (!templatesByClass) continue;

    const boundTargetsByClass = fileAnalysis?.preparedTcbData?.boundTargetMap;
    const result = await compiler.analyzer.getMetadataForFile(filePath);
    if (!result) continue;

    for (const cls of result.classes) {
      if (!cls.className || !cls.component) continue;

      const classKey = makeClassKey(cls.className, cls.span.start);
      const parsedTemplate = templatesByClass.get(classKey);
      if (!parsedTemplate) continue;

      const boundTarget = boundTargetsByClass?.get(classKey);
      const target = fileAnalysis?.preparedTcbData?.targets.find(
        (t) =>
          t.comp.className === cls.className &&
          (!t.comp.classMeta || t.comp.classMeta.span.start === cls.span.start),
      );
      const pipeMap = new Map<string, ClassEntity>();
      if (target?.comp.pipeRegistry) {
        for (const [name, pipeMeta] of target.comp.pipeRegistry.entries()) {
          pipeMap.set(name, {
            name: pipeMeta.className,
            filePath: pipeMeta.filePath || '',
          });
        }
      }
      const visitor = new IndexerVisitor<ClassEntity>(
        new IndexerBoundTemplate(boundTarget, pipeMap),
      );
      parsedTemplate.nodes.forEach((node: TmplAstNode) => node.visit(visitor));

      const identifiers = new Set<TopLevelIdentifier>();

      for (const id of visitor.identifiers) {
        identifiers.add(id);
      }

      let templateUrl: UrlMetadata | undefined = undefined;
      if (cls.component.templateUrl && cls.component.templateUrl.stringLiteralSpan) {
        const span = cls.component.templateUrl.stringLiteralSpan;
        templateUrl = {
          url: cls.component.templateUrl.url,
          span: {
            start: span.start + 1,
            end: span.end - 1,
          },
          resolvedPath: cls.component.templateUrl.resolvedPath,
        };
      }

      const styleUrls: UrlMetadata[] = [];
      if (cls.component.styleUrls) {
        for (const s of cls.component.styleUrls) {
          if (s.stringLiteralSpan) {
            styleUrls.push({
              url: s.url,
              span: {
                start: s.stringLiteralSpan.start + 1,
                end: s.stringLiteralSpan.end - 1,
              },
              resolvedPath: s.resolvedPath,
            });
          }
        }
      }

      const inputMapping = createInputPropertyMapping(cls.inputs);
      const outputMapping = createOutputPropertyMapping(cls.outputs);

      const inputs: IoMetadata[] = Array.from(inputMapping).map((m) => ({
        directiveProperty: m.classPropertyName,
        bindingName: m.bindingPropertyName,
      }));
      const outputs: IoMetadata[] = Array.from(outputMapping).map((m) => ({
        directiveProperty: m.classPropertyName,
        bindingName: m.bindingPropertyName,
      }));

      const templatePath = templateUrl?.resolvedPath || filePath;

      indexedComponents.set(cls.className, {
        name: cls.className,
        selector: cls.component.selector || null,
        fileUrl: filePath,
        template: {
          identifiers,
          fileUrl: templatePath,
        },
        errors: visitor.errors,
        templateUrl,
        styleUrls,
        inputs,
        outputs,
      });
    }
  }

  return indexedComponents;
}
