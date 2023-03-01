/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as core from '../../core';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../ml_parser/interpolation_config';
import * as o from '../../output/output_ast';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '../../parse_util';
import {Identifiers as R3} from '../r3_identifiers';
import {generateForwardRef, R3CompiledExpression} from '../util';
import {DeclarationListEmitMode, R3ComponentMetadata, R3TemplateDependencyKind, R3TemplateDependencyMetadata} from '../view/api';
import {createComponentType} from '../view/compiler';
import {ParsedTemplate} from '../view/template';
import {DefinitionMap} from '../view/util';

import {R3DeclareComponentMetadata, R3DeclareDirectiveDependencyMetadata, R3DeclareNgModuleDependencyMetadata, R3DeclarePipeDependencyMetadata} from './api';
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
  inlineTemplateLiteralExpression: o.Expression|null;
}

/**
 * Compile a component declaration defined by the `R3ComponentMetadata`.
 */
export function compileDeclareComponentFromMetadata(
    meta: R3ComponentMetadata<R3TemplateDependencyMetadata>, template: ParsedTemplate,
    additionalTemplateInfo: DeclareComponentTemplateInfo): R3CompiledExpression {
  const definitionMap = createComponentDefinitionMap(meta, template, additionalTemplateInfo);

  const expression = o.importExpr(R3.declareComponent).callFn([definitionMap.toLiteralMap()]);
  const type = createComponentType(meta);

  return {expression, type, statements: []};
}

/**
 * Gathers the declaration fields for a component into a `DefinitionMap`.
 */
export function createComponentDefinitionMap(
    meta: R3ComponentMetadata<R3TemplateDependencyMetadata>, template: ParsedTemplate,
    templateInfo: DeclareComponentTemplateInfo): DefinitionMap<R3DeclareComponentMetadata> {
  const definitionMap: DefinitionMap<R3DeclareComponentMetadata> =
      createDirectiveDefinitionMap(meta);

  definitionMap.set('template', getTemplateExpression(template, templateInfo));
  if (templateInfo.isInline) {
    definitionMap.set('isInline', o.literal(true));
  }

  definitionMap.set('styles', toOptionalLiteralArray(meta.styles, o.literal));
  definitionMap.set('dependencies', compileUsedDependenciesMetadata(meta));
  definitionMap.set('viewProviders', meta.viewProviders);
  definitionMap.set('animations', meta.animations);

  if (meta.changeDetection !== undefined) {
    definitionMap.set(
        'changeDetection',
        o.importExpr(R3.ChangeDetectionStrategy)
            .prop(core.ChangeDetectionStrategy[meta.changeDetection]));
  }
  if (meta.encapsulation !== core.ViewEncapsulation.Emulated) {
    definitionMap.set(
        'encapsulation',
        o.importExpr(R3.ViewEncapsulation).prop(core.ViewEncapsulation[meta.encapsulation]));
  }
  if (meta.interpolation !== DEFAULT_INTERPOLATION_CONFIG) {
    definitionMap.set(
        'interpolation',
        o.literalArr([o.literal(meta.interpolation.start), o.literal(meta.interpolation.end)]));
  }

  if (template.preserveWhitespaces === true) {
    definitionMap.set('preserveWhitespaces', o.literal(true));
  }

  return definitionMap;
}

function getTemplateExpression(
    template: ParsedTemplate, templateInfo: DeclareComponentTemplateInfo): o.Expression {
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

function compileUsedDependenciesMetadata(meta: R3ComponentMetadata<R3TemplateDependencyMetadata>):
    o.LiteralArrayExpr|null {
  const wrapType = meta.declarationListEmitMode !== DeclarationListEmitMode.Direct ?
      generateForwardRef :
      (expr: o.Expression) => expr;

  return toOptionalLiteralArray(meta.declarations, decl => {
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
