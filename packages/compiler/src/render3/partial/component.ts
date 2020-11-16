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
import {Identifiers as R3} from '../r3_identifiers';
import {R3ComponentDef, R3ComponentMetadata} from '../view/api';
import {createComponentType} from '../view/compiler';
import {ParsedTemplate} from '../view/template';
import {DefinitionMap} from '../view/util';

import {createDirectiveDefinitionMap} from './directive';
import {toOptionalLiteralArray} from './util';


/**
 * Compile a component declaration defined by the `R3ComponentMetadata`.
 */
export function compileDeclareComponentFromMetadata(
    meta: R3ComponentMetadata, template: ParsedTemplate): R3ComponentDef {
  const definitionMap = createComponentDefinitionMap(meta, template);

  const expression = o.importExpr(R3.declareComponent).callFn([definitionMap.toLiteralMap()]);
  const type = createComponentType(meta);

  return {expression, type};
}

/**
 * Gathers the declaration fields for a component into a `DefinitionMap`.
 */
export function createComponentDefinitionMap(
    meta: R3ComponentMetadata, template: ParsedTemplate): DefinitionMap {
  const definitionMap = createDirectiveDefinitionMap(meta);

  const templateMap = compileTemplateDefinition(template);

  definitionMap.set('template', templateMap);

  definitionMap.set('styles', toOptionalLiteralArray(meta.styles, o.literal));
  definitionMap.set('directives', compileUsedDirectiveMetadata(meta));
  definitionMap.set('pipes', compileUsedPipeMetadata(meta));
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

/**
 * Compiles the provided template into its partial definition.
 */
function compileTemplateDefinition(template: ParsedTemplate): o.LiteralMapExpr {
  const templateMap = new DefinitionMap();
  const templateExpr =
      typeof template.template === 'string' ? o.literal(template.template) : template.template;
  templateMap.set('source', templateExpr);
  templateMap.set('isInline', o.literal(template.isInline));
  return templateMap.toLiteralMap();
}

/**
 * Compiles the directives as registered in the component metadata into an array literal of the
 * individual directives. If the component does not use any directives, then null is returned.
 */
function compileUsedDirectiveMetadata(meta: R3ComponentMetadata): o.LiteralArrayExpr|null {
  const wrapType = meta.wrapDirectivesAndPipesInClosure ?
      (expr: o.Expression) => o.fn([], [new o.ReturnStatement(expr)]) :
      (expr: o.Expression) => expr;

  return toOptionalLiteralArray(meta.directives, directive => {
    const dirMeta = new DefinitionMap();
    dirMeta.set('type', wrapType(directive.type));
    dirMeta.set('selector', o.literal(directive.selector));
    dirMeta.set('inputs', toOptionalLiteralArray(directive.inputs, o.literal));
    dirMeta.set('outputs', toOptionalLiteralArray(directive.outputs, o.literal));
    dirMeta.set('exportAs', toOptionalLiteralArray(directive.exportAs, o.literal));
    return dirMeta.toLiteralMap();
  });
}

/**
 * Compiles the pipes as registered in the component metadata into an object literal, where the
 * pipe's name is used as key and a reference to its type as value. If the component does not use
 * any pipes, then null is returned.
 */
function compileUsedPipeMetadata(meta: R3ComponentMetadata): o.LiteralMapExpr|null {
  if (meta.pipes.size === 0) {
    return null;
  }

  const wrapType = meta.wrapDirectivesAndPipesInClosure ?
      (expr: o.Expression) => o.fn([], [new o.ReturnStatement(expr)]) :
      (expr: o.Expression) => expr;

  const entries = [];
  for (const [name, pipe] of meta.pipes) {
    entries.push({key: name, value: wrapType(pipe), quoted: true});
  }
  return o.literalMap(entries);
}
