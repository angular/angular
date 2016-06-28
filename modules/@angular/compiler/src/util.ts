/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileTokenMetadata} from './compile_metadata';
import {StringMapWrapper} from './facade/collection';
import {IS_DART, StringWrapper, isArray, isBlank, isPresent, isPrimitive, isStrictStringMap} from './facade/lang';
import * as o from './output/output_ast';

export var MODULE_SUFFIX = IS_DART ? '.dart' : '';

var CAMEL_CASE_REGEXP = /([A-Z])/g;

export function camelCaseToDashCase(input: string): string {
  return StringWrapper.replaceAllMapped(
      input, CAMEL_CASE_REGEXP, (m: string[]) => { return '-' + m[1].toLowerCase(); });
}

export function splitAtColon(input: string, defaultValues: string[]): string[] {
  var parts = StringWrapper.split(input.trim(), /\s*:\s*/g);
  if (parts.length > 1) {
    return parts;
  } else {
    return defaultValues;
  }
}

export function sanitizeIdentifier(name: string): string {
  return StringWrapper.replaceAll(name, /\W/g, '_');
}

export function visitValue(value: any, visitor: ValueVisitor, context: any): any {
  if (isArray(value)) {
    return visitor.visitArray(<any[]>value, context);
  } else if (isStrictStringMap(value)) {
    return visitor.visitStringMap(<{[key: string]: any}>value, context);
  } else if (isBlank(value) || isPrimitive(value)) {
    return visitor.visitPrimitive(value, context);
  } else {
    return visitor.visitOther(value, context);
  }
}

export interface ValueVisitor {
  visitArray(arr: any[], context: any): any;
  visitStringMap(map: {[key: string]: any}, context: any): any;
  visitPrimitive(value: any, context: any): any;
  visitOther(value: any, context: any): any;
}

export class ValueTransformer implements ValueVisitor {
  visitArray(arr: any[], context: any): any {
    return arr.map(value => visitValue(value, this, context));
  }
  visitStringMap(map: {[key: string]: any}, context: any): any {
    var result = {};
    StringMapWrapper.forEach(map, (value: any /** TODO #9100 */, key: any /** TODO #9100 */) => {
      (result as any /** TODO #9100 */)[key] = visitValue(value, this, context);
    });
    return result;
  }
  visitPrimitive(value: any, context: any): any { return value; }
  visitOther(value: any, context: any): any { return value; }
}

export function assetUrl(pkg: string, path: string = null, type: string = 'src'): string {
  if (IS_DART) {
    if (path == null) {
      return `asset:angular2/${pkg}/${pkg}.dart`;
    } else {
      return `asset:angular2/lib/${pkg}/src/${path}.dart`;
    }
  } else {
    if (path == null) {
      return `asset:@angular/lib/${pkg}/index`;
    } else {
      return `asset:@angular/lib/${pkg}/src/${path}`;
    }
  }
}

export function createDiTokenExpression(token: CompileTokenMetadata): o.Expression {
  if (isPresent(token.value)) {
    return o.literal(token.value);
  } else if (token.identifierIsInstance) {
    return o.importExpr(token.identifier)
        .instantiate([], o.importType(token.identifier, [], [o.TypeModifier.Const]));
  } else {
    return o.importExpr(token.identifier);
  }
}

export class SyncAsyncResult<T> {
  constructor(public syncResult: T, public asyncResult: Promise<T> = null) {
    if (!asyncResult) {
      asyncResult = Promise.resolve(syncResult);
    }
  }
}
