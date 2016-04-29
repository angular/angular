import {
  IS_DART,
  StringWrapper,
  Math,
  isBlank,
  isArray,
  isStrictStringMap,
  isPrimitive
} from './facade/lang';
import {StringMapWrapper} from './facade/collection';

export var MODULE_SUFFIX = IS_DART ? '.dart' : '';

var CAMEL_CASE_REGEXP = /([A-Z])/g;
var DASH_CASE_REGEXP = /-([a-z])/g;

export function camelCaseToDashCase(input: string): string {
  return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP,
                                        (m) => { return '-' + m[1].toLowerCase(); });
}

export function dashCaseToCamelCase(input: string): string {
  return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP,
                                        (m) => { return m[1].toUpperCase(); });
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
    StringMapWrapper.forEach(map,
                             (value, key) => { result[key] = visitValue(value, this, context); });
    return result;
  }
  visitPrimitive(value: any, context: any): any { return value; }
  visitOther(value: any, context: any): any { return value; }
}

export function assetUrl(pkg: string, path: string = null, type:string = 'src'): string {
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
