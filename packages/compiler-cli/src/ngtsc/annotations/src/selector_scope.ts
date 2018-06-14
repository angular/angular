/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, ExternalExpr, ExternalReference} from '@angular/compiler';
import * as ts from 'typescript';

import {AbsoluteReference, Reference, reflectStaticField, reflectTypeEntityToDeclaration} from '../../metadata';

import {referenceToExpression} from './util';


/**
 * Metadata extracted for a given NgModule that can be used to compute selector scopes.
 */
export interface ModuleData {
  declarations: Reference[];
  imports: Reference[];
  exports: Reference[];
}

/**
 * Transitively expanded maps of directives and pipes visible to a component being compiled in the
 * context of some module.
 */
export interface CompilationScope<T> {
  directives: Map<string, T>;
  pipes: Map<string, T>;
}

/**
 * Both transitively expanded scopes for a given NgModule.
 */
interface SelectorScopes {
  /**
   * Set of components, directives, and pipes visible to all components being compiled in the
   * context of some module.
   */
  compilation: Reference[];

  /**
   * Set of components, directives, and pipes added to the compilation scope of any module importing
   * some module.
   */
  exported: Reference[];
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
  private _moduleToData = new Map<ts.ClassDeclaration, ModuleData>();

  /**
   * Map of modules to their cached `CompilationScope`s.
   */
  private _compilationScopeCache = new Map<ts.ClassDeclaration, CompilationScope<Reference>>();

  /**
   * Map of components/directives to their selector.
   */
  private _directiveToSelector = new Map<ts.ClassDeclaration, string>();

  /**
   * Map of pipes to their name.
   */
  private _pipeToName = new Map<ts.ClassDeclaration, string>();

  /**
   * Map of components/directives/pipes to their module.
   */
  private _declararedTypeToModule = new Map<ts.ClassDeclaration, ts.ClassDeclaration>();

  constructor(private checker: ts.TypeChecker) {}

  /**
   * Register a module's metadata with the registry.
   */
  registerModule(node: ts.ClassDeclaration, data: ModuleData): void {
    node = ts.getOriginalNode(node) as ts.ClassDeclaration;

    if (this._moduleToData.has(node)) {
      throw new Error(`Module already registered: ${node.name!.text}`);
    }
    this._moduleToData.set(node, data);

    // Register all of the module's declarations in the context map as belonging to this module.
    data.declarations.forEach(decl => {
      this._declararedTypeToModule.set(ts.getOriginalNode(decl.node) as ts.ClassDeclaration, node);
    });
  }

  /**
   * Register the selector of a component or directive with the registry.
   */
  registerSelector(node: ts.ClassDeclaration, selector: string): void {
    node = ts.getOriginalNode(node) as ts.ClassDeclaration;

    if (this._directiveToSelector.has(node)) {
      throw new Error(`Selector already registered: ${node.name!.text} ${selector}`);
    }
    this._directiveToSelector.set(node, selector);
  }

  /**
   * Register the name of a pipe with the registry.
   */
  registerPipe(node: ts.ClassDeclaration, name: string): void { this._pipeToName.set(node, name); }

  /**
   * Produce the compilation scope of a component, which is determined by the module that declares
   * it.
   */
  lookupCompilationScope(node: ts.ClassDeclaration): CompilationScope<Expression>|null {
    node = ts.getOriginalNode(node) as ts.ClassDeclaration;

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
      return convertScopeToExpressions(scope, node.getSourceFile());
    }

    // This is the first time the scope for this module is being computed.
    const directives = new Map<string, Reference>();
    const pipes = new Map<string, Reference>();

    // Process the declaration scope of the module, and lookup the selector of every declared type.
    // The initial value of ngModuleImportedFrom is 'null' which signifies that the NgModule
    // was not imported from a .d.ts source.
    this.lookupScopes(module !, /* ngModuleImportedFrom */ null).compilation.forEach(ref => {
      const selector =
          this.lookupDirectiveSelector(ts.getOriginalNode(ref.node) as ts.ClassDeclaration);
      // Only directives/components with selectors get added to the scope.
      if (selector != null) {
        directives.set(selector, ref);
      }
    });

    const scope: CompilationScope<Reference> = {directives, pipes};

    // Many components may be compiled in the same scope, so cache it.
    this._compilationScopeCache.set(node, scope);

    // Convert References to Expressions in the context of the component's source file.
    return convertScopeToExpressions(scope, node.getSourceFile());
  }

  /**
   * Lookup `SelectorScopes` for a given module.
   *
   * This function assumes that if the given module was imported from an absolute path
   * (`ngModuleImportedFrom`) then all of its declarations are exported at that same path, as well
   * as imports and exports from other modules that are relatively imported.
   */
  private lookupScopes(node: ts.ClassDeclaration, ngModuleImportedFrom: string|null):
      SelectorScopes {
    let data: ModuleData|null = null;

    // Either this module was analyzed directly, or has a precompiled ngModuleDef.
    if (this._moduleToData.has(node)) {
      // The module was analyzed before, and thus its data is available.
      data = this._moduleToData.get(node) !;
    } else {
      // The module wasn't analyzed before, and probably has a precompiled ngModuleDef with a type
      // annotation that specifies the needed metadata.
      if (ngModuleImportedFrom === null) {
        // TODO(alxhub): handle hand-compiled ngModuleDef in the current Program.
        throw new Error(`Need to read .d.ts module but ngModuleImportedFrom is unspecified`);
      }
      data = this._readMetadataFromCompiledClass(node, ngModuleImportedFrom);
      // Note that data here could still be null, if the class didn't have a precompiled
      // ngModuleDef.
    }

    if (data === null) {
      throw new Error(`Module not registered: ${node.name!.text}`);
    }

    return {
      compilation: [
        ...data.declarations,
        // Expand imports to the exported scope of those imports.
        ...flatten(data.imports.map(
            ref => this.lookupScopes(ref.node as ts.ClassDeclaration, absoluteModuleName(ref))
                       .exported)),
        // And include the compilation scope of exported modules.
        ...flatten(
            data.exports.filter(ref => this._moduleToData.has(ref.node as ts.ClassDeclaration))
                .map(
                    ref =>
                        this.lookupScopes(ref.node as ts.ClassDeclaration, absoluteModuleName(ref))
                            .exported))
      ],
      exported: flatten(data.exports.map(ref => {
        if (this._moduleToData.has(ref.node as ts.ClassDeclaration)) {
          return this.lookupScopes(ref.node as ts.ClassDeclaration, absoluteModuleName(ref))
              .exported;
        } else {
          return [ref];
        }
      })),
    };
  }

  /**
   * Lookup the selector of a component or directive class.
   *
   * Potentially this class is declared in a .d.ts file or otherwise has a manually created
   * ngComponentDef/ngDirectiveDef. In this case, the type metadata of that definition is read
   * to determine the selector.
   */
  private lookupDirectiveSelector(node: ts.ClassDeclaration): string|null {
    if (this._directiveToSelector.has(node)) {
      return this._directiveToSelector.get(node) !;
    } else {
      return this._readSelectorFromCompiledClass(node);
    }
  }

  private lookupPipeName(node: ts.ClassDeclaration): string|undefined {
    return this._pipeToName.get(node);
  }

  /**
   * Read the metadata from a class that has already been compiled somehow (either it's in a .d.ts
   * file, or in a .ts file with a handwritten definition).
   *
   * @param clazz the class of interest
   * @param ngModuleImportedFrom module specifier of the import path to assume for all declarations
   * stemming from this module.
   */
  private _readMetadataFromCompiledClass(clazz: ts.ClassDeclaration, ngModuleImportedFrom: string):
      ModuleData|null {
    // This operation is explicitly not memoized, as it depends on `ngModuleImportedFrom`.
    // TODO(alxhub): investigate caching of .d.ts module metadata.
    const ngModuleDef = reflectStaticField(clazz, 'ngModuleDef');
    if (ngModuleDef === null) {
      return null;
    } else if (
        // Validate that the shape of the ngModuleDef type is correct.
        ngModuleDef.type === undefined || !ts.isTypeReferenceNode(ngModuleDef.type) ||
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
  private _readSelectorFromCompiledClass(clazz: ts.ClassDeclaration): string|null {
    const def =
        reflectStaticField(clazz, 'ngComponentDef') || reflectStaticField(clazz, 'ngDirectiveDef');
    if (def === null) {
      // No definition could be found.
      return null;
    } else if (
        def.type === undefined || !ts.isTypeReferenceNode(def.type) ||
        def.type.typeArguments === undefined || def.type.typeArguments.length !== 2) {
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
  private _extractReferencesFromType(def: ts.TypeNode, ngModuleImportedFrom: string): Reference[] {
    if (!ts.isTupleTypeNode(def)) {
      return [];
    }
    return def.elementTypes.map(element => {
      if (!ts.isTypeReferenceNode(element)) {
        throw new Error(`Expected TypeReferenceNode`);
      }
      const type = element.typeName;
      const {node, from} = reflectTypeEntityToDeclaration(type, this.checker);
      const moduleName = (from !== null && !from.startsWith('.') ? from : ngModuleImportedFrom);
      const clazz = node as ts.ClassDeclaration;
      return new AbsoluteReference(node, clazz.name !, moduleName, clazz.name !.text);
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
  const name = (ref.node as ts.ClassDeclaration).name !.text;
  if (!(ref instanceof AbsoluteReference)) {
    return null;
  }
  return ref.moduleName;
}

function convertReferenceMap(
    map: Map<string, Reference>, context: ts.SourceFile): Map<string, Expression> {
  return new Map<string, Expression>(Array.from(map.entries()).map(([selector, ref]): [
    string, Expression
  ] => [selector, referenceToExpression(ref, context)]));
}

function convertScopeToExpressions(
    scope: CompilationScope<Reference>, context: ts.SourceFile): CompilationScope<Expression> {
  const directives = convertReferenceMap(scope.directives, context);
  const pipes = convertReferenceMap(scope.pipes, context);
  return {directives, pipes};
}
