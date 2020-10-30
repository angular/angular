/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../output/output_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {R3DirectiveDef, R3DirectiveMetadata, R3HostMetadata, R3QueryMetadata} from '../view/api';
import {createDirectiveTypeParams} from '../view/compiler';
import {asLiteral, conditionallyCreateMapObjectLiteral, DefinitionMap} from '../view/util';


/**
 * Compile a directive declaration defined by the `R3DirectiveMetadata`.
 */
export function compileDeclareDirectiveFromMetadata(meta: R3DirectiveMetadata): R3DirectiveDef {
  const definitionMap = baseDirectivePartialCompile(meta);

  const expression = o.importExpr(R3.declareDirective).callFn([definitionMap.toLiteralMap()]);

  const typeParams = createDirectiveTypeParams(meta);
  const type = o.expressionType(o.importExpr(R3.DirectiveDefWithMeta, typeParams));

  return {expression, type};
}

/**
 * Gathers the declaration fields for a directive into a `DefinitionMap`. This allows for reusing
 * this logic for components, as they extend the directive metadata.
 */
export function baseDirectivePartialCompile(meta: R3DirectiveMetadata): DefinitionMap {
  const definitionMap = new DefinitionMap();

  definitionMap.set('version', o.literal(1));

  // e.g. `type: MyDirective`
  definitionMap.set('type', meta.internalType);

  // e.g. `selector: 'some-dir'`
  if (meta.selector !== null) {
    definitionMap.set('selector', o.literal(meta.selector));
  }

  definitionMap.set('inputs', conditionallyCreateMapObjectLiteral(meta.inputs, true));
  definitionMap.set('outputs', conditionallyCreateMapObjectLiteral(meta.outputs));

  definitionMap.set('host', compileHostMetadata(meta.host));

  definitionMap.set('providers', meta.providers);

  if (meta.queries.length > 0) {
    definitionMap.set('queries', o.literalArr(meta.queries.map(compileQuery)));
  }
  if (meta.viewQueries.length > 0) {
    definitionMap.set('viewQueries', o.literalArr(meta.viewQueries.map(compileQuery)));
  }

  if (meta.exportAs !== null) {
    definitionMap.set('exportAs', asLiteral(meta.exportAs));
  }

  definitionMap.set('usesInheritance', o.literal(meta.usesInheritance));
  definitionMap.set('fullInheritance', o.literal(meta.fullInheritance));
  definitionMap.set('usesOnChanges', o.literal(meta.lifecycle.usesOnChanges));

  definitionMap.set('ngImport', o.importExpr(R3.core));

  return definitionMap;
}

/**
 * Compiles the metadata of a single query into its partial declaration form as declared
 * by `R3DeclareQueryMetadata`.
 */
function compileQuery(query: R3QueryMetadata): o.LiteralMapExpr {
  const meta = new DefinitionMap();
  meta.set('propertyName', o.literal(query.propertyName));
  meta.set('first', o.literal(query.first));
  meta.set(
      'predicate', Array.isArray(query.predicate) ? asLiteral(query.predicate) : query.predicate);
  meta.set('descendants', o.literal(query.descendants));
  meta.set('read', query.read);
  meta.set('static', o.literal(query.static));
  return meta.toLiteralMap();
}

/**
 * Compiles the host metadata into its partial declaration form as declared
 * in `R3DeclareDirectiveMetadata['host']`
 */
function compileHostMetadata(meta: R3HostMetadata): o.LiteralMapExpr|null {
  const hostMetadata = new DefinitionMap();
  const attributes = o.literalMap(Object.keys(meta.attributes).map(key => {
    const value = meta.attributes[key];
    return {key, value, quoted: true};
  }));
  if (attributes.entries.length > 0) {
    hostMetadata.set('attributes', attributes);
  }

  const listeners = o.literalMap(Object.keys(meta.listeners).map(key => {
    const value = meta.listeners[key];
    return {key, value: o.literal(value), quoted: true};
  }));
  if (listeners.entries.length > 0) {
    hostMetadata.set('listeners', listeners);
  }

  const properties = o.literalMap(Object.keys(meta.properties).map(key => {
    const value = meta.properties[key];
    return {key, value: o.literal(value), quoted: true};
  }));
  if (properties.entries.length > 0) {
    hostMetadata.set('properties', properties);
  }

  if (meta.specialAttributes.styleAttr) {
    hostMetadata.set('styleAttribute', o.literal(meta.specialAttributes.styleAttr));
  }
  if (meta.specialAttributes.classAttr) {
    hostMetadata.set('classAttribute', o.literal(meta.specialAttributes.classAttr));
  }

  if (hostMetadata.values.length > 0) {
    return hostMetadata.toLiteralMap();
  } else {
    return null;
  }
}
