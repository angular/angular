/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../output/output_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {
  convertFromMaybeForwardRefExpression,
  generateForwardRef,
  R3CompiledExpression,
} from '../util';
import {R3DirectiveMetadata, R3HostMetadata, R3QueryMetadata} from '../view/api';
import {createDirectiveType, createHostDirectivesMappingArray} from '../view/compiler';
import {
  asLiteral,
  conditionallyCreateDirectiveBindingLiteral,
  DefinitionMap,
  UNSAFE_OBJECT_KEY_NAME_REGEXP,
} from '../view/util';

import {R3DeclareDirectiveMetadata, R3DeclareQueryMetadata} from './api';
import {toOptionalLiteralMap} from './util';

/**
 * Compile a directive declaration defined by the `R3DirectiveMetadata`.
 */
export function compileDeclareDirectiveFromMetadata(
  meta: R3DirectiveMetadata,
): R3CompiledExpression {
  const definitionMap = createDirectiveDefinitionMap(meta);

  const expression = o.importExpr(R3.declareDirective).callFn([definitionMap.toLiteralMap()]);
  const type = createDirectiveType(meta);

  return {expression, type, statements: []};
}

/**
 * Gathers the declaration fields for a directive into a `DefinitionMap`. This allows for reusing
 * this logic for components, as they extend the directive metadata.
 */
export function createDirectiveDefinitionMap(
  meta: R3DirectiveMetadata,
): DefinitionMap<R3DeclareDirectiveMetadata> {
  const definitionMap = new DefinitionMap<R3DeclareDirectiveMetadata>();
  const minVersion = getMinimumVersionForPartialOutput(meta);

  definitionMap.set('minVersion', o.literal(minVersion));
  definitionMap.set('version', o.literal('0.0.0-PLACEHOLDER'));

  // e.g. `type: MyDirective`
  definitionMap.set('type', meta.type.value);

  if (meta.isStandalone !== undefined) {
    definitionMap.set('isStandalone', o.literal(meta.isStandalone));
  }
  if (meta.isSignal) {
    definitionMap.set('isSignal', o.literal(meta.isSignal));
  }
  if (meta.boundListenersMarkForCheck) {
    definitionMap.set('boundListenersMarkForCheck', o.literal(meta.boundListenersMarkForCheck));
  }

  // e.g. `selector: 'some-dir'`
  if (meta.selector !== null) {
    definitionMap.set('selector', o.literal(meta.selector));
  }

  definitionMap.set(
    'inputs',
    needsNewInputPartialOutput(meta)
      ? createInputsPartialMetadata(meta.inputs)
      : legacyInputsPartialMetadata(meta.inputs),
  );
  definitionMap.set('outputs', conditionallyCreateDirectiveBindingLiteral(meta.outputs));

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

  if (meta.usesInheritance) {
    definitionMap.set('usesInheritance', o.literal(true));
  }

  if (meta.lifecycle.usesOnChanges) {
    definitionMap.set('usesOnChanges', o.literal(true));
  }

  if (meta.hostDirectives?.length) {
    definitionMap.set('hostDirectives', createHostDirectives(meta.hostDirectives));
  }

  definitionMap.set('ngImport', o.importExpr(R3.core));

  return definitionMap;
}

/**
 * Determines the minimum linker version for the partial output
 * generated for this directive.
 *
 * Every time we make a breaking change to the declaration interface or partial-linker
 * behavior, we must update the minimum versions to prevent old partial-linkers from
 * incorrectly processing the declaration.
 *
 * NOTE: Do not include any prerelease in these versions as they are ignored.
 */
function getMinimumVersionForPartialOutput(meta: R3DirectiveMetadata): string {
  // We are starting with the oldest minimum version that can work for common
  // directive partial compilation output. As we discover usages of new features
  // that require a newer partial output emit, we bump the `minVersion`. Our goal
  // is to keep libraries as much compatible with older linker versions as possible.
  let minVersion = '14.0.0';

  // Note: in order to allow consuming Angular libraries that have been compiled with 16.1+ in
  // Angular 16.0, we only force a minimum version of 16.1 if input transform feature as introduced
  // in 16.1 is actually used.
  const hasDecoratorTransformFunctions = Object.values(meta.inputs).some(
    (input) => input.transformFunction !== null,
  );
  if (hasDecoratorTransformFunctions) {
    minVersion = '16.1.0';
  }

  // If there are input flags and we need the new emit, use the actual minimum version,
  // where this was introduced. i.e. in 17.1.0
  // TODO(legacy-partial-output-inputs): Remove in v18.
  if (needsNewInputPartialOutput(meta)) {
    minVersion = '17.1.0';
  }

  // If there are signal-based queries, partial output generates an extra field
  // that should be parsed by linkers. Ensure a proper minimum linker version.
  if (meta.queries.some((q) => q.isSignal) || meta.viewQueries.some((q) => q.isSignal)) {
    minVersion = '17.2.0';
  }

  return minVersion;
}

/**
 * Gets whether the given directive needs the new input partial output structure
 * that can hold additional metadata like `isRequired`, `isSignal` etc.
 */
function needsNewInputPartialOutput(meta: R3DirectiveMetadata): boolean {
  return Object.values(meta.inputs).some((input) => input.isSignal);
}

/**
 * Compiles the metadata of a single query into its partial declaration form as declared
 * by `R3DeclareQueryMetadata`.
 */
function compileQuery(query: R3QueryMetadata): o.LiteralMapExpr {
  const meta = new DefinitionMap<R3DeclareQueryMetadata>();
  meta.set('propertyName', o.literal(query.propertyName));
  if (query.first) {
    meta.set('first', o.literal(true));
  }
  meta.set(
    'predicate',
    Array.isArray(query.predicate)
      ? asLiteral(query.predicate)
      : convertFromMaybeForwardRefExpression(query.predicate),
  );
  if (!query.emitDistinctChangesOnly) {
    // `emitDistinctChangesOnly` is special because we expect it to be `true`.
    // Therefore we explicitly emit the field, and explicitly place it only when it's `false`.
    meta.set('emitDistinctChangesOnly', o.literal(false));
  } else {
    // The linker will assume that an absent `emitDistinctChangesOnly` flag is by default `true`.
  }
  if (query.descendants) {
    meta.set('descendants', o.literal(true));
  }
  meta.set('read', query.read);
  if (query.static) {
    meta.set('static', o.literal(true));
  }
  if (query.isSignal) {
    meta.set('isSignal', o.literal(true));
  }
  return meta.toLiteralMap();
}

/**
 * Compiles the host metadata into its partial declaration form as declared
 * in `R3DeclareDirectiveMetadata['host']`
 */
function compileHostMetadata(meta: R3HostMetadata): o.LiteralMapExpr | null {
  const hostMetadata = new DefinitionMap<NonNullable<R3DeclareDirectiveMetadata['host']>>();
  hostMetadata.set(
    'attributes',
    toOptionalLiteralMap(meta.attributes, (expression) => expression),
  );
  hostMetadata.set('listeners', toOptionalLiteralMap(meta.listeners, o.literal));
  hostMetadata.set('properties', toOptionalLiteralMap(meta.properties, o.literal));

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

function createHostDirectives(
  hostDirectives: NonNullable<R3DirectiveMetadata['hostDirectives']>,
): o.LiteralArrayExpr {
  const expressions = hostDirectives.map((current) => {
    const keys = [
      {
        key: 'directive',
        value: current.isForwardReference
          ? generateForwardRef(current.directive.type)
          : current.directive.type,
        quoted: false,
      },
    ];
    const inputsLiteral = current.inputs ? createHostDirectivesMappingArray(current.inputs) : null;
    const outputsLiteral = current.outputs
      ? createHostDirectivesMappingArray(current.outputs)
      : null;

    if (inputsLiteral) {
      keys.push({key: 'inputs', value: inputsLiteral, quoted: false});
    }

    if (outputsLiteral) {
      keys.push({key: 'outputs', value: outputsLiteral, quoted: false});
    }

    return o.literalMap(keys);
  });

  // If there's a forward reference, we generate a `function() { return [{directive: HostDir}] }`,
  // otherwise we can save some bytes by using a plain array, e.g. `[{directive: HostDir}]`.
  return o.literalArr(expressions);
}

/**
 * Generates partial output metadata for inputs of a directive.
 *
 * The generated structure is expected to match `R3DeclareDirectiveFacade['inputs']`.
 */
function createInputsPartialMetadata(inputs: R3DirectiveMetadata['inputs']): o.Expression | null {
  const keys = Object.getOwnPropertyNames(inputs);
  if (keys.length === 0) {
    return null;
  }

  return o.literalMap(
    keys.map((declaredName) => {
      const value = inputs[declaredName];

      return {
        key: declaredName,
        // put quotes around keys that contain potentially unsafe characters
        quoted: UNSAFE_OBJECT_KEY_NAME_REGEXP.test(declaredName),
        value: o.literalMap([
          {key: 'classPropertyName', quoted: false, value: asLiteral(value.classPropertyName)},
          {key: 'publicName', quoted: false, value: asLiteral(value.bindingPropertyName)},
          {key: 'isSignal', quoted: false, value: asLiteral(value.isSignal)},
          {key: 'isRequired', quoted: false, value: asLiteral(value.required)},
          {key: 'transformFunction', quoted: false, value: value.transformFunction ?? o.NULL_EXPR},
        ]),
      };
    }),
  );
}

/**
 * Pre v18 legacy partial output for inputs.
 *
 * Previously, inputs did not capture metadata like `isSignal` in the partial compilation output.
 * To enable capturing such metadata, we restructured how input metadata is communicated in the
 * partial output. This would make libraries incompatible with older Angular FW versions where the
 * linker would not know how to handle this new "format". For this reason, if we know this metadata
 * does not need to be captured- we fall back to the old format. This is what this function
 * generates.
 *
 * See:
 * https://github.com/angular/angular/blob/d4b423690210872b5c32a322a6090beda30b05a3/packages/core/src/compiler/compiler_facade_interface.ts#L197-L199
 */
function legacyInputsPartialMetadata(inputs: R3DirectiveMetadata['inputs']): o.Expression | null {
  // TODO(legacy-partial-output-inputs): Remove function in v18.

  const keys = Object.getOwnPropertyNames(inputs);
  if (keys.length === 0) {
    return null;
  }

  return o.literalMap(
    keys.map((declaredName) => {
      const value = inputs[declaredName];
      const publicName = value.bindingPropertyName;
      const differentDeclaringName = publicName !== declaredName;
      let result: o.Expression;

      if (differentDeclaringName || value.transformFunction !== null) {
        const values = [asLiteral(publicName), asLiteral(declaredName)];
        if (value.transformFunction !== null) {
          values.push(value.transformFunction);
        }
        result = o.literalArr(values);
      } else {
        result = asLiteral(publicName);
      }

      return {
        key: declaredName,
        // put quotes around keys that contain potentially unsafe characters
        quoted: UNSAFE_OBJECT_KEY_NAME_REGEXP.test(declaredName),
        value: result,
      };
    }),
  );
}
