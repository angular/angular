/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotSummaryResolver, CompileMetadataResolver, CompilePipeSummary, CompilerConfig, DEFAULT_INTERPOLATION_CONFIG, DirectiveNormalizer, DirectiveResolver, DomElementSchemaRegistry, HtmlParser, InterpolationConfig, NgAnalyzedModules, NgModuleResolver, ParseTreeResult, PipeResolver, ResourceLoader, StaticAndDynamicReflectionCapabilities, StaticReflector, StaticSymbol, StaticSymbolCache, StaticSymbolResolver, SummaryResolver, analyzeNgModules, componentModuleUrl, createOfflineCompileUrlResolver, extractProgramSymbols} from '@angular/compiler';
import {ViewEncapsulation, ɵConsole as Console} from '@angular/core';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {BuiltinType, DeclarationKind, Definition, PipeInfo, Pipes, Signature, Span, Symbol, SymbolDeclaration, SymbolQuery, SymbolTable} from './symbols';


// In TypeScript 2.1 these flags moved
// These helpers work for both 2.0 and 2.1.
const isPrivate = (ts as any).ModifierFlags ?
    ((node: ts.Node) =>
         !!((ts as any).getCombinedModifierFlags(node) & (ts as any).ModifierFlags.Private)) :
    ((node: ts.Node) => !!(node.flags & (ts as any).NodeFlags.Private));

const isReferenceType = (ts as any).ObjectFlags ?
    ((type: ts.Type) =>
         !!(type.flags & (ts as any).TypeFlags.Object &&
            (type as any).objectFlags & (ts as any).ObjectFlags.Reference)) :
    ((type: ts.Type) => !!(type.flags & (ts as any).TypeFlags.Reference));

interface TypeContext {
  node: ts.Node;
  program: ts.Program;
  checker: ts.TypeChecker;
}

export function getSymbolQuery(
    program: ts.Program, checker: ts.TypeChecker, source: ts.SourceFile,
    fetchPipes: () => SymbolTable): SymbolQuery {
  return new TypeScriptSymbolQuery(program, checker, source, fetchPipes);
}

export function getClassMembers(
    program: ts.Program, checker: ts.TypeChecker, staticSymbol: StaticSymbol): SymbolTable|
    undefined {
  const declaration = getClassFromStaticSymbol(program, staticSymbol);
  if (declaration) {
    const type = checker.getTypeAtLocation(declaration);
    const node = program.getSourceFile(staticSymbol.filePath);
    return new TypeWrapper(type, {node, program, checker}).members();
  }
}

export function getClassMembersFromDeclaration(
    program: ts.Program, checker: ts.TypeChecker, source: ts.SourceFile,
    declaration: ts.ClassDeclaration) {
  const type = checker.getTypeAtLocation(declaration);
  return new TypeWrapper(type, {node: source, program, checker}).members();
}

export function getClassFromStaticSymbol(
    program: ts.Program, type: StaticSymbol): ts.ClassDeclaration|undefined {
  const source = program.getSourceFile(type.filePath);
  if (source) {
    return ts.forEachChild(source, child => {
      if (child.kind === ts.SyntaxKind.ClassDeclaration) {
        const classDeclaration = child as ts.ClassDeclaration;
        if (classDeclaration.name != null && classDeclaration.name.text === type.name) {
          return classDeclaration;
        }
      }
    }) as(ts.ClassDeclaration | undefined);
  }

  return undefined;
}

export function getPipesTable(
    source: ts.SourceFile, program: ts.Program, checker: ts.TypeChecker,
    pipes: CompilePipeSummary[]): SymbolTable {
  return new PipesTable(pipes, {program, checker, node: source});
}

class TypeScriptSymbolQuery implements SymbolQuery {
  private typeCache = new Map<BuiltinType, Symbol>();
  private pipesCache: SymbolTable;

  constructor(
      private program: ts.Program, private checker: ts.TypeChecker, private source: ts.SourceFile,
      private fetchPipes: () => SymbolTable) {}

  getTypeKind(symbol: Symbol): BuiltinType { return typeKindOf(this.getTsTypeOf(symbol)); }

  getBuiltinType(kind: BuiltinType): Symbol {
    let result = this.typeCache.get(kind);
    if (!result) {
      const type = getBuiltinTypeFromTs(
          kind, {checker: this.checker, node: this.source, program: this.program});
      result =
          new TypeWrapper(type, {program: this.program, checker: this.checker, node: this.source});
      this.typeCache.set(kind, result);
    }
    return result;
  }

  getTypeUnion(...types: Symbol[]): Symbol {
    // No API exists so return any if the types are not all the same type.
    let result: Symbol|undefined = undefined;
    if (types.length) {
      result = types[0];
      for (let i = 1; i < types.length; i++) {
        if (types[i] != result) {
          result = undefined;
          break;
        }
      }
    }
    return result || this.getBuiltinType(BuiltinType.Any);
  }

  getArrayType(type: Symbol): Symbol { return this.getBuiltinType(BuiltinType.Any); }

  getElementType(type: Symbol): Symbol|undefined {
    if (type instanceof TypeWrapper) {
      const elementType = getTypeParameterOf(type.tsType, 'Array');
      if (elementType) {
        return new TypeWrapper(elementType, type.context);
      }
    }
  }

  getNonNullableType(symbol: Symbol): Symbol {
    if (symbol instanceof TypeWrapper && (typeof this.checker.getNonNullableType == 'function')) {
      const tsType = symbol.tsType;
      const nonNullableType = this.checker.getNonNullableType(tsType);
      if (nonNullableType != tsType) {
        return new TypeWrapper(nonNullableType, symbol.context);
      } else if (nonNullableType == tsType) {
        return symbol;
      }
    }
    return this.getBuiltinType(BuiltinType.Any);
  }

  getPipes(): SymbolTable {
    let result = this.pipesCache;
    if (!result) {
      result = this.pipesCache = this.fetchPipes();
    }
    return result;
  }

  getTemplateContext(type: StaticSymbol): SymbolTable|undefined {
    const context: TypeContext = {node: this.source, program: this.program, checker: this.checker};
    const typeSymbol = findClassSymbolInContext(type, context);
    if (typeSymbol) {
      const contextType = this.getTemplateRefContextType(typeSymbol);
      if (contextType) return new SymbolWrapper(contextType, context).members();
    }
  }

  getTypeSymbol(type: StaticSymbol): Symbol {
    const context: TypeContext = {node: this.source, program: this.program, checker: this.checker};
    const typeSymbol = findClassSymbolInContext(type, context) !;
    return new SymbolWrapper(typeSymbol, context);
  }

  createSymbolTable(symbols: SymbolDeclaration[]): SymbolTable {
    const result = new MapSymbolTable();
    result.addAll(symbols.map(s => new DeclaredSymbol(s)));
    return result;
  }

  mergeSymbolTable(symbolTables: SymbolTable[]): SymbolTable {
    const result = new MapSymbolTable();
    for (const symbolTable of symbolTables) {
      result.addAll(symbolTable.values());
    }
    return result;
  }

  getSpanAt(line: number, column: number): Span|undefined {
    return spanAt(this.source, line, column);
  }

  private getTemplateRefContextType(typeSymbol: ts.Symbol): ts.Symbol|undefined {
    const type = this.checker.getTypeOfSymbolAtLocation(typeSymbol, this.source);
    const constructor = type.symbol && type.symbol.members &&
        getFromSymbolTable(type.symbol.members !, '__constructor');

    if (constructor) {
      const constructorDeclaration = constructor.declarations ![0] as ts.ConstructorTypeNode;
      for (const parameter of constructorDeclaration.parameters) {
        const type = this.checker.getTypeAtLocation(parameter.type !);
        if (type.symbol !.name == 'TemplateRef' && isReferenceType(type)) {
          const typeReference = type as ts.TypeReference;
          if (typeReference.typeArguments.length === 1) {
            return typeReference.typeArguments[0].symbol;
          }
        }
      }
    }
  }

  private getTsTypeOf(symbol: Symbol): ts.Type|undefined {
    const type = this.getTypeWrapper(symbol);
    return type && type.tsType;
  }

  private getTypeWrapper(symbol: Symbol): TypeWrapper|undefined {
    let type: TypeWrapper|undefined = undefined;
    if (symbol instanceof TypeWrapper) {
      type = symbol;
    } else if (symbol.type instanceof TypeWrapper) {
      type = symbol.type;
    }
    return type;
  }
}

function typeCallable(type: ts.Type): boolean {
  const signatures = type.getCallSignatures();
  return signatures && signatures.length != 0;
}

function signaturesOf(type: ts.Type, context: TypeContext): Signature[] {
  return type.getCallSignatures().map(s => new SignatureWrapper(s, context));
}

function selectSignature(type: ts.Type, context: TypeContext, types: Symbol[]): Signature|
    undefined {
  // TODO: Do a better job of selecting the right signature.
  const signatures = type.getCallSignatures();
  return signatures.length ? new SignatureWrapper(signatures[0], context) : undefined;
}

class TypeWrapper implements Symbol {
  constructor(public tsType: ts.Type, public context: TypeContext) {
    if (!tsType) {
      throw Error('Internal: null type');
    }
  }

  get name(): string {
    const symbol = this.tsType.symbol;
    return (symbol && symbol.name) || '<anonymous>';
  }

  get kind(): DeclarationKind { return 'type'; }

  get language(): string { return 'typescript'; }

  get type(): Symbol|undefined { return undefined; }

  get container(): Symbol|undefined { return undefined; }

  get public(): boolean { return true; }

  get callable(): boolean { return typeCallable(this.tsType); }

  get nullable(): boolean {
    return this.context.checker.getNonNullableType(this.tsType) != this.tsType;
  }

  get definition(): Definition { return definitionFromTsSymbol(this.tsType.getSymbol()); }

  members(): SymbolTable {
    return new SymbolTableWrapper(this.tsType.getProperties(), this.context);
  }

  signatures(): Signature[] { return signaturesOf(this.tsType, this.context); }

  selectSignature(types: Symbol[]): Signature|undefined {
    return selectSignature(this.tsType, this.context, types);
  }

  indexed(argument: Symbol): Symbol|undefined { return undefined; }
}

class SymbolWrapper implements Symbol {
  private symbol: ts.Symbol;
  private _tsType: ts.Type;
  private _members: SymbolTable;

  constructor(symbol: ts.Symbol, private context: TypeContext) {
    this.symbol = symbol && context && (symbol.flags & ts.SymbolFlags.Alias) ?
        context.checker.getAliasedSymbol(symbol) :
        symbol;
  }

  get name(): string { return this.symbol.name; }

  get kind(): DeclarationKind { return this.callable ? 'method' : 'property'; }

  get language(): string { return 'typescript'; }

  get type(): Symbol|undefined { return new TypeWrapper(this.tsType, this.context); }

  get container(): Symbol|undefined { return getContainerOf(this.symbol, this.context); }

  get public(): boolean {
    // Symbols that are not explicitly made private are public.
    return !isSymbolPrivate(this.symbol);
  }

  get callable(): boolean { return typeCallable(this.tsType); }

  get nullable(): boolean { return false; }

  get definition(): Definition { return definitionFromTsSymbol(this.symbol); }

  members(): SymbolTable {
    if (!this._members) {
      if ((this.symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) != 0) {
        const declaredType = this.context.checker.getDeclaredTypeOfSymbol(this.symbol);
        const typeWrapper = new TypeWrapper(declaredType, this.context);
        this._members = typeWrapper.members();
      } else {
        this._members = new SymbolTableWrapper(this.symbol.members !, this.context);
      }
    }
    return this._members;
  }

  signatures(): Signature[] { return signaturesOf(this.tsType, this.context); }

  selectSignature(types: Symbol[]): Signature|undefined {
    return selectSignature(this.tsType, this.context, types);
  }

  indexed(argument: Symbol): Symbol|undefined { return undefined; }

  private get tsType(): ts.Type {
    let type = this._tsType;
    if (!type) {
      type = this._tsType =
          this.context.checker.getTypeOfSymbolAtLocation(this.symbol, this.context.node);
    }
    return type;
  }
}

class DeclaredSymbol implements Symbol {
  constructor(private declaration: SymbolDeclaration) {}

  get name() { return this.declaration.name; }

  get kind() { return this.declaration.kind; }

  get language(): string { return 'ng-template'; }

  get container(): Symbol|undefined { return undefined; }

  get type() { return this.declaration.type; }

  get callable(): boolean { return this.declaration.type.callable; }

  get nullable(): boolean { return false; }

  get public(): boolean { return true; }

  get definition(): Definition { return this.declaration.definition; }

  members(): SymbolTable { return this.declaration.type.members(); }

  signatures(): Signature[] { return this.declaration.type.signatures(); }

  selectSignature(types: Symbol[]): Signature|undefined {
    return this.declaration.type.selectSignature(types);
  }

  indexed(argument: Symbol): Symbol|undefined { return undefined; }
}

class SignatureWrapper implements Signature {
  constructor(private signature: ts.Signature, private context: TypeContext) {}

  get arguments(): SymbolTable {
    return new SymbolTableWrapper(this.signature.getParameters(), this.context);
  }

  get result(): Symbol { return new TypeWrapper(this.signature.getReturnType(), this.context); }
}

class SignatureResultOverride implements Signature {
  constructor(private signature: Signature, private resultType: Symbol) {}

  get arguments(): SymbolTable { return this.signature.arguments; }

  get result(): Symbol { return this.resultType; }
}

const toSymbolTable: (symbols: ts.Symbol[]) => ts.SymbolTable = isTypescriptVersion('2.2') ?
    (symbols => {
      const result = new Map<string, ts.Symbol>();
      for (const symbol of symbols) {
        result.set(symbol.name, symbol);
      }
      return <ts.SymbolTable>(result as any);
    }) :
    (symbols => {
      const result = <any>{};
      for (const symbol of symbols) {
        result[symbol.name] = symbol;
      }
      return result as ts.SymbolTable;
    });

function toSymbols(symbolTable: ts.SymbolTable | undefined): ts.Symbol[] {
  if (!symbolTable) return [];

  const table = symbolTable as any;

  if (typeof table.values === 'function') {
    return Array.from(table.values()) as ts.Symbol[];
  }

  const result: ts.Symbol[] = [];

  const own = typeof table.hasOwnProperty === 'function' ?
      (name: string) => table.hasOwnProperty(name) :
      (name: string) => !!table[name];

  for (const name in table) {
    if (own(name)) {
      result.push(table[name]);
    }
  }
  return result;
}

class SymbolTableWrapper implements SymbolTable {
  private symbols: ts.Symbol[];
  private symbolTable: ts.SymbolTable;

  constructor(symbols: ts.SymbolTable|ts.Symbol[]|undefined, private context: TypeContext) {
    symbols = symbols || [];

    if (Array.isArray(symbols)) {
      this.symbols = symbols;
      this.symbolTable = toSymbolTable(symbols);
    } else {
      this.symbols = toSymbols(symbols);
      this.symbolTable = symbols;
    }
  }

  get size(): number { return this.symbols.length; }

  get(key: string): Symbol|undefined {
    const symbol = getFromSymbolTable(this.symbolTable, key);
    return symbol ? new SymbolWrapper(symbol, this.context) : undefined;
  }

  has(key: string): boolean {
    const table: any = this.symbolTable;
    return (typeof table.has === 'function') ? table.has(key) : table[key] != null;
  }

  values(): Symbol[] { return this.symbols.map(s => new SymbolWrapper(s, this.context)); }
}

class MapSymbolTable implements SymbolTable {
  private map = new Map<string, Symbol>();
  private _values: Symbol[] = [];

  get size(): number { return this.map.size; }

  get(key: string): Symbol|undefined { return this.map.get(key); }

  add(symbol: Symbol) {
    if (this.map.has(symbol.name)) {
      const previous = this.map.get(symbol.name) !;
      this._values[this._values.indexOf(previous)] = symbol;
    }
    this.map.set(symbol.name, symbol);
    this._values.push(symbol);
  }

  addAll(symbols: Symbol[]) {
    for (const symbol of symbols) {
      this.add(symbol);
    }
  }

  has(key: string): boolean { return this.map.has(key); }

  values(): Symbol[] {
    // Switch to this.map.values once iterables are supported by the target language.
    return this._values;
  }
}

class PipesTable implements SymbolTable {
  constructor(private pipes: CompilePipeSummary[], private context: TypeContext) {}

  get size() { return this.pipes.length; }

  get(key: string): Symbol|undefined {
    const pipe = this.pipes.find(pipe => pipe.name == key);
    if (pipe) {
      return new PipeSymbol(pipe, this.context);
    }
  }

  has(key: string): boolean { return this.pipes.find(pipe => pipe.name == key) != null; }

  values(): Symbol[] { return this.pipes.map(pipe => new PipeSymbol(pipe, this.context)); }
}

class PipeSymbol implements Symbol {
  private _tsType: ts.Type;

  constructor(private pipe: CompilePipeSummary, private context: TypeContext) {}

  get name(): string { return this.pipe.name; }

  get kind(): DeclarationKind { return 'pipe'; }

  get language(): string { return 'typescript'; }

  get type(): Symbol|undefined { return new TypeWrapper(this.tsType, this.context); }

  get container(): Symbol|undefined { return undefined; }

  get callable(): boolean { return true; }

  get nullable(): boolean { return false; }

  get public(): boolean { return true; }

  get definition(): Definition { return definitionFromTsSymbol(this.tsType.getSymbol()); }

  members(): SymbolTable { return EmptyTable.instance; }

  signatures(): Signature[] { return signaturesOf(this.tsType, this.context); }

  selectSignature(types: Symbol[]): Signature|undefined {
    let signature = selectSignature(this.tsType, this.context, types) !;
    if (types.length == 1) {
      const parameterType = types[0];
      if (parameterType instanceof TypeWrapper) {
        let resultType: ts.Type|undefined = undefined;
        switch (this.name) {
          case 'async':
            switch (parameterType.name) {
              case 'Observable':
              case 'Promise':
              case 'EventEmitter':
                resultType = getTypeParameterOf(parameterType.tsType, parameterType.name);
                break;
              default:
                resultType = getBuiltinTypeFromTs(BuiltinType.Any, this.context);
                break;
            }
            break;
          case 'slice':
            resultType = getTypeParameterOf(parameterType.tsType, 'Array');
            break;
        }
        if (resultType) {
          signature = new SignatureResultOverride(
              signature, new TypeWrapper(resultType, parameterType.context));
        }
      }
    }
    return signature;
  }

  indexed(argument: Symbol): Symbol|undefined { return undefined; }

  private get tsType(): ts.Type {
    let type = this._tsType;
    if (!type) {
      const classSymbol = this.findClassSymbol(this.pipe.type.reference);
      if (classSymbol) {
        type = this._tsType = this.findTransformMethodType(classSymbol) !;
      }
      if (!type) {
        type = this._tsType = getBuiltinTypeFromTs(BuiltinType.Any, this.context);
      }
    }
    return type;
  }

  private findClassSymbol(type: StaticSymbol): ts.Symbol|undefined {
    return findClassSymbolInContext(type, this.context);
  }

  private findTransformMethodType(classSymbol: ts.Symbol): ts.Type|undefined {
    const classType = this.context.checker.getDeclaredTypeOfSymbol(classSymbol);
    if (classType) {
      const transform = classType.getProperty('transform');
      if (transform) {
        return this.context.checker.getTypeOfSymbolAtLocation(transform, this.context.node);
      }
    }
  }
}

function findClassSymbolInContext(type: StaticSymbol, context: TypeContext): ts.Symbol|undefined {
  const sourceFile = context.program.getSourceFile(type.filePath);
  if (sourceFile) {
    const moduleSymbol = (sourceFile as any).module || (sourceFile as any).symbol;
    const exports = context.checker.getExportsOfModule(moduleSymbol);
    return (exports || []).find(symbol => symbol.name == type.name);
  }
}

class EmptyTable implements SymbolTable {
  get size(): number { return 0; }
  get(key: string): Symbol|undefined { return undefined; }
  has(key: string): boolean { return false; }
  values(): Symbol[] { return []; }
  static instance = new EmptyTable();
}

function findTsConfig(fileName: string): string|undefined {
  let dir = path.dirname(fileName);
  while (fs.existsSync(dir)) {
    const candidate = path.join(dir, 'tsconfig.json');
    if (fs.existsSync(candidate)) return candidate;
    const parentDir = path.dirname(dir);
    if (parentDir === dir) break;
    dir = parentDir;
  }
}

function isBindingPattern(node: ts.Node): node is ts.BindingPattern {
  return !!node && (node.kind === ts.SyntaxKind.ArrayBindingPattern ||
                    node.kind === ts.SyntaxKind.ObjectBindingPattern);
}

function walkUpBindingElementsAndPatterns(node: ts.Node): ts.Node {
  while (node && (node.kind === ts.SyntaxKind.BindingElement || isBindingPattern(node))) {
    node = node.parent !;
  }

  return node;
}

function getCombinedNodeFlags(node: ts.Node): ts.NodeFlags {
  node = walkUpBindingElementsAndPatterns(node);

  let flags = node.flags;
  if (node.kind === ts.SyntaxKind.VariableDeclaration) {
    node = node.parent !;
  }

  if (node && node.kind === ts.SyntaxKind.VariableDeclarationList) {
    flags |= node.flags;
    node = node.parent !;
  }

  if (node && node.kind === ts.SyntaxKind.VariableStatement) {
    flags |= node.flags;
  }

  return flags;
}

function isSymbolPrivate(s: ts.Symbol): boolean {
  return !!s.valueDeclaration && isPrivate(s.valueDeclaration);
}

function getBuiltinTypeFromTs(kind: BuiltinType, context: TypeContext): ts.Type {
  let type: ts.Type;
  const checker = context.checker;
  const node = context.node;
  switch (kind) {
    case BuiltinType.Any:
      type = checker.getTypeAtLocation(setParents(
          <ts.Node><any>{
            kind: ts.SyntaxKind.AsExpression,
            expression: <ts.Node>{kind: ts.SyntaxKind.TrueKeyword},
            type: <ts.Node>{kind: ts.SyntaxKind.AnyKeyword}
          },
          node));
      break;
    case BuiltinType.Boolean:
      type =
          checker.getTypeAtLocation(setParents(<ts.Node>{kind: ts.SyntaxKind.TrueKeyword}, node));
      break;
    case BuiltinType.Null:
      type =
          checker.getTypeAtLocation(setParents(<ts.Node>{kind: ts.SyntaxKind.NullKeyword}, node));
      break;
    case BuiltinType.Number:
      const numeric = <ts.Node>{kind: ts.SyntaxKind.NumericLiteral};
      setParents(<any>{kind: ts.SyntaxKind.ExpressionStatement, expression: numeric}, node);
      type = checker.getTypeAtLocation(numeric);
      break;
    case BuiltinType.String:
      type = checker.getTypeAtLocation(
          setParents(<ts.Node>{kind: ts.SyntaxKind.NoSubstitutionTemplateLiteral}, node));
      break;
    case BuiltinType.Undefined:
      type = checker.getTypeAtLocation(setParents(
          <ts.Node><any>{
            kind: ts.SyntaxKind.VoidExpression,
            expression: <ts.Node>{kind: ts.SyntaxKind.NumericLiteral}
          },
          node));
      break;
    default:
      throw new Error(`Internal error, unhandled literal kind ${kind}:${BuiltinType[kind]}`);
  }
  return type;
}

function setParents<T extends ts.Node>(node: T, parent: ts.Node): T {
  node.parent = parent;
  ts.forEachChild(node, child => setParents(child, node));
  return node;
}

function spanOf(node: ts.Node): Span {
  return {start: node.getStart(), end: node.getEnd()};
}

function shrink(span: Span, offset?: number) {
  if (offset == null) offset = 1;
  return {start: span.start + offset, end: span.end - offset};
}

function spanAt(sourceFile: ts.SourceFile, line: number, column: number): Span|undefined {
  if (line != null && column != null) {
    const position = ts.getPositionOfLineAndCharacter(sourceFile, line, column);
    const findChild = function findChild(node: ts.Node): ts.Node | undefined {
      if (node.kind > ts.SyntaxKind.LastToken && node.pos <= position && node.end > position) {
        const betterNode = ts.forEachChild(node, findChild);
        return betterNode || node;
      }
    };

    const node = ts.forEachChild(sourceFile, findChild);
    if (node) {
      return {start: node.getStart(), end: node.getEnd()};
    }
  }
}

function definitionFromTsSymbol(symbol: ts.Symbol): Definition {
  const declarations = symbol.declarations;
  if (declarations) {
    return declarations.map(declaration => {
      const sourceFile = declaration.getSourceFile();
      return {
        fileName: sourceFile.fileName,
        span: {start: declaration.getStart(), end: declaration.getEnd()}
      };
    });
  }
}

function parentDeclarationOf(node: ts.Node): ts.Node|undefined {
  while (node) {
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
      case ts.SyntaxKind.InterfaceDeclaration:
        return node;
      case ts.SyntaxKind.SourceFile:
        return undefined;
    }
    node = node.parent !;
  }
}

function getContainerOf(symbol: ts.Symbol, context: TypeContext): Symbol|undefined {
  if (symbol.getFlags() & ts.SymbolFlags.ClassMember && symbol.declarations) {
    for (const declaration of symbol.declarations) {
      const parent = parentDeclarationOf(declaration);
      if (parent) {
        const type = context.checker.getTypeAtLocation(parent);
        if (type) {
          return new TypeWrapper(type, context);
        }
      }
    }
  }
}

function getTypeParameterOf(type: ts.Type, name: string): ts.Type|undefined {
  if (type && type.symbol && type.symbol.name == name) {
    const typeArguments: ts.Type[] = (type as any).typeArguments;
    if (typeArguments && typeArguments.length <= 1) {
      return typeArguments[0];
    }
  }
}

function typeKindOf(type: ts.Type | undefined): BuiltinType {
  if (type) {
    if (type.flags & ts.TypeFlags.Any) {
      return BuiltinType.Any;
    } else if (
        type.flags & (ts.TypeFlags.String | ts.TypeFlags.StringLike | ts.TypeFlags.StringLiteral)) {
      return BuiltinType.String;
    } else if (type.flags & (ts.TypeFlags.Number | ts.TypeFlags.NumberLike)) {
      return BuiltinType.Number;
    } else if (type.flags & (ts.TypeFlags.Undefined)) {
      return BuiltinType.Undefined;
    } else if (type.flags & (ts.TypeFlags.Null)) {
      return BuiltinType.Null;
    } else if (type.flags & ts.TypeFlags.Union) {
      // If all the constituent types of a union are the same kind, it is also that kind.
      let candidate: BuiltinType|null = null;
      const unionType = type as ts.UnionType;
      if (unionType.types.length > 0) {
        candidate = typeKindOf(unionType.types[0]);
        for (const subType of unionType.types) {
          if (candidate != typeKindOf(subType)) {
            return BuiltinType.Other;
          }
        }
      }
      if (candidate != null) {
        return candidate;
      }
    } else if (type.flags & ts.TypeFlags.TypeParameter) {
      return BuiltinType.Unbound;
    }
  }
  return BuiltinType.Other;
}



function getFromSymbolTable(symbolTable: ts.SymbolTable, key: string): ts.Symbol|undefined {
  const table = symbolTable as any;
  let symbol: ts.Symbol|undefined;

  if (typeof table.get === 'function') {
    // TS 2.2 uses a Map
    symbol = table.get(key);
  } else {
    // TS pre-2.2 uses an object
    symbol = table[key];
  }

  return symbol;
}

function toNumbers(value: string | undefined): number[] {
  return value ? value.split('.').map(v => +v) : [];
}

function compareNumbers(a: number[], b: number[]): -1|0|1 {
  for (let i = 0; i < a.length && i < b.length; i++) {
    if (a[i] > b[i]) return 1;
    if (a[i] < b[i]) return -1;
  }
  return 0;
}

function isTypescriptVersion(low: string, high?: string): boolean {
  const tsNumbers = toNumbers(ts.version);

  return compareNumbers(toNumbers(low), tsNumbers) <= 0 &&
      compareNumbers(toNumbers(high), tsNumbers) >= 0;
}
