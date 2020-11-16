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
import {R3ComponentMetadata, R3DirectiveDef} from '../view/api';
import {createComponentType} from '../view/compiler';
import {ParsedTemplate} from '../view/template';
import {DefinitionMap} from '../view/util';

import {createDirectiveDefinitionMap} from './directive';
import {toOptionalLiteralArray} from './util';


/**
 * Compile a directive declaration defined by the `R3DirectiveMetadata`.
 */
export function compileDeclareComponentFromMetadata(
    meta: R3ComponentMetadata, template: ParsedTemplate): R3DirectiveDef {
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

  const templateMap = new DefinitionMap();
  templateMap.set(
      'source',
      typeof template.template === 'string' ? o.literal(template.template) : template.template);
  templateMap.set('isInline', o.literal(template.isInline));

  definitionMap.set('template', templateMap.toLiteralMap());

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
