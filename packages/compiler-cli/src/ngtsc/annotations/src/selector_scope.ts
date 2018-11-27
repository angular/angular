/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, ExternalExpr, ExternalReference, WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {ReflectionHost} from '../../host';
import {AbsoluteReference, Reference, ResolvedReference, reflectTypeEntityToDeclaration} from '../../metadata';
import {reflectIdentifierOfDeclaration, reflectNameOfDeclaration} from '../../metadata/src/reflector';
import {TypeCheckableDirectiveMeta} from '../../typecheck';

import {extractDirectiveGuards} from './util';


/**
 * Metadata extracted for a given NgModule that can be used to compute selector scopes.
 */
export interface ModuleData {
  declarations: Reference<ts.Declaration>[];
  imports: Reference<ts.Declaration>[];
  exports: Reference<ts.Declaration>[];
}

/**
 * Transitively expanded maps of directives and pipes visible to a component being compiled in the
 * context of some module.
 */
export interface CompilationScope<T> {
  directives: Map<string, ScopeDirective<T>>;
  pipes: Map<string, T>;
  containsForwardDecls?: boolean;
}

export interface ScopeDirective<T> extends TypeCheckableDirectiveMeta {
  selector: string;
  directive: T;
}

/**
 * Both transitively expanded scopes for a given NgModule.
 */
interface SelectorScopes {
  /**
   * Set of components, directives, and pipes visible to all components being compiled in the
   * context of some module.
   */
  compilation: Reference<ts.Declaration>[];

  /**
   * Set of components, directives, and pipes added to the compilation scope of any module importing
   * some module.
   */
  exported: Reference<ts.Declaration>[];
}

/**
 * Registry which records and correlates static analysis information of Angular types.
 *
 * Once a compilation unit's information is fed into the SelectorScopeRegistry, it can be asked to
 * produce transitive `CompilationScope`s for components.
 */
export class SelectorScopeRegistry {
  /**
   *  Map of modules declared in the current compilation unit to their (local) metadata.
   */
  private _moduleToData = new Map<ts.Declaration, ModuleData>();

  /**
   * Map of modules to their cached `CompilationScope`s.
   */
  private _compilationScopeCache = new Map<ts.Declaration, CompilationScope<Reference>>();

  /**
   * Map of components/directives to their metadata.
   */
  private _directiveToMetadata = new Map<ts.Declaration, ScopeDirective<Reference>>();

  /**
   * Map of pipes to their name.
   */
  private _pipeToName = new Map<ts.Declaration, string>();

  /**
   * Map of components/directives/pipes to their module.
   */
  private _declararedTypeToModule = new Map<ts.Declaration, ts.Declaration>();

  constructor(private checker: ts.TypeChecker, private reflector: ReflectionHost) {}

  /**
   * Register a module's metadata with the registry.
   */
  registerModule(node: ts.Declaration, data: ModuleData): void {
    node = ts.getOriginalNode(node) as ts.Declaration;

    if (this._moduleToData.has(node)) {
      throw new Error(`Module already registered: ${reflectNameOfDeclaration(node)}`);
    }
    this._moduleToData.set(node, data);

    // Register all of the module's declarations in the context map as belonging to this module.
    data.declarations.forEach(decl => {
      this._declararedTypeToModule.set(ts.getOriginalNode(decl.node) as ts.Declaration, node);
    });
  }

  /**
   * Register the metadata of a component or directive with the registry.
   */
  registerDirective(node: ts.Declaration, metadata: ScopeDirective<Reference>): void {
    node = ts.getOriginalNode(node) as ts.Declaration;

    if (this._directiveToMetadata.has(node)) {
      throw new Error(
          `Selector already registered: ${reflectNameOfDeclaration(node)} ${metadata.selector}`);
    }
    this._directiveToMetadata.set(node, metadata);
  }

  /**
   * Register the name of a pipe with the registry.
   */
  registerPipe(node: ts.Declaration, name: string): void {
    node = ts.getOriginalNode(node) as ts.Declaration;

    this._pipeToName.set(node, name);
  }

  lookupCompilationScopeAsRefs(node: ts.Declaration): CompilationScope<Reference>|null {
    node = ts.getOriginalNode(node) as ts.Declaration;

    // If the component has no associated module, then it has no compilation scope.
    if (!this._declararedTypeToModule.has(node)) {
      return null;
    }

    const module = this._declararedTypeToModule.get(node) !;

    // Compilation scope computation is somewhat expensive, so it's cached. Check the cache for
    // the module.
    if (this._compilationScopeCache.has(module)) {
      // The compilation scope was cached.
      const scope = this._compilationScopeCache.get(module) !;

      // The scope as cached is in terms of References, not Expressions. Converting between them
      // requires knowledge of the context file (in this case, the component node's source file).
      return scope;
    }

    // This is the first time the scope for this module is being computed.
    const directives = new Map<string, ScopeDirective<Reference<ts.Declaration>>>();
    const pipes = new Map<string, Reference>();

    // Process the declaration scope of the module, and lookup the selector of every declared type.
    // The initial value of ngModuleImportedFrom is 'null' which signifies that the NgModule
    // was not imported from a .d.ts source.
    this.lookupScopesOrDie(module !, /* ngModuleImportedFrom */ null).compilation.forEach(ref => {
      const node = ts.getOriginalNode(ref.node) as ts.Declaration;

      // Either the node represents a directive or a pipe. Look for both.
      const metadata = this.lookupDirectiveMetadata(ref);
      // Only directives/components with selectors get added to the scope.
      if (metadata != null) {
        directives.set(metadata.selector, {...metadata, directive: ref});
        return;
      }

      const name = this.lookupPipeName(node);
      if (name != null) {
        pipes.set(name, ref);
      }
    });

    const scope: CompilationScope<Reference> = {directives, pipes};

    // Many components may be compiled in the same scope, so cache it.
    this._compilationScopeCache.set(node, scope);

    // Convert References to Expressions in the context of the component's source file.
    return scope;
  }

  /**
   * Produce the compilation scope of a component, which is determined by the module that declares
   * it.
   */
  lookupCompilationScope(node: ts.Declaration): CompilationScope<Expression>|null {
    const scope = this.lookupCompilationScopeAsRefs(node);
    return scope !== null ? convertScopeToExpressions(scope, node) : null;
  }

  private lookupScopesOrDie(node: ts.Declaration, ngModuleImportedFrom: string|null):
      SelectorScopes {
    const result = this.lookupScopes(node, ngModuleImportedFrom);
    if (result === null) {
      throw new Error(`Module not found: ${reflectNameOfDeclaration(node)}`);
    }
    return result;
  }

  /**
   * Lookup `SelectorScopes` for a given module.
   *
   * This function assumes that if the given module was imported from an absolute path
   * (`ngModuleImportedFrom`) then all of its declarations are exported at that same path, as well
   * as imports and exports from other modules that are relatively imported.
   */
  private lookupScopes(node: ts.Declaration, ngModuleImportedFrom: string|null): SelectorScopes
      |null {
    let data: ModuleData|null = null;

    // Either this module was analyzed directly, or has a precompiled ngModuleDef.
    if (this._moduleToData.has(node)) {
      // The module was analyzed before, and thus its data is available.
      data = this._moduleToData.get(node) !;
    } else {
      // The module wasn't analyzed before, and probably has a precompiled ngModuleDef with a type
      // annotation that specifies the needed metadata.
      data = this._readModuleDataFromCompiledClass(node, ngModuleImportedFrom);
      // Note that data here could still be null, if the class didn't have a precompiled
      // ngModuleDef.
    }

    if (data === null) {
      return null;
    }

    return {
      compilation: [
        ...data.declarations,
        // Expand imports to the exported scope of those imports.
        ...flatten(data.imports.map(
            ref => this.lookupScopesOrDie(ref.node as ts.Declaration, absoluteModuleName(ref))
                       .exported)),
        // And include the compilation scope of exported modules.
        ...flatten(
            data.exports
                .map(ref => this.lookupScopes(ref.node as ts.Declaration, absoluteModuleName(ref)))
                .filter((scope: SelectorScopes | null): scope is SelectorScopes => scope !== null)
                .map(scope => scope.exported))
      ],
      exported: flatten(data.exports.map(ref => {
        const scope = this.lookupScopes(ref.node as ts.Declaration, absoluteModuleName(ref));
        if (scope !== null) {
          return scope.exported;
        } else {
          return [ref];
        }
      })),
    };
  }

  /**
   * Lookup the metadata of a component or directive class.
   *
   * Potentially this class is declared in a .d.ts file or otherwise has a manually created
   * ngComponentDef/ngDirectiveDef. In this case, the type metadata of that definition is read
   * to determine the metadata.
   */
  private lookupDirectiveMetadata(ref: Reference<ts.Declaration>): ScopeDirective<Reference>|null {
    const node = ts.getOriginalNode(ref.node) as ts.Declaration;
    if (this._directiveToMetadata.has(node)) {
      return this._directiveToMetadata.get(node) !;
    } else {
      return this._readMetadataFromCompiledClass(ref as Reference<ts.ClassDeclaration>);
    }
  }

  private lookupPipeName(node: ts.Declaration): string|null {
    if (this._pipeToName.has(node)) {
      return this._pipeToName.get(node) !;
    } else {
      return this._readNameFromCompiledClass(node);
    }
  }

  /**
   * Read the metadata from a class that has already been compiled somehow (either it's in a .d.ts
   * file, or in a .ts file with a handwritten definition).
   *
   * @param clazz the class of interest
   * @param ngModuleImportedFrom module specifier of the import path to assume for all declarations
   * stemming from this module.
   */
  private _readModuleDataFromCompiledClass(
      clazz: ts.Declaration, ngModuleImportedFrom: string|null): ModuleData|null {
    // This operation is explicitly not memoized, as it depends on `ngModuleImportedFrom`.
    // TODO(alxhub): investigate caching of .d.ts module metadata.
    const ngModuleDef = this.reflector.getMembersOfClass(clazz).find(
        member => member.name === 'ngModuleDef' && member.isStatic);
    if (ngModuleDef === undefined) {
      return null;
    } else if (
        // Validate that the shape of the ngModuleDef type is correct.
        ngModuleDef.type === null || !ts.isTypeReferenceNode(ngModuleDef.type) ||
        ngModuleDef.type.typeArguments === undefined ||
        ngModuleDef.type.typeArguments.length !== 4) {
      return null;
    }

    // Read the ModuleData out of the type arguments.
    const [_, declarationMetadata, importMetadata, exportMetadata] = ngModuleDef.type.typeArguments;
    return {
      declarations: this._extractReferencesFromType(declarationMetadata, ngModuleImportedFrom),
      exports: this._extractReferencesFromType(exportMetadata, ngModuleImportedFrom),
      imports: this._extractReferencesFromType(importMetadata, ngModuleImportedFrom),
    };
  }

  /**
   * Get the selector from type metadata for a class with a precompiled ngComponentDef or
   * ngDirectiveDef.
   */
  private _readMetadataFromCompiledClass(ref: Reference<ts.ClassDeclaration>):
      ScopeDirective<Reference>|null {
    const clazz = ts.getOriginalNode(ref.node) as ts.ClassDeclaration;
    const def = this.reflector.getMembersOfClass(clazz).find(
        field =>
            field.isStatic && (field.name === 'ngComponentDef' || field.name === 'ngDirectiveDef'));
    if (def === undefined) {
      // No definition could be found.
      return null;
    } else if (
        def.type === null || !ts.isTypeReferenceNode(def.type) ||
        def.type.typeArguments === undefined || def.type.typeArguments.length < 2) {
      // The type metadata was the wrong shape.
      return null;
    }
    const selector = readStringType(def.type.typeArguments[1]);
    if (selector === null) {
      return null;
    }

    return {
      ref,
      name: clazz.name !.text,
      directive: ref,
      isComponent: def.name === 'ngComponentDef', selector,
      exportAs: readStringType(def.type.typeArguments[2]),
      inputs: readStringMapType(def.type.typeArguments[3]),
      outputs: readStringMapType(def.type.typeArguments[4]),
      queries: readStringArrayType(def.type.typeArguments[5]),
      ...extractDirectiveGuards(clazz, this.reflector),
    };
  }

  /**
   * Get the selector from type metadata for a class with a precompiled ngComponentDef or
   * ngDirectiveDef.
   */
  private _readNameFromCompiledClass(clazz: ts.Declaration): string|null {
    const def = this.reflector.getMembersOfClass(clazz).find(
        field => field.isStatic && field.name === 'ngPipeDef');
    if (def === undefined) {
      // No definition could be found.
      return null;
    } else if (
        def.type === null || !ts.isTypeReferenceNode(def.type) ||
        def.type.typeArguments === undefined || def.type.typeArguments.length < 2) {
      // The type metadata was the wrong shape.
      return null;
    }
    const type = def.type.typeArguments[1];
    if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
      // The type metadata was the wrong type.
      return null;
    }
    return type.literal.text;
  }

  /**
   * Process a `TypeNode` which is a tuple of references to other types, and return `Reference`s to
   * them.
   *
   * This operation assumes that these types should be imported from `ngModuleImportedFrom` unless
   * they themselves were imported from another absolute path.
   */
  private _extractReferencesFromType(def: ts.TypeNode, ngModuleImportedFrom: string|null):
      Reference<ts.Declaration>[] {
    if (!ts.isTupleTypeNode(def)) {
      return [];
    }
    return def.elementTypes.map(element => {
      if (!ts.isTypeQueryNode(element)) {
        throw new Error(`Expected TypeQueryNode`);
      }
      const type = element.exprName;
      if (ngModuleImportedFrom !== null) {
        const {node, from} = reflectTypeEntityToDeclaration(type, this.checker);
        const moduleName = (from !== null && !from.startsWith('.') ? from : ngModuleImportedFrom);
        const id = reflectIdentifierOfDeclaration(node);
        return new AbsoluteReference(node, id !, moduleName, id !.text);
      } else {
        const {node} = reflectTypeEntityToDeclaration(type, this.checker);
        const id = reflectIdentifierOfDeclaration(node);
        return new ResolvedReference(node, id !);
      }
    });
  }
}

function flatten<T>(array: T[][]): T[] {
  return array.reduce((accum, subArray) => {
    accum.push(...subArray);
    return accum;
  }, [] as T[]);
}

function absoluteModuleName(ref: Reference): string|null {
  if (!(ref instanceof AbsoluteReference)) {
    return null;
  }
  return ref.moduleName;
}

function convertDirectiveReferenceMap(
    map: Map<string, ScopeDirective<Reference>>,
    context: ts.SourceFile): Map<string, ScopeDirective<Expression>> {
  const newMap = new Map<string, ScopeDirective<Expression>>();
  map.forEach((meta, selector) => {
    const directive = meta.directive.toExpression(context);
    if (directive === null) {
      throw new Error(`Could not write expression to reference ${meta.directive.node}`);
    }
    newMap.set(selector, {...meta, directive});
  });
  return newMap;
}

function convertPipeReferenceMap(
    map: Map<string, Reference>, context: ts.SourceFile): Map<string, Expression> {
  const newMap = new Map<string, Expression>();
  map.forEach((meta, selector) => {
    const pipe = meta.toExpression(context);
    if (pipe === null) {
      throw new Error(`Could not write expression to reference ${meta.node}`);
    }
    newMap.set(selector, pipe);
  });
  return newMap;
}

function convertScopeToExpressions(
    scope: CompilationScope<Reference>, context: ts.Declaration): CompilationScope<Expression> {
  const sourceContext = ts.getOriginalNode(context).getSourceFile();
  const directives = convertDirectiveReferenceMap(scope.directives, sourceContext);
  const pipes = convertPipeReferenceMap(scope.pipes, sourceContext);
  const declPointer = maybeUnwrapNameOfDeclaration(context);
  let containsForwardDecls = false;
  directives.forEach(expr => {
    containsForwardDecls = containsForwardDecls ||
        isExpressionForwardReference(expr.directive, declPointer, sourceContext);
  });
  !containsForwardDecls && pipes.forEach(expr => {
    containsForwardDecls =
        containsForwardDecls || isExpressionForwardReference(expr, declPointer, sourceContext);
  });
  return {directives, pipes, containsForwardDecls};
}

function isExpressionForwardReference(
    expr: Expression, context: ts.Node, contextSource: ts.SourceFile): boolean {
  if (isWrappedTsNodeExpr(expr)) {
    const node = ts.getOriginalNode(expr.node);
    return node.getSourceFile() === contextSource && context.pos < node.pos;
  }
  return false;
}

function isWrappedTsNodeExpr(expr: Expression): expr is WrappedNodeExpr<ts.Node> {
  return expr instanceof WrappedNodeExpr;
}

function maybeUnwrapNameOfDeclaration(decl: ts.Declaration): ts.Declaration|ts.Identifier {
  if ((ts.isClassDeclaration(decl) || ts.isVariableDeclaration(decl)) && decl.name !== undefined &&
      ts.isIdentifier(decl.name)) {
    return decl.name;
  }
  return decl;
}

function readStringType(type: ts.TypeNode): string|null {
  if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
    return null;
  }
  return type.literal.text;
}

function readStringMapType(type: ts.TypeNode): {[key: string]: string} {
  if (!ts.isTypeLiteralNode(type)) {
    return {};
  }
  const obj: {[key: string]: string} = {};
  type.members.forEach(member => {
    if (!ts.isPropertySignature(member) || member.type === undefined || member.name === undefined ||
        !ts.isStringLiteral(member.name)) {
      return;
    }
    const value = readStringType(member.type);
    if (value === null) {
      return null;
    }
    obj[member.name.text] = value;
  });
  return obj;
}

function readStringArrayType(type: ts.TypeNode): string[] {
  if (!ts.isTupleTypeNode(type)) {
    return [];
  }
  const res: string[] = [];
  type.elementTypes.forEach(el => {
    if (!ts.isLiteralTypeNode(el) || !ts.isStringLiteral(el.literal)) {
      return;
    }
    res.push(el.literal.text);
  });
  return res;
}
