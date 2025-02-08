/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as core from '../../core';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../ml_parser/defaults';
import * as o from '../../output/output_ast';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '../../parse_util';
import {RecursiveVisitor, visitAll} from '../r3_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {generateForwardRef, R3CompiledExpression} from '../util';
import {
  DeclarationListEmitMode,
  DeferBlockDepsEmitMode,
  R3ComponentMetadata,
  R3TemplateDependencyKind,
  R3TemplateDependencyMetadata,
} from '../view/api';
import {createComponentType} from '../view/compiler';
import {ParsedTemplate} from '../view/template';
import {DefinitionMap} from '../view/util';

import {
  R3DeclareComponentMetadata,
  R3DeclareDirectiveDependencyMetadata,
  R3DeclareNgModuleDependencyMetadata,
  R3DeclarePipeDependencyMetadata,
} from './api';
import {createDirectiveDefinitionMap} from './directive';
import {toOptionalLiteralArray} from './util';

export interface DeclareComponentTemplateInfo {
  /**
   * The string contents of the template.
   *
   * This is the "logical" template string, after expansion of any escaped characters (for inline
   * templates). This may differ from the actual template bytes as they appear in the .ts file.
   */
  content: string;

  /**
   * A full path to the file which contains the template.
   *
   * This can be either the original .ts file if the template is inline, or the .html file if an
   * external file was used.
   */
  sourceUrl: string;

  /**
   * Whether the template was inline (using `template`) or external (using `templateUrl`).
   */
  isInline: boolean;

  /**
   * If the template was defined inline by a direct string literal, then this is that literal
   * expression. Otherwise `null`, if the template was not defined inline or was not a literal.
   */
  inlineTemplateLiteralExpression: o.Expression | null;
}

/**
 * Compile a component declaration defined by the `R3ComponentMetadata`.
 */
export function compileDeclareComponentFromMetadata(
  meta: R3ComponentMetadata<R3TemplateDependencyMetadata>,
  template: ParsedTemplate,
  additionalTemplateInfo: DeclareComponentTemplateInfo,
): R3CompiledExpression {
  const definitionMap = createComponentDefinitionMap(meta, template, additionalTemplateInfo);

  const expression = o.importExpr(R3.declareComponent).callFn([definitionMap.toLiteralMap()]);
  const type = createComponentType(meta);

  return {expression, type, statements: []};
}

/**
 * Gathers the declaration fields for a component into a `DefinitionMap`.
 */
export function createComponentDefinitionMap(
  meta: R3ComponentMetadata<R3TemplateDependencyMetadata>,
  template: ParsedTemplate,
  templateInfo: DeclareComponentTemplateInfo,
): DefinitionMap<R3DeclareComponentMetadata> {
  const definitionMap: DefinitionMap<R3DeclareComponentMetadata> =
    createDirectiveDefinitionMap(meta);
  const blockVisitor = new BlockPresenceVisitor();
  visitAll(blockVisitor, template.nodes);

  definitionMap.set('template', getTemplateExpression(template, templateInfo));

  if (templateInfo.isInline) {
    definitionMap.set('isInline', o.literal(true));
  }

  // Set the minVersion to 17.0.0 if the component is using at least one block in its template.
  // We don't do this for templates without blocks, in order to preserve backwards compatibility.
  if (blockVisitor.hasBlocks) {
    definitionMap.set('minVersion', o.literal('17.0.0'));
  }

  definitionMap.set('styles', toOptionalLiteralArray(meta.styles, o.literal));
  definitionMap.set('dependencies', compileUsedDependenciesMetadata(meta));
  definitionMap.set('viewProviders', meta.viewProviders);
  definitionMap.set('animations', meta.animations);

  if (meta.changeDetection !== null) {
    if (typeof meta.changeDetection === 'object') {
      throw new Error('Impossible state! Change detection flag is not resolved!');
    }

    definitionMap.set(
      'changeDetection',
      o
        .importExpr(R3.ChangeDetectionStrategy)
        .prop(core.ChangeDetectionStrategy[meta.changeDetection]),
    );
  }
  if (meta.encapsulation !== core.ViewEncapsulation.Emulated) {
    definitionMap.set(
      'encapsulation',
      o.importExpr(R3.ViewEncapsulation).prop(core.ViewEncapsulation[meta.encapsulation]),
    );
  }
  if (meta.interpolation !== DEFAULT_INTERPOLATION_CONFIG) {
    definitionMap.set(
      'interpolation',
      o.literalArr([o.literal(meta.interpolation.start), o.literal(meta.interpolation.end)]),
    );
  }

  if (template.preserveWhitespaces === true) {
    definitionMap.set('preserveWhitespaces', o.literal(true));
  }

  if (meta.defer.mode === DeferBlockDepsEmitMode.PerBlock) {
    const resolvers: o.Expression[] = [];
    let hasResolvers = false;

    for (const deps of meta.defer.blocks.values()) {
      // Note: we need to push a `null` even if there are no dependencies, because matching of
      // defer resolver functions to defer blocks happens by index and not adding an array
      // entry for a block can throw off the blocks coming after it.
      if (deps === null) {
        resolvers.push(o.literal(null));
      } else {
        resolvers.push(deps);
        hasResolvers = true;
      }
    }
    // If *all* the resolvers are null, we can skip the field.
    if (hasResolvers) {
      definitionMap.set('deferBlockDependencies', o.literalArr(resolvers));
    }
  } else {
    throw new Error('Unsupported defer function emit mode in partial compilation');
  }

  return definitionMap;
}

function getTemplateExpression(
  template: ParsedTemplate,
  templateInfo: DeclareComponentTemplateInfo,
): o.Expression {
  // If the template has been defined using a direct literal, we use that expression directly
  // without any modifications. This is ensures proper source mapping from the partially
  // compiled code to the source file declaring the template. Note that this does not capture
  // template literals referenced indirectly through an identifier.
  if (templateInfo.inlineTemplateLiteralExpression !== null) {
    return templateInfo.inlineTemplateLiteralExpression;
  }

  // If the template is defined inline but not through a literal, the template has been resolved
  // through static interpretation. We create a literal but cannot provide any source span. Note
  // that we cannot use the expression defining the template because the linker expects the template
  // to be defined as a literal in the declaration.
  if (templateInfo.isInline) {
    return o.literal(templateInfo.content, null, null);
  }

  // The template is external so we must synthesize an expression node with
  // the appropriate source-span.
  const contents = templateInfo.content;
  const file = new ParseSourceFile(contents, templateInfo.sourceUrl);
  const start = new ParseLocation(file, 0, 0, 0);
  const end = computeEndLocation(file, contents);
  const span = new ParseSourceSpan(start, end);
  return o.literal(contents, null, span);
}

function computeEndLocation(file: ParseSourceFile, contents: string): ParseLocation {
  const length = contents.length;
  let lineStart = 0;
  let lastLineStart = 0;
  let line = 0;
  do {
    lineStart = contents.indexOf('\n', lastLineStart);
    if (lineStart !== -1) {
      lastLineStart = lineStart + 1;
      line++;
    }
  } while (lineStart !== -1);

  return new ParseLocation(file, length, line, length - lastLineStart);
}

function compileUsedDependenciesMetadata(
  meta: R3ComponentMetadata<R3TemplateDependencyMetadata>,
): o.LiteralArrayExpr | null {
  const wrapType =
    meta.declarationListEmitMode !== DeclarationListEmitMode.Direct
      ? generateForwardRef
      : (expr: o.Expression) => expr;

  if (meta.declarationListEmitMode === DeclarationListEmitMode.RuntimeResolved) {
    throw new Error(`Unsupported emit mode`);
  }

  return toOptionalLiteralArray(meta.declarations, (decl) => {
    switch (decl.kind) {
      case R3TemplateDependencyKind.Directive:
        const dirMeta = new DefinitionMap<R3DeclareDirectiveDependencyMetadata>();
        dirMeta.set('kind', o.literal(decl.isComponent ? 'component' : 'directive'));
        dirMeta.set('type', wrapType(decl.type));
        dirMeta.set('selector', o.literal(decl.selector));
        dirMeta.set('inputs', toOptionalLiteralArray(decl.inputs, o.literal));
        dirMeta.set('outputs', toOptionalLiteralArray(decl.outputs, o.literal));
        dirMeta.set('exportAs', toOptionalLiteralArray(decl.exportAs, o.literal));
        return dirMeta.toLiteralMap();
      case R3TemplateDependencyKind.Pipe:
        const pipeMeta = new DefinitionMap<R3DeclarePipeDependencyMetadata>();
        pipeMeta.set('kind', o.literal('pipe'));
        pipeMeta.set('type', wrapType(decl.type));
        pipeMeta.set('name', o.literal(decl.name));
        return pipeMeta.toLiteralMap();
      case R3TemplateDependencyKind.NgModule:
        const ngModuleMeta = new DefinitionMap<R3DeclareNgModuleDependencyMetadata>();
        ngModuleMeta.set('kind', o.literal('ngmodule'));
        ngModuleMeta.set('type', wrapType(decl.type));
        return ngModuleMeta.toLiteralMap();
    }
  });
}

class BlockPresenceVisitor extends RecursiveVisitor {
  hasBlocks = false;

  override visitDeferredBlock(): void {
    this.hasBlocks = true;
  }

  override visitDeferredBlockPlaceholder(): void {
    this.hasBlocks = true;
  }

  override visitDeferredBlockLoading(): void {
    this.hasBlocks = true;
  }

  override visitDeferredBlockError(): void {
    this.hasBlocks = true;
  }

  override visitIfBlock(): void {
    this.hasBlocks = true;
  }

  override visitIfBlockBranch(): void {
    this.hasBlocks = true;
  }

  override visitForLoopBlock(): void {
    this.hasBlocks = true;
  }

  override visitForLoopBlockEmpty(): void {
    this.hasBlocks = true;
  }

  override visitSwitchBlock(): void {
    this.hasBlocks = true;
  }

  override visitSwitchBlockCase(): void {
    this.hasBlocks = true;
  }
}
