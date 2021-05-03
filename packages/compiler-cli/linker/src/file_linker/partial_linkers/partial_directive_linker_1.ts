/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {compileDirectiveFromMetadata, ConstantPool, makeBindingParser, ParseLocation, ParseSourceFile, ParseSourceSpan, R3DeclareDirectiveMetadata, R3DeclareQueryMetadata, R3DirectiveMetadata, R3HostMetadata, R3PartialDeclaration, R3QueryMetadata} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';

import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {Range} from '../../ast/ast_host';
import {AstObject, AstValue} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

import {PartialLinker} from './partial_linker';
import {wrapReference} from './util';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareDirective()` call expressions.
 */
export class PartialDirectiveLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  constructor(private sourceUrl: AbsoluteFsPath, private code: string) {}

  linkPartialDeclaration(
      constantPool: ConstantPool,
      metaObj: AstObject<R3PartialDeclaration, TExpression>): o.Expression {
    const meta = toR3DirectiveMeta(metaObj, this.code, this.sourceUrl);
    const def = compileDirectiveFromMetadata(meta, constantPool, makeBindingParser());
    return def.expression;
  }
}

/**
 * Derives the `R3DirectiveMetadata` structure from the AST object.
 */
export function toR3DirectiveMeta<TExpression>(
    metaObj: AstObject<R3DeclareDirectiveMetadata, TExpression>, code: string,
    sourceUrl: AbsoluteFsPath): R3DirectiveMetadata {
  const typeExpr = metaObj.getValue('type');
  const typeName = typeExpr.getSymbolName();
  if (typeName === null) {
    throw new FatalLinkerError(
        typeExpr.expression, 'Unsupported type, its name could not be determined');
  }

  return {
    typeSourceSpan: createSourceSpan(typeExpr.getRange(), code, sourceUrl),
    type: wrapReference(typeExpr.getOpaque()),
    typeArgumentCount: 0,
    internalType: metaObj.getOpaque('type'),
    deps: null,
    host: toHostMetadata(metaObj),
    inputs: metaObj.has('inputs') ? metaObj.getObject('inputs').toLiteral(toInputMapping) : {},
    outputs: metaObj.has('outputs') ?
        metaObj.getObject('outputs').toLiteral(value => value.getString()) :
        {},
    queries: metaObj.has('queries') ?
        metaObj.getArray('queries').map(entry => toQueryMetadata(entry.getObject())) :
        [],
    viewQueries: metaObj.has('viewQueries') ?
        metaObj.getArray('viewQueries').map(entry => toQueryMetadata(entry.getObject())) :
        [],
    providers: metaObj.has('providers') ? metaObj.getOpaque('providers') : null,
    fullInheritance: false,
    selector: metaObj.has('selector') ? metaObj.getString('selector') : null,
    exportAs: metaObj.has('exportAs') ?
        metaObj.getArray('exportAs').map(entry => entry.getString()) :
        null,
    lifecycle: {
      usesOnChanges: metaObj.has('usesOnChanges') ? metaObj.getBoolean('usesOnChanges') : false,
    },
    name: typeName,
    usesInheritance: metaObj.has('usesInheritance') ? metaObj.getBoolean('usesInheritance') : false,
  };
}

/**
 * Decodes the AST value for a single input to its representation as used in the metadata.
 */
function toInputMapping<TExpression>(value: AstValue<string|[string, string], TExpression>):
    string|[string, string] {
  if (value.isString()) {
    return value.getString();
  }

  const values = value.getArray().map(innerValue => innerValue.getString());
  if (values.length !== 2) {
    throw new FatalLinkerError(
        value.expression,
        'Unsupported input, expected a string or an array containing exactly two strings');
  }
  return values as [string, string];
}

/**
 * Extracts the host metadata configuration from the AST metadata object.
 */
function toHostMetadata<TExpression>(metaObj: AstObject<R3DeclareDirectiveMetadata, TExpression>):
    R3HostMetadata {
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
    attributes: host.has('attributes') ?
        host.getObject('attributes').toLiteral(value => value.getOpaque()) :
        {},
    listeners: host.has('listeners') ?
        host.getObject('listeners').toLiteral(value => value.getString()) :
        {},
    properties: host.has('properties') ?
        host.getObject('properties').toLiteral(value => value.getString()) :
        {},
    specialAttributes,
  };
}

/**
 * Extracts the metadata for a single query from an AST object.
 */
function toQueryMetadata<TExpression>(obj: AstObject<R3DeclareQueryMetadata, TExpression>):
    R3QueryMetadata {
  let predicate: R3QueryMetadata['predicate'];
  const predicateExpr = obj.getValue('predicate');
  if (predicateExpr.isArray()) {
    predicate = predicateExpr.getArray().map(entry => entry.getString());
  } else {
    predicate = predicateExpr.getOpaque();
  }
  return {
    propertyName: obj.getString('propertyName'),
    first: obj.has('first') ? obj.getBoolean('first') : false,
    predicate,
    descendants: obj.has('descendants') ? obj.getBoolean('descendants') : false,
    emitDistinctChangesOnly:
        obj.has('emitDistinctChangesOnly') ? obj.getBoolean('emitDistinctChangesOnly') : true,
    read: obj.has('read') ? obj.getOpaque('read') : null,
    static: obj.has('static') ? obj.getBoolean('static') : false,
  };
}

export function createSourceSpan(range: Range, code: string, sourceUrl: string): ParseSourceSpan {
  const sourceFile = new ParseSourceFile(code, sourceUrl);
  const startLocation =
      new ParseLocation(sourceFile, range.startPos, range.startLine, range.startCol);
  return new ParseSourceSpan(startLocation, startLocation.moveBy(range.endPos - range.startPos));
}
