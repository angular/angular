// TODO: fix typings for __symbolic once angular moves to 1.8

export interface ModuleMetadata {
  __symbolic: string;  // "module";
  module: string;
  metadata: {[name: string]: (ClassMetadata | MetadataValue)};
}
export function isModuleMetadata(value: any): value is ModuleMetadata {
  return value && value.__symbolic === "module";
}

export interface ClassMetadata {
  __symbolic: string;  // "class";
  decorators?: MetadataSymbolicExpression[];
  members?: MetadataMap;
}
export function isClassMetadata(value: any): value is ClassMetadata {
  return value && value.__symbolic === "class";
}

export interface MetadataMap { [name: string]: MemberMetadata[]; }

export interface MemberMetadata {
  __symbolic: string;  // "constructor" | "method" | "property";
  decorators?: MetadataSymbolicExpression[];
}
export function isMemberMetadata(value: any): value is MemberMetadata {
  if (value) {
    switch (value.__symbolic) {
      case "constructor":
      case "method":
      case "property":
        return true;
    }
  }
  return false;
}

export interface MethodMetadata extends MemberMetadata {
  // __symbolic: "constructor" | "method";
  parameterDecorators?: MetadataSymbolicExpression[][];
}
export function isMethodMetadata(value: any): value is MemberMetadata {
  return value && (value.__symbolic === "constructor" || value.__symbolic === "method");
}

export interface ConstructorMetadata extends MethodMetadata {
  // __symbolic: "constructor";
  parameters?: MetadataSymbolicExpression[];
}
export function isConstructorMetadata(value: any): value is ConstructorMetadata {
  return value && value.__symbolic === "constructor";
}

export type MetadataValue =
    string | number | boolean | MetadataObject | MetadataArray | MetadataSymbolicExpression;

export interface MetadataObject { [name: string]: MetadataValue; }

export interface MetadataArray { [name: number]: MetadataValue; }

export interface MetadataSymbolicExpression {
  __symbolic: string;  // "binary" | "call" | "index" | "pre" | "reference" | "select"
}
export function isMetadataSymbolicExpression(value: any): value is MetadataSymbolicExpression {
  if (value) {
    switch (value.__symbolic) {
      case "binary":
      case "call":
      case "index":
      case "pre":
      case "reference":
      case "select":
        return true;
    }
  }
  return false;
}

export interface MetadataSymbolicBinaryExpression extends MetadataSymbolicExpression {
  // __symbolic: "binary";
  operator: string;  // "&&" | "||" | "|" | "^" | "&" | "==" | "!=" | "===" | "!==" | "<" | ">" |
                     // "<=" | ">=" | "instanceof" | "in" | "as" | "<<" | ">>" | ">>>" | "+" | "-" |
                     // "*" | "/" | "%" | "**";
  left: MetadataValue;
  right: MetadataValue;
}
export function isMetadataSymbolicBinaryExpression(
    value: any): value is MetadataSymbolicBinaryExpression {
  return value && value.__symbolic === "binary";
}

export interface MetadataSymbolicIndexExpression extends MetadataSymbolicExpression {
  // __symbolic: "index";
  expression: MetadataValue;
  index: MetadataValue;
}
export function isMetadataSymbolicIndexExpression(
    value: any): value is MetadataSymbolicIndexExpression {
  return value && value.__symbolic === "index";
}

export interface MetadataSymbolicCallExpression extends MetadataSymbolicExpression {
  // __symbolic: "call";
  expression: MetadataValue;
  arguments?: MetadataValue[];
}
export function isMetadataSymbolicCallExpression(
    value: any): value is MetadataSymbolicCallExpression {
  return value && value.__symbolic === "call";
}

export interface MetadataSymbolicPrefixExpression extends MetadataSymbolicExpression {
  // __symbolic: "pre";
  operator: string;  // "+" | "-" | "~" | "!";
  operand: MetadataValue;
}
export function isMetadataSymbolicPrefixExpression(
    value: any): value is MetadataSymbolicPrefixExpression {
  return value && value.__symbolic === "pre";
}

export interface MetadataSymbolicReferenceExpression extends MetadataSymbolicExpression {
  // __symbolic: "reference";
  name: string;
  module: string;
}
export function isMetadataSymbolicReferenceExpression(
    value: any): value is MetadataSymbolicReferenceExpression {
  return value && value.__symbolic === "reference";
}

export interface MetadataSymbolicSelectExpression extends MetadataSymbolicExpression {
  // __symbolic: "select";
  expression: MetadataValue;
  name: string;
}
export function isMetadataSymbolicSelectExpression(
    value: any): value is MetadataSymbolicSelectExpression {
  return value && value.__symbolic === "select";
}
