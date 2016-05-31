export interface ModuleMetadata {
  __symbolic: 'module';
  metadata: {[name: string]: (ClassMetadata | MetadataValue)};
}
export function isModuleMetadata(value: any): value is ModuleMetadata {
  return value && value.__symbolic === 'module';
}

export interface ClassMetadata {
  __symbolic: 'class';
  decorators?: (MetadataSymbolicExpression|MetadataError)[];
  members?: MetadataMap;
}
export function isClassMetadata(value: any): value is ClassMetadata {
  return value && value.__symbolic === 'class';
}

export interface MetadataMap { [name: string]: MemberMetadata[]; }

export interface MemberMetadata {
  __symbolic: 'constructor'|'method'|'property';
  decorators?: (MetadataSymbolicExpression|MetadataError)[];
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
  parameterDecorators?: (MetadataSymbolicExpression|MetadataError)[][];
}
export function isMethodMetadata(value: any): value is MemberMetadata {
  return value && (value.__symbolic === 'constructor' || value.__symbolic === 'method');
}

export interface ConstructorMetadata extends MethodMetadata {
  __symbolic: 'constructor';
  parameters?: (MetadataSymbolicExpression|MetadataError|null)[];
}
export function isConstructorMetadata(value: any): value is ConstructorMetadata {
  return value && value.__symbolic === 'constructor';
}

export type MetadataValue = string | number | boolean | MetadataObject | MetadataArray |
    MetadataSymbolicExpression | MetadataError;

export interface MetadataObject { [name: string]: MetadataValue; }

export interface MetadataArray { [name: number]: MetadataValue; }

export interface MetadataSymbolicExpression {
  __symbolic: 'binary'|'call'|'index'|'new'|'pre'|'reference'|'select'
}
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
        return true;
    }
  }
  return false;
}

export interface MetadataSymbolicBinaryExpression extends MetadataSymbolicExpression {
  __symbolic: 'binary';
  operator: '&&'|'||'|'|'|'^'|'&'|'=='|'!='|'==='|'!=='|'<'|'>'|'<='|'>='|'instanceof'|'in'|'as'|
      '<<'|'>>'|'>>>'|'+'|'-'|'*'|'/'|'%'|'**';
  left: MetadataValue;
  right: MetadataValue;
}
export function isMetadataSymbolicBinaryExpression(value: any):
    value is MetadataSymbolicBinaryExpression {
  return value && value.__symbolic === 'binary';
}

export interface MetadataSymbolicIndexExpression extends MetadataSymbolicExpression {
  __symbolic: 'index';
  expression: MetadataValue;
  index: MetadataValue;
}
export function isMetadataSymbolicIndexExpression(value: any):
    value is MetadataSymbolicIndexExpression {
  return value && value.__symbolic === 'index';
}

export interface MetadataSymbolicCallExpression extends MetadataSymbolicExpression {
  __symbolic: 'call'|'new';
  expression: MetadataValue;
  arguments?: MetadataValue[];
}
export function isMetadataSymbolicCallExpression(value: any):
    value is MetadataSymbolicCallExpression {
  return value && (value.__symbolic === 'call' || value.__symbolic === 'new');
}

export interface MetadataSymbolicPrefixExpression extends MetadataSymbolicExpression {
  __symbolic: 'pre';
  operator: '+'|'-'|'~'|'!';
  operand: MetadataValue;
}
export function isMetadataSymbolicPrefixExpression(value: any):
    value is MetadataSymbolicPrefixExpression {
  return value && value.__symbolic === 'pre';
}

export interface MetadataGlobalReferenceExpression extends MetadataSymbolicExpression {
  __symbolic: 'reference';
  name: string;
  arguments?: MetadataValue[];
}
export function isMetadataGlobalReferenceExpression(value: any):
    value is MetadataGlobalReferenceExpression {
  return isMetadataSymbolicReferenceExpression(value) && value.name && !value.module;
}

export interface MetadataModuleReferenceExpression extends MetadataSymbolicExpression {
  __symbolic: 'reference';
  module: string;
}
export function isMetadataModuleReferenceExpression(value: any):
    value is MetadataModuleReferenceExpression {
  return isMetadataSymbolicReferenceExpression(value) && value.module && !value.name &&
      !value.default;
}

export interface MetadataImportedSymbolReferenceExpression extends MetadataSymbolicExpression {
  __symbolic: 'reference';
  module: string;
  name: string;
  arguments?: MetadataValue[];
}
export function isMetadataImportedSymbolReferenceExpression(value: any):
    value is MetadataImportedSymbolReferenceExpression {
  return isMetadataSymbolicReferenceExpression(value) && value.module && !!value.name;
}

export interface MetadataImportedDefaultReferenceExpression extends MetadataSymbolicExpression {
  __symbolic: 'reference';
  module: string;
  default:
    boolean;
}
export function isMetadataImportDefaultReference(value: any):
    value is MetadataImportedDefaultReferenceExpression {
  return isMetadataSymbolicReferenceExpression(value) && value.module && value.default;
}

export type MetadataSymbolicReferenceExpression = MetadataGlobalReferenceExpression |
    MetadataModuleReferenceExpression | MetadataImportedSymbolReferenceExpression |
    MetadataImportedDefaultReferenceExpression;
export function isMetadataSymbolicReferenceExpression(value: any):
    value is MetadataSymbolicReferenceExpression {
  return value && value.__symbolic === 'reference';
}

export interface MetadataSymbolicSelectExpression extends MetadataSymbolicExpression {
  __symbolic: 'select';
  expression: MetadataValue;
  name: string;
}
export function isMetadataSymbolicSelectExpression(value: any):
    value is MetadataSymbolicSelectExpression {
  return value && value.__symbolic === 'select';
}

export interface MetadataError {
  __symbolic: 'error';
  message: string;
}
export function isMetadataError(value: any): value is MetadataError {
  return value && value.__symbolic === 'error';
}