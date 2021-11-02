/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Metadata Schema

// If you make a backwards incompatible change to the schema, increment the METADTA_VERSION number.

// If you make a backwards compatible change to the metadata (such as adding an option field) then
// leave METADATA_VERSION the same. If possible, supply as many versions of the metadata that can
// represent the semantics of the file in an array. For example, when generating a version 2 file,
// if version 1 can accurately represent the metadata, generate both version 1 and version 2 in
// an array.

export const METADATA_VERSION = 4;

export type MetadataEntry = ClassMetadata|InterfaceMetadata|FunctionMetadata|MetadataValue;

export interface ModuleMetadata {
  __symbolic: 'module';
  version: number;
  exports?: ModuleExportMetadata[];
  importAs?: string;
  metadata: {[name: string]: MetadataEntry};
  origins?: {[name: string]: string};
}
export function isModuleMetadata(value: any): value is ModuleMetadata {
  return value && value.__symbolic === 'module';
}

export interface ModuleExportMetadata {
  export?: (string|{name: string, as: string})[];
  from: string;
}

export interface ClassMetadata {
  __symbolic: 'class';
  extends?: MetadataSymbolicExpression|MetadataError;
  arity?: number;
  decorators?: (MetadataSymbolicExpression|MetadataError)[];
  members?: MetadataMap;
  statics?: {[name: string]: MetadataValue|FunctionMetadata};
}
export function isClassMetadata(value: any): value is ClassMetadata {
  return value && value.__symbolic === 'class';
}

export interface InterfaceMetadata {
  __symbolic: 'interface';
}
export function isInterfaceMetadata(value: any): value is InterfaceMetadata {
  return value && value.__symbolic === 'interface';
}

export interface MetadataMap {
  [name: string]: MemberMetadata[];
}

export interface MemberMetadata {
  __symbolic: 'constructor'|'method'|'property';
  decorators?: (MetadataSymbolicExpression|MetadataError)[];
  parameters?: (MetadataSymbolicExpression|MetadataError|null|undefined)[];
}
export function isMemberMetadata(value: any): value is MemberMetadata {
  if (value) {
    switch (value.__symbolic) {
      case 'constructor':
      case 'method':
      case 'property':
        return true;
    }
  }
  return false;
}

export interface MethodMetadata extends MemberMetadata {
  __symbolic: 'constructor'|'method';
  parameterDecorators?: ((MetadataSymbolicExpression | MetadataError)[]|undefined)[];
}
export function isMethodMetadata(value: any): value is MethodMetadata {
  return value && (value.__symbolic === 'constructor' || value.__symbolic === 'method');
}

export interface ConstructorMetadata extends MethodMetadata {
  __symbolic: 'constructor';
  parameters?: (MetadataSymbolicExpression|MetadataError|null|undefined)[];
}
export function isConstructorMetadata(value: any): value is ConstructorMetadata {
  return value && value.__symbolic === 'constructor';
}

export interface FunctionMetadata {
  __symbolic: 'function';
  parameters: string[];
  defaults?: MetadataValue[];
  value: MetadataValue;
}
export function isFunctionMetadata(value: any): value is FunctionMetadata {
  return value && value.__symbolic === 'function';
}

export type MetadataValue = string|number|boolean|undefined|null|MetadataObject|MetadataArray|
    MetadataSymbolicExpression|MetadataSymbolicReferenceExpression|MetadataSymbolicBinaryExpression|
    MetadataSymbolicIndexExpression|MetadataSymbolicCallExpression|MetadataSymbolicPrefixExpression|
    MetadataSymbolicIfExpression|MetadataSymbolicSpreadExpression|MetadataSymbolicSelectExpression|
    MetadataError;

export interface MetadataObject {
  [name: string]: MetadataValue;
}

export interface MetadataArray {
  [name: number]: MetadataValue;
}

export type MetadataSymbolicExpression = MetadataSymbolicBinaryExpression|
    MetadataSymbolicIndexExpression|MetadataSymbolicIndexExpression|MetadataSymbolicCallExpression|
    MetadataSymbolicCallExpression|MetadataSymbolicPrefixExpression|MetadataSymbolicIfExpression|
    MetadataGlobalReferenceExpression|MetadataModuleReferenceExpression|
    MetadataImportedSymbolReferenceExpression|MetadataImportedDefaultReferenceExpression|
    MetadataSymbolicSelectExpression|MetadataSymbolicSpreadExpression;

export function isMetadataSymbolicExpression(value: any): value is MetadataSymbolicExpression {
  if (value) {
    switch (value.__symbolic) {
      case 'binary':
      case 'call':
      case 'index':
      case 'new':
      case 'pre':
      case 'reference':
      case 'select':
      case 'spread':
      case 'if':
        return true;
    }
  }
  return false;
}

export interface MetadataSymbolicBinaryExpression {
  __symbolic: 'binary';
  operator: '&&'|'||'|'|'|'^'|'&'|'=='|'!='|'==='|'!=='|'<'|'>'|'<='|'>='|'instanceof'|'in'|'as'|
      '<<'|'>>'|'>>>'|'+'|'-'|'*'|'/'|'%'|'**'|'??';
  left: MetadataValue;
  right: MetadataValue;
}
export function isMetadataSymbolicBinaryExpression(value: any):
    value is MetadataSymbolicBinaryExpression {
  return value && value.__symbolic === 'binary';
}

export interface MetadataSymbolicIndexExpression {
  __symbolic: 'index';
  expression: MetadataValue;
  index: MetadataValue;
}
export function isMetadataSymbolicIndexExpression(value: any):
    value is MetadataSymbolicIndexExpression {
  return value && value.__symbolic === 'index';
}

export interface MetadataSymbolicCallExpression {
  __symbolic: 'call'|'new';
  expression: MetadataValue;
  arguments?: MetadataValue[];
}
export function isMetadataSymbolicCallExpression(value: any):
    value is MetadataSymbolicCallExpression {
  return value && (value.__symbolic === 'call' || value.__symbolic === 'new');
}

export interface MetadataSymbolicPrefixExpression {
  __symbolic: 'pre';
  operator: '+'|'-'|'~'|'!';
  operand: MetadataValue;
}
export function isMetadataSymbolicPrefixExpression(value: any):
    value is MetadataSymbolicPrefixExpression {
  return value && value.__symbolic === 'pre';
}

export interface MetadataSymbolicIfExpression {
  __symbolic: 'if';
  condition: MetadataValue;
  thenExpression: MetadataValue;
  elseExpression: MetadataValue;
}
export function isMetadataSymbolicIfExpression(value: any): value is MetadataSymbolicIfExpression {
  return value && value.__symbolic === 'if';
}

export interface MetadataSourceLocationInfo {
  /**
   * The line number of the error in the .ts file the metadata was created for.
   */
  line?: number;

  /**
   * The number of utf8 code-units from the beginning of the file of the error.
   */
  character?: number;
}

export interface MetadataGlobalReferenceExpression extends MetadataSourceLocationInfo {
  __symbolic: 'reference';
  name: string;
  arguments?: MetadataValue[];
}
export function isMetadataGlobalReferenceExpression(value: any):
    value is MetadataGlobalReferenceExpression {
  return value && value.name && !value.module && isMetadataSymbolicReferenceExpression(value);
}

export interface MetadataModuleReferenceExpression extends MetadataSourceLocationInfo {
  __symbolic: 'reference';
  module: string;
}
export function isMetadataModuleReferenceExpression(value: any):
    value is MetadataModuleReferenceExpression {
  return value && value.module && !value.name && !value.default &&
      isMetadataSymbolicReferenceExpression(value);
}

export interface MetadataImportedSymbolReferenceExpression extends MetadataSourceLocationInfo {
  __symbolic: 'reference';
  module: string;
  name: string;
  arguments?: MetadataValue[];
}
export function isMetadataImportedSymbolReferenceExpression(value: any):
    value is MetadataImportedSymbolReferenceExpression {
  return value && value.module && !!value.name && isMetadataSymbolicReferenceExpression(value);
}

export interface MetadataImportedDefaultReferenceExpression extends MetadataSourceLocationInfo {
  __symbolic: 'reference';
  module: string;
  default: boolean;
  arguments?: MetadataValue[];
}
export function isMetadataImportDefaultReference(value: any):
    value is MetadataImportedDefaultReferenceExpression {
  return value && value.module && value.default && isMetadataSymbolicReferenceExpression(value);
}

export type MetadataSymbolicReferenceExpression =
    MetadataGlobalReferenceExpression|MetadataModuleReferenceExpression|
    MetadataImportedSymbolReferenceExpression|MetadataImportedDefaultReferenceExpression;
export function isMetadataSymbolicReferenceExpression(value: any):
    value is MetadataSymbolicReferenceExpression {
  return value && value.__symbolic === 'reference';
}

export interface MetadataSymbolicSelectExpression {
  __symbolic: 'select';
  expression: MetadataValue;
  member: string;
}
export function isMetadataSymbolicSelectExpression(value: any):
    value is MetadataSymbolicSelectExpression {
  return value && value.__symbolic === 'select';
}

export interface MetadataSymbolicSpreadExpression {
  __symbolic: 'spread';
  expression: MetadataValue;
}
export function isMetadataSymbolicSpreadExpression(value: any):
    value is MetadataSymbolicSpreadExpression {
  return value && value.__symbolic === 'spread';
}

export interface MetadataError extends MetadataSourceLocationInfo {
  __symbolic: 'error';

  /**
   * This message should be short and relatively discriptive and should be fixed once it is created.
   * If the reader doesn't recognize the message, it will display the message unmodified. If the
   * reader recognizes the error message is it free to use substitute message the is more
   * descriptive and/or localized.
   */
  message: string;

  /**
   * The module of the error (only used in bundled metadata)
   */
  module?: string;

  /**
   * Context information that can be used to generate a more descriptive error message. The content
   * of the context is dependent on the error message.
   */
  context?: {[name: string]: string};
}

export function isMetadataError(value: any): value is MetadataError {
  return value && value.__symbolic === 'error';
}
