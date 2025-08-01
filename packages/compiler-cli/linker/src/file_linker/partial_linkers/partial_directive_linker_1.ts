/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  compileDirectiveFromMetadata,
  ConstantPool,
  ForwardRefHandling,
  LegacyInputPartialMapping,
  makeBindingParser,
  outputAst as o,
  ParseLocation,
  ParseSourceFile,
  ParseSourceSpan,
  R3DeclareDirectiveMetadata,
  R3DeclareHostDirectiveMetadata,
  R3DeclareQueryMetadata,
  R3DirectiveMetadata,
  R3HostDirectiveMetadata,
  R3HostMetadata,
  R3InputMetadata,
  R3PartialDeclaration,
  R3QueryMetadata,
} from '@angular/compiler';

import {Range} from '../../ast/ast_host';
import {AstObject, AstValue} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

import {LinkedDefinition, PartialLinker} from './partial_linker';
import {extractForwardRef, getDefaultStandaloneValue, wrapReference} from './util';
import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system/src/types';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareDirective()` call expressions.
 */
export class PartialDirectiveLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  constructor(
    private sourceUrl: AbsoluteFsPath,
    private code: string,
  ) {}

  linkPartialDeclaration(
    constantPool: ConstantPool,
    metaObj: AstObject<R3PartialDeclaration, TExpression>,
    version: string,
  ): LinkedDefinition {
    const meta = toR3DirectiveMeta(metaObj, this.code, this.sourceUrl, version);
    return compileDirectiveFromMetadata(meta, constantPool, makeBindingParser());
  }
}

/**
 * Derives the `R3DirectiveMetadata` structure from the AST object.
 */
export function toR3DirectiveMeta<TExpression>(
  metaObj: AstObject<R3DeclareDirectiveMetadata, TExpression>,
  code: string,
  sourceUrl: AbsoluteFsPath,
  version: string,
): R3DirectiveMetadata {
  const typeExpr = metaObj.getValue('type');
  const typeName = typeExpr.getSymbolName();
  if (typeName === null) {
    throw new FatalLinkerError(
      typeExpr.expression,
      'Unsupported type, its name could not be determined',
    );
  }

  return {
    typeSourceSpan: createSourceSpan(typeExpr.getRange(), code, sourceUrl),
    type: wrapReference(typeExpr.getOpaque()),
    typeArgumentCount: 0,
    deps: null,
    host: toHostMetadata(metaObj),
    inputs: metaObj.has('inputs') ? metaObj.getObject('inputs').toLiteral(toInputMapping) : {},
    outputs: metaObj.has('outputs')
      ? metaObj.getObject('outputs').toLiteral((value) => value.getString())
      : {},
    queries: metaObj.has('queries')
      ? metaObj.getArray('queries').map((entry) => toQueryMetadata(entry.getObject()))
      : [],
    viewQueries: metaObj.has('viewQueries')
      ? metaObj.getArray('viewQueries').map((entry) => toQueryMetadata(entry.getObject()))
      : [],
    providers: metaObj.has('providers') ? metaObj.getOpaque('providers') : null,
    fullInheritance: false,
    selector: metaObj.has('selector') ? metaObj.getString('selector') : null,
    exportAs: metaObj.has('exportAs')
      ? metaObj.getArray('exportAs').map((entry) => entry.getString())
      : null,
    lifecycle: {
      usesOnChanges: metaObj.has('usesOnChanges') ? metaObj.getBoolean('usesOnChanges') : false,
    },
    name: typeName,
    usesInheritance: metaObj.has('usesInheritance') ? metaObj.getBoolean('usesInheritance') : false,
    isStandalone: metaObj.has('isStandalone')
      ? metaObj.getBoolean('isStandalone')
      : getDefaultStandaloneValue(version),
    isSignal: metaObj.has('isSignal') ? metaObj.getBoolean('isSignal') : false,
    boundListenersMarkForCheck: metaObj.has('boundListenersMarkForCheck')
      ? metaObj.getBoolean('boundListenersMarkForCheck')
      : true,
    hostDirectives: metaObj.has('hostDirectives')
      ? toHostDirectivesMetadata(metaObj.getValue('hostDirectives'))
      : null,
  };
}

/**
 * Decodes the AST value for a single input to its representation as used in the metadata.
 */
function toInputMapping<TExpression>(
  value: AstValue<NonNullable<R3DeclareDirectiveMetadata['inputs']>[string], TExpression>,
  key: string,
): R3InputMetadata {
  if (value.isObject()) {
    const obj = value.getObject();
    const transformValue = obj.getValue('transformFunction');

    return {
      classPropertyName: obj.getString('classPropertyName'),
      bindingPropertyName: obj.getString('publicName'),
      isSignal: obj.getBoolean('isSignal'),
      required: obj.getBoolean('isRequired'),
      transformFunction: transformValue.isNull() ? null : transformValue.getOpaque(),
    };
  }

  return parseLegacyInputPartialOutput(
    key,
    value as AstValue<LegacyInputPartialMapping, TExpression>,
  );
}

/**
 * Parses the legacy partial output for inputs.
 *
 * More details, see: `legacyInputsPartialMetadata` in `partial/directive.ts`.
 * TODO(legacy-partial-output-inputs): Remove function in v18.
 */
function parseLegacyInputPartialOutput<TExpression>(
  key: string,
  value: AstValue<LegacyInputPartialMapping, TExpression>,
): R3InputMetadata {
  if (value.isString()) {
    return {
      bindingPropertyName: value.getString(),
      classPropertyName: key,
      required: false,
      transformFunction: null,
      isSignal: false,
    };
  }

  const values = value.getArray();
  if (values.length !== 2 && values.length !== 3) {
    throw new FatalLinkerError(
      value.expression,
      'Unsupported input, expected a string or an array containing two strings and an optional function',
    );
  }

  return {
    bindingPropertyName: values[0].getString(),
    classPropertyName: values[1].getString(),
    transformFunction: values.length > 2 ? values[2].getOpaque() : null,
    required: false,
    isSignal: false,
  };
}

/**
 * Extracts the host metadata configuration from the AST metadata object.
 */
function toHostMetadata<TExpression>(
  metaObj: AstObject<R3DeclareDirectiveMetadata, TExpression>,
): R3HostMetadata {
  if (!metaObj.has('host')) {
    return {
      attributes: {},
      listeners: {},
      properties: {},
      specialAttributes: {},
    };
  }

  const host = metaObj.getObject('host');

  const specialAttributes: R3HostMetadata['specialAttributes'] = {};
  if (host.has('styleAttribute')) {
    specialAttributes.styleAttr = host.getString('styleAttribute');
  }
  if (host.has('classAttribute')) {
    specialAttributes.classAttr = host.getString('classAttribute');
  }

  return {
    attributes: host.has('attributes')
      ? host.getObject('attributes').toLiteral((value) => value.getOpaque())
      : {},
    listeners: host.has('listeners')
      ? host.getObject('listeners').toLiteral((value) => value.getString())
      : {},
    properties: host.has('properties')
      ? host.getObject('properties').toLiteral((value) => value.getString())
      : {},
    specialAttributes,
  };
}

/**
 * Extracts the metadata for a single query from an AST object.
 */
function toQueryMetadata<TExpression>(
  obj: AstObject<R3DeclareQueryMetadata, TExpression>,
): R3QueryMetadata {
  let predicate: R3QueryMetadata['predicate'];
  const predicateExpr = obj.getValue('predicate');
  if (predicateExpr.isArray()) {
    predicate = predicateExpr.getArray().map((entry) => entry.getString());
  } else {
    predicate = extractForwardRef(predicateExpr);
  }
  return {
    propertyName: obj.getString('propertyName'),
    first: obj.has('first') ? obj.getBoolean('first') : false,
    predicate,
    descendants: obj.has('descendants') ? obj.getBoolean('descendants') : false,
    emitDistinctChangesOnly: obj.has('emitDistinctChangesOnly')
      ? obj.getBoolean('emitDistinctChangesOnly')
      : true,
    read: obj.has('read') ? obj.getOpaque('read') : null,
    static: obj.has('static') ? obj.getBoolean('static') : false,
    isSignal: obj.has('isSignal') ? obj.getBoolean('isSignal') : false,
  };
}

/**
 * Derives the host directives structure from the AST object.
 */
function toHostDirectivesMetadata<TExpression>(
  hostDirectives: AstValue<R3DeclareHostDirectiveMetadata[] | undefined, TExpression>,
): R3HostDirectiveMetadata[] {
  return hostDirectives.getArray().map((hostDirective) => {
    const hostObject = hostDirective.getObject();
    const type = extractForwardRef(hostObject.getValue('directive'));
    const meta: R3HostDirectiveMetadata = {
      directive: wrapReference(type.expression),
      isForwardReference: type.forwardRef !== ForwardRefHandling.None,
      inputs: hostObject.has('inputs')
        ? getHostDirectiveBindingMapping(hostObject.getArray('inputs'))
        : null,
      outputs: hostObject.has('outputs')
        ? getHostDirectiveBindingMapping(hostObject.getArray('outputs'))
        : null,
    };

    return meta;
  });
}

function getHostDirectiveBindingMapping<TExpression>(array: AstValue<string, TExpression>[]) {
  let result: {[publicName: string]: string} | null = null;

  for (let i = 1; i < array.length; i += 2) {
    result = result || {};
    result[array[i - 1].getString()] = array[i].getString();
  }

  return result;
}

export function createSourceSpan(range: Range, code: string, sourceUrl: string): ParseSourceSpan {
  const sourceFile = new ParseSourceFile(code, sourceUrl);
  const startLocation = new ParseLocation(
    sourceFile,
    range.startPos,
    range.startLine,
    range.startCol,
  );
  return new ParseSourceSpan(startLocation, startLocation.moveBy(range.endPos - range.startPos));
}
